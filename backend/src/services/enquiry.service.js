import prisma from "../utils/prisma.js";

export async function createEnquiry(data) {
  return prisma.enquiry.create({ data });
}

export async function listEnquiries() {
  return prisma.enquiry.findMany({
    include: { project: true, unit: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateEnquiryStatus(id, status) {
  try {
    return await prisma.enquiry.update({ where: { id }, data: { status } });
  } catch (err) {
    if (err.code === "P2025") {
      const notFound = new Error("Enquiry not found");
      notFound.status = 404;
      throw notFound;
    }
    throw err;
  }
}
