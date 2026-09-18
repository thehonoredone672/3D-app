import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getScan,
  getScanStatus,
  processScan,
  approveScan,
  publishScan,
  deleteScan,
} from "../../../services/scans.js";
import ScanProgress from "../../../components/scanning/ScanProgress.jsx";
import ScanStatusBadge from "../../../components/scanning/ScanStatus.jsx";
import PropertyViewer from "../../../components/viewer/PropertyViewer.jsx";
import Loading from "../../../components/common/Loading.jsx";
import ErrorMessage from "../../../components/common/ErrorMessage.jsx";
import "./ScanDetail.css";

const POLL_INTERVAL_MS = 4000;
const TERMINAL_STATUSES = ["READY", "FAILED", "APPROVED", "PUBLISHED"];
const MODEL_READY_STATUSES = ["READY", "APPROVED", "PUBLISHED"];
const RESCANNABLE_STATUSES = ["READY", "APPROVED", "PUBLISHED", "FAILED"];

function ScanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scan, setScan] = useState(null);
  const [loadStatus, setLoadStatus] = useState("loading");
  const [actionState, setActionState] = useState("idle");
  const [actionError, setActionError] = useState(null);
  const intervalRef = useRef(null);

  function refreshStatus() {
    getScanStatus(id)
      .then((status) => {
        setScan((prev) => (prev ? { ...prev, ...status } : prev));
        if (TERMINAL_STATUSES.includes(status.status)) {
          clearInterval(intervalRef.current);
        }
      })
      .catch(() => {});
  }

  useEffect(() => {
    let cancelled = false;

    getScan(id)
      .then((data) => {
        if (cancelled) return;
        setScan(data);
        setLoadStatus("ready");
        if (!TERMINAL_STATUSES.includes(data.status)) {
          intervalRef.current = setInterval(refreshStatus, POLL_INTERVAL_MS);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadStatus("error");
      });

    return () => {
      cancelled = true;
      clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function runAction(action, errorFallback) {
    setActionState("busy");
    setActionError(null);
    try {
      const updated = await action();
      setScan((prev) => (prev ? { ...prev, ...updated } : updated));
    } catch (err) {
      setActionError(err.response?.data?.error || errorFallback);
      refreshStatus();
    } finally {
      setActionState("idle");
    }
  }

  function handleProcess() {
    return runAction(async () => {
      await processScan(id);
      if (!intervalRef.current) {
        intervalRef.current = setInterval(refreshStatus, POLL_INTERVAL_MS);
      }
      return { status: "PROCESSING" };
    }, "Could not start processing.");
  }

  function handleApprove() {
    return runAction(() => approveScan(id), "Could not approve this model.");
  }

  function handlePublish() {
    return runAction(() => publishScan(id), "Could not publish this model.");
  }

  async function handleDelete() {
    if (!window.confirm("Delete this scan? This cannot be undone.")) return;
    await deleteScan(id);
    navigate(`/admin/projects/${scan.projectId}`);
  }

  if (loadStatus === "loading") return <Loading label="Loading scan..." />;
  if (loadStatus === "error" || !scan) return <ErrorMessage message="Scan not found." />;

  const canStartProcessing = scan.status === "UPLOADING" && scan.captureCount > 0;
  const modelReady = MODEL_READY_STATUSES.includes(scan.status) && scan.modelUrl;
  const canRescan = RESCANNABLE_STATUSES.includes(scan.status);

  return (
    <div className="scan-detail">
      <div className="admin-page-header">
        <div>
          <p className="scan-detail-subtitle">
            {scan.project?.name} · Unit {scan.unit?.unitNumber}
          </p>
          <h1>{modelReady ? "3D Model Ready" : "Creating 3D Property"}</h1>
        </div>
        <ScanStatusBadge status={scan.status} />
      </div>

      {modelReady ? (
        <div className="scan-detail-viewer">
          <PropertyViewer modelUrl={scan.modelUrl} />
        </div>
      ) : (
        <ScanProgress status={scan.status} captureCount={scan.captureCount} />
      )}

      {scan.status === "PUBLISHED" && (
        <p className="state-message scan-detail-published-note">
          Published — this is now the live model for Unit {scan.unit?.unitNumber}.
        </p>
      )}

      {actionError && <p className="state-message state-message-error">{actionError}</p>}

      <div className="scan-detail-actions">
        {canStartProcessing && (
          <button className="btn" onClick={handleProcess} disabled={actionState === "busy"}>
            {actionState === "busy" ? "Starting..." : "Start Processing"}
          </button>
        )}
        {scan.status === "READY" && (
          <button className="btn" onClick={handleApprove} disabled={actionState === "busy"}>
            {actionState === "busy" ? "Approving..." : "Approve Model"}
          </button>
        )}
        {scan.status === "APPROVED" && (
          <button className="btn" onClick={handlePublish} disabled={actionState === "busy"}>
            {actionState === "busy" ? "Publishing..." : "Publish"}
          </button>
        )}
        {canRescan && (
          <Link
            to={`/mobile-scan?projectId=${scan.projectId}&unitId=${scan.unitId}`}
            className="btn btn-secondary"
          >
            Re-scan
          </Link>
        )}
        <Link to={`/admin/projects/${scan.projectId}`} className="btn btn-secondary">
          Back to Project
        </Link>
        {canRescan && (
          <button className="link-button link-button-danger" onClick={handleDelete}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

export default ScanDetail;
