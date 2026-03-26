from __future__ import annotations
import os
from pathlib import Path

_DIR = Path(__file__).parent
_CACHE = _DIR / "hf_cache"

(_CACHE / "hub").mkdir(parents=True, exist_ok=True)
(_CACHE / "transformers").mkdir(parents=True, exist_ok=True)
(_CACHE / "diffusers").mkdir(parents=True, exist_ok=True)

os.environ["HF_HOME"] = str(_CACHE)
os.environ["HUGGINGFACE_HUB_CACHE"] = str(_CACHE / "hub")
os.environ["TRANSFORMERS_CACHE"] = str(_CACHE / "transformers")
os.environ["DIFFUSERS_CACHE"] = str(_CACHE / "diffusers")
os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "expandable_segments:True"

import argparse
import random
import time
import warnings

import torch
from diffusers import (
    StableDiffusionPipeline,
    StableDiffusionXLPipeline,
    FluxPipeline,
    DPMSolverMultistepScheduler,
    EulerDiscreteScheduler,
)


SUBJECTS = [
    "a middle-aged man", "an elderly woman", "a teenage girl",
    "a businessman", "a construction worker", "a chef",
    "a street musician", "a jogger", "a tourist",
    "two friends", "a mother with child", "a student",
    "a golden retriever", "a tabby cat", "a pigeon",
    "a squirrel", "a duck", "a rabbit",
    "a burger and fries", "a slice of pizza", "a sushi plate",
    "a glass of wine", "a breakfast plate", "a fruit bowl",
    "a taxi cab", "a city bus", "a delivery truck",
    "a parked bicycle", "a scooter", "a subway train",
    "a messy desk", "a bookshelf", "a bathroom sink",
    "a fireplace", "a staircase", "a window with curtains",
    "a rocky mountain", "a sandy beach", "a wheat field",
    "a waterfall", "a snowy street", "a foggy road",
]

SCENES = [
    "on a rainy street", "in a subway station",
    "at a farmers market", "near a construction site",
    "outside a restaurant", "at a bus stop",
    "in a shopping mall", "on a pedestrian bridge",
    "in a dense forest", "on a mountain trail",
    "at a lake shore", "in a snowy landscape",
    "at golden hour", "under overcast sky",
    "in heavy rain", "in morning fog",
    "in a small apartment", "in a crowded restaurant",
    "in a hospital waiting room", "in a school classroom",
    "in a gym", "in a library",
    "in a hotel lobby", "in a garage",
]

STYLES = [
    "iPhone photo", "security camera footage",
    "newspaper photo", "documentary photo",
    "street photography", "paparazzi photo",
    "real estate photo", "food photography",
    "wedding photo", "sports photo",
    "surveillance photo", "dashcam footage",
]

QUALITY = (
    "photorealistic, natural lighting, shot on camera, "
    "authentic, unedited, raw photo, real life, "
    "high resolution, sharp focus"
)

NEGATIVE = (
    "painting, illustration, drawing, cartoon, anime, "
    "3d render, cgi, digital art, concept art, "
    "watermark, text, logo, signature, border, frame, "
    "unrealistic, bad anatomy, deformed, blurry, "
    "oversaturated, hdr, fake, artificial"
)


def random_prompt() -> tuple[str, str]:
    subject = random.choice(SUBJECTS)
    scene = random.choice(SCENES)
    style = random.choice(STYLES)
    prompt = f"{style} of {subject} {scene}, {QUALITY}"
    return prompt, NEGATIVE


def is_flux(model_id: str) -> bool:
    return "flux" in model_id.lower()


def is_sdxl(model_id: str) -> bool:
    m = model_id.lower()
    return ("xl" in m) and (not is_flux(m))


def require_cuda() -> None:
    if not torch.cuda.is_available():
        raise RuntimeError("CUDA unavailable.")


def try_enable_xformers(pipe) -> None:
    try:
        pipe.enable_xformers_memory_efficient_attention()
        print("xFormers: enabled")
    except Exception:
        print("xFormers: not available (this is fine).")


def load_pipeline_sd15(model_id: str) -> StableDiffusionPipeline:
    print("Type: Stable Diffusion 1.5")
    pipe = StableDiffusionPipeline.from_pretrained(
        model_id,
        torch_dtype=torch.float16,
        safety_checker=None,
        requires_safety_checker=False,
        use_safetensors=True,
        token=os.environ.get("HF_TOKEN"),
    )
    pipe.scheduler = DPMSolverMultistepScheduler.from_config(
        pipe.scheduler.config,
        use_karras_sigmas=True,
        algorithm_type="dpmsolver++",
        final_sigmas_type="sigma_min",
    )
    pipe = pipe.to("cuda")
    pipe.enable_attention_slicing()
    try_enable_xformers(pipe)
    return pipe


def load_pipeline_sdxl(model_id: str) -> StableDiffusionXLPipeline:
    print("Type: Stable Diffusion XL")
    pipe = StableDiffusionXLPipeline.from_pretrained(
        model_id,
        torch_dtype=torch.float16,
        use_safetensors=True,
        variant="fp16",
        token=os.environ.get("HF_TOKEN"),
    )
    pipe.scheduler = EulerDiscreteScheduler.from_config(pipe.scheduler.config)

    pipe.enable_model_cpu_offload()
    pipe.enable_attention_slicing()
    try_enable_xformers(pipe)
    return pipe


def load_pipeline_flux(model_id: str) -> FluxPipeline:
    print("Type: FLUX.1 (schnell)")
    pipe = FluxPipeline.from_pretrained(
        model_id,
        torch_dtype=torch.float16,
        use_safetensors=True,
        token=os.environ.get("HF_TOKEN"),
    )
    pipe.enable_model_cpu_offload()
    try:
        pipe.enable_attention_slicing()
    except Exception:
        pass
    try_enable_xformers(pipe)
    return pipe


