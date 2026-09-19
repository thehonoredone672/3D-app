import { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { addRecentScan } from "../../lib/recentScans.js";
import "./CaptureReview.css";

function CaptureReview() {
  const { state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!state) {
      navigate("/", { replace: true });
      return;
    }
    addRecentScan({
      id: `scan_${Date.now()}`,
      objectLabel: state.objectLabel,
      pointCount: state.pointCount,
      capturedCount: state.captureCount,
      status: "captured",
      createdAt: new Date().toISOString(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!state) return null;

  return (
    <div className="capture-review">
      <h1>Capture Complete</h1>
      <p className="capture-review-summary">
        {state.captureCount} of {state.pointCount} planned viewpoints captured for{" "}
        <strong>{state.objectLabel}</strong>.
      </p>

      <div className="capture-review-note">
        <p>
          <strong>Reconstruction isn't built yet.</strong> This phase proves out the guided
          capture experience — turning these viewpoints into an interactive 3D view is the next
          phase of this project.
        </p>
      </div>

      <div className="capture-review-actions">
        <Link to="/new" className="btn btn-secondary">
          Scan Another Object
        </Link>
        <Link to="/" className="btn btn-primary">
          Back Home
        </Link>
      </div>
    </div>
  );
}

export default CaptureReview;
