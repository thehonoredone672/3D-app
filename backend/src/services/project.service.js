import prisma from "../utils/prisma.js";

function countsFrom(buildings) {
  const buildingsCount = buildings.length;
  const unitsCount = buildings.reduce((sum, b) => sum + b._count.units, 0);
  return { buildingsCount, unitsCount };
}

export async function listProjects() {
  const projects = await prisma.project.findMany({
    include: { buildings: { include: { _count: { select: { units: true } } } } },
    orderBy: { createdAt: "desc" },
  });
  return projects.map((project) => {
    const { buildings, ...rest } = project;
    return { ...rest, ...countsFrom(buildings) };
  });
}

export async function getProjectById(id) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      buildings: {
        include: { units: true, _count: { select: { units: true } } },
      },
    },
  });
  if (!project) {
    const err = new Error("Project not found");
    err.status = 404;
    throw err;
  }

  const buildings = project.buildings.map(({ _count, ...building }) => building);
  return { ...project, buildings, ...countsFrom(project.buildings) };
}

export async function createProject(data) {
  return prisma.project.create({ data });
}

export async function updateProject(id, data) {
  try {
    return await prisma.project.update({ where: { id }, data });
  } catch (err) {
    if (err.code === "P2025") {
      const notFound = new Error("Project not found");
      notFound.status = 404;
      throw notFound;
    }
    throw err;
  }
}

export async function deleteProject(id) {
  try {
    await prisma.project.delete({ where: { id } });
  } catch (err) {
    if (err.code === "P2025") {
      const notFound = new Error("Project not found");
      notFound.status = 404;
      throw notFound;
    }
    throw err;
  }
}
