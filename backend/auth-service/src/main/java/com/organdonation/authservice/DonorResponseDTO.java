package com.organdonation.authservice;

import java.time.Instant;
import java.time.LocalDate;

/**
 * DTO de salida para la información de un donante.
 *
 * @author Ceamerap
 * @task PDDO-91
 */
public class DonorResponseDTO {

    private Long id;
    private String fullName;
    private String documentType;
    private String documentNumber;
    private LocalDate birthDate;
    private String sex;
    private String bloodType;
    private String contactPhone;
    private String contactEmail;
    private String address;
    private String status;
    private String medicalNotes;
    private Instant createdAt;

    public static DonorResponseDTO from(Donor d) {
        DonorResponseDTO dto = new DonorResponseDTO();
        dto.id = d.getId();
        dto.fullName = d.getFullName();
        dto.documentType = d.getDocumentType();
        dto.documentNumber = d.getDocumentNumber();
        dto.birthDate = d.getBirthDate();
        dto.sex = d.getSex();
        dto.bloodType = d.getBloodType();
        dto.contactPhone = d.getContactPhone();
        dto.contactEmail = d.getContactEmail();
        dto.address = d.getAddress();
        dto.status = d.getStatus();
        dto.medicalNotes = d.getMedicalNotes();
        dto.createdAt = d.getCreatedAt();
        return dto;
    }

    public Long getId() { return id; }
    public String getFullName() { return fullName; }
    public String getDocumentType() { return documentType; }
    public String getDocumentNumber() { return documentNumber; }
    public LocalDate getBirthDate() { return birthDate; }
    public String getSex() { return sex; }
    public String getBloodType() { return bloodType; }
    public String getContactPhone() { return contactPhone; }
    public String getContactEmail() { return contactEmail; }
    public String getAddress() { return address; }
    public String getStatus() { return status; }
    public String getMedicalNotes() { return medicalNotes; }
    public Instant getCreatedAt() { return createdAt; }
}