# collect_metrics.py
"""
Собирает метрики со всех изображений и сохраняет в CSV.

Использование:
    python collect_metrics.py --real dataset/real_512 --ai dataset/ai_512 --out metrics.csv
"""

from __future__ import annotations

import argparse
import csv
import sys
import time
import traceback
from pathlib import Path

from metric_tool import compute_metrics, ImageMetrics

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff"}

FIELDNAMES = [
    "file",
    "label",
    "entropy",
    "laplacian_variance",
    "hf_energy_ratio",
    "spectral_slope",
    "noise_entropy",
    "gradient_variance",
    "edge_density",
    "color_uniformity",
    "saturation_mean",
    "dct_energy_ratio",
]


def iter_images(folder: Path) -> list[Path]:
    if not folder.exists():
        print(f"[ОШИБКА] Папка не найдена: {folder}", file=sys.stderr)
        sys.exit(1)
    paths = sorted(
        p for p in folder.iterdir()
        if p.suffix.lower() in IMAGE_EXTENSIONS
    )
    if not paths:
        print(f"[ОШИБКА] Нет изображений в {folder}", file=sys.stderr)
        sys.exit(1)
    return paths


def collect(real_dir: Path, ai_dir: Path, out_csv: Path) -> None:
    real_paths = iter_images(real_dir)
    ai_paths   = iter_images(ai_dir)

    tasks: list[tuple[Path, int]] = (
        [(p, 0) for p in real_paths] +
        [(p, 1) for p in ai_paths]
    )

    print(f"Найдено изображений : {len(tasks)}")
    print(f"  real              : {len(real_paths)}")
    print(f"  ai                : {len(ai_paths)}")
    print(f"Выходной файл       : {out_csv}\n")

    errors  = 0
    t_start = time.time()

    with out_csv.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
        writer.writeheader()

        for i, (path, label) in enumerate(tasks, 1):
            try:
                m: ImageMetrics = compute_metrics(path)

                writer.writerow({
                    "file":               path.name,
                    "label":              label,
                    "entropy":            round(m.entropy,            6),
                    "laplacian_variance": round(m.laplacian_variance, 6),
                    "hf_energy_ratio":    round(m.hf_energy_ratio,    6),
                    "spectral_slope":     round(m.spectral_slope,     6),
                    "noise_entropy":      round(m.noise_entropy,      6),
                    "gradient_variance":  round(m.gradient_variance,  6),
                    "edge_density":       round(m.edge_density,       6),
                    "color_uniformity":   round(m.color_uniformity,   6),
                    "saturation_mean":    round(m.saturation_mean,    6),
                    "dct_energy_ratio":   round(m.dct_energy_ratio,   6),
                })

            except Exception:
                errors += 1
                print(f"  [ОШИБКА] {path.name}", file=sys.stderr)
                traceback.print_exc()
                continue

            if i % 50 == 0 or i == len(tasks):
                elapsed   = time.time() - t_start
                per_img   = elapsed / i
                remaining = per_img * (len(tasks) - i)
                print(
                    f"  [{i:>4}/{len(tasks)}] "
                    f"{per_img:.2f}s/img  "
                    f"осталось ~{remaining/60:.1f} мин"
                )

    total = time.time() - t_start
    print(f"\nГотово за {total/60:.1f} минут")
    print(f"Ошибок  : {errors}")
    print(f"CSV     : {out_csv.resolve()}")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--real", required=True)
    ap.add_argument("--ai",   required=True)
    ap.add_argument("--out",  default="metrics.csv")
    args = ap.parse_args()

    collect(Path(args.real), Path(args.ai), Path(args.out))


if __name__ == "__main__":
    main()