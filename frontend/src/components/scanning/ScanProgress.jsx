import "./ScanProgress.css";

const MODEL_DONE_STATUSES = ["READY", "APPROVED", "PUBLISHED"];
const CAPTURES_DONE_STATUSES = ["UPLOADING", "PROCESSING", ...MODEL_DONE_STATUSES, "FAILED"];

const STEPS = [
  {
    key: "uploaded",
    label: "Captures uploaded",
    isDone: (s) => CAPTURES_DONE_STATUSES.includes(s.status) && s.captureCount > 0,
  },
  {
    key: "validated",
    label: "Images validated",
    isDone: (s) => CAPTURES_DONE_STATUSES.includes(s.status) && s.captureCount > 0,
  },
  {
    key: "model",
    label: "Creating 3D model",
    isDone: (s) => MODEL_DONE_STATUSES.includes(s.status),
    isActive: (s) => s.status === "PROCESSING",
  },
  {
    key: "optimize",
    label: "Optimizing model",
    isDone: (s) => MODEL_DONE_STATUSES.includes(s.status),
  },
  {
    key: "viewer",
    label: "Preparing viewer",
    isDone: (s) => MODEL_DONE_STATUSES.includes(s.status),
  },
];

function ScanProgress({ status, captureCount }) {
  const state = { status, captureCount };

  return (
    <div className="scan-progress">
      <ul className="scan-progress-list">
        {STEPS.map((step) => {
          const done = step.isDone(state);
          const active = !done && step.isActive?.(state);
          return (
            <li
              key={step.key}
              className={
                done
                  ? "scan-progress-done"
                  : active
                    ? "scan-progress-active"
                    : "scan-progress-pending"
              }
            >
              <span className="scan-progress-icon">{done ? "✓" : active ? "●" : "○"}</span>
              {step.label}
            </li>
          );
        })}
      </ul>

      {status === "PROCESSING" && <p className="scan-progress-note">Processing your scan...</p>}

      {status === "FAILED" && (
        <p className="scan-progress-note scan-progress-error">
          Processing failed. Please try again or contact support.
        </p>
      )}

      {status === "UPLOADING" && captureCount > 0 && (
        <p className="scan-progress-note">
          Captures received. 3D reconstruction isn't connected yet — that arrives in a later
          step.
        </p>
      )}
    </div>
  );
}

export default ScanProgress;
