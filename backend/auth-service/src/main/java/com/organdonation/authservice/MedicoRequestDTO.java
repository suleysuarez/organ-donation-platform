package com.organdonation.authservice;

import jakarta.validation.constraints.*;

public class MedicoRequestDTO {

    @NotBlank(message = "El nombre completo es obligatorio")
    private String fullName;

    @NotBlank(message = "El tipo de documento es obligatorio")
    private String documentType;

    @NotBlank(message = "El numero de documento es obligatorio")
    private String documentNumber;

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "Formato de correo invalido")
    private String email;

    @NotBlank(message = "La contrasena es obligatoria")
    @Size(min = 8, message = "La contrasena debe tener minimo 8 caracteres")
    private String password;

    private String rethusRegistrationNumber;

    private String professionalProfile;

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }
    public String getDocumentNumber() { return documentNumber; }
    public void setDocumentNumber(String documentNumber) { this.documentNumber = documentNumber; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getRethusRegistrationNumber() { return rethusRegistrationNumber; }
    public void setRethusRegistrationNumber(String r) { this.rethusRegistrationNumber = r; }
    public String getProfessionalProfile() { return professionalProfile; }
    public void setProfessionalProfile(String p) { this.professionalProfile = p; }
}