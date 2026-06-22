package com.organdonation.authservice;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthController(AuthService authService,
                          JwtUtil jwtUtil,
                          AuthenticationManager authenticationManager) {
        this.authService = authService;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequestDTO request) {
        authService.register(request);
        return ResponseEntity.ok("Usuario registrado exitosamente");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDTO loginRequest) {
        // Autenticar con el AuthenticationManager de Spring Security
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        // Si llega aquí, la autenticación fue exitosa
        String email = authentication.getName();
        String role = authentication.getAuthorities().stream()
                .findFirst()
                .map(grantedAuthority -> grantedAuthority.getAuthority().replace("ROLE_", ""))
                .orElse("");

        if (!"MEDICO".equals(role)) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Solo los profesionales de salud pueden acceder al sistema");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        }

        String token = jwtUtil.generateToken(email, role);

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("email", email);
        response.put("role", role);

        return ResponseEntity.ok(response);
    }
}
