package com.organdonation.authservice;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador REST para la gestión de donantes de órganos.
 *
 * <p>Expone los endpoints bajo {@code /api/donantes}.
 *
 * @author Ceamerap
 * @task PDDO-91
 */
@RestController
@RequestMapping("/api/donantes")
public class DonorController {

    private final DonorService donorService;

    public DonorController(DonorService donorService) {
        this.donorService = donorService;
    }

    /** Registra un nuevo donante. */
    @PostMapping
    public ResponseEntity<DonorResponseDTO> crear(
            @Valid @RequestBody DonorRequestDTO request) {
        return ResponseEntity.status(201).body(donorService.crear(request));
    }

    /** Obtiene un donante por id. */
    @GetMapping("/{id}")
    public DonorResponseDTO obtener(@PathVariable Long id) {
        return donorService.obtener(id);
    }
}