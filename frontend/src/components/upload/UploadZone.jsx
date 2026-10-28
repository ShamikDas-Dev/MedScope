import { useCallback, useRef, useState } from "react";
import Button from "../common/Button";

export default function UploadZone({
  onFileSelected,
  disabled = false,
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const openPicker = useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  const handleFiles = useCallback(
    (files) => {
      if (!files || files.length === 0) return;

      const file = files[0];
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(false);

      if (disabled) return;

      const files = e.dataTransfer?.files;
      handleFiles(files);
    },
    [disabled, handleFiles]
  );

  const onDragOver = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (disabled) return;

      setDragging(true);
    },
    [disabled]
  );

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }, []);

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openPicker();
      }
    },
    [openPicker]
  );

  return (
    <div
      className={`upload-zone ${
        dragging ? "upload-zone--dragging" : ""
      }`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={openPicker}
      onKeyDown={onKeyDown}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Upload an X-ray image or a knee MRI DICOM ZIP."
      aria-disabled={disabled}
    >
      <div className="upload-zone__icon" aria-hidden="true">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </div>

      <h3 className="upload-zone__title">
        Drag &amp; drop your medical image here
      </h3>

      <p className="upload-zone__subtitle">or</p>

      <Button
        variant="secondary"
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          openPicker();
        }}
        disabled={disabled}
      >
        Browse
      </Button>

      <div className="upload-zone__formats">
        X-ray: JPG • JPEG • PNG
        <br />
        MRI: DICOM ZIP
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,.jpg,.jpeg,.png,.zip,application/zip,application/x-zip-compressed"
        className="visually-hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
        disabled={disabled}
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}
