import { Link } from "react-router-dom";
import { formatPrice } from "../../utils/format.js";
import { STATUS_COLORS, STATUS_LABELS } from "../../utils/status.js";
import "./UnitInfoPanel.css";

function UnitInfoPanel({ unit, onClose }) {
  if (!unit) return null;

  return (
    <div className="unit-info-panel">
      <button className="unit-info-close" onClick={onClose} aria-label="Close">
        &times;
      </button>
      <h3>Unit {unit.unitNumber}</h3>
      <p className="unit-info-meta">
        {unit.bhk} BHK · {unit.area.toLocaleString("en-IN")} sq.ft
      </p>
      <p className="unit-info-price">{formatPrice(unit.price)}</p>
      <p className="unit-info-status">
        <span className="status-dot" style={{ background: STATUS_COLORS[unit.status] }} />
        {STATUS_LABELS[unit.status] || unit.status}
      </p>
      <Link to={`/units/${unit.id}`} className="btn">
        View Details
      </Link>
    </div>
  );
}

export default UnitInfoPanel;
