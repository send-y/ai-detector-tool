"""
Compute 11 image-based metrics for AI-generated probability heuristics.

Metrics:
    1.  entropy              – Shannon entropy of brightness histogram
    2.  laplacian_variance   – Sharpness proxy via Laplacian
    3.  hf_energy_ratio      – High-frequency energy fraction (FFT)
    4.  spectral_slope       – 1/f^alpha spectral slope estimate
    5.  noise_entropy        – Entropy of high-pass residual
    6.  gradient_variance    – Variance of Sobel gradient magnitude
    7.  edge_density         – Fraction of edge pixels
    8.  color_uniformity     – Std of patch mean brightness (AI = more uniform)
    9.  saturation_mean      – Mean HSV saturation (AI = often higher)
    10. dct_energy_ratio     – HF energy in DCT domain
    11. metadata_flag        – 0 = likely real camera, 1 = likely AI / unknown
"""

from __future__ import annotations

__all__ = [
    "ImageMetrics",
    "compute_metrics",
    "load_image_rgb",
]

import math
import warnings
from dataclasses import dataclass
from pathlib import Path

import numpy as np
from PIL import Image
from PIL.ExifTags import TAGS as _EXIF_TAGS

try:
    import cv2
    _HAVE_CV2 = True
except ImportError:
    cv2 = None
    _HAVE_CV2 = False

try:
    from scipy.ndimage import convolve as _scipy_convolve
    from scipy.ndimage import gaussian_filter as _scipy_gaussian
    from scipy.fft import dctn as _scipy_dctn
    _HAVE_SCIPY = True
except ImportError:
    _HAVE_SCIPY = False

# ---------------------------------------------------------------------------
# EXIF
# ---------------------------------------------------------------------------

_TAG_NAME_TO_ID: dict[str, int] = {
    name: tag_id for tag_id, name in _EXIF_TAGS.items()
}
_EXIF_SOFTWARE = _TAG_NAME_TO_ID["Software"]
_EXIF_MAKE     = _TAG_NAME_TO_ID["Make"]
_EXIF_MODEL    = _TAG_NAME_TO_ID["Model"]

_AI_SOFTWARE_KEYWORDS: frozenset[str] = frozenset({
    "stable diffusion", "midjourney", "dall-e", "comfyui",
    "automatic1111", "sdxl", "novelai", "adobe firefly", "imagen",
})


# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class ImageMetrics:
    entropy:            float
    laplacian_variance: float
    hf_energy_ratio:    float
    spectral_slope:     float
    noise_entropy:      float
    gradient_variance:  float
    edge_density:       float
    color_uniformity:   float
    saturation_mean:    float
    dct_energy_ratio:   float
    metadata_flag:      int

    def as_array(self, include_metadata: bool = False) -> np.ndarray:
        fields = [
            self.entropy,
            self.laplacian_variance,
            self.hf_energy_ratio,
            self.spectral_slope,
            self.noise_entropy,
            self.gradient_variance,
            self.edge_density,
            self.color_uniformity,
            self.saturation_mean,
            self.dct_energy_ratio,
        ]
        if include_metadata:
            fields.append(float(self.metadata_flag))
        return np.array(fields, dtype=np.float64)


# ---------------------------------------------------------------------------
# Loading
# ---------------------------------------------------------------------------

def load_image_rgb(path: str | Path) -> Image.Image:
    with Image.open(Path(path)) as img:
        img.load()
        if img.mode != "RGB":
            img = img.convert("RGB")
        return img.copy()


def pil_to_numpy_rgb(img: Image.Image) -> np.ndarray:
    arr = np.asarray(img, dtype=np.uint8)
    if arr.ndim != 3 or arr.shape[2] != 3:
        raise ValueError(f"Expected (H, W, 3); got {arr.shape}.")
    return arr


def rgb_to_gray(rgb_u8: np.ndarray) -> np.ndarray:
    r = rgb_u8[..., 0].astype(np.float64)
    g = rgb_u8[..., 1].astype(np.float64)
    b = rgb_u8[..., 2].astype(np.float64)
    return np.clip((0.299*r + 0.587*g + 0.114*b) / 255.0, 0.0, 1.0)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _gray_to_u8(gray: np.ndarray) -> np.ndarray:
    return np.clip(gray * 255.0, 0, 255).astype(np.uint8)


