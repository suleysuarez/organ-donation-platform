package com.organdonation.authservice;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class MedicalReportResponseDTO {
    private Long id;
    private RecipientInfo recipient;
    private DoctorInfo doctor;
    private String description;
    private String diagnosis;
    private LocalDate reportDate;
    private String status;
    private LocalDateTime createdAt;

    public MedicalReportResponseDTO(MedicalReport report) {
        this.id = report.getId();
        this.recipient = new RecipientInfo(report.getRecipient());
        if (report.getDoctor() != null) {
            this.doctor = new DoctorInfo(report.getDoctor());
        }
        this.description = report.getDescription();
        this.diagnosis = report.getDiagnosis();
        this.reportDate = report.getReportDate();
        this.status = report.getStatus().name();
        this.createdAt = report.getCreatedAt();
    }

    // Getters
    public Long getId() { return id; }
    public RecipientInfo getRecipient() { return recipient; }
    public DoctorInfo getDoctor() { return doctor; }
    public String getDescription() { return description; }
    public String getDiagnosis() { return diagnosis; }
    public LocalDate getReportDate() { return reportDate; }
    public String getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    // Datos del receptor (entidad Recipient, tabla core.recipients)
    public static class RecipientInfo {
        private Long id;
        private String fullName;
        private String documentNumber;

        public RecipientInfo(Recipient recipient) {
            this.id = recipient.getId();
            this.fullName = recipient.getFullName();
            this.documentNumber = recipient.getDocumentNumber();
        }

        // Getters
        public Long getId() { return id; }
        public String getFullName() { return fullName; }
        public String getDocumentNumber() { return documentNumber; }
    }

    // Datos del médico (entidad User)
    public static class DoctorInfo {
        private Long id;
        private String email;
        private String role;

        public DoctorInfo(User user) {
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
