-- =====================================================================
-- Plataforma de Gestión de Donación de Órganos — Esquema relacional
-- Motor: PostgreSQL (Neon)
-- Autor: DidierParody (encargado de base de datos)
--
-- Qué hace: define el modelo relacional completo del MVP en dos esquemas
-- lógicos alineados a los dos backends Spring Boot:
--   - auth : autenticación y usuarios            (Backend 1)
--   - core : donantes, receptores y procesos     (Backend 2)
-- Las imágenes/documentos NO se guardan en la DB: solo se almacena la ruta
-- al archivo en uploads/ del backend (columnas *_path).
-- =====================================================================

-- ----- Esquemas --------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS core;

-- ----- Tipos ENUM ------------------------------------------------------
-- auth
CREATE TYPE auth.user_role            AS ENUM ('MEDICO', 'DONANTE', 'RECEPTOR');
CREATE TYPE auth.verification_status  AS ENUM ('PENDIENTE', 'VERIFICADO', 'RECHAZADO');

-- core
CREATE TYPE core.blood_type     AS ENUM ('A_POS','A_NEG','B_POS','B_NEG','AB_POS','AB_NEG','O_POS','O_NEG');
CREATE TYPE core.organ_type     AS ENUM ('RINON','HIGADO','CORAZON','PULMON','PANCREAS','CORNEA','INTESTINO','TEJIDO');
CREATE TYPE core.donor_status   AS ENUM ('ACTIVO','EN_EVALUACION','INACTIVO');
CREATE TYPE core.recipient_status AS ENUM ('EN_ESPERA','EN_EVALUACION','TRASPLANTADO','INACTIVO');
CREATE TYPE core.urgency_level  AS ENUM ('BAJA','MEDIA','ALTA','CRITICA');
CREATE TYPE core.process_state  AS ENUM (
    'REGISTRADO','EN_EVALUACION','EN_ESPERA','MATCH_ENCONTRADO',
    'EN_PROCESO_CLINICO','COMPLETADO','CANCELADO'
);

-- =====================================================================
-- ESQUEMA auth (Backend 1: autenticación + usuarios)
-- =====================================================================

-- Cuenta de acceso de cualquier rol del sistema (médico, donante, receptor).
CREATE TABLE auth.users (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          auth.user_role NOT NULL,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Perfil del profesional de salud (médico administrador). Incluye los campos
-- de verificación RETHUS; el FLUJO de verificación queda PENDIENTE de decisión
-- del equipo, pero el modelo ya lo soporta.
CREATE TABLE auth.medical_professional_profiles (
    id                          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id                     BIGINT NOT NULL UNIQUE
                                    REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name                   VARCHAR(150) NOT NULL,
    document_type               VARCHAR(20)  NOT NULL,
    document_number             VARCHAR(40)  NOT NULL UNIQUE,
    rethus_registration_number  VARCHAR(60),
    professional_profile        VARCHAR(120),
    verification_status         auth.verification_status NOT NULL DEFAULT 'PENDIENTE',
    certificate_file_path       VARCHAR(500),                 -- ruta en uploads/certificates/
    verified_by                 BIGINT REFERENCES auth.users(id) ON DELETE SET NULL,
    verified_at                 TIMESTAMPTZ,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- ESQUEMA core (Backend 2: donantes, receptores, procesos)
-- =====================================================================

-- Donante registrado por un médico.
CREATE TABLE core.donors (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    registered_by   BIGINT NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    document_type   VARCHAR(20)  NOT NULL,
    document_number VARCHAR(40)  NOT NULL UNIQUE,
    full_name       VARCHAR(150) NOT NULL,
    birth_date      DATE,
    sex             VARCHAR(20),
    blood_type      core.blood_type,
    contact_phone   VARCHAR(40),
    contact_email   VARCHAR(255),
    address         VARCHAR(255),
    photo_path      VARCHAR(500),                              -- ruta en uploads/donors/
    status          core.donor_status NOT NULL DEFAULT 'EN_EVALUACION',
    medical_notes   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Órganos ofrecidos por un donante (1 donante : N órganos).
CREATE TABLE core.donor_organs (
    id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    donor_id  BIGINT NOT NULL REFERENCES core.donors(id) ON DELETE CASCADE,
    organ     core.organ_type NOT NULL,
    UNIQUE (donor_id, organ)
);

-- Paciente receptor registrado por un médico.
CREATE TABLE core.recipients (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    registered_by   BIGINT NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    document_type   VARCHAR(20)  NOT NULL,
    document_number VARCHAR(40)  NOT NULL UNIQUE,
    full_name       VARCHAR(150) NOT NULL,
    birth_date      DATE,
    sex             VARCHAR(20),
    blood_type      core.blood_type,
    organ_needed    core.organ_type,
    urgency_level   core.urgency_level NOT NULL DEFAULT 'MEDIA',
    contact_phone   VARCHAR(40),
    contact_email   VARCHAR(255),
    photo_path      VARCHAR(500),                              -- ruta en uploads/recipients/
    status          core.recipient_status NOT NULL DEFAULT 'EN_ESPERA',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Proceso/caso de donación que vincula a un donante y/o un receptor.
CREATE TABLE core.donation_processes (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    donor_id      BIGINT REFERENCES core.donors(id)     ON DELETE SET NULL,
    recipient_id  BIGINT REFERENCES core.recipients(id) ON DELETE SET NULL,
    current_state core.process_state NOT NULL DEFAULT 'REGISTRADO',
    opened_by     BIGINT NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Historial de cambios de estado del proceso (trazabilidad — HU-09, HU-10).
-- Cada cambio puede llevar una observación clínica.
CREATE TABLE core.process_status_history (
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    process_id          BIGINT NOT NULL REFERENCES core.donation_processes(id) ON DELETE CASCADE,
    previous_state      core.process_state,
    new_state           core.process_state NOT NULL,
    clinical_observation TEXT,
    changed_by          BIGINT NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    changed_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Documentos/archivos clínicos adjuntos a un proceso (solo la ruta, no el binario).
CREATE TABLE core.process_documents (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    process_id    BIGINT NOT NULL REFERENCES core.donation_processes(id) ON DELETE CASCADE,
    file_path     VARCHAR(500) NOT NULL,                       -- ruta en uploads/
    original_name VARCHAR(255),
    mime_type     VARCHAR(120),
    size_bytes    BIGINT,
    uploaded_by   BIGINT NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----- Índices de apoyo (consultas frecuentes / dashboard) -------------
CREATE INDEX idx_donors_status            ON core.donors(status);
CREATE INDEX idx_donors_registered_by     ON core.donors(registered_by);
CREATE INDEX idx_recipients_status        ON core.recipients(status);
CREATE INDEX idx_recipients_organ_needed  ON core.recipients(organ_needed);
CREATE INDEX idx_processes_current_state  ON core.donation_processes(current_state);
CREATE INDEX idx_processes_donor          ON core.donation_processes(donor_id);
CREATE INDEX idx_processes_recipient      ON core.donation_processes(recipient_id);
CREATE INDEX idx_history_process          ON core.process_status_history(process_id);
CREATE INDEX idx_profiles_verification    ON auth.medical_professional_profiles(verification_status);
