import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

function ProtectedRoute({ role }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/admin/login" replace />;
  if (role && user.role !== role) return <Navigate to="/admin/login" replace />;

  return <Outlet />;
}

export default ProtectedRoute;
