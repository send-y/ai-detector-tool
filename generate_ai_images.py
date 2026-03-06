
# generate_ai_images.py
"""
Генерирует разнообразные AI изображения через Stable Diffusion.
"""
from __future__ import annotations

import os

# Фикс кэша — ОБЯЗАТЕЛЬНО до импорта diffusers/torch
_DIR   = os.path.dirname(os.path.abspath(__file__))
_CACHE = os.path.join(_DIR, "hf_cache")
os.makedirs(os.path.join(_CACHE, "hub"),          exist_ok=True)
os.makedirs(os.path.join(_CACHE, "transformers"), exist_ok=True)
os.environ["HF_HOME"]               = _CACHE
os.environ["HUGGINGFACE_HUB_CACHE"] = os.path.join(_CACHE, "hub")
os.environ["TRANSFORMERS_CACHE"]    = os.path.join(_CACHE, "transformers")

import argparse
import random
import time
from pathlib import Path
import random

import torch
from diffusers import StableDiffusionPipeline, DPMSolverMultistepScheduler

# ---------------------------------------------------------------------------
# Промпты — разнообразные сцены чтобы датасет не был однородным
# ---------------------------------------------------------------------------

SUBJECTS = [
    # Люди — бытовые ситуации
    "a person", "a woman", "a man", "a young woman", "a young man",
    "an old woman", "an old man", "a teenager", "a child", "a baby",
    "a group of people", "a couple", "a family", "two people talking",
    "a person walking", "a person sitting", "a person standing",
    "a person eating", "a person reading", "a person on a phone",
    "a person carrying bags", "a person riding a bicycle",
    "a person waiting", "a person looking at something",

    # Животные
    "a dog", "a cat", "a bird", "a horse", "a cow",
    "a sheep", "a dog running", "a cat sitting",
    "a dog and its owner", "a bird on a branch",

    # Транспорт
    "a car", "a bicycle", "a motorcycle", "a bus", "a truck",
    "a parked car", "cars on a street", "a bicycle leaning against a wall",

    # Еда и предметы
    "a dining table with food", "a plate of food", "a bowl of soup",
    "a sandwich", "a pizza", "fruit on a table", "vegetables",
    "a cup of coffee on a table", "a bottle and glass",

    # Мебель и интерьер
    "a couch", "a chair", "a bed", "a desk with a laptop",
    "a kitchen counter with dishes", "a bookshelf",
    "a tv in a living room", "a dining table",
]

SCENES = [
    # Городские — обычные места
    "on a sidewalk", "on a city street", "at a crosswalk",
    "in a parking lot", "near a bus stop", "on a busy street",
    "in front of a store", "near a building", "in a shopping area",
    "on a bridge", "near a traffic light", "in a square",

    # Общественные места
    "in a restaurant", "in a cafe", "in a fast food place",
    "in a supermarket", "at a market stall", "in a shopping mall",
    "at a train station", "at an airport", "in a hospital",
    "in a school", "in an office", "in a gym",

    # Природа и парки
    "in a park", "on a bench in a park", "near a tree",
    "on a grass field", "near a pond", "on a hiking trail",
    "at the beach", "near a river", "in a backyard",

    # Интерьер жилой
    "in a living room", "in a kitchen", "in a bedroom",
    "in a bathroom", "in a hallway", "in a garage",
    "on a balcony", "on a porch",

    # Время суток
    "during the day", "in the morning", "in the afternoon",
    "in the evening", "on a cloudy day", "on a sunny day",
    "on an overcast day",
]

# Стили — упор на любительское и документальное фото
STYLES = [
    # Любительское (самое реалистичное)
    "amateur photo",
    "smartphone photo",
    "iPhone photo",
    "snapshot",
    "casual photo",
    "family photo",
    "vacation photo",
    "candid photo",

    # Полупрофессиональное
    "DSLR photo",
    "photograph",
    "documentary photo",
    "street photography",
    "news photo",
    "photojournalism",
    "travel photo",
]

# Технические детали — имитируют реальные условия съёмки
CAMERA_DETAILS = [
    "",  # без деталей (чаще всего)
    "",
    "",
    "shot on iPhone",
    "shot on Samsung Galaxy",
    "shot on Canon EOS",
    "shot on Nikon",
    "35mm film",
    "Fujifilm",
]

# Несовершенства — делают фото более реалистичным
IMPERFECTIONS = [
    "",  # без несовершенств (чаще всего)
    "",
    "",
    "slightly blurry",
    "slight motion blur",
    "slightly overexposed",
    "slightly underexposed",
    "grainy",
    "film grain",
    "lens flare",
    "slightly out of focus background",
    "taken in a hurry",
    "low light",
    "harsh shadows",
]

# Качество — реалистичное, не глянцевое
QUALITY = (
    "realistic, natural lighting, photorealistic, "
    "real photo, authentic, everyday life"
)

