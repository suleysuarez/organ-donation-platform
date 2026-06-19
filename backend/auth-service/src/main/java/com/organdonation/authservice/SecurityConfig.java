package com.organdonation.authservice;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // TODO: /api/medicos/** queda público temporalmente; restringir
                        // cuando se implemente autenticación (login + JWT).
                        .requestMatchers("/h2-console/**", "/api/auth/**", "/api/medicos/**", "/api/pacientes/**", "/api/reportes/**").permitAll()
                        // Documentación OpenAPI / Swagger UI (pública).
                        .requestMatchers("/docs", "/docs/**", "/swagger-ui/**", "/swagger-ui.html",
                                "/v3/api-docs", "/v3/api-docs/**").permitAll()
                        .anyRequest().authenticated()
                )
                .headers(headers -> headers.frameOptions(frame -> frame.disable()));
        return http.build();
    }
}