import SectionHeading from "../components/common/SectionHeading";
import Button from "../components/common/Button";

const DETAIL_STEPS = [
  {
    num: "01",
    title: "Upload",
    desc: "The user selects a wrist or ankle X-ray. The image stays local until the user explicitly requests an analysis."
  },
  {
    num: "02",
    title: "Modality Validation",
    desc: "The service checks whether the uploaded image is a supported modality (currently X-ray). Non-X-ray images are rejected with a clear message."
  },
  {
    num: "03",
    title: "Anatomy Detection",
    desc: "If the modality is supported, the service attempts to identify the body region. Unsupported regions are flagged rather than analyzed."
  },
  {
    num: "04",
    title: "Condition-Specific Analysis",
    desc: "A task-specific computer-vision model runs on the image. The model is selected by modality and anatomy — not a single general-purpose model."
  },
  {
    num: "05",
    title: "Explainability",
    desc: "Where available, the model produces visual evidence (e.g. a heatmap) so the user can see which regions influenced the output."
  },
  {
    num: "06",
    title: "AI-Assisted Explanation",
    desc: "Model output is summarised in plain language. The explanation is intentionally non-diagnostic and framed as AI-assisted screening."
  }
];

const PIPELINE = [
  { label: "User", accent: false },
  { label: "Frontend", accent: false },
  { label: "FastAPI", accent: false },
  { label: "Image Validation", accent: true },
  { label: "Model Registry", accent: true },
  { label: "Specialized Model", accent: true },
  { label: "Findings", accent: false },
  { label: "LLM Explanation", accent: true },
  { label: "Frontend", accent: false }
];

export default function HowItWorks() {
  return (
    <div className="page" style={{ paddingTop: "var(--nav-height)" }}>
      <div className="container">
        <header className="page-header">
          <span className="eyebrow">Process</span>
          <h1 className="page-header__title">How MedScope works</h1>
          <p className="page-header__subtitle">
            MedScope is structured as a pipeline rather than a single model call.
            Each stage validates the input before handing off to the next.
          </p>
        </header>

        <section className="section" style={{ paddingTop: 0 }}>
          <SectionHeading
            eyebrow="Pipeline"
            title="From upload to explanation."
            description="Six stages, each narrow enough to reason about on its own."
          />

          <div className="detail-steps">
            {DETAIL_STEPS.map((s) => (
              <div key={s.num} className="detail-step">
                <div className="detail-step__num">{s.num}</div>
                <h3 className="detail-step__title">{s.title}</h3>
                <p className="detail-step__desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section" style={{ paddingTop: 0 }}>
          <SectionHeading
            eyebrow="Technical architecture"
            title="End-to-end architecture."
            description="The frontend never contains model credentials. All model access happens behind the backend service."
          />

          <div className="pipeline" aria-label="Technical pipeline diagram">
            {PIPELINE.map((node, i) => (
              <div key={`${node.label}-${i}`}>
                <div className="pipeline__row">
                  <div className={`pipeline__node ${node.accent ? "pipeline__node--accent" : ""}`}>
                    <span className="pipeline__node-index">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{node.label}</span>
                  </div>
                </div>
                {i < PIPELINE.length - 1 && (
                  <div className="pipeline__connector" aria-hidden="true">
                    <svg width="14" height="20" viewBox="0 0 14 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <line x1="7" y1="0" x2="7" y2="16" />
                      <polyline points="2 12 7 18 12 12" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: "var(--space-6)",
              padding: "var(--space-5)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              background: "var(--color-cream-soft)"
            }}
          >
            <div className="eyebrow" style={{ marginBottom: "var(--space-2)" }}>
              Current V1 scope
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 18,
                fontWeight: 600,
                color: "var(--color-primary)"
              }}
            >
              X-Ray → Wrist / Ankle → Fracture Screening
            </div>
            <p style={{ marginTop: "var(--space-3)", color: "var(--color-muted)", fontSize: 14 }}>
              Additional modalities (MRI, CT) and additional anatomies are
              planned, not currently available.
            </p>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="final-cta" style={{ padding: "var(--space-8) 0" }}>
            <h2 className="final-cta__title" style={{ fontSize: "clamp(28px, 3.5vw, 40px)" }}>
              Ready to try it?
            </h2>
            <div className="final-cta__actions">
              <Button to="/analyze" variant="primary" size="lg">
                Analyze an Image
              </Button>
              <Button to="/research" variant="secondary" size="lg">
                Read the Research
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}