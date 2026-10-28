const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message, { status = null, code = null, cause = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.cause = cause;
  }
}

function buildUrl(path) {
  if (!API_BASE_URL) {
    throw new ApiError(
      "API base URL is not configured. Set VITE_API_BASE_URL in your environment.",
      { code: "config_error" }
    );
  }
  return `${API_BASE_URL}${path}`;
}

async function parseJsonSafe(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { __raw: text };
  }
}

/**
 * Sends an image to the backend for analysis.
 * POST {VITE_API_BASE_URL}/api/analyze  (multipart/form-data)
 *
 * @param {File} file
 * @returns {Promise<object>} The parsed JSON response from the backend.
 * @throws {ApiError} on network failure, non-2xx status, or malformed payload.
 */
export async function analyzeImage(file) {
  if (!file) {
    throw new ApiError("No file provided for analysis.", { code: "no_file" });
  }

  const url = buildUrl("/api/analyze");

  const formData = new FormData();
  formData.append("image", file);

  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      body: formData
    });
  } catch (err) {
    throw new ApiError(
      "Unable to reach the analysis service. Please check your connection and try again.",
      { code: "network_error", cause: err }
    );
  }

  const data = await parseJsonSafe(response);

  if (!response.ok) {
    const message =
      (data && typeof data.message === "string" && data.message) ||
      (data && typeof data.detail === "string" && data.detail) ||
      `Analysis request failed (${response.status}).`;
    throw new ApiError(message, { status: response.status });
  }

  if (!data || typeof data !== "object") {
    throw new ApiError(
      "The analysis service returned an unexpected response.",
      { status: response.status, code: "malformed_response" }
    );
  }

  return data;
}

/**
 * Builds an absolute URL for a backend-provided relative resource path
 * (e.g. visualization.url = "/api/results/xyz/heatmap").
 */
export function resolveApiAssetUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  if (!API_BASE_URL) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function isApiConfigured() {
  return Boolean(API_BASE_URL);
}