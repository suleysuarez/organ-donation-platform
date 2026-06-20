package com.organdonation.authservice;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

/**
 * DTO de entrada para el registro de un receptor.
 *
 * @author Ceamerap
 * @task PDDO-91
 */
public class RecipientRequestDTO {

    @NotNull(message = "El id del médico registrador es obligatorio")
    private Long registeredById;

    @NotBlank(message = "El tipo de documento es obligatorio")
    private String documentType;

    @NotBlank(message = "El número de documento es obligatorio")
    private String documentNumber;

    @NotBlank(message = "El nombre completo es obligatorio")
    private String fullName;

    private LocalDate birthDate;
    private String sex;
    private String bloodType;
    private String organNeeded;

    @NotBlank(message = "El nivel de urgencia es obligatorio")
    private String urgencyLevel;

    private String contactPhone;
    private String contactEmail;

    public Long getRegisteredById() { return registeredById; }
    public void setRegisteredById(Long registeredById) { this.registeredById = registeredById; }
    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }
    public String getDocumentNumber() { return documentNumber; }
    public void setDocumentNumber(String documentNumber) { this.documentNumber = documentNumber; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public LocalDate getBirthDate() { return birthDate; }
    public void setBirthDate(LocalDate birthDate) { this.birthDate = birthDate; }
    public String getSex() { return sex; }
    public void setSex(String sex) { this.sex = sex; }
    public String getBloodType() { return bloodType; }
    public void setBloodType(String bloodType) { this.bloodType = bloodType; }
    public String getOrganNeeded() { return organNeeded; }
    public void setOrganNeeded(String organNeeded) { this.organNeeded = organNeeded; }
    public String getUrgencyLevel() { return urgencyLevel; }
    public void setUrgencyLevel(String urgencyLevel) { this.urgencyLevel = urgencyLevel; }
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
}
