# scorer.py
"""
Скорит изображение используя обученную модель.

Использование:
    python scorer.py image.jpg
    python scorer.py image.jpg --model model.json --verbose
    python scorer.py image.jpg --model model.json --json
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np

from metric_tool import compute_metrics, ImageMetrics

FEATURE_COLS = [
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


# ---------------------------------------------------------------------------
# Загрузка модели
# ---------------------------------------------------------------------------

class _Model:
    """Универсальная обёртка — работает с GaussianNB и LogisticRegression."""

    def __init__(self, path: Path) -> None:
        with path.open(encoding="utf-8") as f:
            self.data       = json.load(f)
        self.model_type = self.data["type"]
        self.features   = self.data["features"]

    def predict_proba(self, x: np.ndarray) -> float:
        if self.model_type == "GaussianNB":
            return self._predict_nb(x)
        if self.model_type == "LogisticRegression":
            return self._predict_lr(x)
        raise ValueError(f"Неизвестный тип модели: {self.model_type}")

    def _predict_nb(self, x: np.ndarray) -> float:
        means  = {int(k): np.array(v) for k, v in self.data["means"].items()}
        stds   = {int(k): np.array(v) for k, v in self.data["stds"].items()}
        priors = {int(k): float(v)    for k, v in self.data["priors"].items()}

        def ll(cls: int) -> float:
            mu, sig = means[cls], stds[cls]
            return float(
                np.log(priors[cls])
                - np.sum(np.log(sig))
                - 0.5 * np.sum(((x - mu) / sig) ** 2)
            )

        ll0, ll1 = ll(0), ll(1)
        m        = max(ll0, ll1)
        e0, e1   = np.exp(ll0 - m), np.exp(ll1 - m)
        return float(e1 / (e0 + e1))

    def _predict_lr(self, x: np.ndarray) -> float:
        w  = np.array(self.data["w"])
        b  = float(self.data["b"])
        mu = np.array(self.data["mu"])
        sg = np.array(self.data["sg"])
        xn = (x - mu) / (sg + 1e-9)
        z  = float(xn @ w + b)
        return float(1.0 / (1.0 + np.exp(-z)))


# ---------------------------------------------------------------------------
# Скоринг
# ---------------------------------------------------------------------------

def metrics_to_vector(m: ImageMetrics) -> np.ndarray:
    return np.array([
        m.entropy,
        m.laplacian_variance,
        m.hf_energy_ratio,
        m.spectral_slope,
        m.noise_entropy,
        m.gradient_variance,
        m.edge_density,
        m.color_uniformity,
        m.saturation_mean,
        m.dct_energy_ratio,
    ], dtype=np.float64)


def score_image(image_path: Path, model_path: Path) -> dict:
    model   = _Model(model_path)
    metrics = compute_metrics(image_path)
    x       = metrics_to_vector(metrics)
    prob    = model.predict_proba(x)
    label   = "AI-generated" if prob >= 0.5 else "Real photo"

    return {
        "file":        str(image_path),
        "model_type":  model.model_type,
        "probability": round(prob, 4),
        "label":       label,
        "metrics": {
            "entropy":            round(metrics.entropy,            4),
            "laplacian_variance": round(metrics.laplacian_variance, 4),
            "hf_energy_ratio":    round(metrics.hf_energy_ratio,    4),
            "spectral_slope":     round(metrics.spectral_slope,     4),
            "noise_entropy":      round(metrics.noise_entropy,      4),
            "gradient_variance":  round(metrics.gradient_variance,  4),
            "edge_density":       round(metrics.edge_density,       4),
            "color_uniformity":   round(metrics.color_uniformity,   4),
            "saturation_mean":    round(metrics.saturation_mean,    4),
            "dct_energy_ratio":   round(metrics.dct_energy_ratio,   4),
            "metadata_flag":      metrics.metadata_flag,
        },
    }


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main() -> None:
    ap = argparse.ArgumentParser(
        description="Определить AI-сгенерированное изображение или нет."
    )
    ap.add_argument("image",     help="Путь к изображению")
    ap.add_argument("--model",   default="model.json")
    ap.add_argument("--verbose", action="store_true")
    ap.add_argument("--json",    action="store_true")
    args = ap.parse_args()

    image_path = Path(args.image)
    model_path = Path(args.model)

    if not image_path.exists():
        print(f"[ОШИБКА] Файл не найден: {image_path}")
        return

    if not model_path.exists():
        print(f"[ОШИБКА] Модель не найдена: {model_path}")
        print("  Сначала запусти: python analyze_metrics.py --csv metrics.csv")
        return

    result = score_image(image_path, model_path)

    if args.json:
        print(json.dumps(result, indent=2, ensure_ascii=False))
        return

    prob  = result["probability"]
    label = result["label"]

    filled = int(prob * 20)
    bar    = "█" * filled + "░" * (20 - filled)

    print(f"\nФайл      : {result['file']}")
    print(f"Модель    : {result['model_type']}")
    print(f"Результат : {label}")
    print(f"P(AI)     : {prob:.4f}  [{bar}]")

    if args.verbose:
        print(f"\n{'─' * 45}")
        print("Метрики:")
        width = max(len(k) for k in result["metrics"])
        for key, val in result["metrics"].items():
            if isinstance(val, float):
                print(f"  {key:<{width}} = {val:.4f}")
            else:
                print(f"  {key:<{width}} = {val}")

    print()


if __name__ == "__main__":
    main()