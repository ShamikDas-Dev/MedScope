import ErrorMessage from "../common/ErrorMessage";
import Button from "../common/Button";

export default function AnalysisError({ message, onRetry, onReset }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <ErrorMessage title="We couldn't complete the analysis.">
        {message || "Something went wrong. Please try again."}
      </ErrorMessage>

      <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
        {onRetry && (
          <Button variant="primary" onClick={onRetry}>
            Try again
          </Button>
        )}
        {onReset && (
          <Button variant="ghost" onClick={onReset}>
            Start over
          </Button>
        )}
      </div>
    </div>
  );
}