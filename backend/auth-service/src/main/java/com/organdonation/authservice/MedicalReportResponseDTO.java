package com.organdonation.authservice;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class MedicalReportResponseDTO {
    private Long id;
    private PatientInfo patient;
    private PatientInfo doctor;
    private String description;
    private String diagnosis;
    private LocalDate reportDate;
    private String status;
    private LocalDateTime createdAt;

    public MedicalReportResponseDTO(MedicalReport report) {
        this.id = report.getId();
        this.patient = new PatientInfo(report.getPatient());
        if (report.getDoctor() != null) {
            this.doctor = new PatientInfo(report.getDoctor());
        }
        this.description = report.getDescription();
        this.diagnosis = report.getDiagnosis();
        this.reportDate = report.getReportDate();
        this.status = report.getStatus().name();
        this.createdAt = report.getCreatedAt();
    }

    // Getters
    public Long getId() { return id; }
    public PatientInfo getPatient() { return patient; }
    public PatientInfo getDoctor() { return doctor; }
    public String getDescription() { return description; }
    public String getDiagnosis() { return diagnosis; }
    public LocalDate getReportDate() { return reportDate; }
    public String getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    // Clase interna adaptada a los campos reales de User (develop actual)
    public static class PatientInfo {
        private Long id;
        private String email;
        private String role;

        public PatientInfo(User user) {
            this.id = user.getId();
            this.email = user.getEmail();
            this.role = user.getRole();
        }

        // Getters
        public Long getId() { return id; }
        public String getEmail() { return email; }
        public String getRole() { return role; }
    }
}