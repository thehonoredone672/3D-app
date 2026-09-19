import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home.jsx";
import ObjectSetup from "../pages/NewScan/ObjectSetup.jsx";
import CaptureSession from "../pages/NewScan/CaptureSession.jsx";
import CaptureReview from "../pages/NewScan/CaptureReview.jsx";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/new" element={<ObjectSetup />} />
      <Route path="/new/capture" element={<CaptureSession />} />
      <Route path="/new/review" element={<CaptureReview />} />
    </Routes>
  );
}

export default AppRoutes;
