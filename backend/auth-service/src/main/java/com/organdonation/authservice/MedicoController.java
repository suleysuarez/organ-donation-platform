package com.organdonation.authservice;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class MedicoController {

    private final UserRepository userRepository;

    public MedicoController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/medicos")
    public ResponseEntity<List<UserDto>> listarMedicos(
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) String documento,
            @RequestParam(required = false) String especialidad,
            @RequestParam(required = false) String ciudad,
            @RequestParam(required = false) String estadoValidacion) {

        // Base: rol médico
        Specification<User> spec = Specification.where(
                (root, query, cb) -> cb.equal(root.get("role"), "MEDICO")
        );

        // Filtro por nombre (en firstName o lastName)
        if (nombre != null && !nombre.isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("firstName")), "%" + nombre.toLowerCase() + "%"),
                    cb.like(cb.lower(root.get("lastName")), "%" + nombre.toLowerCase() + "%")
            ));
        }

        // Filtro por documento (DNI)
        if (documento != null && !documento.isEmpty()) {
            spec = spec.and((root, query, cb) ->
                    cb.like(root.get("dni"), "%" + documento + "%"));
        }

        // Filtro por especialidad
        if (especialidad != null && !especialidad.isEmpty()) {
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("specialty")), "%" + especialidad.toLowerCase() + "%"));
        }

        // Filtro por ciudad
        if (ciudad != null && !ciudad.isEmpty()) {
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("city")), "%" + ciudad.toLowerCase() + "%"));
        }

        // Filtro por estado de validación
        if (estadoValidacion != null && !estadoValidacion.isEmpty()) {
            ValidationStatus status = ValidationStatus.fromString(estadoValidacion);
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("validationStatus"), status));
        }

        List<User> medicos = userRepository.findAll(spec);
        List<UserDto> response = medicos.stream()
                .map(UserDto::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/medicos/{id}")
    public ResponseEntity<?> obtenerMedicoPorId(@PathVariable Long id) {
        Optional<User> optionalMedico = userRepository.findById(id);
        if (optionalMedico.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User medico = optionalMedico.get();
        if (!"MEDICO".equals(medico.getRole())) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(new UserDto(medico));
    }
}