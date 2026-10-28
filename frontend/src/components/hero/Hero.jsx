import Button from "../common/Button";

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container">
        <div className="hero__grid">
          <div>
            <span className="hero__eyebrow eyebrow">
              <span className="hero__dot" aria-hidden="true" />
              AI-Assisted Medical Image Analysis
            </span>

            <h1 id="hero-title" className="hero__title">
              See deeper into
              <br />
              <em>medical images.</em>
            </h1>

            <p className="hero__subtitle">
              AI-assisted medical image analysis built around specialized models,
              visual evidence, and understandable results.
            </p>

            <div className="hero__note" role="note">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>
                Currently supporting <strong>wrist and ankle X-ray</strong> fracture screening.
              </span>
            </div>

            <div className="hero__actions">
              <Button to="/analyze" variant="primary" size="lg">
                Analyze an Image
              </Button>
              <Button to="/research" variant="secondary" size="lg">
                Explore the Research
              </Button>
            </div>
          </div>

          <div className="hero__visual" aria-hidden="true">
            <div className="hero__frame">
              <div className="hero__frame-grid" />
              <div className="hero__frame-scan" />
              <div className="hero__frame-center">
                <svg viewBox="0 0 200 300" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
                  <rect x="60" y="10" width="80" height="280" rx="8" fill="none" stroke="rgba(248,231,201,0.35)" strokeWidth="1.5" />
                  <line x1="20" y1="80" x2="180" y2="80" stroke="rgba(248,231,201,0.18)" strokeWidth="1" />
                  <line x1="20" y1="150" x2="180" y2="150" stroke="rgba(248,231,201,0.18)" strokeWidth="1" />
                  <line x1="20" y1="220" x2="180" y2="220" stroke="rgba(248,231,201,0.18)" strokeWidth="1" />
                  <circle cx="100" cy="60" r="4" fill="rgba(248,231,201,0.5)" />
                  <circle cx="100" cy="140" r="4" fill="rgba(248,231,201,0.5)" />
                  <circle cx="100" cy="220" r="4" fill="rgba(248,231,201,0.5)" />
                </svg>
              </div>
              <div className="hero__frame-line" style={{ top: "38%" }} />
              <div className="hero__frame-line" style={{ top: "62%" }} />
            </div>

            <div className="hero__badge">
              <span>Imaging Preview</span>
              <span className="hero__badge-meta">No result data</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}