def _normalize_to_01(x: np.ndarray, eps: float = 1e-12) -> np.ndarray:
    lo, hi = float(x.min()), float(x.max())
    if hi - lo < eps:
        return np.zeros_like(x, dtype=np.float64)
    return np.clip((x - lo) / (hi - lo), 0.0, 1.0)


def _convolve2d(img: np.ndarray, kernel: np.ndarray) -> np.ndarray:
    img_f = img.astype(np.float64)
    if _HAVE_SCIPY:
        return _scipy_convolve(img_f, kernel, mode="mirror")
    from numpy.lib.stride_tricks import sliding_window_view
    kh, kw = kernel.shape
    ph, pw = kh // 2, kw // 2
    padded  = np.pad(img_f, ((ph, ph), (pw, pw)), mode="reflect")
    windows = sliding_window_view(padded, (kh, kw))
    return np.einsum("hwij,ij->hw", windows, kernel[::-1, ::-1])


def _gaussian_blur(gray: np.ndarray, sigma: float = 1.0) -> np.ndarray:
    if _HAVE_CV2:
        k = int(max(3, math.ceil(sigma * 6))) | 1
        return cv2.GaussianBlur(gray.astype(np.float64), (k, k),
                                sigmaX=sigma, sigmaY=sigma)
    if _HAVE_SCIPY:
        return _scipy_gaussian(gray.astype(np.float64), sigma=sigma)
    warnings.warn("Using box-blur approximation.", RuntimeWarning, stacklevel=3)
    k      = max(3, int(round(sigma * 6 + 1))) | 1
    kernel = np.ones((k, k), dtype=np.float64) / (k * k)
    return _convolve2d(gray, kernel)


def _sobel_magnitude(gray: np.ndarray) -> np.ndarray:
    if _HAVE_CV2:
        gray_u8 = _gray_to_u8(gray)
        gx = cv2.Sobel(gray_u8, cv2.CV_64F, 1, 0, ksize=3)
        gy = cv2.Sobel(gray_u8, cv2.CV_64F, 0, 1, ksize=3)
        return np.sqrt(gx*gx + gy*gy)
    kx = np.array([[-1,0,1],[-2,0,2],[-1,0,1]], dtype=np.float64)
    ky = np.array([[-1,-2,-1],[0,0,0],[1,2,1]], dtype=np.float64)
    gx = _convolve2d(gray, kx)
    gy = _convolve2d(gray, ky)
    return np.sqrt(gx*gx + gy*gy)


def _shannon_entropy(gray_01: np.ndarray, bins: int = 256) -> float:
    gray_u8 = _gray_to_u8(gray_01)
    hist    = np.bincount(gray_u8.ravel(), minlength=bins).astype(np.float64)
    total   = hist.sum()
    if total == 0:
        return 0.0
    p       = hist / total
    nonzero = p[p > 0]
    return float(-(nonzero * np.log2(nonzero)).sum())


# ---------------------------------------------------------------------------
# Metrics 1-7 (original)
# ---------------------------------------------------------------------------

def compute_entropy(gray: np.ndarray) -> float:
    return _shannon_entropy(gray)


def compute_laplacian_variance(gray: np.ndarray) -> float:
    if _HAVE_CV2:
        lap = cv2.Laplacian(_gray_to_u8(gray), cv2.CV_64F)
        return float(lap.var())
    k   = np.array([[0,1,0],[1,-4,1],[0,1,0]], dtype=np.float64)
    lap = _convolve2d(gray, k)
    return float((lap * 255.0).var())


def compute_hf_energy_ratio(gray: np.ndarray,
                             lf_radius_frac: float = 0.25) -> float:
    F     = np.fft.fftshift(np.fft.fft2(gray))
    power = np.abs(F) ** 2
    h, w  = gray.shape
    cy, cx = h // 2, w // 2
    yy, xx = np.ogrid[:h, :w]
    r     = np.sqrt((yy - cy)**2 + (xx - cx)**2)
    r0    = lf_radius_frac * (min(h, w) / 2.0)
    total = float(power.sum())
    if total <= 0:
        return 0.0
    return float(power[r > r0].sum()) / total


