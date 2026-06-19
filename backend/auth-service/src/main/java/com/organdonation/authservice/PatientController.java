package com.organdonation.authservice;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.*;
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
            @RequestParam(required = false) String ciudad,
            @RequestParam(required = false) String bloodType,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) Boolean isDonor,
            @RequestParam(required = false) String validationStatus) {

        Specification<User> spec = Specification.where(
                (root, query, cb) -> cb.equal(root.get("role"), "PACIENTE")
        );

        // Filtro por nombre (firstName o lastName)
        if (nombre != null && !nombre.isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("firstName")), "%" + nombre.toLowerCase() + "%"),
                    cb.like(cb.lower(root.get("lastName")), "%" + nombre.toLowerCase() + "%")
            ));
        }

        // Filtro por documento
        if (documento != null && !documento.isEmpty()) {
            spec = spec.and((root, query, cb) ->
                    cb.like(root.get("dni"), "%" + documento + "%"));
        }

        // Filtro por ciudad
        if (ciudad != null && !ciudad.isEmpty()) {
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("city")), "%" + ciudad.toLowerCase() + "%"));
        }

        // Filtro por tipo de sangre
        if (bloodType != null && !bloodType.isEmpty()) {
            String cleanedBloodType = bloodType.replace(' ', '+');
            BloodType bt = BloodType.fromString(cleanedBloodType);
            spec = spec.and((root, query, cb) -> cb.equal(root.get("bloodType"), bt));
        }

        // Filtro por género
        if (gender != null && !gender.isEmpty()) {
            Gender g = Gender.fromString(gender);
            spec = spec.and((root, query, cb) -> cb.equal(root.get("gender"), g));
        }

        // Filtro por estado de donante
        if (isDonor != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("isDonor"), isDonor));
        }

        // Filtro por estado de validación
        if (validationStatus != null && !validationStatus.isEmpty()) {
            ValidationStatus vs = ValidationStatus.fromString(validationStatus);
            spec = spec.and((root, query, cb) -> cb.equal(root.get("validationStatus"), vs));
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

    // ========== CREAR PACIENTE (con validaciones de negocio) ==========
    @PostMapping("/pacientes")
    public ResponseEntity<?> crearPaciente(@RequestBody RegisterRequestDTO dto) {

        // --- Validaciones de negocio ---
        List<String> errores = new ArrayList<>();

        // Email único
        if (userRepository.existsByEmail(dto.getEmail())) {
            errores.add("El email ya está registrado");
        }

        // DNI único (si se envía)
        if (dto.getDni() != null && !dto.getDni().isEmpty() &&
                userRepository.findAll().stream().anyMatch(u -> dto.getDni().equals(u.getDni()))) {
            errores.add("El DNI ya está registrado");
        }

        // Fecha de nacimiento no futura
        if (dto.getBirthDate() != null && dto.getBirthDate().isAfter(LocalDate.now())) {
            errores.add("La fecha de nacimiento no puede ser futura");
        }

        // Teléfono al menos 7 dígitos
        if (dto.getPhone() != null && !dto.getPhone().isEmpty() &&
                dto.getPhone().replaceAll("[^0-9]", "").length() < 7) {
            errores.add("El teléfono debe tener al menos 7 dígitos");
        }

        // Nombre y apellido sin números
        if (dto.getFirstName() != null && dto.getFirstName().matches(".*\\d.*")) {
            errores.add("El nombre no puede contener números");
        }
        if (dto.getLastName() != null && dto.getLastName().matches(".*\\d.*")) {
            errores.add("El apellido no puede contener números");
        }

        // Username al menos 3 caracteres
        if (dto.getUsername() != null && dto.getUsername().length() < 3) {
            errores.add("El username debe tener al menos 3 caracteres");
        }

        // Contraseña al menos 8 caracteres
        if (dto.getPassword() != null && dto.getPassword().length() < 8) {
            errores.add("La contraseña debe tener al menos 8 caracteres");
        }

        // Si hay errores, devolver 400 con la lista
        if (!errores.isEmpty()) {
            return ResponseEntity.badRequest().body(errores);
        }

        // --- Crear usuario ---
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

    // ========== ACTUALIZAR PACIENTE (con validaciones de negocio) ==========
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

        // --- Validaciones de negocio ---
        List<String> errores = new ArrayList<>();

        // Fecha de nacimiento no futura
        if (dto.getBirthDate() != null && dto.getBirthDate().isAfter(LocalDate.now())) {
            errores.add("La fecha de nacimiento no puede ser futura");
        }

        // Teléfono al menos 7 dígitos
        if (dto.getPhone() != null && !dto.getPhone().isEmpty() &&
                dto.getPhone().replaceAll("[^0-9]", "").length() < 7) {
            errores.add("El teléfono debe tener al menos 7 dígitos");
        }

        // Nombre y apellido sin números
        if (dto.getFirstName() != null && dto.getFirstName().matches(".*\\d.*")) {
            errores.add("El nombre no puede contener números");
        }
        if (dto.getLastName() != null && dto.getLastName().matches(".*\\d.*")) {
            errores.add("El apellido no puede contener números");
        }

        // Username al menos 3 caracteres
        if (dto.getUsername() != null && dto.getUsername().length() < 3) {
            errores.add("El username debe tener al menos 3 caracteres");
        }

        // Contraseña al menos 8 caracteres
        if (dto.getPassword() != null && dto.getPassword().length() < 8) {
            errores.add("La contraseña debe tener al menos 8 caracteres");
        }

        // Si hay errores, devolver 400 con la lista
        if (!errores.isEmpty()) {
            return ResponseEntity.badRequest().body(errores);
        }

        // --- Actualizar campos ---
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