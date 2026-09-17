import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProject } from "../../services/projects.js";
import { formatPrice } from "../../utils/format.js";
import { assetUrl } from "../../utils/assetUrl.js";
import Loading from "../../components/common/Loading.jsx";
import ErrorMessage from "../../components/common/ErrorMessage.jsx";
import "./ProjectDetails.css";

function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    setStatus("loading");
    getProject(id)
      .then((data) => {
        setProject(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [id]);

  if (status === "loading") return <Loading label="Loading project..." />;
  if (status === "error" || !project) {
    return <ErrorMessage message="Project not found." />;
  }

  return (
    <div className="project-details">
      {project.imageUrl && (
        <img
          className="project-details-image"
          src={assetUrl(project.imageUrl)}
          alt={project.name}
        />
      )}

      <h1>{project.name}</h1>
      <p className="project-details-location">{project.location}</p>
      <p className="project-details-price">{formatPrice(project.startingPrice)}</p>

      <p className="project-details-description">{project.description}</p>

      {project.amenities?.length > 0 && (
        <div className="project-details-section">
          <h2>Amenities</h2>
          <ul className="project-details-amenities">
            {project.amenities.map((amenity) => (
              <li key={amenity}>{amenity}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="project-details-stats">
        <div>
          <strong>{project.buildingsCount ?? 0}</strong>
          <span>Buildings</span>
        </div>
        <div>
          <strong>{project.unitsCount ?? 0}</strong>
          <span>Units</span>
        </div>
      </div>

      <Link to={`/projects/${project.id}/explore`} className="btn">
        Explore in 3D
      </Link>
    </div>
  );
}

export default ProjectDetails;
