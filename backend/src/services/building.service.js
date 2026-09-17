import prisma from "../utils/prisma.js";

function notFound(message) {
  const err = new Error(message);
  err.status = 404;
  return err;
}

export async function listBuildingsForProject(projectId) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw notFound("Project not found");

  return prisma.building.findMany({
    where: { projectId },
    include: { _count: { select: { units: true } } },
  });
}

export async function createBuilding({ projectId, name, description }) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw notFound("Project not found");

  return prisma.building.create({ data: { projectId, name, description } });
}

export async function updateBuilding(id, data) {
  try {
    return await prisma.building.update({ where: { id }, data });
  } catch (err) {
    if (err.code === "P2025") throw notFound("Building not found");
    throw err;
  }
}

export async function deleteBuilding(id) {
  try {
    await prisma.building.delete({ where: { id } });
  } catch (err) {
    if (err.code === "P2025") throw notFound("Building not found");
    throw err;
  }
}
