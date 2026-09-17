import { useGLTF } from "@react-three/drei";
import { findUnitByMeshName } from "../../utils/units.js";

function Model({ url, buildings = [], onSelectUnit }) {
  const { scene } = useGLTF(url);

  function handleClick(event) {
    event.stopPropagation();
    const unit = findUnitByMeshName(buildings, event.object?.name || "");
    if (unit) onSelectUnit?.(unit);
  }

  return (
    <primitive
      object={scene}
      onClick={handleClick}
      onPointerOver={(event) => {
        event.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    />
  );
}

export default Model;
