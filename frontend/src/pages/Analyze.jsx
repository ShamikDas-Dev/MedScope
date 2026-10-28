import { useCallback, useEffect } from "react";
import UploadZone from "../components/upload/UploadZone";
import ImagePreview from "../components/upload/ImagePreview";
import AnalysisProgress from "../components/analysis/AnalysisProgress";
import AnalysisError from "../components/analysis/AnalysisError";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import { useAnalysis } from "../hooks/useAnalysis";
import { formatModality, humanizeLabel } from "../utils/formatters";

export default function Analyze() {
  const {
    file,
    fileKind,
    previewUrl,
    state,
    result,
    error,
    selectFile,
    runAnalysis,
    reset,
    clearError,
  } = useAnalysis();

  useEffect(() => {
    if (state === "completed" || state === "error") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [state]);

  const handleSelect = useCallback(
    async (incoming) => {
      clearError();
      await selectFile(incoming);
    },
    [clearError, selectFile]
  );

  const handleAnalyze = useCallback(() => {
    runAnalysis();
  }, [runAnalysis]);

  const renderRightPanel = () => {
    if (state === "analyzing") {
      return <AnalysisProgress />;
    }

    if (state === "error") {
      return (
        <AnalysisError
          message={error}
          onRetry={file ? handleAnalyze : undefined}
          onReset={reset}
        />
      );
    }

    if (state === "completed" && result) {
      return (
        <ResultView
          result={result}
          previewUrl={previewUrl}
        />
      );
    }

    if (state === "ready") {
      return (
        <div className="status-empty">
          <div className="status-empty__title">
            Ready to analyze.
          </div>

          <p className="status-empty__desc">
            {fileKind === "mri_zip"
              ? "Your knee MRI DICOM ZIP is ready. Click Analyze Image to start MRI screening."
              : "Review the preview, then click Analyze Image to start the medical-image analysis."}
          </p>
        </div>
      );
    }

    return (
      <div className="status-empty">
        <div className="status-empty__title">
          Upload an X-ray or knee MRI to begin.
        </div>

        <p className="status-empty__desc">
          X-rays use JPG, JPEG, or PNG. Knee MRI studies should be
          uploaded as a ZIP containing DICOM files.
        </p>
      </div>
    );
  };

  return (
    <div
      className="page"
      style={{ paddingTop: "var(--nav-height)" }}
    >
      <div
        className="container"
        style={{
          paddingTop: "var(--space-7)",
          paddingBottom: "var(--space-9)",
        }}
      >
        <header className="analyze-page__header">
          <span className="eyebrow">Analysis</span>

          <h1 className="analyze-page__title">
            Analyze an Image
          </h1>

          <p className="analyze-page__subtitle">
            Upload an X-ray or knee MRI. MedScope identifies the
            input format and routes it to the appropriate screening
            pipeline.
          </p>
        </header>

        <div className="analyze-layout">
          <div
            className="panel"
            aria-label="Upload panel"
          >
            <div className="panel__header">
              <span className="panel__title">
                Medical image
              </span>

              {state === "ready" && (
                <Badge variant="muted">Ready</Badge>
              )}

              {state === "analyzing" && (
                <Badge variant="warning">
                  Analyzing
                </Badge>
              )}

              {state === "completed" && (
                <Badge variant="success">
                  Completed
                </Badge>
              )}

              {state === "error" && (
                <Badge variant="danger">
                  Error
                </Badge>
              )}
            </div>

            <div className="panel__body">
              {previewUrl ? (
                <ImagePreview
                  src={previewUrl}
                  file={file}
                  onRemove={reset}
                  onAnalyze={handleAnalyze}
                  analyzing={state === "analyzing"}
                />
              ) : fileKind === "mri_zip" ? (
                <MRIFilePreview
                  file={file}
                  onRemove={reset}
                  onAnalyze={handleAnalyze}
                  analyzing={state === "analyzing"}
                />
              ) : (
                <UploadZone
                  onFileSelected={handleSelect}
                  disabled={state === "analyzing"}
                />
              )}
            </div>
          </div>

          <div
            className="panel"
            aria-label="Result panel"
          >
            <div className="panel__header">
              <span className="panel__title">
                Result
              </span>
            </div>

            <div className="panel__body">
              {renderRightPanel()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MRIFilePreview({
  file,
  onRemove,
  onAnalyze,
  analyzing,
}) {
  const sizeMb = file
    ? (file.size / (1024 * 1024)).toFixed(2)
    : "0.00";

  return (
    <div
      style={{
        width: "100%",
      }}
    >
      {/* MRI file preview area — same visual weight as image preview */}
      <div
        style={{
          width: "100%",
          minHeight: "360px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "var(--radius-lg)",
          background: "var(--color-surface-soft)",
          border: "1px solid var(--color-border)",
          padding: "var(--space-7)",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "520px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "84px",
              height: "84px",
              margin: "0 auto var(--space-4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
              fontSize: "1.35rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              color: "var(--color-primary)",
            }}
          >
            MRI
          </div>

          <div
            className="explanation-block__label"
            style={{ marginBottom: "var(--space-2)" }}
          >
            KNEE MRI STUDY
          </div>

          <div
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              wordBreak: "break-word",
            }}
          >
            {file?.name || "MRI DICOM ZIP"}
          </div>

          <div
            style={{
              marginTop: "var(--space-2)",
              color: "var(--color-muted)",
              fontSize: "0.9rem",
            }}
          >
            DICOM ZIP · {sizeMb} MB
          </div>

          <p
            className="explanation-block__text"
            style={{
              marginTop: "var(--space-4)",
              color: "var(--color-muted)",
            }}
          >
            This MRI study will be processed as DICOM data.
            The ZIP file itself cannot be displayed as an image.
          </p>
        </div>
      </div>

      {/* Same action area style as the existing image workflow */}
      <div
        style={{
          marginTop: "var(--space-4)",
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "var(--space-3)",
        }}
      >
        <Button
          variant="primary"
          type="button"
          onClick={onAnalyze}
          disabled={analyzing}
        >
          {analyzing ? "Analyzing..." : "Analyze Image"}
        </Button>

        <Button
          variant="secondary"
          type="button"
          onClick={onRemove}
          disabled={analyzing}
        >
          Remove
        </Button>
      </div>

      <div
        className="inline-disclaimer"
        style={{
          marginTop: "var(--space-4)",
        }}
      >
        MRI screening requires a DICOM study ZIP. Results are
        AI-assisted and non-diagnostic.
      </div>
    </div>
  );
}

function ResultView({ result, previewUrl }) {
  const status = result?.status;

  if (status === "rejected") {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-4)",
        }}
      >
        <div className="status-callout status-callout--warning">
          <div>
            <div className="status-callout__title">
              Input not accepted
            </div>

            <p className="status-callout__text">
              {result.message ||
                "This file could not be accepted for analysis."}
            </p>
          </div>
        </div>

        {result.modality?.label && (
          <div className="result__summary">
            <Badge variant="muted">
              Detected: {formatModality(result.modality)}
            </Badge>
          </div>
        )}
      </div>
    );
  }

  if (status === "unsupported") {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-4)",
        }}
      >
        <div className="status-callout status-callout--warning">
          <div>
            <div className="status-callout__title">
              Body region not supported
            </div>

            <p className="status-callout__text">
              {result.message ||
                "This input is not supported by the current release."}
            </p>
          </div>
        </div>

        <div className="result__summary">
          {result.modality?.label && (
            <Badge variant="primary">
              {formatModality(result.modality)}
            </Badge>
          )}

          {result.body_part?.label && (
            <Badge variant="muted">
              {humanizeLabel(result.body_part.label)}
            </Badge>
          )}
        </div>
      </div>
    );
  }

  if (status === "completed") {
    const modality = result?.modality;
    const bodyPart = result?.body_part;
    const explanation = result?.explanation;

    // -----------------------------
    // MRI result
    // -----------------------------
    if (String(modality?.label).toLowerCase() === "mri") {
      const fracture =
        result?.fracture_screening || {};

      const fractureProbability =
        Number(
          fracture?.probability ??
            fracture?.probabilities?.Fracture ??
            0
        ) * 100;

      const prediction =
        fracture?.prediction || "Unavailable";

      const allFindings =
        result?.all_findings || {};

      const findingEntries = Object.entries(
        allFindings
      ).filter(
        ([, value]) =>
          Number.isFinite(Number(value))
      );

      return (
        <div className="result">
          <div className="result__summary">
            <Badge variant="primary">
              MRI
            </Badge>

            {bodyPart?.label && (
              <Badge variant="muted">
                {humanizeLabel(bodyPart.label)}
              </Badge>
            )}

            <Badge variant="muted">
              AI-assisted screening
            </Badge>
          </div>

          <div
            style={{
              padding: "var(--space-5)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              background: "var(--color-surface-soft)",
            }}
          >
            <div className="explanation-block__label">
              Primary MRI screening result
            </div>

            <div
              style={{
                fontSize: "2rem",
                fontWeight: 600,
                marginTop: "var(--space-2)",
              }}
            >
              {prediction}
            </div>

            <div
              style={{
                marginTop: "var(--space-3)",
                display: "flex",
                flexWrap: "wrap",
                gap: "var(--space-3)",
              }}
            >
              <Badge variant="warning">
                Fracture: {fractureProbability.toFixed(1)}%
              </Badge>
            </div>
          </div>

          <div
            style={{
              padding: "var(--space-5)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              background: "var(--color-surface-soft)",
            }}
          >
            <div className="explanation-block__label">
              Screening model confidence
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "var(--space-2)",
                marginTop: "var(--space-2)",
              }}
            >
              <strong
                style={{
                  fontSize: "2.2rem",
                  fontWeight: 600,
                }}
              >
                {fractureProbability.toFixed(1)}%
              </strong>

              <span
                style={{
                  color: "var(--color-muted)",
                  fontSize: "0.95rem",
                }}
              >
                predicted fracture probability
              </span>
            </div>

            <div
              style={{
                marginTop: "var(--space-3)",
                height: "8px",
                borderRadius: "999px",
                background: "var(--color-border)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${Math.max(
                    0,
                    Math.min(100, fractureProbability)
                  )}%`,
                  height: "100%",
                  borderRadius: "999px",
                  background: "var(--color-primary)",
                }}
              />
            </div>

            <p
              className="explanation-block__text"
              style={{
                marginTop: "var(--space-3)",
              }}
            >
              This is the model's predicted probability for
              the fracture class. It is not a measure of
              clinical certainty.
            </p>
          </div>

          {findingEntries.length > 0 && (
            <div
              style={{
                padding: "var(--space-5)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                background: "var(--color-surface-soft)",
              }}
            >
              <div className="explanation-block__label">
                Other model findings
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "var(--space-3)",
                  marginTop: "var(--space-4)",
                }}
              >
                {findingEntries.map(
                  ([label, value]) => (
                    <div
                      key={label}
                      style={{
                        padding: "var(--space-3)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius-md)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "0.9rem",
                          color: "var(--color-muted)",
                        }}
                      >
                        {label}
                      </div>

                      <strong
                        style={{
                          display: "block",
                          marginTop: "4px",
                        }}
                      >
                        {(Number(value) * 100).toFixed(1)}%
                      </strong>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          <div className="explanation-block">
            <span className="explanation-block__label">
              Explanation
            </span>

            {explanation?.summary ? (
              <p className="explanation-block__text">
                {explanation.summary}
              </p>
            ) : (
              <p
                className="explanation-block__text"
                style={{ color: "var(--color-muted)" }}
              >
                No explanation was returned.
              </p>
            )}
          </div>

          {explanation?.meaning && (
            <div className="explanation-block">
              <span className="explanation-block__label">
                What the result means
              </span>

              <p className="explanation-block__text">
                {explanation.meaning}
              </p>
            </div>
          )}

          {explanation?.next_step && (
            <div className="explanation-block">
              <span className="explanation-block__label">
                Recommended next step
              </span>

              <p className="explanation-block__text">
                {explanation.next_step}
              </p>
            </div>
          )}

          <div className="inline-disclaimer">
            {explanation?.warning ||
              "This is an AI-assisted MRI screening result and not a medical diagnosis."}
          </div>
        </div>
      );
    }

    // -----------------------------
    // Existing X-ray result
    // -----------------------------
    const fracture =
      result?.fracture_screening;

    const prediction =
      fracture?.prediction || "Unavailable";

    const fracturedProbability =
      Number(
        fracture?.probabilities?.Fractured ?? 0
      ) * 100;

    const notFracturedProbability =
      Number(
        fracture?.probabilities?.["Not Fractured"] ?? 0
      ) * 100;

    return (
      <div className="result">
        <div className="result__summary">
          {modality?.label && (
            <Badge variant="primary">
              {formatModality(modality)}
            </Badge>
          )}

          {bodyPart?.label && (
            <Badge variant="muted">
              {humanizeLabel(bodyPart.label)}
            </Badge>
          )}

          <Badge variant="muted">
            AI-assisted screening
          </Badge>
        </div>

        <div
          style={{
            padding: "var(--space-5)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            background: "var(--color-surface-soft)",
          }}
        >
          <div className="explanation-block__label">
            Primary screening result
          </div>

          <div
            style={{
              fontSize: "2rem",
              fontWeight: 600,
              marginTop: "var(--space-2)",
            }}
          >
            {prediction}
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "var(--space-3)",
              marginTop: "var(--space-3)",
            }}
          >
            <Badge variant="warning">
              Fractured: {fracturedProbability.toFixed(1)}%
            </Badge>

            <Badge variant="muted">
              Not Fractured: {notFracturedProbability.toFixed(1)}%
            </Badge>
          </div>
        </div>

        <div
          style={{
            padding: "var(--space-5)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            background: "var(--color-surface-soft)",
          }}
        >
          <div className="explanation-block__label">
            Screening model confidence
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "var(--space-2)",
              marginTop: "var(--space-2)",
            }}
          >
            <strong
              style={{
                fontSize: "2.2rem",
                fontWeight: 600,
              }}
            >
              {Math.max(
                fracturedProbability,
                notFracturedProbability
              ).toFixed(1)}
              %
            </strong>

            <span
              style={{
                color: "var(--color-muted)",
                fontSize: "0.95rem",
              }}
            >
              predicted class probability
            </span>
          </div>

          <div
            style={{
              marginTop: "var(--space-3)",
              height: "8px",
              borderRadius: "999px",
              background: "var(--color-border)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${Math.max(
                  fracturedProbability,
                  notFracturedProbability
                )}%`,
                height: "100%",
                borderRadius: "999px",
                background: "var(--color-primary)",
              }}
            />
          </div>

          <p
            className="explanation-block__text"
            style={{ marginTop: "var(--space-3)" }}
          >
            This percentage represents the model's probability
            for the predicted class. It is not a measure of
            clinical certainty.
          </p>
        </div>

        <div className="explanation-block">
          <span className="explanation-block__label">
            Explanation
          </span>

          {explanation?.summary ? (
            <p className="explanation-block__text">
              {explanation.summary}
            </p>
          ) : (
            <p
              className="explanation-block__text"
              style={{ color: "var(--color-muted)" }}
            >
              No explanation was returned.
            </p>
          )}
        </div>

        {explanation?.meaning && (
          <div className="explanation-block">
            <span className="explanation-block__label">
              What the result means
            </span>

            <p className="explanation-block__text">
              {explanation.meaning}
            </p>
          </div>
        )}

        {explanation?.next_step && (
          <div className="explanation-block">
            <span className="explanation-block__label">
              Recommended next step
            </span>

            <p className="explanation-block__text">
              {explanation.next_step}
            </p>
          </div>
        )}

        <div className="inline-disclaimer">
          {explanation?.warning ||
            "This is an AI-assisted screening result and not a medical diagnosis. Professional review is recommended for clinical decisions."}
        </div>
      </div>
    );
  }

  return (
    <div className="status-empty">
      <div className="status-empty__title">
        Unexpected response
      </div>

      <p className="status-empty__desc">
        The analysis service returned a response MedScope did
        not recognize.
      </p>
    </div>
  );
}
