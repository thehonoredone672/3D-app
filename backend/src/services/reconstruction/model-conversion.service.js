import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { NodeIO } from "@gltf-transform/core";
import { dedup, prune, weld, simplify, draco } from "@gltf-transform/functions";
import { KHRDracoMeshCompression } from "@gltf-transform/extensions";
import draco3d from "draco3dgltf";
import { MeshoptSimplifier } from "meshoptimizer";

const PYTHON_PATH = process.env.PYTHON_PATH || "python";
const CONVERT_SCRIPT = path.resolve("scripts/convert_mesh.py");
const MESH_FROM_POINTS_SCRIPT = path.resolve("scripts/mesh_from_points.py");

let ioPromise;
function getIO() {
  if (!ioPromise) {
    ioPromise = (async () => {
      await MeshoptSimplifier.ready;
      return new NodeIO()
        .registerExtensions([KHRDracoMeshCompression])
        .registerDependencies({
          "draco3d.decoder": await draco3d.createDecoderModule(),
          "draco3d.encoder": await draco3d.createEncoderModule(),
        });
    })();
  }
  return ioPromise;
}

function runPythonScript(scriptPath, args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(PYTHON_PATH, [scriptPath, ...args]);
    let stderr = "";
    proc.stderr.on("data", (chunk) => (stderr += chunk));
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${path.basename(scriptPath)} failed (exit ${code}): ${stderr.trim()}`));
    });
    proc.on("error", reject);
  });
}

// Pipeline stage: Mesh Cleanup -> Texture Generation -> GLB Conversion.
// Shells out to a small Python/trimesh helper - there is no reliable pure-JS
// path for loading an arbitrary photogrammetry mesh (PLY/OBJ) and writing GLB.
export async function convertToGlb(inputMeshPath, outputGlbPath) {
  await runPythonScript(CONVERT_SCRIPT, [inputMeshPath, outputGlbPath]);
  return outputGlbPath;
}

// Point-cloud variant: used when dense reconstruction/meshing isn't
// available (see photogrammetry.service.js) and we mesh COLMAP's sparse
// point cloud directly via CPU-only Poisson surface reconstruction.
export async function meshFromPointCloud(inputPlyPath, outputGlbPath) {
  await runPythonScript(MESH_FROM_POINTS_SCRIPT, [inputPlyPath, outputGlbPath]);
  return outputGlbPath;
}

// Pipeline stage: Remove unnecessary geometry -> Reduce polygon count ->
// Compress -> the actual file a buyer's browser downloads. Raw photogrammetry
// meshes can be far larger than a web viewer should have to load; this is a
// real, measurable optimization pass (welding duplicate vertices, decimating
// triangle count, Draco-compressing geometry), not a no-op placeholder.
export async function optimizeGlb(inputPath, outputPath, { simplifyRatio = 0.5 } = {}) {
  const io = await getIO();
  const doc = await io.read(inputPath);

  await doc.transform(
    dedup(),
    weld(),
    simplify({ simplifier: MeshoptSimplifier, ratio: simplifyRatio, error: 0.01 }),
    prune(),
    draco()
  );

  await io.write(outputPath, doc);

  return {
    rawBytes: fs.statSync(inputPath).size,
    optimizedBytes: fs.statSync(outputPath).size,
  };
}
