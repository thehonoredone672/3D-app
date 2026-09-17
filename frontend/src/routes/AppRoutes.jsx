import { Routes, Route } from "react-router-dom";
import Layout from "../components/common/Layout.jsx";
import AdminLayout from "../components/common/AdminLayout.jsx";
import ProtectedRoute from "../components/common/ProtectedRoute.jsx";
import NotFound from "../components/common/NotFound.jsx";
import Home from "../pages/Home/Home.jsx";
import Projects from "../pages/Projects/Projects.jsx";
import ProjectDetails from "../pages/ProjectDetails/ProjectDetails.jsx";
import PropertyExplorer from "../pages/PropertyExplorer/PropertyExplorer.jsx";
import UnitDetails from "../pages/UnitDetails/UnitDetails.jsx";
import Contact from "../pages/Contact/Contact.jsx";
import AdminLogin from "../pages/Admin/Login/AdminLogin.jsx";
import Dashboard from "../pages/Admin/Dashboard/Dashboard.jsx";
import ProjectsList from "../pages/Admin/Projects/ProjectsList.jsx";
import ProjectForm from "../pages/Admin/Projects/ProjectForm.jsx";
import ProjectManage from "../pages/Admin/Projects/ProjectManage.jsx";
import EnquiriesList from "../pages/Admin/Enquiries/EnquiriesList.jsx";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/projects/:id/explore" element={<PropertyExplorer />} />

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<ProtectedRoute role="ADMIN" />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/projects" element={<ProjectsList />} />
          <Route path="/admin/projects/new" element={<ProjectForm />} />
          <Route path="/admin/projects/:id" element={<ProjectManage />} />
          <Route path="/admin/enquiries" element={<EnquiriesList />} />
        </Route>
      </Route>

      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetails />} />
        <Route path="/units/:id" element={<UnitDetails />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
