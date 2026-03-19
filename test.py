from diffusers import StableDiffusionXLPipeline
import torch
import os

CACHE_DIR = r"C:\Users\Bohdan\ai-detector-tool\hf_cache"

os.environ["HF_HOME"] = CACHE_DIR
os.environ["HUGGINGFACE_HUB_CACHE"] = os.path.join(CACHE_DIR, "hub")
os.makedirs(os.path.join(CACHE_DIR, "hub"), exist_ok=True)

pipe = StableDiffusionXLPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0",
    torch_dtype=torch.float16,
).to("cuda")

prompt = "a photorealistic photo of a dog in a park"

image = pipe(
    prompt=prompt,
    output_type="pil",
    num_inference_steps=25,
    guidance_scale=7.5,
).images[0]

image.show()