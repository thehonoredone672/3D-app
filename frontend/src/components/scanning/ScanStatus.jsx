const STATUS_LABELS = {
  DRAFT: "Draft",
  CAPTURING: "Capturing",
  UPLOADING: "Uploading",
  PROCESSING: "Processing",
  READY: "Ready",
  FAILED: "Failed",
  APPROVED: "Approved",
  PUBLISHED: "Published",
};

const STATUS_COLORS = {
  DRAFT: "#9ca3af",
  CAPTURING: "#3b82f6",
  UPLOADING: "#3b82f6",
  PROCESSING: "#f59e0b",
  READY: "#10b981",
  FAILED: "#b91c1c",
  APPROVED: "#10b981",
  PUBLISHED: "#10b981",
};

function ScanStatus({ status }) {
  return (
    <span
      className="scan-status-badge"
      style={{ background: STATUS_COLORS[status] || "#9ca3af" }}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export default ScanStatus;
export { STATUS_LABELS, STATUS_COLORS };
