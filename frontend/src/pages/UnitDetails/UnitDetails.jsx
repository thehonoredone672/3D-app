import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getUnit } from "../../services/units.js";
import { formatPrice } from "../../utils/format.js";
import { STATUS_COLORS, STATUS_LABELS } from "../../utils/status.js";
import { assetUrl } from "../../utils/assetUrl.js";
import Loading from "../../components/common/Loading.jsx";
import ErrorMessage from "../../components/common/ErrorMessage.jsx";
import Modal from "../../components/common/Modal.jsx";
import EnquiryForm from "../../components/property/EnquiryForm.jsx";
import "./UnitDetails.css";

function UnitDetails() {
  const { id } = useParams();
  const [unit, setUnit] = useState(null);
  const [status, setStatus] = useState("loading");
  const [showVisitForm, setShowVisitForm] = useState(false);

  useEffect(() => {
    setStatus("loading");
    getUnit(id)
      .then((data) => {
        setUnit(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [id]);

  if (status === "loading") return <Loading label="Loading unit..." />;
  if (status === "error" || !unit) return <ErrorMessage message="Unit not found." />;

  const project = unit.building.project;

  return (
    <div className="unit-details">
      <p className="unit-details-breadcrumb">
        <Link to={`/projects/${project.id}`}>{project.name}</Link> · {unit.building.name}
      </p>

      <h1>Unit {unit.unitNumber}</h1>

      <p className="unit-details-status">
        <span className="status-dot" style={{ background: STATUS_COLORS[unit.status] }} />
        {STATUS_LABELS[unit.status] || unit.status}
      </p>

      <p className="unit-details-price">{formatPrice(unit.price)}</p>

      <div className="unit-details-grid">
        <div>
          <span>BHK</span>
          <strong>{unit.bhk}</strong>
        </div>
        <div>
          <span>Area</span>
          <strong>{unit.area.toLocaleString("en-IN")} sq.ft</strong>
        </div>
        <div>
          <span>Floor</span>
          <strong>{unit.floor}</strong>
        </div>
        <div>
          <span>Facing</span>
          <strong>{unit.facing || "—"}</strong>
        </div>
      </div>

      <div className="unit-details-section">
        <h2>Floor Plan</h2>
        {unit.floorPlanUrl ? (
          <img
            className="unit-details-floorplan"
            src={assetUrl(unit.floorPlanUrl)}
            alt={`Floor plan for unit ${unit.unitNumber}`}
          />
        ) : (
          <p className="state-message">No floor plan available.</p>
        )}
      </div>

      <div className="unit-details-actions">
        <Link to={`/projects/${project.id}/explore`} className="btn btn-secondary">
          View in 3D
        </Link>
        <button className="btn" onClick={() => setShowVisitForm(true)}>
          Request Site Visit
        </button>
      </div>

      {showVisitForm && (
        <Modal onClose={() => setShowVisitForm(false)}>
          <h3>Request a Site Visit</h3>
          <p className="unit-details-modal-subtitle">
            Unit {unit.unitNumber} · {project.name}
          </p>
          <EnquiryForm
            projectId={project.id}
            unitId={unit.id}
            includeDate
            submitLabel="Request Visit"
          />
        </Modal>
      )}
    </div>
  );
}

export default UnitDetails;
