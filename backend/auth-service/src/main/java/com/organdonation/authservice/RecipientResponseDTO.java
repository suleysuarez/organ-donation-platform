package com.organdonation.authservice;

import java.time.Instant;
import java.time.LocalDate;

/**
 * DTO de salida para la información de un receptor.
 *
 * @author Ceamerap
 * @task PDDO-91
 */
public class RecipientResponseDTO {

    private Long id;
    private String fullName;
    private String documentType;
    private String documentNumber;
    private LocalDate birthDate;
    private String sex;
    private String bloodType;
    private String organNeeded;
    private String urgencyLevel;
    private String contactPhone;
    private String contactEmail;
    private String status;
    private Instant createdAt;

    public static RecipientResponseDTO from(Recipient r) {
        RecipientResponseDTO dto = new RecipientResponseDTO();
        dto.id = r.getId();
        dto.fullName = r.getFullName();
        dto.documentType = r.getDocumentType();
        dto.documentNumber = r.getDocumentNumber();
        dto.birthDate = r.getBirthDate();
        dto.sex = r.getSex();
        dto.bloodType = r.getBloodType();
        dto.organNeeded = r.getOrganNeeded();
        dto.urgencyLevel = r.getUrgencyLevel();
        dto.contactPhone = r.getContactPhone();
        dto.contactEmail = r.getContactEmail();
        dto.status = r.getStatus();
        dto.createdAt = r.getCreatedAt();
        return dto;
    }

    public Long getId() { return id; }
    public String getFullName() { return fullName; }
    public String getDocumentType() { return documentType; }
    public String getDocumentNumber() { return documentNumber; }
    public LocalDate getBirthDate() { return birthDate; }
    public String getSex() { return sex; }
    public String getBloodType() { return bloodType; }
    public String getOrganNeeded() { return organNeeded; }
    public String getUrgencyLevel() { return urgencyLevel; }
    public String getContactPhone() { return contactPhone; }
    public String getContactEmail() { return contactEmail; }
    public String getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
}