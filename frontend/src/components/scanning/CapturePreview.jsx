import Modal from "../common/Modal.jsx";
import "./CapturePreview.css";

function CapturePreview({ capture, index, onRemove, onClose }) {
  if (!capture) return null;

  return (
    <Modal onClose={onClose}>
      <p className="capture-preview-label">Capture {String(index + 1).padStart(2, "0")}</p>
      <img className="capture-preview-image" src={capture.url} alt={`Capture ${index + 1}`} />
      <button
        className="capture-preview-remove"
        onClick={() => {
          onRemove(capture.id);
          onClose();
        }}
      >
        Remove This Capture
      </button>
    </Modal>
  );
}

export default CapturePreview;
