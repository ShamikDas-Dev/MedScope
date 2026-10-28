/**
 * Research references.
 *
 * This array is intentionally EMPTY. Populate it later with real,
 * verified references. Each object should match the shape below.
 *
 * Example (DO NOT treat as real — placeholder shape only):
 * {
 *   id: "unique-id",
 *   title: "Paper title",
 *   authors: "Author names",
 *   journal: "Journal / conference",
 *   year: 2024,
 *   description: "Short neutral description.",
 *   link: "https://...",
 *   category: "Explainability"
 * }
 *
 * The Research page renders these automatically once added.
 */
export const researchPapers = [];

/** Categories used to organise the research page sections. */
export const researchCategories = [
  "Featured Research",
  "Datasets",
  "Model Architecture",
  "Explainability",
  "Medical AI"
];

/**
 * Modalities — used for roadmap / future-facing copy.
 * Only `xray` is currently active.
 */
export const modalities = {
  xray: { label: "X-Ray", active: true },
  mri: { label: "MRI", active: false },
  ct: { label: "CT", active: false }
};