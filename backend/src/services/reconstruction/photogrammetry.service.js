import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const COLMAP_PATH = process.env.COLMAP_PATH || path.resolve("tools/colmap/bin/colmap.exe");

// Pipeline stage: Captured Images -> Photogrammetry Engine -> Point Cloud.
// Spawns COLMAP's automatic_reconstructor (feature extraction, matching,
// sparse SfM) as a background process. Does not wait for it to finish -
// writes a COLMAP_DONE or FAILED marker into workspacePath on exit, which
// LocalColmapProvider.getStatus() polls for.
//
// Dense reconstruction is intentionally skipped (--dense 0): COLMAP's dense
// stereo (patch_match_stereo) is CUDA-only with no CPU fallback, and this
// environment reports a GPU via the OS without actually passing through
// compute access to it. model-conversion.service.js meshes the sparse point
// cloud directly instead.
export function runPhotogrammetry({ imagePath, workspacePath }) {
  const logPath = path.join(workspacePath, "colmap.log");
  const logStream = fs.createWriteStream(logPath);

  const args = [
    "automatic_reconstructor",
    "--image_path",
    imagePath,
    "--workspace_path",
    workspacePath,
    "--data_type",
    "individual",
    "--quality",
    "low",
    "--use_gpu",
    "0",
    "--dense",
    "0",
  ];

  const proc = spawn(COLMAP_PATH, args);
  proc.stdout.pipe(logStream);
  proc.stderr.pipe(logStream);

  proc.on("close", (code) => {
    const marker = code === 0 ? "COLMAP_DONE" : "FAILED";
    const detail = code === 0 ? "ok" : `colmap exited with code ${code}`;
    fs.writeFileSync(path.join(workspacePath, marker), detail);
  });

  proc.on("error", (err) => {
    fs.writeFileSync(path.join(workspacePath, "FAILED"), err.message);
  });

  return proc;
}

// Exports a COLMAP sparse reconstruction (binary format) to a plain PLY
// point cloud that downstream meshing tools can read.
export function exportSparsePointCloud(sparseModelPath, outputPlyPath) {
  return new Promise((resolve, reject) => {
    const proc = spawn(COLMAP_PATH, [
      "model_converter",
      "--input_path",
      sparseModelPath,
      "--output_path",
      outputPlyPath,
      "--output_type",
      "PLY",
    ]);
    let stderr = "";
    proc.stderr.on("data", (chunk) => (stderr += chunk));
    proc.on("close", (code) => {
      if (code === 0) resolve(outputPlyPath);
      else reject(new Error(`model_converter failed (exit ${code}): ${stderr.trim()}`));
    });
    proc.on("error", reject);
  });
}

// Finds the sparse reconstruction COLMAP produced. automatic_reconstructor
// numbers submodels (0, 1, ...) if the scene fragments into disconnected
// components; we use the first, which is conventionally the largest.
export function findSparseModel(workspacePath) {
  const sparseDir = path.join(workspacePath, "sparse");
  if (!fs.existsSync(sparseDir)) return null;

  const entries = fs
    .readdirSync(sparseDir)
    .filter((entry) => fs.statSync(path.join(sparseDir, entry)).isDirectory())
    .sort();

  return entries.length > 0 ? path.join(sparseDir, entries[0]) : null;
}
