import "dotenv/config";
import { prisma } from "./lib/prisma";

async function main(): Promise<void> {
  const patientOne = await prisma.patient.upsert({
    where: { email: "maya.raman.seed@example.com" },
    update: {
      firstName: "Maya",
      lastName: "Raman",
      phone: "+91-90000-10001",
      dateOfBirth: new Date("1998-05-14T00:00:00.000Z"),
    },
    create: {
      firstName: "Maya",
      lastName: "Raman",
      email: "maya.raman.seed@example.com",
      phone: "+91-90000-10001",
      dateOfBirth: new Date("1998-05-14T00:00:00.000Z"),
    },
  });

  const patientTwo = await prisma.patient.upsert({
    where: { email: "arjun.kumar.seed@example.com" },
    update: {
      firstName: "Arjun",
      lastName: "Kumar",
      phone: "+91-90000-10002",
      dateOfBirth: new Date("2001-11-03T00:00:00.000Z"),
    },
    create: {
      firstName: "Arjun",
      lastName: "Kumar",
      email: "arjun.kumar.seed@example.com",
      phone: "+91-90000-10002",
      dateOfBirth: new Date("2001-11-03T00:00:00.000Z"),
    },
  });

  const doctorOne = await prisma.doctor.upsert({
    where: { email: "dr.ananya.seed@example.com" },
    update: {
      firstName: "Ananya",
      lastName: "Iyer",
      specialty: "Cardiology",
      phone: "+91-90000-20001",
    },
    create: {
      firstName: "Ananya",
      lastName: "Iyer",
      specialty: "Cardiology",
      email: "dr.ananya.seed@example.com",
      phone: "+91-90000-20001",
    },
  });

  const doctorTwo = await prisma.doctor.upsert({
    where: { email: "dr.rahul.seed@example.com" },
    update: {
      firstName: "Rahul",
      lastName: "Menon",
      specialty: "Dermatology",
      phone: "+91-90000-20002",
    },
    create: {
      firstName: "Rahul",
      lastName: "Menon",
      specialty: "Dermatology",
      email: "dr.rahul.seed@example.com",
      phone: "+91-90000-20002",
    },
  });

  const appointmentSeeds = [
    {
      patientId: patientOne.id,
      doctorId: doctorOne.id,
      appointmentDate: new Date("2030-01-15T04:30:00.000Z"),
      reason: "Routine heart health consultation",
    },
    {
      patientId: patientTwo.id,
      doctorId: doctorTwo.id,
      appointmentDate: new Date("2030-01-16T05:00:00.000Z"),
      reason: "Skin consultation",
    },
    {
      patientId: patientOne.id,
      doctorId: doctorTwo.id,
      appointmentDate: new Date("2030-01-17T06:00:00.000Z"),
      reason: "Follow-up consultation",
    },
  ];

  let appointmentsCreated = 0;
  for (const item of appointmentSeeds) {
    const existing = await prisma.appointment.findFirst({
      where: {
        patientId: item.patientId,
        doctorId: item.doctorId,
        appointmentDate: item.appointmentDate,
      },
    });

    if (!existing) {
      await prisma.appointment.create({ data: item });
      appointmentsCreated += 1;
    }
  }

  console.log(`Seed complete: 2 patients available (IDs ${patientOne.id}, ${patientTwo.id}).`);
  console.log(`Seed complete: 2 doctors available (IDs ${doctorOne.id}, ${doctorTwo.id}).`);
  console.log(`Seed complete: ${appointmentsCreated} new appointment(s) inserted.`);
}

main()
  .catch((error: unknown) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
