export function normalizeLabel(label) {
  return label === "AI-generated" || label === "ai" ? "ai" : "real";
}
