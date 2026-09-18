import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getUnit } from "../../services/units.js";
import PropertyViewer from "../../components/viewer/PropertyViewer.jsx";
import UnitInfoPanel from "../../components/property/UnitInfoPanel.jsx";
import Loading from "../../components/common/Loading.jsx";
import ErrorMessage from "../../components/common/ErrorMessage.jsx";
import "./UnitExplorer.css";

function UnitExplorer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [unit, setUnit] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    setStatus("loading");
    getUnit(id)
      .then((data) => {
        setUnit(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [id]);

  if (status === "loading") {
    return (
      <div className="unit-explorer unit-explorer-centered">
        <Loading label="Loading..." />
      </div>
    );
  }

  if (status === "error" || !unit) {
    return (
      <div className="unit-explorer unit-explorer-centered">
        <ErrorMessage message="Unit not found." />
      </div>
    );
  }

  const project = unit.building.project;

  return (
    <div className="unit-explorer">
      <header className="unit-explorer-header">
        <Link to="/" className="unit-explorer-logo">
          PropView
        </Link>
        <span className="unit-explorer-title">
          {project.name} · Unit {unit.unitNumber}
        </span>
        <Link to={`/units/${unit.id}`} className="unit-explorer-exit">
          Exit
        </Link>
      </header>

      <div className="unit-explorer-viewer">
        {unit.modelUrl ? (
          <PropertyViewer modelUrl={unit.modelUrl} />
        ) : (
          <div className="unit-explorer-empty">
            <p>A 3D view isn't available for this unit yet.</p>
          </div>
        )}

        <UnitInfoPanel unit={unit} onClose={() => navigate(`/units/${unit.id}`)} />
      </div>
    </div>
  );
}

export default UnitExplorer;