# Негативный промпт — убираем всё что выдаёт AI
NEGATIVE = (
    "painting, drawing, illustration, cartoon, anime, render, cgi, "
    "3d, digital art, watermark, text, logo, signature, "
    "oversaturated, perfect lighting, studio lighting, "
    "too sharp, too clean, too perfect, unrealistic, "
    "plastic skin, smooth skin, airbrushed, "
    "extra limbs, bad anatomy, deformed, ugly, "
    "fantasy, sci-fi, surreal, abstract"
)


def random_prompt() -> tuple[str, str]:
    """
    Возвращает (prompt, negative_prompt).

    Строит промпт из случайных компонентов.
    Чем больше компонентов — тем разнообразнее датасет.
    """
    subject    = random.choice(SUBJECTS)
    scene      = random.choice(SCENES)
    style      = random.choice(STYLES)
    camera     = random.choice(CAMERA_DETAILS)
    imperfect  = random.choice(IMPERFECTIONS)

    parts = [f"{style} of {subject} {scene}", QUALITY]

    if camera:
        parts.append(camera)
    if imperfect:
        parts.append(imperfect)

    prompt = ", ".join(parts)
    return prompt, NEGATIVE


# ---------------------------------------------------------------------------
# Загрузка пайплайна
# ---------------------------------------------------------------------------

def load_pipeline(model_id: str) -> StableDiffusionPipeline:
    print(f"Загрузка модели: {model_id}")
    print("Первый запуск скачает ~4GB — подожди...\n")

    pipe = StableDiffusionPipeline.from_pretrained(
        model_id,
        torch_dtype=torch.float16,   # float16 обязательно для 8GB VRAM
        safety_checker=None,
        requires_safety_checker=False,
    )

    # DPM++ 2M — быстрый и качественный планировщик
    pipe.scheduler = DPMSolverMultistepScheduler.from_config(
        pipe.scheduler.config,
        use_karras_sigmas=True,
    )

    pipe = pipe.to("cuda")

    # Экономия VRAM — важно для 8GB
    pipe.enable_attention_slicing()

    return pipe


# ---------------------------------------------------------------------------
# Генерация
# ---------------------------------------------------------------------------

def generate(out_dir: Path, count: int, model_id: str, seed: int) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)

    # Проверяем сколько уже есть (чтобы можно было продолжить после остановки)
    existing = list(out_dir.glob("ai_*.png"))
    start_i  = len(existing)

    if start_i >= count:
        print(f"Уже есть {start_i} изображений — ничего не делаем.")
        return

    if start_i > 0:
        print(f"Найдено {start_i} уже готовых — продолжаем с {start_i}...\n")

    pipe = load_pipeline(model_id)

    generator = torch.Generator("cuda").manual_seed(seed)

    print(f"Генерация {count - start_i} изображений на {out_dir}\n")
    t0 = time.time()

    for i in range(start_i, count):
        prompt, negative = random_prompt()

        image = pipe(
            prompt          = prompt,
            negative_prompt = negative,
            width           = 512,
            height          = 512,
            num_inference_steps = 25,  # 25 шагов — баланс скорость/качество
            guidance_scale      = 7.0,
            generator           = generator,
        ).images[0]

        out_path = out_dir / f"ai_{i:05d}.png"
        image.save(out_path)

        # Прогресс
        elapsed  = time.time() - t0
        done     = i - start_i + 1
        per_img  = elapsed / done
        remaining = per_img * (count - i - 1)

        print(
            f"[{i+1:>4}/{count}] "
            f"{per_img:.1f}s/img  "
            f"осталось ~{remaining/60:.0f} мин  |  {prompt[:60]}"
        )

    total = time.time() - t0
    print(f"\nГотово! {count - start_i} изображений за {total/60:.1f} минут")
    print(f"Папка: {out_dir.resolve()}")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--out",
        default="dataset/ai_512",
        help="Папка для сохранения (default: dataset/ai_512)",
    )
    ap.add_argument(
        "--count",
        type=int,
        default=1000,
        help="Сколько изображений сгенерировать (default: 1000)",
    )
    ap.add_argument(
        "--model",
        default="runwayml/stable-diffusion-v1-5",
        help="Модель с HuggingFace (default: SD 1.5)",
    )
    ap.add_argument(
        "--seed",
        type=int,
        default=42,
        help="Random seed (default: 42)",
    )
    args = ap.parse_args()

    print(f"Устройство : {torch.cuda.get_device_name(0)}")
    print(f"VRAM       : {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB")
    print(f"Модель     : {args.model}")
    print(f"Количество : {args.count}")
    print(f"Выход      : {args.out}\n")

    generate(
        out_dir  = Path(args.out),
        count    = args.count,
        model_id = args.model,
        seed     = args.seed,
    )


if __name__ == "__main__":
    main()