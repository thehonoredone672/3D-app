# PropView

An MVP real-estate platform for interactive 3D property visualization. Developers/agents manage projects, buildings and units through an admin dashboard; buyers explore properties in an interactive 3D viewer, select units, and submit enquiries or site-visit requests.

Built as a deliberately minimal SaaS product — functional, clean architecture, no unnecessary complexity.

This repo also contains **[ScanView](scanview/)**, a separate, unrelated app: a generic multi-view object scanner (turn any physical object into an interactive 3D view from guided phone-camera captures — see [scanview/README.md](scanview/README.md)). It ships from the same repo and GitHub Pages site as a matter of deployment convenience, not because the two products are connected.

## Tech Stack

**Frontend:** React + Vite (JavaScript, no TypeScript) · React Router · Three.js · @react-three/fiber · @react-three/drei · Axios · plain CSS

**Backend:** Node.js + Express · PostgreSQL + Prisma ORM · JWT auth · bcrypt · Multer (file uploads)

## Project Structure

```text
propview/
  backend/
    src/
      controllers/   # request handling, validation
      services/      # Prisma queries / business logic
      routes/        # Express route definitions
      middleware/     # auth, error handling, uploads
      utils/         # jwt, prisma client
      prisma/        # schema.prisma, migrations, seed.js
    uploads/         # local file storage (dev only)
  frontend/
    src/
      components/
        common/      # Header, Layout, Modal, ProtectedRoute, AdminLayout, ...
        property/    # ProjectCard, UnitInfoPanel, EnquiryForm
        viewer/      # PropertyViewer, Model (GLB loader), DemoBuilding
      pages/         # Home, Projects, ProjectDetails, PropertyExplorer,
                      # UnitDetails, Contact, Admin/*
      services/      # axios wrappers per API resource
      context/       # AuthContext (JWT session)
      routes/        # AppRoutes.jsx
```

## Features

- Public browsing: project listing → project details → full-screen 3D explorer → unit details
- Interactive 3D viewer (Three.js / React Three Fiber): orbit/zoom/pan, shadows, GLB model loading with a loading indicator and error state, or a procedural demo building generated from real unit data when no model is uploaded
- Click-to-select units in the 3D scene (by mesh naming convention, e.g. `Tower_A_Unit_101`), with building/floor filtering and status-based coloring (Available / Reserved / Sold)
- Enquiry & site-visit request forms, stored in PostgreSQL
- Admin dashboard: JWT-protected, role-based (`ADMIN` vs `BUYER`), full CRUD for projects/buildings/units, file uploads (project images, 3D models, floor plans), enquiries table with status updates
- Mobile scanning & 3D reconstruction: a phone-browser guided capture flow (`/mobile-scan`) that uploads photos and runs them through a real, pluggable reconstruction pipeline — see below

## Prerequisites

- Node.js 18+
- PostgreSQL running locally (or reachable via a connection string)

## Setup

### 1. Backend

```bash
cd backend
npm install
```

Create `backend/.env` (see `.env.example`):

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/propview?schema=public"
PORT=4100
JWT_SECRET="replace-with-a-long-random-string"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173"
UPLOAD_DIR="uploads"
SCAN_STORAGE_DIR="storage"
RECONSTRUCTION_PROVIDER="null"
```

Create the database, then run migrations and seed demo data:

```bash
npx prisma migrate dev
npm run prisma:seed
```

Start the API:

```bash
npm run dev
```

The API listens on `http://localhost:4100` (health check at `/api/health`).

### 2. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:4100/api
```

Start the dev server:

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

## Demo Data & Admin Login

The seed script (`backend/src/prisma/seed.js`) creates:

- An admin user — **admin@propview.dev / admin123**
- A demo project ("Skyline Heights") with two towers and 12 units across mixed floors

Admin dashboard: `http://localhost:5173/admin/login`

## API Overview

```text
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/projects
GET    /api/projects/:id
GET    /api/projects/:id/buildings
POST   /api/projects            (admin)
PUT    /api/projects/:id        (admin)
DELETE /api/projects/:id        (admin)

POST   /api/buildings           (admin)
PUT    /api/buildings/:id       (admin)
DELETE /api/buildings/:id       (admin)
GET    /api/buildings/:id/units

GET    /api/units/:id
POST   /api/units               (admin)
PUT    /api/units/:id           (admin)
DELETE /api/units/:id           (admin)

POST   /api/enquiries
GET    /api/enquiries           (admin)
PUT    /api/enquiries/:id       (admin, status update)

POST   /api/uploads             (admin, multipart file upload)

POST   /api/scans               (admin)
GET    /api/scans/:id           (admin)
GET    /api/scans/:id/status    (admin)
POST   /api/scans/:id/captures  (admin, multipart file upload)
POST   /api/scans/:id/process   (admin, starts reconstruction)
```

## 3D Models

Upload a `.glb`/`.gltf` file per project through the admin dashboard (Create/Edit Project → 3D Model). For unit-level click detection, name meshes in the model `<Building>_Unit_<UnitNumber>` (e.g. `Tower_A_Unit_101`) — matching the building name and unit number as entered in the admin panel.

If a project has no uploaded model, the explorer falls back to a procedural building generated from that project's real building/unit data.

## Mobile Scanning & 3D Reconstruction

An admin can generate a unit's 3D model two ways:

1. **Upload an existing model** (`.glb`) directly, same as project-level models — always available, no setup required.
2. **Scan it with a phone**: from a unit's admin page, the "Scan" link opens `/mobile-scan?projectId=…&unitId=…` on any phone browser. It guides the user through a manual photo capture (no LiDAR/ARCore/ARKit required), lets them review and remove shots, then uploads the session. `/scans/:id` shows real-time status — no fabricated progress percentages, ever.

