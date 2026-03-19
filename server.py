# server.py
from __future__ import annotations

import json
import tempfile
from pathlib import Path

import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

from metric_tool import compute_metrics


app = Flask(__name__)
CORS(app)

MODEL_PATH = Path("model.json")
ALLOWED_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tif", ".tiff"}


def sigmoid(z: float) -> float:
    z = float(np.clip(z, -50.0, 50.0))
    return 1.0 / (1.0 + np.exp(-z))


def load_model(path: Path) -> dict:
    if not path.exists():
        raise FileNotFoundError(
            f"model.json не найден: {path}\n"
            "Сначала обучи модель: python analyze_metrics.py --csv metrics.csv --save model.json"
        )
    m = json.loads(path.read_text(encoding="utf-8"))
    for k in ("feature_cols", "mu", "sg", "w", "b"):
        if k not in m:
            raise ValueError(f"model.json missing key '{k}'")

    # numpy-версии
    m["mu"] = np.array(m["mu"], dtype=np.float64)
    m["sg"] = np.array(m["sg"], dtype=np.float64)
    m["w"]  = np.array(m["w"],  dtype=np.float64)
    m["b"]  = float(m["b"])

    m["threshold"] = float(m.get("threshold", 0.5))
    m["z_clip"]    = float(m.get("z_clip", 6.0))
    m["sg_floor"]  = float(m.get("sg_floor", 1e-3))
    return m


MODEL = load_model(MODEL_PATH)
COLS = list(MODEL["feature_cols"])


def predict_with_explain(x: np.ndarray) -> tuple[float, float, list[dict]]:
    mu = MODEL["mu"]
    sg = np.maximum(MODEL["sg"], MODEL["sg_floor"])
    w  = MODEL["w"]
    b  = MODEL["b"]

    z = (x - mu) / sg
    z = np.clip(z, -MODEL["z_clip"], MODEL["z_clip"])

    contrib = w * z
    logit = float(z @ w + b)
    p_ai = sigmoid(logit)

    idx = np.argsort(np.abs(contrib))[::-1][:5]
    top = [{
        "metric": COLS[i],
        "value": float(x[i]),
        "z": float(z[i]),
        "weight": float(w[i]),
        "contribution": float(contrib[i]),
    } for i in idx]

    return p_ai, logit, top


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "model_type": MODEL.get("type", "unknown"),
        "n_features": len(COLS),
        "threshold": MODEL["threshold"],
        "z_clip": MODEL["z_clip"],
        "sg_floor": MODEL["sg_floor"],
    })


@app.route("/api/analyze", methods=["POST"])
def analyze():
    if "image" not in request.files:
        return jsonify({"error": "Файл не найден в запросе (поле должно называться 'image')"}), 400

    file = request.files["image"]
    if not file.filename:
        return jsonify({"error": "Файл не выбран"}), 400

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTS:
        return jsonify({"error": f"Неподдерживаемый формат: {ext}. Разрешено: {sorted(ALLOWED_EXTS)}"}), 400

    tmp_path: Path | None = None
    try:
        with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
            tmp_path = Path(tmp.name)
            file.save(tmp_path)

        m = compute_metrics(tmp_path)

        # вектор в порядке, как в model.json
        x = np.array([float(getattr(m, c)) for c in COLS], dtype=np.float64)

        p_ai, logit, top = predict_with_explain(x)
        thr = MODEL["threshold"]
        label = "AI-generated" if p_ai >= thr else "Real photo"

        metrics_dict = {c: round(float(getattr(m, c)), 6) for c in COLS}

        extras = {}
        for k in ("metadata_flag", "exif_present", "orig_width", "orig_height", "file_size_kb", "file_bpp"):
            if hasattr(m, k):
                v = getattr(m, k)
                if isinstance(v, (int, float, np.integer, np.floating)):
                    extras[k] = float(v)
                else:
                    extras[k] = v

        return jsonify({
            "probability": round(float(p_ai), 4),
            "label": label,
            "threshold": float(thr),
            "logit": round(float(logit), 6),
            "top_contributions": top,
            "metrics": metrics_dict,
            "extras": extras,
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if tmp_path is not None and tmp_path.exists():
            tmp_path.unlink(missing_ok=True)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)