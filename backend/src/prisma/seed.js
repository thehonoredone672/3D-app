import "dotenv/config";
import bcrypt from "bcrypt";
import prisma from "../utils/prisma.js";

async function main() {
  const email = "admin@propview.dev";
  const password = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { name: "PropView Admin", email, password, role: "ADMIN" },
  });

  console.log(`Admin user ready: ${admin.email} / admin123`);

  const existingProject = await prisma.project.findFirst({
    where: { name: "Skyline Heights" },
  });
  const project =
    existingProject ||
    (await prisma.project.create({
      data: {
        name: "Skyline Heights",
        location: "Coimbatore, Tamil Nadu",
        description:
          "A premium residential project featuring modern towers with skyline views, landscaped gardens, and full-service amenities.",
        startingPrice: 4500000,
        amenities: ["Swimming Pool", "Gym", "Clubhouse", "Children's Play Area", "24/7 Security"],
      },
    }));

  console.log(`Project ready: ${project.name} (${project.id})`);

  const existingBuildings = await prisma.building.count({ where: { projectId: project.id } });
  if (existingBuildings > 0) {
    console.log("Buildings already seeded, skipping units.");
    return;
  }

  const unitTemplate = (floor, suffix, bhk, area, price, facing) => ({
    unitNumber: `${floor}${suffix}`,
    floor,
    bhk,
    area,
    price,
    facing,
  });

  const towers = [
    {
      name: "Tower A",
      description: "North-facing tower with skyline views",
      units: [
        [1, "01", 2, 950, 4500000, "East"],
        [1, "02", 2, 980, 4600000, "West"],
        [1, "03", 3, 1250, 5800000, "North"],
        [2, "01", 2, 950, 4650000, "East"],
        [2, "02", 2, 980, 4750000, "West"],
        [2, "03", 3, 1250, 5950000, "North"],
      ],
    },
    {
      name: "Tower B",
      description: "South-facing tower overlooking the clubhouse",
      units: [
        [1, "01", 2, 1000, 4700000, "South"],
        [1, "02", 3, 1300, 6000000, "East"],
        [1, "03", 3, 1300, 6050000, "West"],
        [2, "01", 2, 1000, 4850000, "South"],
        [2, "02", 3, 1300, 6150000, "East"],
        [2, "03", 3, 1300, 6200000, "West"],
      ],
    },
  ];

  for (const tower of towers) {
    const building = await prisma.building.create({
      data: { projectId: project.id, name: tower.name, description: tower.description },
    });

    for (const [floor, suffix, bhk, area, price, facing] of tower.units) {
      const data = unitTemplate(floor, suffix, bhk, area, price, facing);
      await prisma.unit.create({ data: { ...data, buildingId: building.id } });
    }

    console.log(`Seeded ${tower.name} with ${tower.units.length} units`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