Reconstruction itself is behind an adapter (`backend/src/services/reconstruction/`) so no single vendor is hardcoded:

```text
ReconstructionProvider (createModel / getStatus / downloadModel)
        │
   ┌────┼─────────┐
   ▼    ▼         ▼
 null  local    (future: cloud)
```

- **`null`** (default) — honestly reports "not configured" rather than faking a result. Nothing else in the app breaks; the "upload existing model" path still works.
- **`local`** — a genuinely real pipeline: [COLMAP](https://colmap.github.io/) (feature extraction → matching → sparse structure-from-motion) followed by CPU-side Poisson surface reconstruction (via Python/Open3D) and GLB export (via trimesh). Dense multi-view stereo is intentionally skipped — COLMAP's dense stage is CUDA-only with no CPU fallback, and this pipeline is built to work without requiring a specific GPU. Reconstruction quality is entirely dependent on having enough real, overlapping photos of an actual space; see `backend/tools/README.md` to set it up.

Set `RECONSTRUCTION_PROVIDER=local` in `.env` to enable it. Adding a real cloud provider later means implementing the same three-method interface and registering it in `providerRegistry.js` — no other code changes.

## Testing on a Phone

The mobile scanning flow (`/mobile-scan`) needs a real camera, and browsers only allow camera access (`getUserMedia`) over HTTPS. To test it from a phone on the same WiFi network as your dev machine:

1. Generate a self-signed certificate covering your machine's LAN IP (find it via `ipconfig` / `ifconfig`, e.g. `192.168.1.6`):

   ```bash
   mkdir certs
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout certs/dev.key -out certs/dev.crt \
     -subj "/CN=YOUR_LAN_IP" \
     -addext "subjectAltName=IP:YOUR_LAN_IP,DNS:localhost,IP:127.0.0.1"
   ```

2. In `backend/.env`, set:
   ```env
   SSL_KEY_PATH="../certs/dev.key"
   SSL_CERT_PATH="../certs/dev.crt"
   CORS_ORIGIN="https://localhost:5173,https://YOUR_LAN_IP:5173"
   ```
3. In `frontend/.env`, set `VITE_API_URL=https://YOUR_LAN_IP:4100/api`.
4. Restart both `npm run dev` processes (env changes need a restart).
5. On your phone, visit `https://YOUR_LAN_IP:4100/api/health` first and accept the certificate warning (this is expected — it's self-signed, not a real security problem on your own LAN), then visit `https://YOUR_LAN_IP:5173` and accept its warning too. Each `host:port` needs to be trusted separately.
6. Log in at `/admin/login`, open a unit's admin page, and use its "Scan" link.

This is a dev-only setup for testing on your own network — not a public deployment.

## Deploying to the Internet

This deploys the frontend to **GitHub Pages** (free static hosting) and the backend + database to **Render** + **Neon** (both have free tiers). Reconstruction (`RECONSTRUCTION_PROVIDER=local`, the COLMAP pipeline) is intentionally left disabled in this setup — it needs a persistent server with COLMAP/Python installed, which free static/serverless hosting doesn't provide. The "upload an existing `.glb`" path works normally.

### 1. Database — Neon

1. Create a free account at [neon.tech](https://neon.tech) and a new project.
2. Copy the connection string it gives you (starts with `postgresql://...`) — this is your `DATABASE_URL`.

### 2. Backend — Render

1. Create a free account at [render.com](https://render.com) and connect your GitHub account.
2. **New → Blueprint**, pick this repo — it will read [`render.yaml`](render.yaml) at the repo root and pre-fill a `propview-api` web service (root dir `backend`, builds with `prisma migrate deploy`, `plan: free`).
3. When prompted, fill in the two secret env vars it leaves blank:
   - `DATABASE_URL` — the Neon connection string from step 1.
   - `CORS_ORIGIN` — `https://YOUR_GITHUB_USERNAME.github.io` (no trailing slash).
4. Deploy. Once live, note the service URL, e.g. `https://propview-api.onrender.com`.
5. Seed demo data once, from your machine, by pointing your local `backend/.env`'s `DATABASE_URL` at the same Neon database and running `npm run prisma:seed` — or run it from Render's **Shell** tab on the service.
6. Free-tier services spin down after inactivity; the first request after a while takes ~30-50s to wake up.

### 3. Frontend — GitHub Pages

1. In this repo on GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**. (One-time toggle — the included [workflow](.github/workflows/deploy-pages.yml) handles the rest.)
2. **Settings → Secrets and variables → Actions → Variables → New repository variable**:
   - Name: `VITE_API_URL`
   - Value: `https://propview-api.onrender.com/api` (your Render URL from above, with `/api`)
3. Push to `main` (or re-run the workflow from the **Actions** tab) — it builds the frontend and publishes it to `https://YOUR_GITHUB_USERNAME.github.io/3D-app/`.

Once both are live, share the GitHub Pages URL — anyone can open it in a browser and use the app; no download or install needed. The mobile scanning flow works too, since both Pages and Render serve over HTTPS by default.

## Notes

- File uploads are stored locally under `backend/uploads/` in development. The upload path is isolated behind a single service (`services/uploads.js` on the frontend, `upload.middleware.js` on the backend) so it can be swapped for S3/Cloudinary/R2 later without touching calling code.
- Prisma is pinned to a stable 6.x release rather than the 7.x/8.x pre-release lines, which introduced breaking changes to the datasource configuration.
- Not included in this MVP (by design): VR/AR, payments, CRM integrations, AI features, multiplayer — see the product spec for the full roadmap.
