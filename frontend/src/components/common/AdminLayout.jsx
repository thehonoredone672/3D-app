import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import "./AdminLayout.css";

function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/admin/login");
  }

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <span className="admin-logo">PropView Admin</span>
        <nav className="admin-nav">
          <NavLink to="/admin" end>
            Dashboard
          </NavLink>
          <NavLink to="/admin/projects">Projects</NavLink>
          <NavLink to="/admin/enquiries">Enquiries</NavLink>
        </nav>
        <button className="btn btn-secondary" onClick={handleLogout}>
          Logout
        </button>
      </header>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
