import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProject, updateProject } from "../../../services/projects.js";
import { createBuilding } from "../../../services/buildings.js";
import ProjectFieldsForm from "./ProjectFieldsForm.jsx";
import BuildingManager from "./BuildingManager.jsx";
import Loading from "../../../components/common/Loading.jsx";
import ErrorMessage from "../../../components/common/ErrorMessage.jsx";
import "./ProjectManage.css";

function ProjectManage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [status, setStatus] = useState("loading");
  const [showEdit, setShowEdit] = useState(false);
  const [showAddBuilding, setShowAddBuilding] = useState(false);
  const [buildingForm, setBuildingForm] = useState({ name: "", description: "" });

  function load() {
    setStatus("loading");
    getProject(id)
      .then((data) => {
        setProject(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }

  useEffect(load, [id]);

  async function handleUpdateProject(data) {
    await updateProject(id, data);
    setShowEdit(false);
    load();
  }

  async function handleAddBuilding(event) {
    event.preventDefault();
    await createBuilding({ ...buildingForm, projectId: id });
    setBuildingForm({ name: "", description: "" });
    setShowAddBuilding(false);
    load();
  }

  if (status === "loading") return <Loading label="Loading project..." />;
  if (status === "error" || !project) return <ErrorMessage message="Project not found." />;

  return (
    <div className="admin-project-manage">
      <div className="admin-page-header">
        <div>
          <Link to="/admin/projects" className="admin-back-link">
            &larr; Projects
          </Link>
          <h1>{project.name}</h1>
        </div>
        <button className="btn btn-secondary" onClick={() => setShowEdit((v) => !v)}>
          {showEdit ? "Cancel" : "Edit Details"}
        </button>
      </div>

      {showEdit && (
        <div className="admin-section">
          <ProjectFieldsForm
            initialProject={project}
            onSubmit={handleUpdateProject}
            submitLabel="Save Changes"
          />
        </div>
      )}

      <div className="admin-section">
        <h2>Buildings</h2>
        {project.buildings.length === 0 && <p className="state-message">No buildings yet.</p>}

        {project.buildings.map((building) => (
          <BuildingManager key={building.id} building={building} onChange={load} />
        ))}

        {showAddBuilding ? (
          <form className="add-building-form" onSubmit={handleAddBuilding}>
            <input
              placeholder="Building name"
              value={buildingForm.name}
              onChange={(event) => setBuildingForm({ ...buildingForm, name: event.target.value })}
              required
            />
            <input
              placeholder="Description (optional)"
              value={buildingForm.description}
              onChange={(event) =>
                setBuildingForm({ ...buildingForm, description: event.target.value })
              }
            />
            <button type="submit" className="btn">
              Add
            </button>
          </form>
        ) : (
          <button className="btn btn-secondary" onClick={() => setShowAddBuilding(true)}>
            Add Building
          </button>
        )}
      </div>
    </div>
  );
}

export default ProjectManage;
