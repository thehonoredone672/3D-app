import {
  listBuildingsForProject,
  createBuilding,
  updateBuilding,
  deleteBuilding,
} from "../services/building.service.js";
import { listUnitsForBuilding } from "../services/unit.service.js";

export async function getForProject(req, res, next) {
  try {
    res.json(await listBuildingsForProject(req.params.id));
  } catch (err) {
    next(err);
  }
}

export async function getUnits(req, res, next) {
  try {
    res.json(await listUnitsForBuilding(req.params.id));
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const { projectId, name, description } = req.body;
    if (!projectId || !name) {
      return res.status(400).json({ error: "projectId and name are required" });
    }
    res.status(201).json(await createBuilding({ projectId, name, description }));
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const { name, description } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    res.json(await updateBuilding(req.params.id, data));
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    await deleteBuilding(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
