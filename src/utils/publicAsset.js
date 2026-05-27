export function publicAsset(path) {
  const base = process.env.PUBLIC_URL || "";
  const cleanBase = base.replace(/\/$/, "");
  const cleanPath = String(path || "").replace(/^\/+/, "");

  return `${cleanBase}/${cleanPath}`;
}
