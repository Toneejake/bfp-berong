#!/usr/bin/env python3
"""
Simple script to start the FastAPI server
"""
import uvicorn
from main import app

if __name__ == "__main__":
    print("🚀 Starting BFP Simulation Backend...")
    uvicorn.run(app, host="0.0.0.0", port=8001)
