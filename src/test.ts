import "dotenv/config";
import {
  bookAppointment,
  cancelAllPatientAppointments,
  deleteAppointment,
  getAppointmentFull,
  getDoctorUpcomingAppointments,
  setAppointmentStatus,
} from "./appointments";
import {
  createDoctor,
  deleteDoctor,
  getDoctor,
  listDoctorsBySpecialty,
} from "./doctors";
import {
  createPatient,
  deletePatient,
  getPatient,
  searchPatients,
  updatePatientPhone,
} from "./patients";
import { prisma } from "./lib/prisma";

async function main(): Promise<void> {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  let patientId: number | undefined;
  let doctorId: number | undefined;
  let appointmentId: number | undefined;

  try {
    const patient = await createPatient({
      firstName: "Test",
      lastName: "Patient",
      email: `test.patient.${suffix}@example.com`,
      phone: "+91-91111-11111",
      dateOfBirth: new Date("2000-02-12T00:00:00.000Z"),
    });
    patientId = patient.id;
    console.log("PASS createPatient:", patient.id, patient.email);

    const fetchedPatient = await getPatient(patient.id);
    if (!fetchedPatient) throw new Error("getPatient did not find the created patient");
    console.log("PASS getPatient:", fetchedPatient.firstName, fetchedPatient.lastName);

    const searchedPatients = await searchPatients(`test.patient.${suffix}`);
    if (!searchedPatients.some((item) => item.id === patient.id)) {
      throw new Error("searchPatients did not return the created patient");
    }
    console.log("PASS searchPatients:", searchedPatients.length, "match(es)");

    const updatedPatient = await updatePatientPhone(patient.id, "+91-92222-22222");
    console.log("PASS updatePatientPhone:", updatedPatient.phone);

    const doctor = await createDoctor({
      firstName: "Test",
      lastName: "Doctor",
      specialty: "General Medicine",
      email: `test.doctor.${suffix}@example.com`,
      phone: "+91-93333-33333",
    });
    doctorId = doctor.id;
    console.log("PASS createDoctor:", doctor.id, doctor.specialty);

    const fetchedDoctor = await getDoctor(doctor.id);
    if (!fetchedDoctor) throw new Error("getDoctor did not find the created doctor");
    console.log("PASS getDoctor:", fetchedDoctor.firstName, fetchedDoctor.lastName);

    const specialtyDoctors = await listDoctorsBySpecialty("general medicine");
    if (!specialtyDoctors.some((item) => item.id === doctor.id)) {
      throw new Error("listDoctorsBySpecialty did not return the created doctor");
    }
    console.log("PASS listDoctorsBySpecialty:", specialtyDoctors.length, "match(es)");

    const futureAppointment = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const appointment = await bookAppointment(
      patient.id,
      doctor.id,
      futureAppointment,
      "CRUD module test appointment",
    );
    appointmentId = appointment.id;
    console.log(
      "PASS bookAppointment:",
      appointment.id,
      appointment.Patient.email,
      appointment.Doctor.email,
    );

    const fullAppointment = await getAppointmentFull(appointment.id);
    if (!fullAppointment) throw new Error("getAppointmentFull did not find the booking");
    console.log(
      "PASS getAppointmentFull:",
      fullAppointment.Patient.firstName,
      "with",
      fullAppointment.Doctor.firstName,
    );

    const upcoming = await getDoctorUpcomingAppointments(doctor.id);
    if (!upcoming.some((item) => item.id === appointment.id)) {
      throw new Error("getDoctorUpcomingAppointments did not include the test booking");
    }
    console.log("PASS getDoctorUpcomingAppointments:", upcoming.length, "upcoming appointment(s)");

    const confirmedAppointment = await setAppointmentStatus(appointment.id, "confirmed");
    console.log("PASS setAppointmentStatus:", confirmedAppointment.status);

    const cancellation = await cancelAllPatientAppointments(patient.id);
    console.log("PASS cancelAllPatientAppointments:", cancellation.count, "appointment(s) cancelled");

    const deletedAppointment = await deleteAppointment(appointment.id);
    appointmentId = undefined;
    console.log("PASS deleteAppointment:", deletedAppointment.id);

    const deletedPatient = await deletePatient(patient.id);
    patientId = undefined;
    console.log("PASS deletePatient:", deletedPatient.id);

    const deletedDoctor = await deleteDoctor(doctor.id);
    doctorId = undefined;
    console.log("PASS deleteDoctor:", deletedDoctor.id);

    console.log("\nAll 15 CRUD checks passed.");
  } finally {
    if (appointmentId !== undefined) {
      await prisma.appointment.deleteMany({ where: { id: appointmentId } });
    }
    if (patientId !== undefined) {
      await prisma.appointment.deleteMany({ where: { patientId } });
      await prisma.patient.deleteMany({ where: { id: patientId } });
    }
    if (doctorId !== undefined) {
      await prisma.appointment.deleteMany({ where: { doctorId } });
      await prisma.doctor.deleteMany({ where: { id: doctorId } });
    }
  }
}

main()
  .catch((error: unknown) => {
    console.error("CRUD test failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
