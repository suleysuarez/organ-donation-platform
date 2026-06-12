package com.organdonation.authservice;

import jakarta.persistence.*;
import java.time.Instant;

/**
 * Perfil del profesional de salud (médico). Mapea auth.medical_professional_profiles
 * (creada por la migración Flyway V1). Solo lectura en los endpoints actuales.
 */
@Entity
@Table(name = "medical_professional_profiles", schema = "auth")
public class MedicalProfessionalProfile {

    protected MedicalProfessionalProfile() {}

    public MedicalProfessionalProfile(
            User user,
            String fullName,
            String documentType,
            String documentNumber,
            String rethusRegistrationNumber,
            String professionalProfile) {
        this.user = user;
        this.fullName = fullName;
        this.documentType = documentType;
        this.documentNumber = documentNumber;
        this.rethusRegistrationNumber = rethusRegistrationNumber;
        this.professionalProfile = professionalProfile;
        this.verificationStatus = "PENDIENTE";
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "document_type", nullable = false)
    private String documentType;

    @Column(name = "document_number", nullable = false, unique = true)
    private String documentNumber;

    @Column(name = "rethus_registration_number")
    private String rethusRegistrationNumber;

    @Column(name = "professional_profile")
    private String professionalProfile;

    @Column(name = "verification_status", nullable = false)
    private String verificationStatus;

    @Column(name = "certificate_file_path")
    private String certificateFilePath;

    @Column(name = "verified_by")
    private Long verifiedBy;

    @Column(name = "verified_at")
    private Instant verifiedAt;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;

    public Long getId() { return id; }
    public User getUser() { return user; }
    public String getFullName() { return fullName; }
    public String getDocumentType() { return documentType; }
    public String getDocumentNumber() { return documentNumber; }
    public String getRethusRegistrationNumber() { return rethusRegistrationNumber; }
    public String getProfessionalProfile() { return professionalProfile; }
    public String getVerificationStatus() { return verificationStatus; }
    public String getCertificateFilePath() { return certificateFilePath; }
    public Long getVerifiedBy() { return verifiedBy; }
    public Instant getVerifiedAt() { return verifiedAt; }
    public Instant getCreatedAt() { return createdAt; }
}
