package com.organdonation.authservice;

import java.time.Instant;

/** Vista pública de un médico (perfil + datos de cuenta). No expone la contraseña. */
public class MedicoResponseDTO {

    private Long id;
    private String fullName;
    private String email;
    private Boolean isActive;
    private String documentType;
    private String documentNumber;
    private String rethusRegistrationNumber;
    private String professionalProfile;
    private String verificationStatus;
    private Instant verifiedAt;
    private Instant createdAt;

    public static MedicoResponseDTO from(MedicalProfessionalProfile p) {
        MedicoResponseDTO dto = new MedicoResponseDTO();
        dto.id = p.getId();
        dto.fullName = p.getFullName();
        if (p.getUser() != null) {
            dto.email = p.getUser().getEmail();
            dto.isActive = p.getUser().getIsActive();
        }
        dto.documentType = p.getDocumentType();
        dto.documentNumber = p.getDocumentNumber();
        dto.rethusRegistrationNumber = p.getRethusRegistrationNumber();
        dto.professionalProfile = p.getProfessionalProfile();
        dto.verificationStatus = p.getVerificationStatus();
        dto.verifiedAt = p.getVerifiedAt();
        dto.createdAt = p.getCreatedAt();
        return dto;
    }

    public Long getId() { return id; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public Boolean getIsActive() { return isActive; }
    public String getDocumentType() { return documentType; }
    public String getDocumentNumber() { return documentNumber; }
    public String getRethusRegistrationNumber() { return rethusRegistrationNumber; }
    public String getProfessionalProfile() { return professionalProfile; }
    public String getVerificationStatus() { return verificationStatus; }
    public Instant getVerifiedAt() { return verifiedAt; }
    public Instant getCreatedAt() { return createdAt; }
}
