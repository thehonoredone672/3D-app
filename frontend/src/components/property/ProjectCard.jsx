import { Link } from "react-router-dom";
import { formatPrice } from "../../utils/format.js";
import { assetUrl } from "../../utils/assetUrl.js";
import "./ProjectCard.css";

function ProjectCard({ project }) {
  return (
    <div className="project-card">
      <div className="project-card-image">
        {project.imageUrl ? (
          <img src={assetUrl(project.imageUrl)} alt={project.name} />
        ) : (
          <div className="project-card-image-placeholder">No image</div>
        )}
      </div>
      <div className="project-card-body">
        <h3>{project.name}</h3>
        <p className="project-card-location">{project.location}</p>
        <p className="project-card-price">{formatPrice(project.startingPrice)}</p>
        <p className="project-card-meta">{project.unitsCount ?? 0} units</p>
        <Link to={`/projects/${project.id}`} className="btn">
          Explore
        </Link>
      </div>
    </div>
  );
}

export default ProjectCard;
