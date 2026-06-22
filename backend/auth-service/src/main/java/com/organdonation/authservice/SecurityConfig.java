package com.organdonation.authservice;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
            "http://localhost:5173",
            "http://localhost:5174"   // agrega el puerto real que esté usando tu Vite
        ));
        // Permite tanto localhost como 127.0.0.1 para evitar bloqueos
        configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://127.0.0.1:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        // Permite explícitamente los headers necesarios para el JWT
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With", "Accept"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L); 
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // Habilitamos la configuración de CORS definida arriba
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()));
        
        http.csrf(AbstractHttpConfigurer::disable);

        http.sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        http.authorizeHttpRequests(auth -> auth
                .requestMatchers("/h2-console/**").permitAll()
                .requestMatchers("/api/auth/login").permitAll()
                .requestMatchers("/docs", "/docs/**", "/swagger-ui/**", "/swagger-ui.html",
                        "/v3/api-docs", "/v3/api-docs/**").permitAll()
                
                // Endpoints específicos
                .requestMatchers(HttpMethod.POST, "/api/auth/register").hasRole("MEDICO")
                .requestMatchers(HttpMethod.POST, "/api/medicos").permitAll()
                .requestMatchers("/api/medicos", "/api/medicos/**").hasRole("MEDICO")
                // Aseguramos que los registros clinicos solo los gestionen medicos
                .requestMatchers("/api/donantes", "/api/donantes/**").hasRole("MEDICO")
                .requestMatchers("/api/receptores", "/api/receptores/**").hasRole("MEDICO")
                .requestMatchers("/api/procesos", "/api/procesos/**").hasRole("MEDICO")
                .requestMatchers("/api/reportes/historial/**").hasRole("MEDICO")
                .requestMatchers("/api/reportes", "/api/reportes/**").hasRole("MEDICO")
                .anyRequest().authenticated()
        );

        http.headers(headers -> headers.frameOptions(frame -> frame.disable()));

        return http.build();
    }
}
