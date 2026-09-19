// Pure, framework-free generator for the guided capture-point path.
//
// A "capture point" is a planned camera viewpoint on a ring-sampled sphere
// around the object: a sequence of (azimuth, elevation) pairs at a fixed
// distance, converted to a position + look-at target. This is a *plan*,
// not a measurement - the app has no way to know the phone's real position
// in space during Phase 1 (no SLAM/ARCore/ARKit), so guidance is derived
// entirely from comparing planned points to each other, never from sensor
// pose data we don't actually have.

export const DETAIL_PRESETS = {
  FAST: { label: "Fast", horizontalDensity: 8, verticalDensity: 3 },
  STANDARD: { label: "Standard", horizontalDensity: 12, verticalDensity: 4 },
  DETAILED: { label: "Detailed", horizontalDensity: 16, verticalDensity: 6 },
  HIGH: { label: "High", horizontalDensity: 20, verticalDensity: 8 },
};

export const DEFAULT_MIN_ELEVATION_DEG = -15;
export const DEFAULT_MAX_ELEVATION_DEG = 60;

export function pointCountForPreset(detailLevel, custom) {
  if (detailLevel === "CUSTOM") {
    const h = Math.max(3, custom?.horizontalDensity || 0);
    const v = Math.max(1, custom?.verticalDensity || 0);
    return h * v;
  }
  const preset = DETAIL_PRESETS[detailLevel];
  return preset ? preset.horizontalDensity * preset.verticalDensity : 0;
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function normalizeAngle(deg) {
  let d = deg % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

/**
 * generateCapturePoints({
 *   objectSize,          // approximate largest dimension of the object, meters
 *   cameraDistance,      // optional override; derived from objectSize otherwise
 *   horizontalDensity,   // points per elevation ring
 *   verticalDensity,     // number of elevation rings
 *   detailLevel,         // "FAST" | "STANDARD" | "DETAILED" | "HIGH" | "CUSTOM"
 *   minElevationDeg, maxElevationDeg,
 * }) -> [{ id, sequence, azimuthDeg, elevationDeg, position:{x,y,z}, target:{x,y,z} }]
 */
export function generateCapturePoints(options = {}) {
  const {
    objectSize = 0.2,
    horizontalDensity: hOverride,
    verticalDensity: vOverride,
    detailLevel = "STANDARD",
    minElevationDeg = DEFAULT_MIN_ELEVATION_DEG,
    maxElevationDeg = DEFAULT_MAX_ELEVATION_DEG,
  } = options;

  const preset = DETAIL_PRESETS[detailLevel];
  const horizontalDensity = Math.max(3, hOverride ?? preset?.horizontalDensity ?? 12);
  const verticalDensity = Math.max(1, vOverride ?? preset?.verticalDensity ?? 3);

  const cameraDistance = Math.max(0.15, options.cameraDistance ?? objectSize * 2.5);

  const points = [];
  let sequence = 1;

  for (let ring = 0; ring < verticalDensity; ring++) {
    const elevationDeg =
      verticalDensity === 1
        ? (minElevationDeg + maxElevationDeg) / 2
        : minElevationDeg + (ring * (maxElevationDeg - minElevationDeg)) / (verticalDensity - 1);

    // Serpentine (boustrophedon) traversal: alternate direction each ring so
    // the last azimuth of one ring is adjacent to the first azimuth of the
    // next, instead of jumping back to 0deg - keeps consecutive views
    // overlapping per the "avoid large jumps" requirement.
    const reverse = ring % 2 === 1;
    for (let step = 0; step < horizontalDensity; step++) {
      const index = reverse ? horizontalDensity - 1 - step : step;
      const azimuthDeg = (index * 360) / horizontalDensity;

      const elevRad = toRad(elevationDeg);
      const azRad = toRad(azimuthDeg);

      const position = {
        x: cameraDistance * Math.cos(elevRad) * Math.cos(azRad),
        y: cameraDistance * Math.sin(elevRad),
        z: cameraDistance * Math.cos(elevRad) * Math.sin(azRad),
      };

      points.push({
        id: `p${String(sequence).padStart(3, "0")}`,
        sequence,
        ring,
        azimuthDeg,
        elevationDeg,
        position,
        target: { x: 0, y: 0, z: 0 },
      });
      sequence++;
    }
  }

  return points;
}

/**
 * Derives a plain-language guidance hint between two *planned* points.
 * This compares pre-computed angles, not live camera pose - it tells the
 * user which way the plan says to move next, not where the phone actually is.
 */
export function describeTransition(fromPoint, toPoint) {
  if (!fromPoint) {
    return { azimuthDeltaDeg: 0, elevationDeltaDeg: 0, hint: "Frame the object and capture" };
  }

  const azimuthDeltaDeg = normalizeAngle(toPoint.azimuthDeg - fromPoint.azimuthDeg);
  const elevationDeltaDeg = toPoint.elevationDeg - fromPoint.elevationDeg;

  const parts = [];
  if (Math.abs(azimuthDeltaDeg) > 3) {
    parts.push(azimuthDeltaDeg > 0 ? "move right" : "move left");
  }
  if (elevationDeltaDeg > 3) {
    parts.push("move higher");
  } else if (elevationDeltaDeg < -3) {
    parts.push("move lower");
  }

  return {
    azimuthDeltaDeg,
    elevationDeltaDeg,
    hint: parts.length ? parts.join(", ") : "Hold steady and capture",
  };
}
