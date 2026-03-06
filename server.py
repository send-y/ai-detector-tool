# server.py
"""
Flask API для AI детектора.
Запуск: python server.py
"""

from __future__ import annotations

import io
import json
import os
import tempfile
from pathlib import Path

from flask import Flask, request, jsonify
from flask_cors import CORS  # pip install flask-cors

from metric_tool import compute_metrics
from scorer import _Model, metrics_to_vector

# ---------------------------------------------------------------------------
# Инициализация
# ---------------------------------------------------------------------------

app        = Flask(__name__)
CORS(app)  # разрешаем запросы с React (localhost:3000)

MODEL_PATH = Path("model.json")

# Загружаем модель один раз при старте
if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Модель не найдена: {MODEL_PATH}\n"
        "Сначала запусти: python analyze_metrics.py --csv metrics.csv"
    )

model = _Model(MODEL_PATH)
print(f"Модель загружена: {model.model_type}")


# ---------------------------------------------------------------------------
# Роуты
# ---------------------------------------------------------------------------

@app.route("/api/health", methods=["GET"])
def health():
    """Проверка что сервер работает."""
    return jsonify({
        "status":     "ok",
        "model_type": model.model_type,
    })


@app.route("/api/analyze", methods=["POST"])
def analyze():
    """
    Принимает изображение, возвращает метрики и вероятность AI.

    Request:  multipart/form-data  { image: File }
    Response: application/json     { probability, label, metrics }
    """
    if "image" not in request.files:
        return jsonify({"error": "Файл не найден в запросе"}), 400

    file = request.files["image"]

    if file.filename == "":
        return jsonify({"error": "Файл не выбран"}), 400

    # Проверяем расширение
    allowed = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
    ext     = Path(file.filename).suffix.lower()
    if ext not in allowed:
        return jsonify({
            "error": f"Неподдерживаемый формат: {ext}. "
                     f"Используй: {', '.join(allowed)}"
        }), 400

    # Сохраняем во временный файл
    try:
        with tempfile.NamedTemporaryFile(
            suffix=ext, delete=False
        ) as tmp:
            tmp_path = Path(tmp.name)
            file.save(tmp_path)

        # Считаем метрики
        metrics = compute_metrics(tmp_path)
        x       = metrics_to_vector(metrics)
        prob    = model.predict_proba(x)
        label   = "AI-generated" if prob >= 0.5 else "Real photo"

        return jsonify({
            "probability": round(float(prob), 4),
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
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        # Удаляем временный файл
        if tmp_path.exists():
            tmp_path.unlink()


# ---------------------------------------------------------------------------
# Запуск
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    app.run(
        host  = "0.0.0.0",
        port  = 5000,
        debug = True,
    )