package com.organdonation.authservice;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.Instant;

/**
 * Entidad que representa un receptor de órganos.
 * Mapea la tabla core.recipients creada por la migración Flyway V1.
 *
 * @author Ceamerap
 * @task PDDO-91
 */
@Entity
@Table(name = "recipients", schema = "core")
public class Recipient {

    protected Recipient() {}

    public Recipient(User registeredBy, String documentType, String documentNumber,
                     String fullName, LocalDate birthDate, String sex,
                     String bloodType, String organNeeded, String urgencyLevel,
                     String contactPhone, String contactEmail) {
        this.registeredBy = registeredBy;
        this.documentType = documentType;
        this.documentNumber = documentNumber;
        this.fullName = fullName;
        this.birthDate = birthDate;
        this.sex = sex;
        this.bloodType = bloodType;
        this.organNeeded = organNeeded;
        this.urgencyLevel = urgencyLevel;
        this.contactPhone = contactPhone;
        this.contactEmail = contactEmail;
        this.status = "EN_ESPERA";
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "registered_by", nullable = false)
    private User registeredBy;

    @Column(name = "document_type", nullable = false)
    private String documentType;

    @Column(name = "document_number", nullable = false, unique = true)
    private String documentNumber;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(name = "sex")
    private String sex;

    @Column(name = "blood_type")
    private String bloodType;

    @Column(name = "organ_needed")
    private String organNeeded;

    @Column(name = "urgency_level", nullable = false)
    private String urgencyLevel;

    @Column(name = "contact_phone")
    private String contactPhone;

    @Column(name = "contact_email")
    private String contactEmail;

    @Column(name = "photo_path")
    private String photoPath;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private Instant updatedAt;

    public Long getId() { return id; }
    public User getRegisteredBy() { return registeredBy; }
    public String getDocumentType() { return documentType; }
    public String getDocumentNumber() { return documentNumber; }
    public String getFullName() { return fullName; }
    public LocalDate getBirthDate() { return birthDate; }
    public String getSex() { return sex; }
    public String getBloodType() { return bloodType; }
    public String getOrganNeeded() { return organNeeded; }
    public String getUrgencyLevel() { return urgencyLevel; }
    public String getContactPhone() { return contactPhone; }
    public String getContactEmail() { return contactEmail; }
    public String getPhotoPath() { return photoPath; }
    public String getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}