import "./CaptureGrid.css";

function CaptureGrid({ captures, onRemove, onSelect }) {
  return (
    <div className="capture-grid">
      {captures.map((capture, index) => (
        <div key={capture.id} className="capture-grid-item">
          <button className="capture-grid-thumb" onClick={() => onSelect(capture)}>
            <img src={capture.url} alt={`Capture ${index + 1}`} />
            <span className="capture-grid-label">{String(index + 1).padStart(2, "0")}</span>
          </button>
          <button
            className="capture-grid-remove"
            onClick={() => onRemove(capture.id)}
            aria-label={`Remove capture ${index + 1}`}
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}

export default CaptureGrid;
