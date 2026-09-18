import express from "express";
import cors from "cors";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import buildingRoutes from "./routes/building.routes.js";
import unitRoutes from "./routes/unit.routes.js";
import enquiryRoutes from "./routes/enquiry.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import scanRoutes from "./routes/scan.routes.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: allowedOrigins,
  })
);
app.use(express.json());
app.use("/uploads", express.static(process.env.UPLOAD_DIR || "uploads"));

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/buildings", buildingRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/scans", scanRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
