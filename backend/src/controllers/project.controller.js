import {
  listProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from "../services/project.service.js";

function validateProjectInput(body, { partial = false } = {}) {
  const { name, location, description, startingPrice, amenities } = body;

  if (!partial || name !== undefined) {
    if (!name || typeof name !== "string") return "Name is required";
  }
  if (!partial || location !== undefined) {
    if (!location || typeof location !== "string") return "Location is required";
  }
  if (!partial || description !== undefined) {
    if (!description || typeof description !== "string") return "Description is required";
  }
  if (!partial || startingPrice !== undefined) {
    if (startingPrice === undefined || isNaN(Number(startingPrice))) {
      return "Starting price must be a number";
    }
  }
  if (amenities !== undefined && !Array.isArray(amenities)) {
    return "Amenities must be an array of strings";
  }
  return null;
}

function pickProjectFields(body) {
  const fields = ["name", "location", "description", "imageUrl", "modelUrl", "amenities"];
  const data = {};
  for (const key of fields) {
    if (body[key] !== undefined) data[key] = body[key];
  }
  if (body.startingPrice !== undefined) data.startingPrice = Number(body.startingPrice);
  return data;
}

export async function getAll(req, res, next) {
  try {
    res.json(await listProjects());
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    res.json(await getProjectById(req.params.id));
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const error = validateProjectInput(req.body);
    if (error) return res.status(400).json({ error });

    const project = await createProject(pickProjectFields(req.body));
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const error = validateProjectInput(req.body, { partial: true });
    if (error) return res.status(400).json({ error });

    const project = await updateProject(req.params.id, pickProjectFields(req.body));
    res.json(project);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    await deleteProject(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
