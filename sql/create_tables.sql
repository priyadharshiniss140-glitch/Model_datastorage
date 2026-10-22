-- Run against the hospital_api database before running Prisma introspection.
-- These PostgreSQL table/column names and types match prisma/schema.prisma.

CREATE TABLE patients (
  id SERIAL CONSTRAINT patients_pkey PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(30),
  date_of_birth DATE,
  created_at TIMESTAMP(6) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT patients_email_key UNIQUE (email)
);

CREATE TABLE doctors (
  id SERIAL CONSTRAINT doctors_pkey PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  specialty VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(30),
  created_at TIMESTAMP(6) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT doctors_email_key UNIQUE (email)
);

CREATE TABLE appointments (
  id SERIAL CONSTRAINT appointments_pkey PRIMARY KEY,
  patient_id INTEGER NOT NULL,
  doctor_id INTEGER NOT NULL,
  appointment_date TIMESTAMP(6) WITHOUT TIME ZONE NOT NULL,
  reason TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP(6) WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT appointments_patient_id_fkey
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT appointments_doctor_id_fkey
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX doctors_specialty_idx ON doctors (specialty);
CREATE INDEX appointments_patient_id_idx ON appointments (patient_id);
CREATE INDEX appointments_doctor_id_appointment_date_idx ON appointments (doctor_id, appointment_date);
