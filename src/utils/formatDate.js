export function formatFirestoreDate(value) {
  if (!value) return "—";

  if (typeof value?.toDate === "function") {
    return value.toDate().toLocaleString();
  }

  return String(value);
}

export function toIsoDate(value) {
  if (!value) return null;

  if (typeof value?.toDate === "function") {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return value;
}
