import type { Appointment, Prisma } from "../generated/prisma/client";
import { prisma } from "./lib/prisma";

export type AppointmentStatus = "scheduled" | "confirmed" | "completed" | "cancelled";

export type AppointmentWithRelations = Prisma.AppointmentGetPayload<{
  include: { Patient: true; Doctor: true };
}>;

export type AppointmentWithPatient = Prisma.AppointmentGetPayload<{
  include: { Patient: true };
}>;

export async function bookAppointment(
  patientId: number,
  doctorId: number,
  appointmentDate: Date,
  reason: string,
): Promise<AppointmentWithRelations> {
  return prisma.appointment.create({
    data: {
      appointmentDate,
      reason,
      Patient: { connect: { id: patientId } },
      Doctor: { connect: { id: doctorId } },
    },
    include: { Patient: true, Doctor: true },
  });
}

export async function getAppointmentFull(
  id: number,
): Promise<AppointmentWithRelations | null> {
  return prisma.appointment.findUnique({
    where: { id },
    include: { Patient: true, Doctor: true },
  });
}

export async function getDoctorUpcomingAppointments(
  doctorId: number,
  fromDate: Date = new Date(),
): Promise<AppointmentWithPatient[]> {
  return prisma.appointment.findMany({
    where: {
      doctorId,
      appointmentDate: { gte: fromDate },
      status: { not: "cancelled" },
    },
    include: { Patient: true },
    orderBy: { appointmentDate: "asc" },
  });
}

export async function setAppointmentStatus(
  id: number,
  status: AppointmentStatus,
): Promise<Appointment> {
  return prisma.appointment.update({ where: { id }, data: { status } });
}

export async function cancelAllPatientAppointments(
  patientId: number,
): Promise<{ count: number }> {
  return prisma.appointment.updateMany({
    where: {
      patientId,
      status: { notIn: ["completed", "cancelled"] },
    },
    data: { status: "cancelled" },
  });
}

export async function deleteAppointment(id: number): Promise<Appointment> {
  return prisma.appointment.delete({ where: { id } });
}
