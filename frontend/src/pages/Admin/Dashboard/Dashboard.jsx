import { useEffect, useState } from "react";
import { listProjects } from "../../../services/projects.js";
import { listEnquiries } from "../../../services/enquiries.js";
import Loading from "../../../components/common/Loading.jsx";
import ErrorMessage from "../../../components/common/ErrorMessage.jsx";
import "./Dashboard.css";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    Promise.all([listProjects(), listEnquiries()])
      .then(([projects, enquiries]) => {
        const units = projects.reduce((sum, p) => sum + (p.unitsCount || 0), 0);
        setStats({ projects: projects.length, units, enquiries: enquiries.length });
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  if (status === "loading") return <Loading label="Loading dashboard..." />;
  if (status === "error" || !stats) return <ErrorMessage message="Could not load dashboard." />;

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="dashboard-cards">
        <div className="dashboard-card">
          <strong>{stats.projects}</strong>
          <span>Projects</span>
        </div>
        <div className="dashboard-card">
          <strong>{stats.units}</strong>
          <span>Units</span>
        </div>
        <div className="dashboard-card">
          <strong>{stats.enquiries}</strong>
          <span>Enquiries</span>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
