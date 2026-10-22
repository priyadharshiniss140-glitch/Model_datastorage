import type { Patient } from "../generated/prisma/client";
import { prisma } from "./lib/prisma";

export interface CreatePatientInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  dateOfBirth?: Date | null;
}

export async function createPatient(input: CreatePatientInput): Promise<Patient> {
  return prisma.patient.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone ?? null,
      dateOfBirth: input.dateOfBirth ?? null,
    },
  });
}

export async function getPatient(id: number): Promise<Patient | null> {
  return prisma.patient.findUnique({ where: { id } });
}

export async function searchPatients(term: string): Promise<Patient[]> {
  const cleanedTerm = term.trim();
  if (cleanedTerm.length === 0) return [];

  return prisma.patient.findMany({
    where: {
      OR: [
        { firstName: { contains: cleanedTerm, mode: "insensitive" } },
        { lastName: { contains: cleanedTerm, mode: "insensitive" } },
        { email: { contains: cleanedTerm, mode: "insensitive" } },
      ],
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });
}

export async function updatePatientPhone(id: number, phone: string): Promise<Patient> {
  return prisma.patient.update({ where: { id }, data: { phone } });
}

export async function deletePatient(id: number): Promise<Patient> {
  return prisma.patient.delete({ where: { id } });
}
