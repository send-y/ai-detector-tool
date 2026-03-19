"""
Генерирует AI-изображения через Stable Diffusion и SDXL.
"""
from __future__ import annotations

# ✅ Шаг 1: настройка окружения ДО всех импортов HuggingFace
import os
from pathlib import Path

_DIR   = Path(__file__).parent
_CACHE = _DIR / "hf_cache"

(_CACHE / "hub").mkdir(parents=True, exist_ok=True)
(_CACHE / "transformers").mkdir(parents=True, exist_ok=True)

os.environ["HF_HOME"]                = str(_CACHE)
os.environ["HUGGINGFACE_HUB_CACHE"]  = str(_CACHE / "hub")
os.environ["TRANSFORMERS_CACHE"]     = str(_CACHE / "transformers")
os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "expandable_segments:True"

# ✅ Токен из переменной окружения, не из кода
# Установи: set HF_TOKEN=hf_xxx  (Windows) или export HF_TOKEN=hf_xxx (Linux)
# os.environ["HF_TOKEN"] уже должен быть установлен снаружи

# ✅ Шаг 2: импорты после настройки окружения
import argparse
import random
import time

import torch
from diffusers import (
    StableDiffusionPipeline,
    StableDiffusionXLPipeline,
    DPMSolverMultistepScheduler,
    EulerDiscreteScheduler,
)

# --- Промпты ---

SUBJECTS = [
    # Люди
    "a middle-aged man", "an elderly woman", "a teenage girl",
    "a businessman", "a construction worker", "a chef",
    "a street musician", "a jogger", "a tourist",
    "two friends", "a mother with child", "a student",
    # Животные
    "a golden retriever", "a tabby cat", "a pigeon",
    "a squirrel", "a duck", "a rabbit",
    # Еда и напитки
    "a burger and fries", "a slice of pizza", "a sushi plate",
    "a glass of wine", "a breakfast plate", "a fruit bowl",
    # Транспорт
    "a taxi cab", "a city bus", "a delivery truck",
    "a parked bicycle", "a scooter", "a subway train",
    # Интерьер
    "a messy desk", "a bookshelf", "a bathroom sink",
    "a fireplace", "a staircase", "a window with curtains",
    # Природа
    "a rocky mountain", "a sandy beach", "a wheat field",
    "a waterfall", "a snowy street", "a foggy road",
]

