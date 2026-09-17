import { createEnquiry, listEnquiries, updateEnquiryStatus } from "../services/enquiry.service.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STATUSES = ["NEW", "CONTACTED", "CLOSED"];

function validate(body) {
  const { name, email, phone, preferredDate } = body;

  if (!name || !email || !phone) {
    return "Name, email, and phone are required";
  }
  if (!EMAIL_RE.test(email)) {
    return "Invalid email address";
  }
  if (preferredDate !== undefined && preferredDate !== null && isNaN(Date.parse(preferredDate))) {
    return "Invalid preferred date";
  }
  return null;
}

export async function create(req, res, next) {
  try {
    const error = validate(req.body);
    if (error) return res.status(400).json({ error });

    const { name, email, phone, message, preferredDate, projectId, unitId } = req.body;
    const enquiry = await createEnquiry({
      name,
      email,
      phone,
      message,
      preferredDate: preferredDate ? new Date(preferredDate) : undefined,
      projectId: projectId || undefined,
      unitId: unitId || undefined,
    });
    res.status(201).json(enquiry);
  } catch (err) {
    if (err.code === "P2003") {
      return res.status(400).json({ error: "Referenced project or unit does not exist" });
    }
    next(err);
  }
}

export async function getAll(req, res, next) {
  try {
    res.json(await listEnquiries());
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of ${STATUSES.join(", ")}` });
    }
    res.json(await updateEnquiryStatus(req.params.id, status));
  } catch (err) {
    next(err);
  }
}
