package com.organdonation.authservice;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public class MedicalReportRequestDTO {

    @NotNull(message = "El ID del paciente es obligatorio")
    private Long patientId;

    private Long doctorId;

    @NotBlank(message = "La descripción es obligatoria")
    private String description;

    private String diagnosis;

    @NotNull(message = "La fecha del reporte es obligatoria")
    private LocalDate reportDate;

    private String status = "PENDIENTE";

    // Getters y setters
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getDiagnosis() { return diagnosis; }
    public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }
    public LocalDate getReportDate() { return reportDate; }
    public void setReportDate(LocalDate reportDate) { this.reportDate = reportDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}