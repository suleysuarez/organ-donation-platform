package com.organdonation.authservice;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public class MedicalReportRequestDTO {

    @NotNull(message = "El ID del receptor es obligatorio")
    private Long recipientId;

    @NotNull(message = "El ID del medico es obligatorio")
    private Long doctorId;

    @NotBlank(message = "La descripción es obligatoria")
    private String description;

    private String diagnosis;

    @NotNull(message = "La fecha del reporte es obligatoria")
    private LocalDate reportDate;

    private String status = "PENDIENTE";

    // Getters y setters
    public Long getRecipientId() { return recipientId; }
    public void setRecipientId(Long recipientId) { this.recipientId = recipientId; }
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
