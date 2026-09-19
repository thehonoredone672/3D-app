import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import CameraCapture from "../../components/CameraCapture.jsx";
import CapturePointMap from "../../components/CapturePointMap.jsx";
import { generateCapturePoints, describeTransition } from "../../lib/capturePoints.js";
import { loadPendingScanConfig, clearPendingScanConfig } from "../../lib/scanConfig.js";
import "./CaptureSession.css";

const CAPTURE_COOLDOWN_MS = 400;

function CaptureSession() {
  const navigate = useNavigate();
  const cameraRef = useRef(null);
  const lastCaptureAtRef = useRef(0);

  const config = useMemo(() => loadPendingScanConfig(), []);

  const points = useMemo(() => {
    if (!config) return [];
    return generateCapturePoints({
      objectSize: config.objectSize,
      detailLevel: config.detailLevel,
      horizontalDensity: config.horizontalDensity,
      verticalDensity: config.verticalDensity,
    });
  }, [config]);

  const [captures, setCaptures] = useState({}); // pointId -> { blob, url }
  const [pendingCapture, setPendingCapture] = useState(null); // { blob, url, meta, point }
  const [justCaptured, setJustCaptured] = useState(false);

  useEffect(() => {
    if (!config || points.length === 0) {
      navigate("/new", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      Object.values(captures).forEach((c) => URL.revokeObjectURL(c.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const capturedIds = useMemo(() => new Set(Object.keys(captures)), [captures]);
  const currentIndex = points.findIndex((p) => !capturedIds.has(p.id));
  const currentPoint = currentIndex >= 0 ? points[currentIndex] : null;
  const lastCapturedPoint = currentIndex > 0 ? points[currentIndex - 1] : null;
  const guidance = describeTransition(lastCapturedPoint, currentPoint || points[points.length - 1]);
  const done = currentIndex === -1;

  useEffect(() => {
    if (done && points.length > 0) {
      navigate("/new/review", {
        state: {
          objectLabel: config.objectLabel,
          pointCount: points.length,
          captureCount: Object.keys(captures).length,
        },
      });
      clearPendingScanConfig();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  function commit(blob, meta, point) {
    const url = URL.createObjectURL(blob);
    setCaptures((prev) => ({ ...prev, [point.id]: { blob, url, meta } }));
    setJustCaptured(true);
    setTimeout(() => setJustCaptured(false), 200);
  }

  function handleRawCapture(blob, meta) {
    if (!currentPoint) return;
    if (meta.tooDark) {
      setPendingCapture({ blob, url: URL.createObjectURL(blob), meta, point: currentPoint });
      return;
    }
    commit(blob, meta, currentPoint);
  }

  function handleShutter() {
    const now = Date.now();
    if (now - lastCaptureAtRef.current < CAPTURE_COOLDOWN_MS) return;
    lastCaptureAtRef.current = now;
    cameraRef.current?.capture();
  }

  function handleRetakePending() {
    if (pendingCapture) URL.revokeObjectURL(pendingCapture.url);
    setPendingCapture(null);
  }

  function handleAcceptPending() {
    if (!pendingCapture) return;
    commit(pendingCapture.blob, pendingCapture.meta, pendingCapture.point);
    setPendingCapture(null);
  }

  if (!config || points.length === 0) return null;

  return (
    <div className="capture-session">
      <CameraCapture ref={cameraRef} onCapture={handleRawCapture} disabled={!!pendingCapture} />

      <div className="capture-session-top">
        <button className="capture-session-exit" onClick={() => navigate("/")}>
          ← Object Scan
        </button>
        <span className="capture-session-count">
          {Object.keys(captures).length} / {points.length}
        </span>
      </div>

      <div className="capture-session-reticle" aria-hidden="true">
        <div className="capture-session-reticle-ring" />
      </div>

      <div className="capture-session-map">
        <CapturePointMap points={points} currentIndex={currentIndex} capturedIds={capturedIds} />
      </div>

      <div className="capture-session-guidance">{guidance.hint}</div>

      <div className="capture-session-bottom">
        <button
          className={`capture-session-shutter ${justCaptured ? "capture-session-shutter-flash" : ""}`}
          onClick={handleShutter}
          disabled={!!pendingCapture}
          aria-label="Capture"
        />
      </div>

      {pendingCapture && (
        <div className="capture-session-confirm">
          <img src={pendingCapture.url} alt="" className="capture-session-confirm-thumb" />
          <p>Capture not suitable — this looks too dark.</p>
          <p className="capture-session-confirm-hint">Move to better lighting and try again.</p>
          <div className="capture-session-confirm-actions">
            <button className="btn btn-secondary" onClick={handleRetakePending}>
              Retake
            </button>
            <button className="btn" onClick={handleAcceptPending}>
              Capture Anyway
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CaptureSession;
