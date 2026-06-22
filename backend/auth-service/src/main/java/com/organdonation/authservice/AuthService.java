package com.organdonation.authservice;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;


/**
 * Servicio de autenticación y registro de usuarios.
 *
 * <p>Gestiona el registro de nuevos usuarios en el sistema,
 * incluyendo el hashing seguro de contraseñas con BCrypt.
 *
 * @author Ceamerap
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Registra un nuevo usuario en el sistema.
     *
     * <p>Valida que el correo no esté en uso y persiste el usuario
     * con la contraseña hasheada con BCrypt.
     *
     * @param dto datos del formulario de registro
     * @throws RuntimeException si el correo ya está registrado
     */
    public void register(RegisterRequestDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("El correo ya esta registrado");
        }
        User user = new User();
        user.setEmail(dto.getEmail());
        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        user.setRole(dto.getRole());
        userRepository.save(user);
    }
}
