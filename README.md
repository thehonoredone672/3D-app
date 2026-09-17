# PropView

An MVP real-estate platform for interactive 3D property visualization. Developers/agents manage projects, buildings and units through an admin dashboard; buyers explore properties in an interactive 3D viewer, select units, and submit enquiries or site-visit requests.

Built as a deliberately minimal SaaS product — functional, clean architecture, no unnecessary complexity.

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
```

## 3D Models

Upload a `.glb`/`.gltf` file per project through the admin dashboard (Create/Edit Project → 3D Model). For unit-level click detection, name meshes in the model `<Building>_Unit_<UnitNumber>` (e.g. `Tower_A_Unit_101`) — matching the building name and unit number as entered in the admin panel.

If a project has no uploaded model, the explorer falls back to a procedural building generated from that project's real building/unit data.

## Notes

- File uploads are stored locally under `backend/uploads/` in development. The upload path is isolated behind a single service (`services/uploads.js` on the frontend, `upload.middleware.js` on the backend) so it can be swapped for S3/Cloudinary/R2 later without touching calling code.
- Prisma is pinned to a stable 6.x release rather than the 7.x/8.x pre-release lines, which introduced breaking changes to the datasource configuration.
- Not included in this MVP (by design): VR/AR, payments, CRM integrations, AI features, multiplayer — see the product spec for the full roadmap.