SCENES = [
    # Городские
    "on a rainy street", "in a subway station",
    "at a farmers market", "near a construction site",
    "outside a restaurant", "at a bus stop",
    "in a shopping mall", "on a pedestrian bridge",
    # Природные
    "in a dense forest", "on a mountain trail",
    "at a lake shore", "in a snowy landscape",
    "at golden hour", "under overcast sky",
    "in heavy rain", "in morning fog",
    # Интерьерные
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
    scene   = random.choice(SCENES)
    style   = random.choice(STYLES)
    prompt  = f"{style} of {subject} {scene}, {QUALITY}"
    return prompt, NEGATIVE


# --- Определение типа модели ---

def is_sdxl(model_id: str) -> bool:
    return "xl" in model_id.lower()


# --- Загрузка пайплайнов ---

def load_pipeline_sd15(model_id: str) -> StableDiffusionPipeline:
    print("Тип: Stable Diffusion 1.5")
    pipe = StableDiffusionPipeline.from_pretrained(
        model_id,
        torch_dtype=torch.float16,
        safety_checker=None,
        requires_safety_checker=False,
        use_safetensors=True,          # ← добавь это для V6
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
    return pipe

    # ✅ Исправление — переопределяем проблемные параметры
    pipe.scheduler = DPMSolverMultistepScheduler.from_config(
        pipe.scheduler.config,
        use_karras_sigmas=True,
        algorithm_type="dpmsolver++",   # ← было deis в конфиге модели
        final_sigmas_type="sigma_min",  # ← было zero в конфиге модели
    )

    pipe = pipe.to("cuda")
    pipe.enable_attention_slicing()
    return pipe


def load_pipeline_sdxl(model_id: str) -> StableDiffusionXLPipeline:
    print("Тип: Stable Diffusion XL")
    pipe = StableDiffusionXLPipeline.from_pretrained(
        model_id,
        torch_dtype=torch.float16,
        use_safetensors=True,
        variant="fp16",
        token=os.environ.get("HF_TOKEN"),
    )
    pipe.scheduler = EulerDiscreteScheduler.from_config(
        pipe.scheduler.config,
    )
    pipe.enable_model_cpu_offload()
    pipe.enable_attention_slicing()
    return pipe


def load_pipeline(model_id: str):
    print(f"Загрузка модели: {model_id}")
    print("Первый запуск скачает ~4-6 GB — подожди...\n")
    if is_sdxl(model_id):
        return load_pipeline_sdxl(model_id)
    return load_pipeline_sd15(model_id)



# --- Параметры генерации по типу модели ---

def get_image_size(use_sdxl: bool) -> tuple[int, int]:
    """
    SDXL обучен на 1024×1024.
    SD 1.5 — на 512×512.
    """
    return (1024, 1024) if use_sdxl else (1024, 1024)


# --- Генерация ---

def generate(
    out_dir: Path,
    count: int,
    model_id: str,
    base_seed: int,
) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)

    existing = list(out_dir.glob("ai_*.png"))
    start_i  = len(existing)

    if start_i >= count:
        print(f"Уже есть {start_i} изображений — пропускаем генерацию.")
        return

    if start_i > 0:
        print(f"Найдено {start_i} готовых — продолжаем с {start_i}...\n")

    pipe     = load_pipeline(model_id)
    use_sdxl = is_sdxl(model_id)
    width, height = get_image_size(use_sdxl)

    print(f"Размер изображений : {width}×{height}")
    print(f"Генерация {count - start_i} изображений в {out_dir}\n")

    t0 = time.time()

    for i in range(start_i, count):
        prompt, negative = random_prompt()

        # ✅ Уникальный seed для каждого изображения
        seed      = base_seed + i
        generator = torch.Generator("cuda").manual_seed(seed)

        try:
            result = pipe(
                prompt=prompt,
                negative_prompt=negative,
                width=width,
                height=height,
                num_inference_steps=25,
                guidance_scale=7.0,
                generator=generator,
                output_type="pil",
            )
            image = result.images[0]

            out_path = out_dir / f"ai_{i:05d}.png"
            image.save(out_path)

            elapsed   = time.time() - t0
            done      = i - start_i + 1
            per_img   = elapsed / done
            remaining = per_img * (count - i - 1)

            print(
                f"[{i+1:>4}/{count}] "
                f"seed={seed}  "
                f"{per_img:.1f}s/img  "
                f"осталось ~{remaining/60:.0f} мин  |  "
                f"{prompt[:60]}"
            )

        except torch.cuda.OutOfMemoryError:
            print(f"[{i+1:>4}/{count}] OOM — очищаем память и пропускаем")
            torch.cuda.empty_cache()
            continue

    total = time.time() - t0
    generated = count - start_i
    print(
        f"\nГотово! Сгенерировано {generated} изображений "
        f"за {total/60:.1f} минут"
    )
    print(f"Папка: {out_dir.resolve()}")


# --- CLI ---

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Генератор AI-изображений (SD 1.5 / SDXL)"
    )
    parser.add_argument(
        "--out",
        default="dataset/ai_512",
        help="Папка для сохранения изображений",
    )
    parser.add_argument(
        "--count",
        type=int,
        default=1000,
        help="Количество изображений",
    )
    parser.add_argument(
        "--model",
        default="runwayml/stable-diffusion-v1-5",
        help="ID модели на HuggingFace",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="Базовый seed (каждое фото получит seed+i)",
    )
    args = parser.parse_args()

    device_name = torch.cuda.get_device_name(0)
    vram_gb     = torch.cuda.get_device_properties(0).total_memory / 1e9

    print(f"Устройство : {device_name}")
    print(f"VRAM       : {vram_gb:.1f} GB")
    print(f"Модель     : {args.model}")
    print(f"Количество : {args.count}")
    print(f"Выход      : {args.out}\n")

    generate(Path(args.out), args.count, args.model, args.seed)


if __name__ == "__main__":
    main()