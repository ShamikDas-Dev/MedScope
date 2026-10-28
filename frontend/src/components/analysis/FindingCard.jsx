import { formatModality, humanizeLabel } from "../../utils/formatters";
import ConfidenceIndicator from "./ConfidenceIndicator";
import Badge from "../common/Badge";

/**
 * Renders the primary finding from a completed backend response.
 * Expected shape (all fields read defensively — nothing hardcoded):
 *
 * {
 *   modality:   { label, confidence },
 *   body_part:  { label, confidence },
 *   fracture:   { label, confidence }
 * }
 */
export default function FindingCard({ modality, bodyPart, fracture }) {
  const fractureLabel = fracture?.label ? humanizeLabel(fracture.label) : null;
  const isPositive = /fracture/i.test(fractureLabel || "") && !/no[_ ]?fracture/i.test(fractureLabel || "");

  const cardClass = `finding-card ${
    isPositive ? "finding-card--positive" : "finding-card--negative"
  }`;

  return (
    <div className={cardClass}>
      <div>
        <div className="finding-card__label">Primary finding</div>
        <div className="finding-card__value">
          {fractureLabel || "No finding label returned"}
        </div>
      </div>

      <div className="finding-card__row">
        <div className="finding-card__cell">
          <span className="finding-card__cell-label">Modality</span>
          <span className="finding-card__cell-value">
            {formatModality(modality)}
          </span>
          {modality?.confidence != null && (
            <ConfidenceIndicator value={modality.confidence} label="Modality confidence" />
          )}
        </div>

        <div className="finding-card__cell">
          <span className="finding-card__cell-label">Body region</span>
          <span className="finding-card__cell-value">
            {bodyPart?.label ? humanizeLabel(bodyPart.label) : "—"}
          </span>
          {bodyPart?.confidence != null && (
            <ConfidenceIndicator value={bodyPart.confidence} label="Region confidence" />
          )}
        </div>
      </div>

      {fracture?.confidence != null && (
        <ConfidenceIndicator value={fracture.confidence} label="Finding confidence" />
      )}

      <div>
        <Badge variant="muted">AI-assisted result — non-diagnostic</Badge>
      </div>
    </div>
  );
}