package com.organdonation.authservice;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Buscar usuario por email (como no hay username, usamos email)
        User user = userRepository.findAll().stream()
                .filter(u -> email.equals(u.getEmail()))
                .findFirst()
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + email));

        if (!user.getIsActive()) {
            throw new UsernameNotFoundException("Usuario inactivo: " + email);
        }

        // Convertir el rol a GrantedAuthority (Spring Security espera "ROLE_" como prefijo)
        String role = user.getRole().toUpperCase();
        if (!role.startsWith("ROLE_")) {
            role = "ROLE_" + role;
        }

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPasswordHash(),
                Collections.singletonList(new SimpleGrantedAuthority(role))
        );
    }
}