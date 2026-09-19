import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRecentScans } from "../lib/recentScans.js";
import "./Home.css";

function statusLabel(status) {
  switch (status) {
    case "captured":
      return "Captured";
    case "abandoned":
      return "Incomplete";
    default:
      return status;
  }
}

function Home() {
  const [recentScans, setRecentScans] = useState([]);

  useEffect(() => {
    setRecentScans(getRecentScans());
  }, []);

  return (
    <div className="home">
      <div className="home-hero">
        <h1>Create 3D View</h1>
        <p>Turn a real object into an interactive 3D view, right from your phone camera.</p>
        <Link to="/new" className="btn btn-primary btn-large">
          New Scan
        </Link>
      </div>

      <section className="home-recents">
        <h2>Recent Scans</h2>
        {recentScans.length === 0 ? (
          <p className="home-recents-empty">No scans yet. Start your first one above.</p>
        ) : (
          <ul className="home-recents-list">
            {recentScans.map((scan) => (
              <li key={scan.id} className="home-recents-item">
                <div>
                  <strong>{scan.objectLabel || "Untitled object"}</strong>
                  <span className="home-recents-meta">
                    {scan.capturedCount}/{scan.pointCount} captures ·{" "}
                    {new Date(scan.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <span className={`home-recents-status home-recents-status-${scan.status}`}>
                  {statusLabel(scan.status)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default Home;