def compute_spectral_slope(gray: np.ndarray, eps: float = 1e-12) -> float:
    F      = np.fft.fftshift(np.fft.fft2(gray))
    power  = np.abs(F).astype(np.float64) ** 2
    h, w   = gray.shape
    cy, cx = h // 2, w // 2
    yy, xx = np.indices((h, w))
    r      = np.sqrt((yy - cy)**2 + (xx - cx)**2)
    r_int  = r.astype(np.int32)
    r_max  = int(r_int.max())
    sums   = np.bincount(r_int.ravel(), weights=power.ravel(),
                         minlength=r_max + 1)
    cnts   = np.bincount(r_int.ravel(), minlength=r_max + 1)
    radial = sums / np.maximum(cnts, 1).astype(np.float64)
    freqs  = np.arange(1, r_max + 1, dtype=np.float64)
    vals   = radial[1:r_max + 1].astype(np.float64)
    mask   = vals > 0
    freqs, vals = freqs[mask], vals[mask]
    if len(freqs) < 10:
        return 0.0
    b, _ = np.polyfit(np.log(freqs + eps), np.log(vals + eps), 1)
    return float(-b)


def compute_noise_entropy(gray: np.ndarray, sigma: float = 1.0) -> float:
    residual = gray - _gaussian_blur(gray, sigma=sigma)
    return _shannon_entropy(_normalize_to_01(residual))


def compute_gradient_variance(gray: np.ndarray) -> float:
    return float(_sobel_magnitude(gray).var())


def compute_edge_density(gray: np.ndarray,
                         canny_low: int = 100,
                         canny_high: int = 200) -> float:
    h, w = gray.shape
    n    = h * w
    if n == 0:
        return 0.0
    if _HAVE_CV2:
        edges = cv2.Canny(_gray_to_u8(gray),
                          threshold1=canny_low, threshold2=canny_high)
        return float((edges > 0).sum()) / n
    warnings.warn("cv2 not available; using gradient threshold for edge_density.",
                  RuntimeWarning, stacklevel=2)
    mag    = _sobel_magnitude(gray)
    thresh = mag.mean() + mag.std()
    return float((mag > thresh).sum()) / n


# ---------------------------------------------------------------------------
# Metric 8 — Color uniformity
# ---------------------------------------------------------------------------

def compute_color_uniformity(rgb_u8: np.ndarray,
                              patch_size: int = 16) -> float:
    """
    Std of per-patch mean brightness.

    AI images tend to have more globally uniform brightness distribution
    across patches → lower std → lower value means more AI-like.
    We return the std so that higher = more varied = more real-like.
    """
    h, w  = rgb_u8.shape[:2]
    gray  = (0.299 * rgb_u8[:,:,0].astype(np.float64)
           + 0.587 * rgb_u8[:,:,1].astype(np.float64)
           + 0.114 * rgb_u8[:,:,2].astype(np.float64))

    means = []
    for y in range(0, h - patch_size + 1, patch_size):
        for x in range(0, w - patch_size + 1, patch_size):
            patch = gray[y:y + patch_size, x:x + patch_size]
            means.append(float(patch.mean()))

    if len(means) < 2:
        return 0.0

    return float(np.std(means))


# ---------------------------------------------------------------------------
# Metric 9 — Saturation mean
# ---------------------------------------------------------------------------

def compute_saturation_mean(rgb_u8: np.ndarray) -> float:
    """
    Mean HSV saturation.
    AI images often have higher / more uniform saturation.
    Returns mean saturation in [0, 1].
    """
    if _HAVE_CV2:
        hsv = cv2.cvtColor(rgb_u8, cv2.COLOR_RGB2HSV)
        # OpenCV HSV: S channel is 0-255
        return float(hsv[:, :, 1].mean()) / 255.0

    # Fallback: compute saturation from RGB
    r = rgb_u8[:,:,0].astype(np.float64) / 255.0
    g = rgb_u8[:,:,1].astype(np.float64) / 255.0
    b = rgb_u8[:,:,2].astype(np.float64) / 255.0

    cmax = np.maximum(np.maximum(r, g), b)
    cmin = np.minimum(np.minimum(r, g), b)
    diff = cmax - cmin

    sat = np.where(cmax > 1e-9, diff / cmax, 0.0)
    return float(sat.mean())


