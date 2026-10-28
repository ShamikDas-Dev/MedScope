import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  analyzeImage as analyzeImageRequest,
  ApiError,
} from "../services/api";

import {
  validateMedicalFile,
  validateImageReadable,
} from "../utils/validation";

/**
 * Analysis states:
 *   "idle"      — no file selected
 *   "ready"     — a valid file is selected, not yet analyzed
 *   "analyzing" — request in flight
 *   "completed" — backend returned a response
 *   "error"     — request or validation failure
 */
export function useAnalysis() {
  const [file, setFile] = useState(null);
  const [fileKind, setFileKind] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [state, setState] = useState("idle");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const previewUrlRef = useRef(null);

  const revokePreview = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      revokePreview();
    };
  }, [revokePreview]);

  const reset = useCallback(() => {
    revokePreview();

    setFile(null);
    setFileKind(null);
    setPreviewUrl(null);
    setState("idle");
    setResult(null);
    setError(null);
  }, [revokePreview]);

  const selectFile = useCallback(
    async (incoming) => {
      setError(null);
      setResult(null);

      if (!incoming) {
        setState("idle");
        return {
          ok: false,
          error: "No file selected.",
        };
      }

      const basic = validateMedicalFile(incoming);

      if (!basic.valid) {
        revokePreview();

        setFile(null);
        setFileKind(null);
        setPreviewUrl(null);
        setState("error");
        setError(basic.error);

        return {
          ok: false,
          error: basic.error,
        };
      }

      // Browser image readability check only applies to JPG/PNG.
      if (basic.kind === "image") {
        const readable = await validateImageReadable(
          incoming
        );

        if (!readable.valid) {
          revokePreview();

          setFile(null);
          setFileKind(null);
          setPreviewUrl(null);
          setState("error");
          setError(readable.error);

          return {
            ok: false,
            error: readable.error,
          };
        }
      }

      revokePreview();

      let nextPreviewUrl = null;

      // ZIP files cannot be rendered with <img>.
      if (basic.kind === "image") {
        nextPreviewUrl = URL.createObjectURL(incoming);
        previewUrlRef.current = nextPreviewUrl;
      }

      setFile(incoming);
      setFileKind(basic.kind);
      setPreviewUrl(nextPreviewUrl);
      setState("ready");
      setError(null);

      return {
        ok: true,
      };
    },
    [revokePreview]
  );

  const runAnalysis = useCallback(async () => {
    if (!file) {
      setError(
        "Please select an X-ray image or MRI ZIP before analyzing."
      );
      setState("error");
      return;
    }

    setState("analyzing");
    setError(null);
    setResult(null);

    try {
      const data = await analyzeImageRequest(file);

      setResult(data);
      setState("completed");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again.";

      setError(message);
      setState("error");
    }
  }, [file]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
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
  };
}
