from __future__ import annotations

from pathlib import Path
from PIL import Image

def center_crop_resize(img: Image.Image, size: int = 512) -> Image.Image:
    # сначала делаем квадрат по меньшей стороне (center crop), потом resize
    w, h = img.size
    s = min(w, h)
    left = (w - s) // 2
    top = (h - s) // 2
    img = img.crop((left, top, left + s, top + s))
    img = img.resize((size, size), Image.Resampling.LANCZOS)
    return img

def prepare_folder(src_dir: str, dst_dir: str, size: int = 512) -> None:
    src = Path(src_dir)
    dst = Path(dst_dir)
    dst.mkdir(parents=True, exist_ok=True)

    exts = {".jpg", ".jpeg", ".png", ".webp"}

    count = 0
    for p in sorted(src.iterdir()):
        if p.suffix.lower() not in exts:
            continue
        try:
            img = Image.open(p).convert("RGB")
            img = center_crop_resize(img, size=size)

            out_path = dst / (p.stem + ".png")
            img.save(out_path, format="PNG", optimize=True)
            count += 1
        except Exception as e:
            print(f"[SKIP] {p.name}: {e}")

    print(f"[OK] Prepared {count} images -> {dst}")

if __name__ == "__main__":
    prepare_folder(r"dataset\real_raw", r"dataset\real_512", size=512)