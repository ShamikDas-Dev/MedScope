import { formatFileSize } from "../../utils/validation";

export default function FileInfo({ file }) {
  if (!file) return null;
  return (
    <div className="preview__info">
      <span className="preview__filename" title={file.name}>
        {file.name}
      </span>
      <span className="preview__filesize">{formatFileSize(file.size)}</span>
    </div>
  );
}