def load_pipeline(model_id: str):
    print(f"Loading model: {model_id}")
    print("The first run will download weights — please wait...\n")

    if is_flux(model_id):
        return load_pipeline_flux(model_id)
    if is_sdxl(model_id):
        return load_pipeline_sdxl(model_id)
    return load_pipeline_sd15(model_id)

def get_image_size(model_id: str) -> tuple[int, int]:
    # FLUX/SDXL: 1024, SD1.5: 512
    if is_flux(model_id) or is_sdxl(model_id):
        return 1024, 1024
    return 512, 512


def get_defaults(model_id: str) -> tuple[int, float]:
    if is_flux(model_id):
        return 4, 1.0
    if is_sdxl(model_id):
        return 25, 6.5
    return 25, 7.0


def generate(
    out_dir: Path,
    count: int,
    model_id: str,
    base_seed: int,
    steps: int | None,
    cfg: float | None,
    width: int | None,
    height: int | None,
) -> None:
    require_cuda()
    out_dir.mkdir(parents=True, exist_ok=True)

    existing = list(out_dir.glob("ai_*.png"))
    start_i = len(existing)

    if start_i >= count:
        print(f"{start_i} images already exist — skipping generation.")
        return

    if start_i > 0:
        print(f"Found {start_i} already generated — continuing from {start_i}...\n")

    pipe = load_pipeline(model_id)

    default_w, default_h = get_image_size(model_id)
    w = width or default_w
    h = height or default_h

    default_steps, default_cfg = get_defaults(model_id)
    steps = steps if steps is not None else default_steps
    cfg = cfg if cfg is not None else default_cfg

    use_flux = is_flux(model_id)
    use_sdxl = is_sdxl(model_id)

    gen_device = "cpu" if (use_flux or use_sdxl) else "cuda"

    print(f"Image size         : {w}×{h}")
    print(f"steps/cfg          : {steps} / {cfg}")
    print(f"generator device   : {gen_device}")
    print(f"Generating {count - start_i} images into {out_dir}\n")

    t0 = time.time()

    for i in range(start_i, count):
        prompt, negative = random_prompt()

        seed = base_seed + i
        generator = torch.Generator(gen_device).manual_seed(seed)

        try:
            if use_flux:
                result = pipe(
                    prompt=prompt,
                    width=w,
                    height=h,
                    num_inference_steps=steps,
                    guidance_scale=cfg,
                    generator=generator,
                    output_type="pil",
                )
            else:
                result = pipe(
                    prompt=prompt,
                    negative_prompt=negative,
                    width=w,
                    height=h,
                    num_inference_steps=steps,
                    guidance_scale=cfg,
                    generator=generator,
                    output_type="pil",
                )

            image = result.images[0]
            out_path = out_dir / f"ai_{i:05d}.png"
            image.save(out_path)

            elapsed = time.time() - t0
            done = i - start_i + 1
            per_img = elapsed / done
            remaining = per_img * (count - i - 1)

            print(
                f"[{i+1:>4}/{count}] "
                f"seed={seed}  "
                f"{per_img:.1f}s/img  "
                f"ETA ~{remaining/60:.0f} min  |  "
                f"{prompt[:60]}"
            )

        except torch.cuda.OutOfMemoryError:
            print(f"[{i+1:>4}/{count}] OOM — clearing memory and skipping")
            torch.cuda.empty_cache()
            continue
        except TypeError as e:
            print(f"[{i+1:>4}/{count}] Pipeline call error: {e}")
            print(
                "Tip: update diffusers/transformers or remove unsupported arguments "
                "(width/height/negative_prompt)."
            )
            raise

    total = time.time() - t0
    generated = count - start_i
    print(f"\nDone! Generated {generated} images in {total/60:.1f} minutes")
    print(f"Folder: {out_dir.resolve()}")

def main() -> None:
    warnings.filterwarnings("ignore", category=UserWarning)

    parser = argparse.ArgumentParser(
        description="AI image generator (SD 1.5 / SDXL / FLUX.1-schnell)"
    )
    parser.add_argument("--out", default="dataset/ai", help="Output folder for saving images")
    parser.add_argument("--count", type=int, default=1000, help="Number of images")
    parser.add_argument(
        "--model",
        default="runwayml/stable-diffusion-v1-5",
        help=(
            "HuggingFace model ID: "
            "runwayml/stable-diffusion-v1-5 | "
            "stabilityai/stable-diffusion-xl-base-1.0 | "
            "black-forest-labs/FLUX.1-schnell"
        ),
    )
    parser.add_argument("--seed", type=int, default=42, help="Base seed (each image gets seed+i)")

    parser.add_argument("--steps", type=int, default=None, help="Diffusion steps (model-dependent by default)")
    parser.add_argument("--cfg", type=float, default=None, help="Guidance scale (model-dependent by default)")
    parser.add_argument("--width", type=int, default=None, help="Width (model-dependent by default)")
    parser.add_argument("--height", type=int, default=None, help="Height (model-dependent by default)")

    args = parser.parse_args()

    require_cuda()
    device_name = torch.cuda.get_device_name(0)
    vram_gb = torch.cuda.get_device_properties(0).total_memory / 1e9

    print(f"Device     : {device_name}")
    print(f"VRAM       : {vram_gb:.1f} GB")
    print(f"Model      : {args.model}")
    print(f"Count      : {args.count}")
    print(f"Output     : {args.out}\n")

    generate(
        out_dir=Path(args.out),
        count=args.count,
        model_id=args.model,
        base_seed=args.seed,
        steps=args.steps,
        cfg=args.cfg,
        width=args.width,
        height=args.height,
    )


if __name__ == "__main__":
    main()