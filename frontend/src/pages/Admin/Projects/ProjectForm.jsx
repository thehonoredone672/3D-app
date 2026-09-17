import { useNavigate } from "react-router-dom";
import { createProject } from "../../../services/projects.js";
import ProjectFieldsForm from "./ProjectFieldsForm.jsx";
import "./ProjectForm.css";

function ProjectForm() {
  const navigate = useNavigate();

  async function handleCreate(data) {
    const project = await createProject(data);
    navigate(`/admin/projects/${project.id}`);
  }

  return (
    <div className="admin-project-form">
      <h1>Create Project</h1>
      <ProjectFieldsForm onSubmit={handleCreate} submitLabel="Create Project" />
    </div>
  );
}

export default ProjectForm;
