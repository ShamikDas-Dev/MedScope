export const ACCEPTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
];

export const ACCEPTED_IMAGE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
];

export const MRI_MIME_TYPES = [
  "application/zip",
  "application/x-zip-compressed",
  "application/octet-stream",
];

export const MRI_EXTENSIONS = ["zip"];

export const MAX_IMAGE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
export const MAX_MRI_ZIP_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB

export function getFileExtension(filename) {
  if (!filename || typeof filename !== "string") return "";
  const parts = filename.split(".");
  if (parts.length < 2) return "";
  return parts.pop().toLowerCase();
}

export function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function isMRIFile(file) {
  if (!file) return false;

  const mime = (file.type || "").toLowerCase();
  const ext = getFileExtension(file.name || "");

  return MRI_EXTENSIONS.includes(ext) || MRI_MIME_TYPES.includes(mime);
}

export function isImageFile(file) {
  if (!file) return false;

  const mime = (file.type || "").toLowerCase();
  const ext = getFileExtension(file.name || "");

  return (
    ACCEPTED_IMAGE_MIME_TYPES.includes(mime) ||
    ACCEPTED_IMAGE_EXTENSIONS.includes(ext)
  );
}

/**
 * Validates all MedScope upload types.
 *
 * Returns:
 * {
 *   valid: boolean,
 *   kind: "image" | "mri_zip" | null,
 *   error: string | null
 * }
 */
export function validateMedicalFile(file) {
  if (!file) {
    return {
      valid: false,
      kind: null,
      error: "No file selected.",
    };
  }

  if (!(file instanceof File) && !(file instanceof Blob)) {
    return {
      valid: false,
      kind: null,
      error: "Invalid file.",
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      kind: null,
      error: "This file is empty.",
    };
  }

  const mime = (file.type || "").toLowerCase();
  const ext = getFileExtension(file.name || "");

  const imageMimeOk = ACCEPTED_IMAGE_MIME_TYPES.includes(mime);
  const imageExtOk = ACCEPTED_IMAGE_EXTENSIONS.includes(ext);

  const mriMimeOk = MRI_MIME_TYPES.includes(mime);
  const mriExtOk = MRI_EXTENSIONS.includes(ext);

  if (imageMimeOk || imageExtOk) {
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return {
        valid: false,
        kind: "image",
        error: `Image is too large. Maximum size is ${formatFileSize(
          MAX_IMAGE_SIZE_BYTES
        )}.`,
      };
    }

    return {
      valid: true,
      kind: "image",
      error: null,
    };
  }

  if (mriMimeOk || mriExtOk) {
    if (file.size > MAX_MRI_ZIP_SIZE_BYTES) {
      return {
        valid: false,
        kind: "mri_zip",
        error: `MRI DICOM ZIP is too large. Maximum size is ${formatFileSize(
          MAX_MRI_ZIP_SIZE_BYTES
        )}.`,
      };
    }

    return {
      valid: true,
      kind: "mri_zip",
      error: null,
    };
  }

  return {
    valid: false,
    kind: null,
    error:
      "Unsupported file type. Upload a JPG, JPEG, PNG X-ray, or a ZIP containing a DICOM MRI study.",
  };
}

/**
 * Backward-compatible alias for code that still imports validateImageFile.
 */
export function validateImageFile(file) {
  const result = validateMedicalFile(file);

  if (!result.valid || result.kind !== "image") {
    return {
      valid: false,
      error:
        result.error ||
        "Please upload a JPG, JPEG, or PNG image.",
    };
  }

  return {
    valid: true,
    error: null,
  };
}

/**
 * Checks whether an image can be decoded by the browser.
 * ZIP files must not be sent here.
 */
export function validateImageReadable(file) {
  if (!isImageFile(file)) {
    return Promise.resolve({
      valid: true,
      error: null,
    });
  }

  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);

      if (img.naturalWidth === 0 || img.naturalHeight === 0) {
        resolve({
          valid: false,
          error:
            "The selected image appears to be corrupt or unreadable.",
        });
      } else {
        resolve({
          valid: true,
          error: null,
        });
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);

      resolve({
        valid: false,
        error:
          "The selected image appears to be corrupt or unreadable.",
      });
    };

    img.src = url;
  });
}
