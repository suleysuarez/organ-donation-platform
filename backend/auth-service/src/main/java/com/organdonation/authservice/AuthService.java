package com.organdonation.authservice;

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
        userRepository.save(user);
    }
}