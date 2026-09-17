import { useState } from "react";
import { uploadFile } from "../../services/uploads.js";
import { assetUrl } from "../../utils/assetUrl.js";

function FileUploadField({ label, accept, value, onChange }) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setStatus("uploading");
    setError(null);
    try {
      const url = await uploadFile(file);
      onChange(url);
      setStatus("idle");
    } catch (err) {
      setError(err.response?.data?.error || "Upload failed");
      setStatus("idle");
    }
  }

  return (
    <label>
      {label}
      <input type="file" accept={accept} onChange={handleFileChange} />
      {status === "uploading" && <span className="upload-status">Uploading...</span>}
      {error && <span className="upload-status upload-status-error">{error}</span>}
      {value && status !== "uploading" && (
        <span className="upload-status">
          Uploaded:{" "}
          <a href={assetUrl(value)} target="_blank" rel="noreferrer">
            {value.split("/").pop()}
          </a>
        </span>
      )}
    </label>
  );
}

export default FileUploadField;
