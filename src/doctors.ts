import type { Doctor } from "../generated/prisma/client";
import { prisma } from "./lib/prisma";

export interface CreateDoctorInput {
  firstName: string;
  lastName: string;
  specialty: string;
  email: string;
  phone?: string | null;
}

export async function createDoctor(input: CreateDoctorInput): Promise<Doctor> {
  return prisma.doctor.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      specialty: input.specialty,
      email: input.email,
      phone: input.phone ?? null,
    },
  });
}

export async function getDoctor(id: number): Promise<Doctor | null> {
  return prisma.doctor.findUnique({ where: { id } });
}

export async function listDoctorsBySpecialty(specialty: string): Promise<Doctor[]> {
  const cleanedSpecialty = specialty.trim();
  if (cleanedSpecialty.length === 0) return [];

  return prisma.doctor.findMany({
    where: { specialty: { equals: cleanedSpecialty, mode: "insensitive" } },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });
}

export async function deleteDoctor(id: number): Promise<Doctor> {
  return prisma.doctor.delete({ where: { id } });
}
