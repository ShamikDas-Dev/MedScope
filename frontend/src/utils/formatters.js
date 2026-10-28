export function formatConfidence(value) {
  if (value === null || value === undefined) return "—";
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) return "—";
  const pct = num > 1 ? num : num * 100;
  return `${Math.round(pct)}%`;
}

export function toConfidencePercent(value) {
  if (value === null || value === undefined) return 0;
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) return 0;
  const pct = num > 1 ? num : num * 100;
  return Math.max(0, Math.min(100, Math.round(pct)));
}

export function humanizeLabel(value) {
  if (!value && value !== 0) return "—";
  return String(value)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());
}

export function formatModality(modality) {
  if (!modality) return "—";
  const label = modality.label || modality;
  if (typeof label !== "string") return "—";
  if (label.toLowerCase() === "xray" || label.toLowerCase() === "x-ray") {
    return "X-Ray";
  }
  return humanizeLabel(label);
}