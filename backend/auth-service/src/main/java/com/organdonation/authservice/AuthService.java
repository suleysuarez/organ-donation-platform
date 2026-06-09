package com.organdonation.authservice;

import com.organdonation.authservice.Gender;
import com.organdonation.authservice.BloodType;
import com.organdonation.authservice.DonorStatus;
import org.springframework.stereotype.Service;


@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public void register(RegisterRequestDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("El correo ya esta registrado");
        }
        User user = new User();
        user.setEmail(dto.getEmail());
        user.setPasswordHash(dto.getPassword());
        user.setRole(dto.getRole());

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
            user.setGender(Gender.valueOf(dto.getGender().toUpperCase()));
        }
        if (dto.getBloodType() != null) {

            String bt = dto.getBloodType().replace("+", "_POSITIVE").replace("-", "_NEGATIVE");
            user.setBloodType(BloodType.valueOf(bt));
        }
        if (dto.getDonorStatus() != null && !dto.getDonorStatus().isEmpty()) {
            user.setDonorStatus(DonorStatus.valueOf(dto.getDonorStatus().toUpperCase()));
        }
        userRepository.save(user);
    }
}