# MedScope

**AI-Assisted Medical Image Analysis**

MedScope is a research and educational prototype for AI-assisted medical
image analysis. The current release focuses on **wrist and ankle X-ray
fracture screening**, but the frontend is structured so additional modalities
(MRI, CT) and anatomies can be added later without redesign.

> **MedScope is not a medical device.** Results are AI-assisted,
> non-diagnostic, and may be incorrect. They must not replace evaluation by a
> qualified healthcare professional.

---

## Features

- Editorial, research-grade UI (deep green / warm cream palette)
- Functional upload flow: drag & drop, file picker, validation, preview, remove
- Frontend file validation (MIME + extension + size + readability)
- Real API integration via `POST /api/analyze` (multipart/form-data)
- Backend-driven results: findings, confidence, heatmap, explanation
- Empty / loading / error / rejected / unsupported states — no fabricated data
- Responsive layout (320px → 1440px+)
- Accessible: semantic HTML, keyboard navigation, ARIA, focus states
- Restrained animation, respects `prefers-reduced-motion`

---

## Current V1 scope

| | |
|---|---|
| **Modality** | X-Ray |
| **Anatomies** | Wrist, Ankle |
| **Task** | Fracture screening |
| **Output** | Findings, confidence, visual explanation (when available), AI-assisted summary |

MRI, CT, and additional anatomies are **planned**, not currently supported.

---

## Frontend architecture

```
src/
├── components/
│   ├── common/       Button, Loader, ErrorMessage, Badge, SectionHeading
│   ├── layout/       Navbar, MobileMenu, Footer, ScrollToTop
│   ├── hero/         Hero
│   ├── upload/       UploadZone, ImagePreview, FileInfo, UploadCTA
│   ├── analysis/     AnalysisProgress, FindingCard, ConfidenceIndicator,
│   │                 ImageViewer, HeatmapViewer, AnalysisError
│   ├── research/     ResearchSection, ResearchCard, ResearchEmptyState
│   ├── safety/       Disclaimer
│   └── roadmap/      Roadmap
├── pages/            Home, Analyze, HowItWorks, Research, About, NotFound
├── services/         api.js
├── hooks/            useAnalysis.js
├── utils/            validation.js, formatters.js
├── data/             research.js
└── styles/           variables.css, globals.css, components.css, responsive.css
```

The frontend never holds API keys, model tokens, or backend credentials. All
model access happens behind the backend service.

---

## Installation

```bash
npm install
```

## Environment variables

Copy `.env.example` to `.env` and set the backend URL:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Running locally

```bash
npm run dev
```

Then open the printed URL (defaults to `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

---

## Backend integration

The frontend calls:

```
POST {VITE_API_BASE_URL}/api/analyze
Content-Type: multipart/form-data
Field:        image
```

Expected response shapes:

**Non-X-ray**

```json
{ "status": "rejected", "reason": "not_xray", "message": "..." }
```

**Unsupported X-ray body region**

```json
{ "status": "unsupported", "reason": "unsupported_body_part", "message": "..." }
```

**Successful result**

```json
{
  "status": "completed",
  "analysis_id": "...",
  "modality":    { "label": "xray",  "confidence": 0.0 },
  "body_part":   { "label": "wrist", "confidence": 0.0 },
  "fracture":    { "label": "…",     "confidence": 0.0 },
  "visualization": { "available": true, "url": "/api/results/.../heatmap" },
  "explanation": { "summary": "…" }
}
```

If the backend is unreachable or returns a non-2xx response, MedScope displays
a clean error state. It never fabricates results.

---

## Project structure

```
frontend/
├── public/
│   ├── favicon.svg
│   └── logo.svg
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   ├── utils/
│   ├── data/
│   ├── styles/
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## Adding research references

Edit `src/data/research.js`:

```js
export const researchPapers = [
  {
    id: "unique-id",
    title: "…",
    authors: "…",
    journal: "…",
    year: 2024,
    description: "…",
    link: "https://…",
    category: "Explainability" // one of researchCategories
  }
];
```

The Research page and homepage research section update automatically.

---

## Future expansion

- Additional X-ray anatomies
- Additional analysis tasks
- Improved localization
- MRI and CT modalities
- Multi-modal analysis

These are planned directions and are not currently available.

---

## License

Research & educational prototype. © 2026 MedScope.