package com.organdonation.authservice;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.stream.Collectors;

import java.util.*;

@RestController
@RequestMapping("/api/pacientes")
public class PatientController {

    private final UserRepository userRepository;
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;

    public PatientController(UserRepository userRepository,
                             AuthService authService,
                             PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.authService = authService;
        this.passwordEncoder = passwordEncoder;
    }

    // ========== LISTAR PACIENTES (con filtro opcional por email) ==========
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listarPacientes(
            @RequestParam(required = false) String email) {

        List<User> todos = userRepository.findAll();
        List<User> pacientes = todos.stream()
                .filter(u -> "PACIENTE".equals(u.getRole()))
                .filter(u -> email == null || email.isEmpty() ||
                        u.getEmail().toLowerCase().contains(email.toLowerCase()))
                .collect(Collectors.toList());

        List<Map<String, Object>> response = new ArrayList<>();
        for (User p : pacientes) {
            response.add(userToMap(p));
        }
        return ResponseEntity.ok(response);
    }

    // ========== CREAR PACIENTE ==========
    @PostMapping
    public ResponseEntity<?> crearPaciente(@RequestBody RegisterRequestDTO dto) {
        // Validaciones de negocio
        List<String> errores = new ArrayList<>();

        if (userRepository.existsByEmail(dto.getEmail())) {
            errores.add("El email ya está registrado");
        }
        if (dto.getPassword() == null || dto.getPassword().length() < 8) {
            errores.add("La contraseña debe tener al menos 8 caracteres");
        }
        if (!errores.isEmpty()) {
            return ResponseEntity.badRequest().body(errores);
        }

        // Forzar rol PACIENTE
        dto.setRole("PACIENTE");
        authService.register(dto);   // Ya encripta la contraseña
        return ResponseEntity.ok("Paciente creado exitosamente");
    }

    // ========== ACTUALIZAR PACIENTE ==========
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarPaciente(@PathVariable Long id,
                                                @RequestBody RegisterRequestDTO dto) {
        Optional<User> pacienteOpt = userRepository.findById(id);
        if (pacienteOpt.isEmpty() || !"PACIENTE".equals(pacienteOpt.get().getRole())) {
            return ResponseEntity.notFound().build();
        }

        User paciente = pacienteOpt.get();

        // Validaciones
        List<String> errores = new ArrayList<>();
        if (dto.getEmail() != null && !dto.getEmail().equals(paciente.getEmail())
                && userRepository.existsByEmail(dto.getEmail())) {
            errores.add("El nuevo email ya está registrado");
        }
        if (dto.getPassword() != null && dto.getPassword().length() < 8) {
            errores.add("La contraseña debe tener al menos 8 caracteres");
        }
        if (!errores.isEmpty()) {
            return ResponseEntity.badRequest().body(errores);
        }

        // Actualizar campos permitidos
        if (dto.getEmail() != null) {
            paciente.setEmail(dto.getEmail());
        }
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            paciente.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        }
        // El rol no se modifica (se mantiene PACIENTE)
        userRepository.save(paciente);

        return ResponseEntity.ok(userToMap(paciente));
    }

    // ========== ELIMINAR PACIENTE ==========
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarPaciente(@PathVariable Long id) {
        Optional<User> pacienteOpt = userRepository.findById(id);
        if (pacienteOpt.isEmpty() || !"PACIENTE".equals(pacienteOpt.get().getRole())) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok("Paciente eliminado exitosamente");
    }

    // ========== Método auxiliar para convertir User a Map ==========
    private Map<String, Object> userToMap(User user) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", user.getId());
        map.put("email", user.getEmail());
        map.put("role", user.getRole());
        map.put("isActive", user.getIsActive());
        return map;
    }
}