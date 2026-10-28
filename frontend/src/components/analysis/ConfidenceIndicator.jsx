import { formatConfidence, toConfidencePercent } from "../../utils/formatters";

export default function ConfidenceIndicator({ value, label = "Model confidence" }) {
  const pct = toConfidencePercent(value);
  const hasValue = value !== null && value !== undefined && Number.isFinite(Number(value));

  return (
    <div className="confidence">
      <div className="confidence__header">
        <span className="confidence__label">{label}</span>
        <span className="confidence__value">{hasValue ? formatConfidence(value) : "—"}</span>
      </div>
      <div
        className="confidence__bar"
        role="progressbar"
        aria-valuenow={hasValue ? pct : undefined}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className="confidence__fill" style={{ width: `${hasValue ? pct : 0}%` }} />
      </div>
      <p className="confidence__note">
        A high confidence score does not mean a finding is medically confirmed.
      </p>
    </div>
  );
}