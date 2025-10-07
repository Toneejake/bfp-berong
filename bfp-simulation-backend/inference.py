import torch
from PIL import Image
from torchvision import transforms
import numpy as np

def create_grid_from_image(model, image, image_size, device):
    """
    Takes a trained U-Net model and an image file path,
    and returns a binary numpy grid (1=wall, 0=free).
    """
    # 1. Load and prepare the model
    model.to(device)
    model.eval()

    # 2. Define the same transformations used during training
    transform = transforms.Compose([
        transforms.Resize((image_size, image_size)),
        transforms.ToTensor(),
    ])

    # 3. Load and transform the input image
    input_tensor = transform(image).unsqueeze(0).to(device)

    # 4. Get the model's prediction
    with torch.no_grad():
        output = model(input_tensor)

    # 5. Process the output into a binary grid
    # Apply sigmoid because our model outputs logits
    output_probs = torch.sigmoid(output)
    # Use a 0.5 threshold to decide wall vs. free space
    binary_mask = (output_probs > 0.5).float()

    # Squeeze the tensor to remove batch and channel dimensions, move to CPU
    grid_tensor = binary_mask.squeeze().cpu()

    # 6. Convert to NumPy array
    grid_numpy = grid_tensor.numpy()

    return grid_numpy
