import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Loader, Html } from "@react-three/drei";
import Model from "./Model.jsx";
import DemoBuilding from "./DemoBuilding.jsx";
import ViewerErrorBoundary from "./ViewerErrorBoundary.jsx";
import { assetUrl } from "../../utils/assetUrl.js";
import "./PropertyViewer.css";

function ModelError() {
  return (
    <Html center>
      <div className="viewer-error">Failed to load 3D model.</div>
    </Html>
  );
}

function PropertyViewer({
  modelUrl,
  buildings = [],
  selectedBuildingId,
  selectedFloor,
  selectedUnitId,
  onSelectUnit,
}) {
  return (
    <div className="property-viewer">
      <Canvas shadows camera={{ position: [12, 10, 12], fov: 45 }}>
        <color attach="background" args={["#f5f5f5"]} />
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[10, 15, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <Suspense fallback={null}>
          <ViewerErrorBoundary fallback={<ModelError />}>
            {modelUrl ? (
              <Model url={assetUrl(modelUrl)} buildings={buildings} onSelectUnit={onSelectUnit} />
            ) : (
              <DemoBuilding
                buildings={buildings}
                selectedBuildingId={selectedBuildingId}
                selectedFloor={selectedFloor}
                selectedUnitId={selectedUnitId}
                onSelectUnit={onSelectUnit}
              />
            )}
          </ViewerErrorBoundary>
        </Suspense>
        <OrbitControls makeDefault enableDamping dampingFactor={0.1} />
      </Canvas>
      <Loader />
    </div>
  );
}

export default PropertyViewer;
