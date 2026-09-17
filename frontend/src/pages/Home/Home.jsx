import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home">
      <section className="home-hero">
        <h1>PropView</h1>
        <p className="home-headline">Explore properties before you visit.</p>
        <p className="home-subtext">
          Walk through real estate projects in interactive 3D, pick your unit, and book a
          site visit — all before stepping onto the property.
        </p>
        <Link to="/projects" className="btn">
          Explore Projects
        </Link>
      </section>

      <section className="home-preview">
        <div className="home-preview-box">
          <span>Interactive 3D Property Viewer</span>
        </div>
      </section>
    </div>
  );
}

export default Home;
