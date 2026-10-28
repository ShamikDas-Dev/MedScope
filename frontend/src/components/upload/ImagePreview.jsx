import Button from "../common/Button";
import FileInfo from "./FileInfo";

export default function ImagePreview({ src, file, onRemove, onAnalyze, analyzing }) {
  if (!src) return null;

  return (
    <div className="preview">
      <div className="preview__frame">
        <img className="preview__img" src={src} alt="Selected medical image preview" />
      </div>

      <div className="preview__meta">
        <FileInfo file={file} />
        <div className="preview__actions">
          <Button variant="ghost" size="sm" onClick={onRemove} disabled={analyzing}>
            Remove
          </Button>
        </div>
      </div>

      <Button
        variant="primary"
        size="lg"
        block
        onClick={onAnalyze}
        loading={analyzing}
        disabled={analyzing}
      >
        {analyzing ? "Analyzing…" : "Analyze Image"}
      </Button>

      <p className="inline-disclaimer">
        MedScope is a research and educational prototype. Results are AI-assisted,
        non-diagnostic, and may be incorrect.
      </p>
    </div>
  );
}