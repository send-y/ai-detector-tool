# analyze_metrics.py
"""
Читает metrics.csv, строит статистику, обучает два классификатора,
сохраняет лучший.

Использование:
    python analyze_metrics.py --csv metrics.csv --save model.json
"""

from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path

import numpy as np

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
# Загрузка CSV
# ---------------------------------------------------------------------------

def load_csv(path: Path) -> tuple[np.ndarray, np.ndarray, list[str]]:
    rows, labels, files = [], [], []
    with path.open(encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                rows.append([float(row[c]) for c in FEATURE_COLS])
                labels.append(int(row["label"]))
                files.append(row["file"])
            except (ValueError, KeyError):
                continue
    return (
        np.array(rows,   dtype=np.float64),
        np.array(labels, dtype=np.int32),
        files,
    )


# ---------------------------------------------------------------------------
# Статистика
# ---------------------------------------------------------------------------

def print_statistics(X: np.ndarray, y: np.ndarray) -> None:
    real_X = X[y == 0]
    ai_X   = X[y == 1]

    print(f"\n{'Метрика':<22} {'Real mean':>12} {'Real std':>10} "
          f"{'AI mean':>12} {'AI std':>10} {'Cohen d':>9}")
    print("─" * 82)

    for i, col in enumerate(FEATURE_COLS):
        r_mean, r_std = real_X[:, i].mean(), real_X[:, i].std()
        a_mean, a_std = ai_X[:, i].mean(),   ai_X[:, i].std()
        pooled        = np.sqrt((r_std**2 + a_std**2) / 2 + 1e-12)
        d             = abs(a_mean - r_mean) / pooled
        marker        = " ✓" if d > 0.8 else (" ~" if d > 0.4 else "  ")

        print(
            f"{col:<22} {r_mean:>12.4f} {r_std:>10.4f} "
            f"{a_mean:>12.4f} {a_std:>10.4f} {d:>9.3f}{marker}"
        )

    print()
    print("✓ d > 0.8  ~ d > 0.4    d < 0.4")


# ---------------------------------------------------------------------------
# Gaussian Naive Bayes
# ---------------------------------------------------------------------------

class GaussianNBClassifier:

    def __init__(self) -> None:
        self.means:    dict[int, np.ndarray] = {}
        self.stds:     dict[int, np.ndarray] = {}
        self.priors:   dict[int, float]      = {}
        self.features: list[str]             = FEATURE_COLS

    def fit(self, X: np.ndarray, y: np.ndarray) -> "GaussianNBClassifier":
        for cls in (0, 1):
            mask             = y == cls
            self.means[cls]  = X[mask].mean(axis=0)
            self.stds[cls]   = X[mask].std(axis=0) + 1e-9
            self.priors[cls] = float(mask.sum()) / len(y)
        return self

    def _ll(self, x: np.ndarray, cls: int) -> float:
        mu, sig = self.means[cls], self.stds[cls]
        return float(
            np.log(self.priors[cls])
            - np.sum(np.log(sig))
            - 0.5 * np.sum(((x - mu) / sig) ** 2)
        )

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        out = []
        for x in X:
            ll0, ll1 = self._ll(x, 0), self._ll(x, 1)
            m        = max(ll0, ll1)
            e0, e1   = np.exp(ll0 - m), np.exp(ll1 - m)
            out.append(float(e1 / (e0 + e1)))
        return np.array(out)

    def predict(self, X: np.ndarray, thr: float = 0.5) -> np.ndarray:
        return (self.predict_proba(X) >= thr).astype(int)

    def save(self, path: Path) -> None:
        with path.open("w", encoding="utf-8") as f:
            json.dump({
                "type":     "GaussianNB",
                "features": self.features,
                "means":    {str(k): v.tolist() for k, v in self.means.items()},
                "stds":     {str(k): v.tolist() for k, v in self.stds.items()},
                "priors":   {str(k): v          for k, v in self.priors.items()},
            }, f, indent=2)

    @classmethod
    def load(cls, path: Path) -> "GaussianNBClassifier":
        with path.open(encoding="utf-8") as f:
            d = json.load(f)
        obj          = cls()
        obj.features = d["features"]
        obj.means    = {int(k): np.array(v) for k, v in d["means"].items()}
        obj.stds     = {int(k): np.array(v) for k, v in d["stds"].items()}
        obj.priors   = {int(k): float(v)    for k, v in d["priors"].items()}
        return obj


# ---------------------------------------------------------------------------
# Logistic Regression
# ---------------------------------------------------------------------------

class LogisticRegressionClassifier:

    def __init__(self, lr: float = 0.1,
                 epochs: int = 2000,
                 C: float = 1.0) -> None:
        self.lr     = lr
        self.epochs = epochs
        self.C      = C
        self.w:  np.ndarray = np.array([])
        self.b:  float      = 0.0
        self.mu: np.ndarray = np.array([])
        self.sg: np.ndarray = np.array([])
        self.features: list[str] = FEATURE_COLS

    def _normalize(self, X: np.ndarray) -> np.ndarray:
        return (X - self.mu) / (self.sg + 1e-9)

    def fit(self, X: np.ndarray, y: np.ndarray) -> "LogisticRegressionClassifier":
        self.mu = X.mean(axis=0)
        self.sg = X.std(axis=0)
        Xn      = self._normalize(X)
        n, d    = Xn.shape
        self.w  = np.zeros(d)
        self.b  = 0.0

        for epoch in range(self.epochs):
            z    = Xn @ self.w + self.b
            pred = 1.0 / (1.0 + np.exp(-np.clip(z, -500, 500)))
            err  = pred - y.astype(np.float64)

            dw = (Xn.T @ err) / n + self.w / (self.C * n)
            db = float(err.mean())

            self.w -= self.lr * dw
            self.b -= self.lr * db

        return self

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        z = self._normalize(X) @ self.w + self.b
        return 1.0 / (1.0 + np.exp(-np.clip(z, -500, 500)))

    def predict(self, X: np.ndarray, thr: float = 0.5) -> np.ndarray:
        return (self.predict_proba(X) >= thr).astype(int)

    def save(self, path: Path) -> None:
        with path.open("w", encoding="utf-8") as f:
            json.dump({
                "type":     "LogisticRegression",
                "features": self.features,
                "w":        self.w.tolist(),
                "b":        float(self.b),
                "mu":       self.mu.tolist(),
                "sg":       self.sg.tolist(),
            }, f, indent=2)

    @classmethod
    def load(cls, path: Path) -> "LogisticRegressionClassifier":
        with path.open(encoding="utf-8") as f:
            d = json.load(f)
        obj          = cls()
        obj.features = d["features"]
        obj.w        = np.array(d["w"])
        obj.b        = float(d["b"])
        obj.mu       = np.array(d["mu"])
        obj.sg       = np.array(d["sg"])
        return obj


# ---------------------------------------------------------------------------
# Оценка качества
# ---------------------------------------------------------------------------

def evaluate(y_true: np.ndarray, y_pred: np.ndarray) -> dict:
    tp = int(((y_pred == 1) & (y_true == 1)).sum())
    tn = int(((y_pred == 0) & (y_true == 0)).sum())
    fp = int(((y_pred == 1) & (y_true == 0)).sum())
    fn = int(((y_pred == 0) & (y_true == 1)).sum())

    accuracy  = (tp + tn) / max(len(y_true), 1)
    precision = tp / max(tp + fp, 1)
    recall    = tp / max(tp + fn, 1)
    f1        = 2 * precision * recall / max(precision + recall, 1e-12)

    return {
        "accuracy":  round(accuracy,  4),
        "precision": round(precision, 4),
        "recall":    round(recall,    4),
        "f1":        round(f1,        4),
        "tp": tp, "tn": tn, "fp": fp, "fn": fn,
    }


def cross_validate(
    X: np.ndarray,
    y: np.ndarray,
    clf_class,
    folds: int = 5,
) -> dict:
    n         = len(y)
    indices   = np.random.permutation(n)
    fold_size = n // folds
    results   = []

    for fold in range(folds):
        val_idx   = indices[fold * fold_size : (fold + 1) * fold_size]
        train_idx = np.concatenate([
            indices[:fold * fold_size],
            indices[(fold + 1) * fold_size:],
        ])

        clf    = clf_class().fit(X[train_idx], y[train_idx])
        y_pred = clf.predict(X[val_idx])
        results.append(evaluate(y[val_idx], y_pred))

    keys = ["accuracy", "precision", "recall", "f1"]
    return {
        k: round(float(np.mean([r[k] for r in results])), 4)
        for k in keys
    }


# ---------------------------------------------------------------------------
# Главная функция
# ---------------------------------------------------------------------------

def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--csv",  required=True,        help="Путь к metrics.csv")
    ap.add_argument("--save", default="model.json", help="Сохранить модель")
    ap.add_argument("--seed", type=int, default=42)
    args = ap.parse_args()

    np.random.seed(args.seed)

    print(f"Загрузка {args.csv} ...")
    X, y, _ = load_csv(Path(args.csv))
    print(f"Загружено: {len(y)} изображений  "
          f"({(y==0).sum()} real, {(y==1).sum()} ai)\n")

    # Статистика
    print("=" * 82)
    print("СТАТИСТИКА ПО МЕТРИКАМ")
    print("=" * 82)
    print_statistics(X, y)

    # Кросс-валидация обоих классификаторов
    print("=" * 82)
    print("КРОСС-ВАЛИДАЦИЯ (5-fold)")
    print("=" * 82)

    print("\nGaussian Naive Bayes:")
    cv_nb = cross_validate(X, y, GaussianNBClassifier, folds=5)
    for k, v in cv_nb.items():
        print(f"  {k:<12} = {v:.4f}")

    print("\nLogistic Regression:")
    cv_lr = cross_validate(X, y, LogisticRegressionClassifier, folds=5)
    for k, v in cv_lr.items():
        print(f"  {k:<12} = {v:.4f}")

    # Выбираем лучший классификатор по f1
    if cv_lr["f1"] >= cv_nb["f1"]:
        print(f"\nЛучший классификатор: Logistic Regression "
              f"(f1={cv_lr['f1']:.4f})")
        best_clf = LogisticRegressionClassifier().fit(X, y)
    else:
        print(f"\nЛучший классификатор: Gaussian Naive Bayes "
              f"(f1={cv_nb['f1']:.4f})")
        best_clf = GaussianNBClassifier().fit(X, y)

    # Финальная оценка на всех данных
    y_pred = best_clf.predict(X)
    final  = evaluate(y, y_pred)

    print("\n" + "=" * 82)
    print("ФИНАЛЬНАЯ МОДЕЛЬ")
    print("=" * 82)
    print(f"  accuracy  = {final['accuracy']:.4f}")
    print(f"  precision = {final['precision']:.4f}")
    print(f"  recall    = {final['recall']:.4f}")
    print(f"  f1        = {final['f1']:.4f}")
    print(f"  TP={final['tp']}  TN={final['tn']}  "
          f"FP={final['fp']}  FN={final['fn']}")

    # Сохранение
    save_path = Path(args.save)
    best_clf.save(save_path)

    print("\n" + "=" * 82)
    print("ГОТОВО")
    print("=" * 82)
    print(f"  Модель    : {save_path.resolve()}")
    print(f"  Следующий шаг: python scorer.py <image> --model {args.save}")


if __name__ == "__main__":
    main()