# Local reconstruction tooling

This folder is gitignored — it holds large native binaries that don't belong in version control.

To enable the `local` reconstruction provider (`RECONSTRUCTION_PROVIDER=local`):

1. Download a [COLMAP](https://github.com/colmap/colmap/releases) release for your platform (e.g. `colmap-x64-windows-cuda.zip` if you have an NVIDIA GPU, or `colmap-x64-windows-nocuda.zip` otherwise — CPU-only works but is much slower).
2. Extract it here, so `tools/colmap/bin/colmap.exe` exists (the default `COLMAP_PATH` in `.env.example`).
3. Install Python 3.10+ and `pip install trimesh` — used by `scripts/convert_mesh.py` to convert COLMAP's output mesh (PLY) to GLB.
4. Set `PYTHON_PATH` in `.env` if `python` isn't on your PATH.

Without this, the app falls back to the `null` provider: reconstruction requests fail with a clear "not configured" error, and the "upload an existing 3D model" path in the admin dashboard still works normally.
