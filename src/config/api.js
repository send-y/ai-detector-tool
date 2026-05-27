const apiBaseUrl = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/$/, "");

export const API_URL =
  process.env.REACT_APP_API_URL ||
  (apiBaseUrl ? `${apiBaseUrl}/api/analyze` : "http://localhost:5000/api/analyze");

const maxUploadMb = Number(process.env.REACT_APP_MAX_UPLOAD_MB || 10);

export const MAX_UPLOAD_MB = Number.isFinite(maxUploadMb) ? maxUploadMb : 10;
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/bmp",
  "image/tiff",
];
export const ALLOWED_IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".bmp",
  ".tif",
  ".tiff",
];
