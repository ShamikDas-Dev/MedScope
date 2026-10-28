import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <div className="footer__brand">
              <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true">
                <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="16" cy="16" r="5" fill="currentColor" />
              </svg>
              <span>MEDSCOPE</span>
            </div>
            <p className="footer__tagline">
              AI-Assisted Medical Image Analysis. A research and educational prototype.
            </p>
          </div>

          <div className="footer__col">
            <h4>Platform</h4>
            <div className="footer__links">
              <Link to="/analyze">Analyze</Link>
              <Link to="/how-it-works">How It Works</Link>
              <Link to="/research">Research</Link>
              <Link to="/about">About</Link>
            </div>
          </div>

          <div className="footer__col">
            <h4>Scope</h4>
            <div className="footer__links">
              <span style={{ fontSize: 14, color: "var(--color-muted)" }}>
                Current V1: Wrist &amp; Ankle X-Ray fracture screening
              </span>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <span className="footer__note">Research &amp; Educational Prototype</span>
          <span>© 2026 MedScope</span>
        </div>
      </div>
    </footer>
  );
}