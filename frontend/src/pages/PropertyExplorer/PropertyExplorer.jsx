import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProject } from "../../services/projects.js";
import PropertyViewer from "../../components/viewer/PropertyViewer.jsx";
import UnitInfoPanel from "../../components/property/UnitInfoPanel.jsx";
import Loading from "../../components/common/Loading.jsx";
import ErrorMessage from "../../components/common/ErrorMessage.jsx";
import { STATUS_COLORS, STATUS_LABELS } from "../../utils/status.js";
import "./PropertyExplorer.css";

function PropertyExplorer() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [status, setStatus] = useState("loading");

  const [selectedBuildingId, setSelectedBuildingId] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);

  useEffect(() => {
    setStatus("loading");
    getProject(id)
      .then((data) => {
        setProject(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [id]);

  const buildings = project?.buildings || [];

  const relevantBuildings = useMemo(
    () =>
      selectedBuildingId
        ? buildings.filter((b) => b.id === selectedBuildingId)
        : buildings,
    [buildings, selectedBuildingId]
  );

  const floorNumbers = useMemo(
    () =>
      [...new Set(relevantBuildings.flatMap((b) => b.units.map((u) => u.floor)))].sort(
        (a, b) => b - a
      ),
    [relevantBuildings]
  );

  const visibleUnits = useMemo(
    () =>
      relevantBuildings
        .flatMap((b) => b.units.map((u) => ({ ...u, buildingName: b.name })))
        .filter((u) => selectedFloor == null || u.floor === selectedFloor)
        .sort((a, b) => a.floor - b.floor || a.unitNumber.localeCompare(b.unitNumber)),
    [relevantBuildings, selectedFloor]
  );

  function selectBuilding(buildingId) {
    setSelectedBuildingId(buildingId);
    setSelectedFloor(null);
  }

  if (status === "loading") {
    return (
      <div className="explorer-page explorer-centered">
        <Loading label="Loading explorer..." />
      </div>
    );
  }

  if (status === "error" || !project) {
    return (
      <div className="explorer-page explorer-centered">
        <ErrorMessage message="Project not found." />
      </div>
    );
  }

  return (
    <div className="explorer-page">
      <header className="explorer-header">
        <Link to="/" className="explorer-logo">
          PropView
        </Link>
        <span className="explorer-project-name">{project.name}</span>
        <Link to={`/projects/${project.id}`} className="explorer-exit">
          Exit
        </Link>
      </header>

      <div className="explorer-body">
        <aside className="explorer-sidebar">
          <div className="explorer-sidebar-section">
            <h4>Building</h4>
            <div className="chip-list">
              <button
                className={`chip ${!selectedBuildingId ? "chip-active" : ""}`}
                onClick={() => selectBuilding(null)}
              >
                All
              </button>
              {buildings.map((building) => (
                <button
                  key={building.id}
                  className={`chip ${selectedBuildingId === building.id ? "chip-active" : ""}`}
                  onClick={() => selectBuilding(building.id)}
                >
                  {building.name}
                </button>
              ))}
            </div>
          </div>

          <div className="explorer-sidebar-section">
            <h4>Floor</h4>
            <div className="chip-list">
              <button
                className={`chip ${selectedFloor == null ? "chip-active" : ""}`}
                onClick={() => setSelectedFloor(null)}
              >
                All
              </button>
              {floorNumbers.map((floor) => (
                <button
                  key={floor}
                  className={`chip ${selectedFloor === floor ? "chip-active" : ""}`}
                  onClick={() => setSelectedFloor(floor)}
                >
                  Floor {floor}
                </button>
              ))}
            </div>
          </div>

          <div className="explorer-sidebar-section">
            <h4>Units ({visibleUnits.length})</h4>
            {visibleUnits.length === 0 && <p className="state-message">No units.</p>}
            <ul className="unit-list">
              {visibleUnits.map((unit) => (
                <li key={unit.id}>
                  <button
                    className={`unit-list-item ${
                      selectedUnit?.id === unit.id ? "unit-list-item-active" : ""
                    }`}
                    onClick={() => setSelectedUnit(unit)}
                  >
                    <span
                      className="status-dot"
                      style={{ background: STATUS_COLORS[unit.status] }}
                    />
                    {selectedBuildingId ? unit.unitNumber : `${unit.buildingName} · ${unit.unitNumber}`}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="explorer-sidebar-section">
            <h4>Legend</h4>
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <p key={key} className="legend-item">
                <span className="status-dot" style={{ background: STATUS_COLORS[key] }} />
                {label}
              </p>
            ))}
          </div>
        </aside>

        <div className="explorer-viewer">
          <PropertyViewer
            modelUrl={project.modelUrl}
            buildings={buildings}
            selectedBuildingId={selectedBuildingId}
            selectedFloor={selectedFloor}
            selectedUnitId={selectedUnit?.id}
            onSelectUnit={setSelectedUnit}
          />
          <UnitInfoPanel unit={selectedUnit} onClose={() => setSelectedUnit(null)} />
        </div>
      </div>
    </div>
  );
}

export default PropertyExplorer;
