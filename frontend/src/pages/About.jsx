import SectionHeading from "../components/common/SectionHeading";
import Disclaimer from "../components/safety/Disclaimer";

const TECH = [
  "React",
  "Vite",
  "FastAPI",
  "PyTorch",
  "Hugging Face",
  "Computer Vision",
  "Explainable AI",
  "Medical LLMs"
];

export default function About() {
  return (
    <div className="page" style={{ paddingTop: "var(--nav-height)" }}>
      <div className="container">
        <header className="page-header">
          <span className="eyebrow">About</span>
          <h1 className="page-header__title">About MedScope</h1>
          <p className="page-header__subtitle">
            MedScope is a research and educational prototype exploring how
            specialized computer-vision models, explainability, and medical
            language models can be combined in a single, understandable pipeline.
          </p>
        </header>

        <div className="about-blocks">
          <div className="about-block">
            <div className="about-block__label">What is MedScope?</div>
            <div className="about-block__content">
              <p>
                MedScope is an AI-assisted medical image analysis platform. The
                current release focuses on wrist and ankle X-ray fracture
                screening. It is designed as a layered pipeline — modality
                validation, anatomy detection, condition-specific analysis, and
                explanation — rather than a single general-purpose model.
              </p>
              <p>
                Every result is framed as AI-assisted and non-diagnostic. MedScope
                does not provide medical advice and does not replace evaluation by
                a qualified healthcare professional.
              </p>
            </div>
          </div>

          <div className="about-block">
            <div className="about-block__label">Why it was built</div>
            <div className="about-block__content">
              <p>
                Medical imaging AI is often presented as a black box: an input
                image goes in, and a confident-looking label comes out. MedScope
                was built to explore what a more legible pipeline looks like —
                one that makes its validation steps visible, its evidence
                inspectable, and its language deliberately non-diagnostic.
              </p>
            </div>
          </div>

          <div className="about-block">
            <div className="about-block__label">Current V1 scope</div>
            <div className="about-block__content">
              <ul style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                <li>• Modality: X-Ray</li>
                <li>• Anatomies: Wrist, Ankle</li>
                <li>• Task: Fracture screening</li>
                <li>• Output: Findings, confidence, and (where available) a visual explanation</li>
              </ul>
              <p>
                Other modalities (MRI, CT) and additional anatomies are planned
                but not currently supported.
              </p>
            </div>
          </div>

          <div className="about-block">
            <div className="about-block__label">Technology</div>
            <div className="about-block__content">
              <p>
                The frontend is a React application built with Vite. The backend
                service is designed around FastAPI. Model training and inference
                use PyTorch and Hugging Face tooling. Explainability and
                medical-language generation are handled by dedicated components
                behind the backend API.
              </p>
              <div className="tech-list">
                {TECH.map((t) => (
                  <span key={t} className="tech-tag">
                    {t}
                  </span>
                ))}
              </div>
              <p style={{ fontSize: 13 }}>
                Not all listed technologies are integrated in V1. The list
                describes the intended stack.
              </p>
            </div>
          </div>

          <div className="about-block">
            <div className="about-block__label">Responsible AI</div>
            <div className="about-block__content">
              <p>
                MedScope is a research and educational prototype. Its outputs may
                be incorrect. Confidence scores describe the model's internal
                estimate — not medical certainty. No result should be used for
                clinical decision-making without review by a qualified
                professional.
              </p>
            </div>
          </div>

          <div className="about-block">
            <div className="about-block__label">Future direction</div>
            <div className="about-block__content">
              <p>
                Planned work includes additional X-ray anatomies, additional
                analysis tasks, improved localization, and eventually MRI and CT
                support with multi-modal analysis. These are described as
                direction, not as available features.
              </p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "var(--space-8)" }}>
          <SectionHeading
            eyebrow="Responsible AI"
            title="AI-assisted. Not a diagnosis."
            description="MedScope is intended to support understanding, not to replace professional judgement."
          />
        </div>
      </div>

      <Disclaimer />
    </div>
  );
}