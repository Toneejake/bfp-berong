# bfp-simulation-backend/main.py
from fastapi import FastAPI, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
import uuid
import numpy as np
import torch
from PIL import Image
import io

# Import your classes and functions
import sys
import os
sys.path.append(os.path.dirname(__file__))
from unet import UNet
from simulation import EvacuationEnv
from inference import create_grid_from_image
from stable_baselines3 import PPO

# --- Globals and Model Loading ---
app = FastAPI()
jobs = {}  # In-memory "database" to store job status and results

# Allow requests from your Next.js app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"], # Support both localhost and 127.0.0.1
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load models at startup
import os
print("🔧 Loading models...")
device = torch.device("cpu") # Use CPU for inference on a typical server
image_size = 256 # Must match the training config

# Ensure models directory exists and construct proper paths
models_dir = os.path.join(os.path.dirname(__file__), "models")
unet_model_path = os.path.join(models_dir, "unet_floorplan_model.pth")
ppo_model_path = os.path.join(models_dir, "ppo_commander_24k_steps.zip")

print(f"📁 U-Net model path: {unet_model_path}")
print(f"📁 PPO model path: {ppo_model_path}")

unet_model = UNet()
unet_model.load_state_dict(torch.load(unet_model_path, map_location=device))
unet_model.eval()
print("✅ U-Net model loaded successfully")

ppo_model = PPO.load(ppo_model_path)
print("✅ PPO model loaded successfully")

# --- Simulation Task ---
def run_simulation_task(image_bytes: bytes, job_id: str):
    try:
        # 1. Perception AI
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        simulation_grid = create_grid_from_image(unet_model, image, image_size, device)
        
        # 2. Run Simulation
        env = EvacuationEnv(grid=simulation_grid, num_agents=5, max_steps=500)
        obs, _ = env.reset()
        terminated, truncated = False, False
        history = []
        while not terminated and not truncated:
            action, _ = ppo_model.predict(obs, deterministic=True)
            obs, _, terminated, truncated, _ = env.step(action)
            history.append({
                'fire_map': np.argwhere(env.fire_sim.fire_map == 1).tolist(), # Send only burning cells to save space
                'agents': [(agent.pos, agent.status) for agent in env.agents],
            })
            
        # 3. Store the results
        final_state = history[-1]
        escaped = sum(1 for _, status in final_state['agents'] if status == 'escaped')
        burned = sum(1 for _, status in final_state['agents'] if status == 'burned')
        
        result = {
            "dashboard": {"total_agents": 5, "escaped": escaped, "burned": burned},
            "animation_data": {"exits": env.exits, "history": history, "grid_shape": simulation_grid.shape}
        }
        jobs[job_id] = {"status": "complete", "result": result}
        
    except Exception as e:
        jobs[job_id] = {"status": "failed", "error": str(e)}

# --- API Endpoints ---
@app.post("/api/v1/simulate")
async def start_simulation(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    job_id = str(uuid.uuid4())
    jobs[job_id] = {"status": "processing"}
    image_bytes = await file.read()
    
    background_tasks.add_task(run_simulation_task, image_bytes, job_id)
    
    return JSONResponse({"job_id": job_id})

@app.get("/api/v1/status/{job_id}")
async def get_status(job_id: str):
    job = jobs.get(job_id)
    if job is None:
        return JSONResponse({"status": "error", "message": "Job not found"}, status_code=404)
    return JSONResponse(job)
