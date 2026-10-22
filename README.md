# Hospital Appointment API — Prisma 7 + TypeScript

A typed CRUD module for patients, doctors, and hospital appointments using Prisma ORM 7.10, PostgreSQL, and the Prisma PostgreSQL driver adapter.

> The assignment's original lesson DDL was not included in the prompt. The SQL file below defines a compatible schema. If your lesson provides exact table definitions, use those definitions before introspection.

## Requirements
- Node.js 22 LTS (Node.js 20+ should work)
- npm
- PostgreSQL running locally

## Setup
```bash
npm install
```

Copy `.env.example` to `.env`, then replace `YOUR_PASSWORD` with your local PostgreSQL password. Do not commit `.env`.

Create the database and tables:
```bash
psql -U postgres -d postgres -c "CREATE DATABASE hospital_api;"
psql -U postgres -d hospital_api -f sql/create_tables.sql
```
Skip the CREATE DATABASE command if the database already exists. Run the DDL only against an empty database.

## Prisma introspection and generation
The checked-in schema is the cleaned Prisma model matching `sql/create_tables.sql`. To practise the required introspection, first back up the clean schema, then run:
```bash
npx prisma db pull
npx prisma generate
```
Compare the introspected schema with `prisma/schema.prisma`. The cleaned schema uses PascalCase models with `@@map`, camelCase fields with `@map`, relation properties `Patient`/`Doctor`/`Appointments`, and preserves PostgreSQL `DATE` and `TIMESTAMP(6)` column types.

Prisma 7 CLI configuration is in `prisma7.config.ts`; it loads `DATABASE_URL` and configures the seed command.

## Seed and test
```bash
npx prisma db seed
npx tsx src/test.ts
npm run typecheck
```
The seed uses fictional sample data and is designed to be rerun. The CRUD test creates and removes its own temporary patient, doctor, and appointment. A working PostgreSQL database and generated Prisma Client are required to run the database checks.

## Implemented functions
- `src/patients.ts`: `createPatient`, `getPatient`, `searchPatients`, `updatePatientPhone`, `deletePatient`
- `src/doctors.ts`: `createDoctor`, `getDoctor`, `listDoctorsBySpecialty`, `deleteDoctor`
- `src/appointments.ts`: `bookAppointment`, `getAppointmentFull`, `getDoctorUpcomingAppointments`, `setAppointmentStatus`, `cancelAllPatientAppointments`, `deleteAppointment`
- `src/lib/prisma.ts`: cached Prisma Client singleton using `PrismaPg`
- `src/seed.ts`: repeatable sample data
- `src/test.ts`: database-backed CRUD test runner

Public functions use explicit TypeScript parameter and return types. No `any` types are used.

## Security
Never commit `.env`, database credentials, or real patient details. The `.gitignore` excludes `.env`, `node_modules/`, generated client output, and build artifacts.
