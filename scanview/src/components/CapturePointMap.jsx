import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import "./CapturePointMap.css";

const DISPLAY_RADIUS = 1.3;

function normalizeForDisplay(points) {
  const maxDist = points.reduce((max, p) => {
    const d = Math.hypot(p.position.x, p.position.y, p.position.z);
    return Math.max(max, d);
  }, 1e-6);
  return points.map((p) => ({
    ...p,
    displayPosition: {
      x: (p.position.x / maxDist) * DISPLAY_RADIUS,
      y: (p.position.y / maxDist) * DISPLAY_RADIUS,
      z: (p.position.z / maxDist) * DISPLAY_RADIUS,
    },
  }));
}

function SpinningRig({ children }) {
  const group = useRef();
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.15;
  });
  return <group ref={group}>{children}</group>;
}

function PointDot({ point, state }) {
  const { x, y, z } = point.displayPosition;
  const color = state === "captured" ? "#3ecf6e" : state === "current" ? "#ffcc33" : "#6b7280";
  const size = state === "current" ? 0.1 : 0.06;
  return (
    <mesh position={[x, y, z]}>
      <sphereGeometry args={[size, 12, 12]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={state === "current" ? 0.9 : 0.25}
      />
    </mesh>
  );
}

/**
 * A small, non-interactive 3D map of the planned capture sphere: the
 * object placeholder in the center, one dot per planned viewpoint, colored
 * by whether it's been captured yet, is the current target, or is pending.
 * This visualizes the *plan* from generateCapturePoints() - it is not a
 * live view of the phone's actual position (Phase 1 has no pose tracking).
 */
function CapturePointMap({ points, currentIndex, capturedIds }) {
  const displayPoints = useMemo(() => normalizeForDisplay(points), [points]);

  return (
    <div className="capture-point-map">
      <Canvas camera={{ position: [1.8, 1.4, 1.8], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[3, 3, 3]} intensity={40} />
        <SpinningRig>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.25, 0.3, 0.7, 24]} />
            <meshStandardMaterial color="#3a4a63" />
          </mesh>
          {displayPoints.map((point, i) => (
            <PointDot
              key={point.id}
              point={point}
              state={
                capturedIds.has(point.id) ? "captured" : i === currentIndex ? "current" : "pending"
              }
            />
          ))}
        </SpinningRig>
      </Canvas>
    </div>
  );
}

export default CapturePointMap;
