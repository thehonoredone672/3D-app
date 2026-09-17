import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listProjects, deleteProject } from "../../../services/projects.js";
import { formatPrice } from "../../../utils/format.js";
import Loading from "../../../components/common/Loading.jsx";
import ErrorMessage from "../../../components/common/ErrorMessage.jsx";

function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState("loading");

  function load() {
    setStatus("loading");
    listProjects()
      .then((data) => {
        setProjects(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }

  useEffect(load, []);

  async function handleDelete(project) {
    if (!window.confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
    await deleteProject(project.id);
    load();
  }

  return (
    <div className="admin-projects">
      <div className="admin-page-header">
        <h1>Projects</h1>
        <Link to="/admin/projects/new" className="btn">
          Create Project
        </Link>
      </div>

      {status === "loading" && <Loading label="Loading projects..." />}
      {status === "error" && <ErrorMessage message="Could not load projects." />}
      {status === "ready" && projects.length === 0 && (
        <p className="state-message">No projects yet.</p>
      )}

      {status === "ready" && projects.length > 0 && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Starting Price</th>
              <th>Buildings</th>
              <th>Units</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id}>
                <td>{project.name}</td>
                <td>{project.location}</td>
                <td>{formatPrice(project.startingPrice)}</td>
                <td>{project.buildingsCount}</td>
                <td>{project.unitsCount}</td>
                <td className="admin-table-actions">
                  <Link to={`/admin/projects/${project.id}`}>Manage</Link>
                  <button
                    className="link-button link-button-danger"
                    onClick={() => handleDelete(project)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ProjectsList;
