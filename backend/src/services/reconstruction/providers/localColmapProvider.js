import fs from "fs";
import path from "path";
import { ReconstructionProvider } from "../reconstructionProvider.js";
import { runPhotogrammetry, exportSparsePointCloud, findSparseModel } from "../photogrammetry.service.js";
import { meshFromPointCloud, optimizeGlb } from "../model-conversion.service.js";

const RECONSTRUCTION_ROOT = process.env.RECONSTRUCTION_WORKSPACE_DIR || "storage/reconstruction";

function workspaceFor(jobId) {
  return path.join(RECONSTRUCTION_ROOT, jobId);
}

function marker(workspace, name) {
  return path.join(workspace, name);
}

// Real local pipeline: shells out to an actual COLMAP install for feature
// extraction / matching / sparse SfM, then meshes the resulting sparse point
// cloud (dense reconstruction needs CUDA - see photogrammetry.service.js).
// With only a handful of photos and little real geometric overlap, this can
// genuinely fail at any stage - reported honestly via getStatus(), never
// masked as success.
export class LocalColmapProvider extends ReconstructionProvider {
  async createModel({ jobId, captures, sourceRoot }) {
    const workspace = workspaceFor(jobId);
    const imageDir = path.join(workspace, "images");
    fs.mkdirSync(imageDir, { recursive: true });

    for (const capture of captures) {
      const src = path.join(sourceRoot, capture.fileUrl);
      const dest = path.join(imageDir, `${capture.sequenceNumber}${path.extname(capture.fileUrl)}`);
      fs.copyFileSync(src, dest);
    }

    runPhotogrammetry({ imagePath: imageDir, workspacePath: workspace });

    return { jobId };
  }

  async getStatus(jobId) {
    const workspace = workspaceFor(jobId);

    if (fs.existsSync(marker(workspace, "FAILED"))) {
      const reason = fs.readFileSync(marker(workspace, "FAILED"), "utf-8").trim();
      return { state: "failed", error: `Reconstruction failed: ${reason}` };
    }

    if (fs.existsSync(marker(workspace, "MESH_DONE"))) {
      return { state: "succeeded", meshPath: path.join(workspace, "model.glb") };
    }

    if (fs.existsSync(marker(workspace, "COLMAP_DONE"))) {
      // COLMAP's sparse stage finished; run the (fast) meshing step now,
      // synchronously within this status check.
      try {
        const sparseModel = findSparseModel(workspace);
        if (!sparseModel) {
          throw new Error(
            "COLMAP produced no sparse reconstruction (no image pairs could be registered - the captures likely don't have enough real overlapping geometry)"
          );
        }

        const pointsPly = path.join(workspace, "sparse-points.ply");
        await exportSparsePointCloud(sparseModel, pointsPly);

        const rawGlbPath = path.join(workspace, "raw.glb");
        await meshFromPointCloud(pointsPly, rawGlbPath);

        const glbPath = path.join(workspace, "model.glb");
        const { rawBytes, optimizedBytes } = await optimizeGlb(rawGlbPath, glbPath);
        console.log(
          `Optimized model for scan ${jobId}: ${rawBytes} -> ${optimizedBytes} bytes (${Math.round((1 - optimizedBytes / rawBytes) * 100)}% smaller)`
        );

        fs.writeFileSync(marker(workspace, "MESH_DONE"), "ok");
        return { state: "succeeded", meshPath: glbPath };
      } catch (err) {
        fs.writeFileSync(marker(workspace, "FAILED"), err.message);
        return { state: "failed", error: `Reconstruction failed: ${err.message}` };
      }
    }

    return { state: "running" };
  }

  async downloadModel(jobId) {
    const status = await this.getStatus(jobId);
    if (status.state !== "succeeded") {
      throw new Error("Model is not ready yet");
    }
    return status.meshPath;
  }
}
