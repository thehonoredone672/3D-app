export function findUnitByNumber(buildings, unitNumber) {
  const target = String(unitNumber).toLowerCase();
  for (const building of buildings) {
    const match = building.units.find((u) => u.unitNumber.toLowerCase() === target);
    if (match) return match;
  }
  return null;
}

export function findUnitByMeshName(buildings, meshName) {
  const match = meshName.match(/Unit[_-]?([\w-]+)$/i);
  if (!match) return null;

  const building = buildings.find((b) => meshName.startsWith(b.name.replace(/\s+/g, "_")));
  return findUnitByNumber(building ? [building] : buildings, match[1]);
}
