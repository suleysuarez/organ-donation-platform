package com.organdonation.authservice;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class MedicoController {

    private final UserRepository userRepository;

    public MedicoController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/medicos")
    public ResponseEntity<List<UserDto>> listarMedicos() {
        List<User> medicos = userRepository.findByRole("MEDICO");
        List<UserDto> response = medicos.stream()
                .map(UserDto::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
}