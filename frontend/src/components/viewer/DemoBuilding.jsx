import { STATUS_COLORS } from "../../utils/status.js";

const UNIT_SIZE = [1.6, 1, 1.6];
const UNIT_GAP = 0.3;
const FLOOR_HEIGHT = 1.3;
const BUILDING_GAP = 6;
const HIGHLIGHT_COLOR = "#2563eb";
const DIM_OPACITY = 0.25;

function groupByFloor(units) {
  return units.reduce((acc, unit) => {
    (acc[unit.floor] = acc[unit.floor] || []).push(unit);
    return acc;
  }, {});
}

function DemoBuilding({
  buildings = [],
  selectedBuildingId,
  selectedFloor,
  selectedUnitId,
  onSelectUnit,
}) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#e5e5e5" />
      </mesh>

      {buildings.map((building, bIdx) => {
        const floors = groupByFloor(building.units);
        const floorNumbers = Object.keys(floors)
          .map(Number)
          .sort((a, b) => a - b);
        const buildingX = (bIdx - (buildings.length - 1) / 2) * BUILDING_GAP;
        const safeName = building.name.replace(/\s+/g, "_");
        const buildingDimmed = selectedBuildingId && selectedBuildingId !== building.id;

        return (
          <group key={building.id} position={[buildingX, 0, 0]}>
            {floorNumbers.map((floorNum, fIdx) =>
              floors[floorNum].map((unit, uIdx) => {
                const units = floors[floorNum];
                const totalWidth = units.length * (UNIT_SIZE[0] + UNIT_GAP);
                const x = uIdx * (UNIT_SIZE[0] + UNIT_GAP) - totalWidth / 2 + UNIT_SIZE[0] / 2;
                const y = fIdx * FLOOR_HEIGHT + UNIT_SIZE[1] / 2;

                const isSelected = unit.id === selectedUnitId;
                const floorDimmed = selectedFloor != null && selectedFloor !== floorNum;
                const dimmed = buildingDimmed || floorDimmed;
                const color = isSelected
                  ? HIGHLIGHT_COLOR
                  : STATUS_COLORS[unit.status] || "#cbd5e1";

                return (
                  <mesh
                    key={unit.id}
                    name={`${safeName}_Unit_${unit.unitNumber}`}
                    position={[x, y, 0]}
                    castShadow
                    receiveShadow
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelectUnit?.(unit);
                    }}
                    onPointerOver={(event) => {
                      event.stopPropagation();
                      document.body.style.cursor = "pointer";
                    }}
                    onPointerOut={() => {
                      document.body.style.cursor = "auto";
                    }}
                  >
                    <boxGeometry args={UNIT_SIZE} />
                    <meshStandardMaterial
                      color={color}
                      transparent
                      opacity={dimmed ? DIM_OPACITY : 1}
                    />
                  </mesh>
                );
              })
            )}
          </group>
        );
      })}
    </group>
  );
}

export default DemoBuilding;
