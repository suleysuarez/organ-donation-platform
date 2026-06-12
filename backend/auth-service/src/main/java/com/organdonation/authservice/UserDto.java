package com.organdonation.authservice;

import java.time.LocalDate;

public class UserDto {
    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String dni;
    private LocalDate birthDate;
    private String gender;
    private String bloodType;
    private String phone;
    private String role;
    private String city;
    private String specialty;

    public UserDto(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.dni = user.getDni();
        this.birthDate = user.getBirthDate();
        this.gender = user.getGender() != null ? user.getGender().getValue() : null;
        this.bloodType = user.getBloodType() != null ? user.getBloodType().getValue() : null;
        this.phone = user.getPhone();
        this.city = user.getCity();
        this.specialty = user.getSpecialty();
        this.role = user.getRole();
    }

    // Getters
    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getDni() { return dni; }
    public LocalDate getBirthDate() { return birthDate; }
    public String getGender() { return gender; }
    public String getBloodType() { return bloodType; }
    public String getPhone() { return phone; }
    public String getRole() { return role; }
    public String getCity() { return city; }
    public String getSpecialty() { return specialty; }
}