# ---------------------------------------------------------------------------
# Metric 10 — DCT energy ratio
# ---------------------------------------------------------------------------

def compute_dct_energy_ratio(gray: np.ndarray,
                              patch_size: int = 128) -> float:
    """
    Ratio of high-frequency DCT energy to total DCT energy.

    Uses a centre patch of size patch_size x patch_size.
    AI images often show a different HF/LF energy balance in DCT domain
        compared to natural photos.
    """
    h, w   = gray.shape
    cy, cx = h // 2, w // 2
    half   = patch_size // 2

    # Вырезаем центральный патч
    y0, y1 = max(0, cy - half), min(h, cy + half)
    x0, x1 = max(0, cx - half), min(w, cx + half)
    patch  = gray[y0:y1, x0:x1]

    # Если патч меньше нужного — берём с начала
    if patch.shape[0] < 16 or patch.shape[1] < 16:
        patch = gray[:min(h, patch_size), :min(w, patch_size)]

    if _HAVE_SCIPY:
        dct = _scipy_dctn(patch.astype(np.float64), norm="ortho")
    else:
        # Fallback: используем FFT как приближение DCT
        dct = np.fft.fft2(patch.astype(np.float64)).real

    power = dct ** 2
    total = float(power.sum())
    if total < 1e-12:
        return 0.0

    # Высокочастотная часть — правый нижний квадрант
    ph, pw = patch.shape
    hf     = float(power[ph // 2:, pw // 2:].sum())
    return hf / total


# ---------------------------------------------------------------------------
# Metric 11 — Metadata flag
# ---------------------------------------------------------------------------

def compute_metadata_flag(pil_img: Image.Image) -> int:
    try:
        exif = pil_img.getexif()
    except Exception:
        return 1

    if not exif:
        return 1

    software = str(exif.get(_EXIF_SOFTWARE, "")).lower().strip()
    make     = str(exif.get(_EXIF_MAKE,     "")).strip()
    model    = str(exif.get(_EXIF_MODEL,    "")).strip()

    if any(kw in software for kw in _AI_SOFTWARE_KEYWORDS):
        return 1
    if make or model:
        return 0
    return 1


# ---------------------------------------------------------------------------
# Orchestration
# ---------------------------------------------------------------------------

def compute_metrics(path: str | Path) -> ImageMetrics:
    pil_img = load_image_rgb(path)
    rgb     = pil_to_numpy_rgb(pil_img)
    gray    = rgb_to_gray(rgb)

    return ImageMetrics(
        entropy            = compute_entropy(gray),
        laplacian_variance = compute_laplacian_variance(gray),
        hf_energy_ratio    = compute_hf_energy_ratio(gray),
        spectral_slope     = compute_spectral_slope(gray),
        noise_entropy      = compute_noise_entropy(gray),
        gradient_variance  = compute_gradient_variance(gray),
        edge_density       = compute_edge_density(gray),
        color_uniformity   = compute_color_uniformity(rgb),
        saturation_mean    = compute_saturation_mean(rgb),
        dct_energy_ratio   = compute_dct_energy_ratio(gray),
        metadata_flag      = compute_metadata_flag(pil_img),
    )


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main() -> None:
    import argparse
    import json

    ap = argparse.ArgumentParser(
        description="Compute AI-image heuristic metrics."
    )
    ap.add_argument("image",      help="Path to image file.")
    ap.add_argument("--json",     dest="as_json", action="store_true")
    args = ap.parse_args()

    m = compute_metrics(args.image)

    if args.as_json:
        print(json.dumps(m.__dict__, indent=2, ensure_ascii=False))
    else:
        width = max(len(k) for k in m.__dict__)
        for key, val in m.__dict__.items():
            if isinstance(val, float):
                print(f"{key:<{width}} = {val:.6f}")
            else:
                print(f"{key:<{width}} = {val}")


if __name__ == "__main__":
    main()