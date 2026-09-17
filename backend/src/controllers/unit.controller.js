import {
  getUnitById,
  createUnit,
  updateUnit,
  deleteUnit,
} from "../services/unit.service.js";

const STATUSES = ["AVAILABLE", "RESERVED", "SOLD"];
const NUMERIC_FIELDS = ["floor", "bhk", "area", "price"];
const OPTIONAL_FIELDS = ["facing", "floorPlanUrl", "modelUrl"];

function validate(body, { partial = false } = {}) {
  const { buildingId, unitNumber, status } = body;

  if (!partial && !buildingId) return "buildingId is required";
  if (!partial && !unitNumber) return "unitNumber is required";

  for (const field of NUMERIC_FIELDS) {
    if (body[field] !== undefined && isNaN(Number(body[field]))) {
      return `${field} must be a number`;
    }
    if (!partial && body[field] === undefined) {
      return `${field} is required`;
    }
  }

  if (status !== undefined && !STATUSES.includes(status)) {
    return `status must be one of ${STATUSES.join(", ")}`;
  }

  return null;
}

function pickFields(body) {
  const data = {};
  if (body.unitNumber !== undefined) data.unitNumber = body.unitNumber;
  if (body.status !== undefined) data.status = body.status;
  for (const field of NUMERIC_FIELDS) {
    if (body[field] !== undefined) data[field] = Number(body[field]);
  }
  for (const field of OPTIONAL_FIELDS) {
    if (body[field] !== undefined) data[field] = body[field];
  }
  return data;
}

export async function getOne(req, res, next) {
  try {
    res.json(await getUnitById(req.params.id));
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const error = validate(req.body);
    if (error) return res.status(400).json({ error });

    const data = { buildingId: req.body.buildingId, ...pickFields(req.body) };
    res.status(201).json(await createUnit(data));
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const error = validate(req.body, { partial: true });
    if (error) return res.status(400).json({ error });

    res.json(await updateUnit(req.params.id, pickFields(req.body)));
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    await deleteUnit(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
