import { useEffect, useState } from "react";
import { listProjects } from "../../services/projects.js";
import ProjectCard from "../../components/property/ProjectCard.jsx";
import Loading from "../../components/common/Loading.jsx";
import ErrorMessage from "../../components/common/ErrorMessage.jsx";
import "./Projects.css";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    listProjects()
      .then((data) => {
        setProjects(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div className="projects-page">
      <h1>Projects</h1>

      {status === "loading" && <Loading label="Loading projects..." />}
      {status === "error" && <ErrorMessage message="Could not load projects." />}
      {status === "ready" && projects.length === 0 && (
        <p className="state-message">No projects available yet.</p>
      )}

      {status === "ready" && projects.length > 0 && (
        <div className="projects-grid">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Projects;
