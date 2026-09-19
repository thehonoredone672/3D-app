# ScanView

Turn a real physical object into an interactive 3D view, captured entirely from a phone camera.

This is a **separate product from PropView** — a generic multi-view object scanner, not tied to real estate. It lives in this repo purely for convenience (shared GitHub Pages deployment); the two apps don't share code, data, or a backend.

## Status: Phase 1

Only the guided capture experience is implemented so far — no reconstruction yet, by design:

```text
New Scan → Object Setup → Capture Point Generator → Guided Camera Capture → Capture Complete
```

Reconstruction (turning captures into an actual viewable 3D object) is a later phase and is *not* faked here — the final screen says so explicitly.

## Tech Stack

React + Vite (JavaScript) · React Router · Three.js / @react-three/fiber (for the live capture-point map) · Browser Camera API (`getUserMedia`)

No backend, no database, no auth in Phase 1 — everything runs client-side. "Recent Scans" on the home screen is local browser history (`localStorage`), not a synced record.

## Project Structure

```text
scanview/
  src/
    lib/
      capturePoints.js   # generateCapturePoints() - the dynamic viewpoint-sphere generator
      scanConfig.js       # sessionStorage handoff between setup and capture screens
      recentScans.js       # localStorage scan history
    components/
      CameraCapture.jsx    # getUserMedia -> canvas -> JPEG blob, with a basic too-dark check
      CapturePointMap.jsx  # mini 3D visualization of the planned capture sphere
    pages/
      Home.jsx
      NewScan/
        ObjectSetup.jsx     # object label/size, detail-level preset, prepare checklist
        CaptureSession.jsx  # the guided capture screen
        CaptureReview.jsx   # honest "capture complete, reconstruction not built yet" summary
```

## Setup

```bash
npm install --legacy-peer-deps
npm run dev
```

The app runs at `http://localhost:5173` (or whichever port you choose).

## Testing the Camera on a Phone

`getUserMedia` (camera access) requires HTTPS. To test on a real phone on the same WiFi network as your dev machine:

1. Generate a self-signed certificate for your machine's LAN IP:
   ```bash
   mkdir certs
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout certs/dev.key -out certs/dev.crt \
     -subj "/CN=YOUR_LAN_IP" \
     -addext "subjectAltName=IP:YOUR_LAN_IP,DNS:localhost,IP:127.0.0.1"
   ```
2. `npm run dev -- --host` and open `https://YOUR_LAN_IP:5173` on your phone, accepting the certificate warning (expected — it's self-signed, for your own LAN only).

`certs/` is gitignored; this is a dev-only setup.

## Detail Levels

| Preset | Viewpoints/ring × rings | Total |
|---|---|---|
| Fast | 8 × 3 | 24 |
| Standard | 12 × 4 | 48 |
| Detailed | 16 × 6 | 96 |
| High | 20 × 8 | 160 |
| Custom | user-defined | unbounded |

More points give more overlap and visual information for a future reconstruction step — they don't by themselves guarantee better quality (lighting, focus, and real overlap all matter too).
