import Hero from "../components/hero/Hero";
import SectionHeading from "../components/common/SectionHeading";
import Button from "../components/common/Button";
import UploadCTA from "../components/upload/UploadCTA";
import Disclaimer from "../components/safety/Disclaimer";
import Roadmap from "../components/roadmap/Roadmap";
import ResearchSection from "../components/research/ResearchSection";
import { researchPapers } from "../data/research";

const CAPABILITIES = [
  "X-Ray Validation",
  "Anatomy Detection",
  "Fracture Screening",
  "Explainable AI"
];

const STEPS = [
  { num: "01", title: "Upload", desc: "Upload a supported medical image." },
  { num: "02", title: "Validate", desc: "MedScope checks whether the image is supported." },
  { num: "03", title: "Analyze", desc: "A specialized computer-vision model analyzes the image." },
  { num: "04", title: "Explain", desc: "Model evidence is combined with an AI-generated explanation." },
  { num: "05", title: "Understand", desc: "Receive a clear, non-diagnostic summary." }
];

const MVP_CARDS = [
  { label: "Supported", title: "Wrist X-Ray", desc: "Fracture screening" },
  { label: "Supported", title: "Ankle X-Ray", desc: "Fracture screening" },
  { label: "Output", title: "Visual Explanation", desc: "Model-generated visual evidence" }
];

export default function Home() {
  const hasResearch = researchPapers.length > 0;

  return (
    <>
      <Hero />

      {/* Capability strip */}
      <section className="capability-strip" aria-label="Capabilities">
        <div className="container">
          <div className="capability-strip__inner">
            {CAPABILITIES.map((cap) => (
              <div key={cap} className="capability-strip__item">
                {cap}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How MedScope works */}
      <section className="section" id="how">
        <div className="container">
          <SectionHeading
            eyebrow="Process"
            title="From image to insight."
            description="A layered pipeline: each stage validates and narrows the analysis before a specialized model runs."
          />

          <div className="steps">
            {STEPS.map((s) => (
              <div key={s.num} className="step">
                <div className="step__num">{s.num}</div>
                <h3 className="step__title">{s.title}</h3>
                <p className="step__desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Layered analysis */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <SectionHeading
            eyebrow="Architecture"
            title="Layered analysis, not a single leap."
            description="MedScope is not simply Image → LLM → diagnosis. Each layer narrows the problem space before the next runs."
          />

          <div className="layered">
            <div className="layered__flow" aria-hidden="true">
              <div className="layered__node">
                <span>Image</span>
                <span className="layered__node-tag">Input</span>
              </div>
              <div className="layered__arrow">
                <svg width="14" height="20" viewBox="0 0 14 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="7" y1="0" x2="7" y2="16" />
                  <polyline points="2 12 7 18 12 12" />
                </svg>
              </div>

              <div className="layered__node">
                <span>Modality</span>
                <span className="layered__node-tag">Is it supported?</span>
              </div>
              <div className="layered__arrow">
                <svg width="14" height="20" viewBox="0 0 14 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="7" y1="0" x2="7" y2="16" />
                  <polyline points="2 12 7 18 12 12" />
                </svg>
              </div>

              <div className="layered__node">
                <span>Anatomy</span>
                <span className="layered__node-tag">Supported region?</span>
              </div>
              <div className="layered__arrow">
                <svg width="14" height="20" viewBox="0 0 14 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="7" y1="0" x2="7" y2="16" />
                  <polyline points="2 12 7 18 12 12" />
                </svg>
              </div>

              <div className="layered__node">
                <span>Condition</span>
                <span className="layered__node-tag">Task-specific model</span>
              </div>
              <div className="layered__arrow">
                <svg width="14" height="20" viewBox="0 0 14 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="7" y1="0" x2="7" y2="16" />
                  <polyline points="2 12 7 18 12 12" />
                </svg>
              </div>

              <div className="layered__node layered__node--highlight">
                <span>Explanation</span>
                <span className="layered__node-tag">Clear summary</span>
              </div>
            </div>

            <div className="layered__legend">
              <div className="layered__item">
                <h4>Modality</h4>
                <p>Is the uploaded image supported?</p>
              </div>
              <div className="layered__item">
                <h4>Anatomy</h4>
                <p>Is the body region supported?</p>
              </div>
              <div className="layered__item">
                <h4>Condition</h4>
                <p>Which task-specific model should analyze the image?</p>
              </div>
              <div className="layered__item">
                <h4>Explanation</h4>
                <p>How can the model output be communicated clearly?</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Current MVP */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <SectionHeading
            eyebrow="Current release"
            title="Built around a focused first release."
            description="V1 is deliberately narrow: a small number of anatomies and a single analysis task, so behaviour can be examined carefully."
          />

          <div className="mvp-grid">
            {MVP_CARDS.map((c) => (
              <div key={c.title} className="mvp-card">
                <span className="mvp-card__label">{c.label}</span>
                <h3 className="mvp-card__title">{c.title}</h3>
                <p className="mvp-card__desc">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <UploadCTA />

      {/* Research */}
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Research"
            title="Research behind MedScope"
            description="The platform is designed around published research in medical imaging, fracture detection, explainable AI, and medical multimodal models."
          />

          {hasResearch ? (
            <ResearchSection
              title="Reference papers"
              description="Verified references added by the maintainers."
              papers={researchPapers}
            />
          ) : (
            <div className="research-empty" role="status">
              <div className="research-empty__title">Research references</div>
              <p className="research-empty__desc">
                Research papers and technical references will appear here as they
                are added.
              </p>
            </div>
          )}
        </div>
      </section>

      <Disclaimer />

      {/* Roadmap */}
      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Direction"
            title="Where MedScope is heading."
            description="Unsupported modalities and tasks are described as planned, not available."
          />
          <Roadmap />
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <div className="container">
          <h2 className="final-cta__title">
            Explore what MedScope can see.
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
    </>
  );
}