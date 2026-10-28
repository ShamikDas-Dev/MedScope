import { useEffect, useState } from "react";
import Loader from "../common/Loader";

/**
 * Shows an indeterminate progress UI while the analysis request is in flight.
 * Steps are shown as a running narrative — not as completed milestones —
 * because the backend does not stream per-step status in V1.
 */
const STEPS = [
  "Preparing image…",
  "Validating image…",
  "Analyzing…",
  "Generating explanation…"
];

export default function AnalysisProgress() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % STEPS.length);
    }, 2200);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="analysis-progress" role="status" aria-live="polite">
      <div className="analysis-progress__header">
        <Loader />
        <span>Analyzing image</span>
      </div>

      <div className="analysis-progress__steps">
        {STEPS.map((label, idx) => (
          <div
            key={label}
            className={`progress-step ${
              idx === activeIndex ? "progress-step--active" : ""
            }`}
          >
            <span className="progress-step__marker" aria-hidden="true">
              {idx === activeIndex ? (
                <Loader />
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="8" />
                </svg>
              )}
            </span>
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div className="progress-bar" aria-hidden="true">
        <div
          className="progress-bar__fill"
          style={{
            width: `${((activeIndex + 1) / STEPS.length) * 100}%`,
            transition: "width 2s linear"
          }}
        />
      </div>

      <p className="inline-disclaimer">
        The request is in progress. Steps illustrate the pipeline and are not
        reported individually by the service.
      </p>
    </div>
  );
}