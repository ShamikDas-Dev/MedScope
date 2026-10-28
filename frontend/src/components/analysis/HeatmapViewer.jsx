import { resolveApiAssetUrl } from "../../services/api";

export default function HeatmapViewer({ visualization }) {
  const available = Boolean(visualization?.available);
  const url = visualization?.url ? resolveApiAssetUrl(visualization.url) : null;

  if (!available || !url) {
    return (
      <div className="heatmap-unavailable" role="note">
        Visual explanation unavailable for this analysis.
      </div>
    );
  }

  return (
    <div className="heatmap-viewer">
      <img
        className="heatmap-viewer__img"
        src={url}
        alt="Model-generated visual explanation (heatmap)"
      />
    </div>
  );
}