package com.organdonation.authservice;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;

    public SecurityConfig(CustomUserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .userDetailsService(userDetailsService)
                .authorizeHttpRequests(auth -> auth
                        // ===== RUTAS PÚBLICAS (sin autenticación) =====
                        .requestMatchers("/h2-console/**").permitAll()
                        .requestMatchers("/api/auth/register", "/api/auth/login").permitAll()
                        .requestMatchers("/docs", "/docs/**", "/swagger-ui/**", "/swagger-ui.html",
                                "/v3/api-docs", "/v3/api-docs/**").permitAll()

                        // ===== RUTAS POR ROL =====
                        // Médicos: solo MEDICO y ADMIN pueden gestionar
                        .requestMatchers("/api/medicos/**").hasAnyRole("MEDICO", "ADMIN")

                        // Pacientes: solo MEDICO y ADMIN pueden gestionar
                        .requestMatchers("/api/pacientes/**").hasAnyRole("MEDICO", "ADMIN")

                        // Reportes: MEDICO y ADMIN gestionan; PACIENTE solo puede ver su historial
                        .requestMatchers("/api/reportes/historial/**").hasAnyRole("MEDICO", "ADMIN", "PACIENTE")
                        .requestMatchers("/api/reportes/**").hasAnyRole("MEDICO", "ADMIN")

                        // ===== CUALQUIER OTRA RUTA REQUIERE AUTENTICACIÓN =====
                        .anyRequest().authenticated()
                )
                .httpBasic(httpBasic -> {}) // Autenticación HTTP Basic
                .headers(headers -> headers.frameOptions(frame -> frame.disable()));

        return http.build();
    }
}