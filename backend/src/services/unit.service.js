import prisma from "../utils/prisma.js";

function notFound(message) {
  const err = new Error(message);
  err.status = 404;
  return err;
}

export async function listUnitsForBuilding(buildingId) {
  const building = await prisma.building.findUnique({ where: { id: buildingId } });
  if (!building) throw notFound("Building not found");

  return prisma.unit.findMany({ where: { buildingId }, orderBy: { floor: "asc" } });
}

export async function getUnitById(id) {
  const unit = await prisma.unit.findUnique({
    where: { id },
    include: { building: { include: { project: true } } },
  });
  if (!unit) throw notFound("Unit not found");
  return unit;
}

export async function createUnit(data) {
  const building = await prisma.building.findUnique({ where: { id: data.buildingId } });
  if (!building) throw notFound("Building not found");

  return prisma.unit.create({ data });
}

export async function updateUnit(id, data) {
  try {
    return await prisma.unit.update({ where: { id }, data });
  } catch (err) {
    if (err.code === "P2025") throw notFound("Unit not found");
    throw err;
  }
}

export async function deleteUnit(id) {
  try {
    await prisma.unit.delete({ where: { id } });
  } catch (err) {
    if (err.code === "P2025") throw notFound("Unit not found");
    throw err;
  }
}
