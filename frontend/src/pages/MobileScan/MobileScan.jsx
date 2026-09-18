import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import CameraCapture from "../../components/scanning/CameraCapture.jsx";
import ScanGuide, { MIN_RECOMMENDED } from "../../components/scanning/ScanGuide.jsx";
import CaptureGrid from "../../components/scanning/CaptureGrid.jsx";
import CapturePreview from "../../components/scanning/CapturePreview.jsx";
import { createScan, uploadCapture } from "../../services/scans.js";
import "./MobileScan.css";

const TARGET_CAPTURES = 30;
const CAPTURE_COOLDOWN_MS = 400;
const SCAN_TYPES = ["ROOM", "APARTMENT", "EXTERIOR"];

let nextId = 1;

function MobileScan() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const unitId = searchParams.get("unitId");

  const cameraRef = useRef(null);
  const lastCaptureAtRef = useRef(0);
  const [captures, setCaptures] = useState([]);
  const [stage, setStage] = useState("capturing");
  const [justCaptured, setJustCaptured] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(null);
  const [scanType, setScanType] = useState("ROOM");

  const [scanId, setScanId] = useState(null);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [uploadState, setUploadState] = useState("idle");
  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    return () => {
      captures.forEach((c) => URL.revokeObjectURL(c.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!projectId || !unitId) {
    return (
      <div className="mobile-scan mobile-scan-error">
        <p>This scan needs to be started from a unit's page in the admin dashboard.</p>
        <Link to="/admin/projects" className="btn">
          Go to Projects
        </Link>
      </div>
    );
  }

  function handleCapture(blob) {
    const capture = { id: nextId++, url: URL.createObjectURL(blob), blob };
    setCaptures((prev) => [...prev, capture]);
    setJustCaptured(true);
    setTimeout(() => setJustCaptured(false), 250);
  }

  function handleCaptureClick() {
    const now = Date.now();
    if (now - lastCaptureAtRef.current < CAPTURE_COOLDOWN_MS) return;
    lastCaptureAtRef.current = now;
    cameraRef.current?.capture();
  }

  function removeCapture(id) {
    setCaptures((prev) => {
      const target = prev.find((c) => c.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((c) => c.id !== id);
    });
  }

  function handleRetakeAll() {
    captures.forEach((c) => URL.revokeObjectURL(c.url));
    setCaptures([]);
    setStage("capturing");
    setScanId(null);
    setUploadedCount(0);
    setUploadState("idle");
    setUploadError(null);
  }

  async function handleUpload() {
    setUploadState("uploading");
    setUploadError(null);
    try {
      let currentScanId = scanId;
      if (!currentScanId) {
        const scan = await createScan({ projectId, unitId, scanType });
        currentScanId = scan.id;
        setScanId(currentScanId);
      }

      for (let i = uploadedCount; i < captures.length; i++) {
        await uploadCapture(currentScanId, captures[i].blob);
        setUploadedCount(i + 1);
      }

      setUploadState("done");
    } catch (err) {
      setUploadError(err.response?.data?.error || "Upload failed. Please try again.");
      setUploadState("error");
    }
  }

  const previewCapture = previewIndex != null ? captures[previewIndex] : null;

  return (
    <div className="mobile-scan">
      <header className="mobile-scan-header">
        <span>PropView</span>
        <Link to="/admin" className="mobile-scan-exit">
          Exit
        </Link>
      </header>

      <div
        className="mobile-scan-camera"
        style={{ display: stage === "capturing" ? "block" : "none" }}
      >
        <CameraCapture ref={cameraRef} onCapture={handleCapture} />
        <div className="mobile-scan-frame" />
      </div>

      {stage === "capturing" && (
        <>
          {captures.length === 0 && (
            <div className="mobile-scan-type-select">
              {SCAN_TYPES.map((type) => (
                <button
                  key={type}
                  className={`chip ${scanType === type ? "chip-active" : ""}`}
                  onClick={() => setScanType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          )}

          <ScanGuide captureCount={captures.length} target={TARGET_CAPTURES} />

          <div className="mobile-scan-controls">
            <button
              className={`mobile-scan-shutter ${justCaptured ? "mobile-scan-shutter-flash" : ""}`}
              onClick={handleCaptureClick}
              aria-label="Capture"
            />
          </div>

          <p className="mobile-scan-count">
            {captures.length} / {TARGET_CAPTURES} captures
          </p>

          {captures.length > 0 && (
            <div className="mobile-scan-thumbs">
              {captures.map((c) => (
                <button
                  key={c.id}
                  className="mobile-scan-thumb"
                  onClick={() => removeCapture(c.id)}
                  aria-label="Remove capture"
                >
                  <img src={c.url} alt="" />
                  <span className="mobile-scan-thumb-remove">&times;</span>
                </button>
              ))}
            </div>
          )}

          <button
            className="btn mobile-scan-finish"
            disabled={captures.length < MIN_RECOMMENDED}
            onClick={() => setStage("review")}
          >
            Review Captures (
            {captures.length < MIN_RECOMMENDED
              ? `${MIN_RECOMMENDED - captures.length} more`
              : "Ready"}
            )
          </button>
        </>
      )}

      {stage === "review" && uploadState !== "done" && (
        <div className="mobile-scan-review">
          <p className="mobile-scan-review-heading">
            {captures.length} captures — tap one to view, or remove it
          </p>

          <CaptureGrid
            captures={captures}
            onRemove={removeCapture}
            onSelect={(capture) => setPreviewIndex(captures.findIndex((c) => c.id === capture.id))}
          />

          {captures.length < MIN_RECOMMENDED && (
            <p className="mobile-scan-review-warning">
              We recommend at least {MIN_RECOMMENDED} captures for a good scan.
            </p>
          )}

          {uploadState === "error" && (
            <p className="mobile-scan-review-warning">{uploadError}</p>
          )}

          {uploadState === "uploading" ? (
            <p className="mobile-scan-note">
              Uploading {uploadedCount} / {captures.length}...
            </p>
          ) : (
            <div className="mobile-scan-review-actions">
              <button className="btn btn-secondary" onClick={() => setStage("capturing")}>
                Add More
              </button>
              <button className="btn btn-secondary" onClick={handleRetakeAll}>
                Retake All
              </button>
            </div>
          )}

          <button
            className="btn mobile-scan-finish"
            onClick={handleUpload}
            disabled={uploadState === "uploading"}
          >
            {uploadState === "error" ? "Retry Upload" : "Upload Scan"}
          </button>
        </div>
      )}

      {uploadState === "done" && (
        <div className="mobile-scan-finished-body">
          <h2>Scan Uploaded</h2>
          <p>{captures.length} images uploaded successfully.</p>
          <Link to={`/scans/${scanId}`} className="btn">
            View Scan Status
          </Link>
          <Link to="/admin" className="mobile-scan-exit-link">
            Back to Admin
          </Link>
        </div>
      )}

      {previewCapture && (
        <CapturePreview
          capture={previewCapture}
          index={previewIndex}
          onRemove={removeCapture}
          onClose={() => setPreviewIndex(null)}
        />
      )}
    </div>
  );
}

export default MobileScan;
