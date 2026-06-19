package com.organdonation.authservice;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class PatientController {

    private final UserRepository userRepository;

    public PatientController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ========== LISTAR PACIENTES (con filtros) ==========
    @GetMapping("/pacientes")
    public ResponseEntity<List<UserDto>> listarPacientes(
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) String documento,
            @RequestParam(required = false) String ciudad) {

        Specification<User> spec = Specification.where(
                (root, query, cb) -> cb.equal(root.get("role"), "PACIENTE")
        );

        if (nombre != null && !nombre.isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("firstName")), "%" + nombre.toLowerCase() + "%"),
                    cb.like(cb.lower(root.get("lastName")), "%" + nombre.toLowerCase() + "%")
            ));
        }
        if (documento != null && !documento.isEmpty()) {
            spec = spec.and((root, query, cb) ->
                    cb.like(root.get("dni"), "%" + documento + "%"));
        }
        if (ciudad != null && !ciudad.isEmpty()) {
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("city")), "%" + ciudad.toLowerCase() + "%"));
        }

        List<User> pacientes = userRepository.findAll(spec);
        List<UserDto> response = pacientes.stream()
                .map(UserDto::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    // ========== OBTENER PACIENTE POR ID ==========
    @GetMapping("/pacientes/{id}")
    public ResponseEntity<?> obtenerPacientePorId(@PathVariable Long id) {
        Optional<User> optionalPaciente = userRepository.findById(id);
        if (optionalPaciente.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User paciente = optionalPaciente.get();
        if (!"PACIENTE".equals(paciente.getRole())) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(new UserDto(paciente));
    }

    // ========== CREAR PACIENTE (rol PACIENTE automático) ==========
    @PostMapping("/pacientes")
    public ResponseEntity<?> crearPaciente(@RequestBody RegisterRequestDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            return ResponseEntity.badRequest().body("El email ya está registrado");
        }
        User user = new User();
        user.setEmail(dto.getEmail());
        user.setPasswordHash(dto.getPassword());
        user.setRole("PACIENTE");
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
        if (dto.getGender() != null) user.setGender(Gender.fromString(dto.getGender()));
        if (dto.getBloodType() != null) user.setBloodType(BloodType.fromString(dto.getBloodType()));
        if (dto.getDonorStatus() != null && !dto.getDonorStatus().isEmpty())
            user.setDonorStatus(DonorStatus.fromString(dto.getDonorStatus()));
        user.setSpecialty(dto.getSpecialty());
        if (dto.getValidationStatus() != null && !dto.getValidationStatus().isEmpty())
            user.setValidationStatus(ValidationStatus.fromString(dto.getValidationStatus()));

        userRepository.save(user);
        return ResponseEntity.ok("Paciente registrado exitosamente");
    }

    // ========== ACTUALIZAR PACIENTE ==========
    @PutMapping("/pacientes/{id}")
    public ResponseEntity<?> actualizarPaciente(@PathVariable Long id, @RequestBody RegisterRequestDTO dto) {
        Optional<User> optionalPaciente = userRepository.findById(id);
        if (optionalPaciente.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User paciente = optionalPaciente.get();
        if (!"PACIENTE".equals(paciente.getRole())) {
            return ResponseEntity.badRequest().body("El usuario no es un paciente");
        }

        paciente.setUsername(dto.getUsername());
        paciente.setFirstName(dto.getFirstName());
        paciente.setLastName(dto.getLastName());
        paciente.setDni(dto.getDni());
        paciente.setBirthDate(dto.getBirthDate());
        paciente.setPhone(dto.getPhone());
        paciente.setAddress(dto.getAddress());
        paciente.setCity(dto.getCity());
        paciente.setCountry(dto.getCountry());
        paciente.setIsDonor(dto.getIsDonor());
        if (dto.getGender() != null) paciente.setGender(Gender.fromString(dto.getGender()));
        if (dto.getBloodType() != null) paciente.setBloodType(BloodType.fromString(dto.getBloodType()));
        if (dto.getDonorStatus() != null && !dto.getDonorStatus().isEmpty())
            paciente.setDonorStatus(DonorStatus.fromString(dto.getDonorStatus()));
        paciente.setSpecialty(dto.getSpecialty());
        if (dto.getValidationStatus() != null && !dto.getValidationStatus().isEmpty())
            paciente.setValidationStatus(ValidationStatus.fromString(dto.getValidationStatus()));

        userRepository.save(paciente);
        return ResponseEntity.ok("Paciente actualizado exitosamente");
    }

    // ========== ELIMINAR PACIENTE ==========
    @DeleteMapping("/pacientes/{id}")
    public ResponseEntity<?> eliminarPaciente(@PathVariable Long id) {
        Optional<User> optionalPaciente = userRepository.findById(id);
        if (optionalPaciente.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        if (!"PACIENTE".equals(optionalPaciente.get().getRole())) {
            return ResponseEntity.badRequest().body("El usuario no es un paciente");
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok("Paciente eliminado exitosamente");
    }
}