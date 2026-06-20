package com.organdonation.authservice;

import com.organdonation.authservice.Gender;
import com.organdonation.authservice.BloodType;
import com.organdonation.authservice.DonorStatus;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;


@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder; // ← Esta línea inicializa el campo
    }

    public void register(RegisterRequestDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("El correo ya esta registrado");
        }
        User user = new User();
        user.setEmail(dto.getEmail());
        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        user.setRole(dto.getRole());
        user.setSpecialty(dto.getSpecialty());
        if (dto.getValidationStatus() != null && !dto.getValidationStatus().isEmpty()) {
            user.setValidationStatus(ValidationStatus.fromString(dto.getValidationStatus()));
        }

        user.setUsername(dto.getUsername());
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setDni(dto.getDni());
        user.setBirthDate(dto.getBirthDate());
        user.setPhone(dto.getPhone());
        user.setAddress(dto.getAddress());
        user.setCity(dto.getCity());
        user.setCountry(dto.getCountry());
        user.setIsDonor(dto.getIsDonor());


        if (dto.getGender() != null) {
            user.setGender(Gender.fromString(dto.getGender()));
        }
        if (dto.getBloodType() != null) {
            user.setBloodType(BloodType.fromString(dto.getBloodType()));
        }
        if (dto.getDonorStatus() != null && !dto.getDonorStatus().isEmpty()) {
            user.setDonorStatus(DonorStatus.fromString(dto.getDonorStatus()));
        }
        userRepository.save(user);
    }
}