package com.organdonation.authservice;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador REST para la gestión de procesos de donación.
 *
 * <p>Expone los endpoints bajo {@code /api/procesos}.
 *
 * @author Ceamerap
 * @task PDDO-92
 */
@RestController
@RequestMapping("/api/procesos")
public class DonationProcessController {

    private final DonationProcessService processService;

    public DonationProcessController(DonationProcessService processService) {
        this.processService = processService;
    }

    /** Crea un nuevo proceso de donación. */
    @PostMapping
    public ResponseEntity<DonationProcessResponseDTO> crear(
            @Valid @RequestBody DonationProcessRequestDTO request) {
        return ResponseEntity.status(201).body(processService.crear(request));
    }

    /** Obtiene un proceso de donación por id. */
    @GetMapping("/{id}")
    public DonationProcessResponseDTO obtener(@PathVariable Long id) {
        return processService.obtener(id);
    }

    /** Actualiza el estado de un proceso de donación. */
    @PatchMapping("/{id}/estado")
    public DonationProcessResponseDTO actualizarEstado(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProcessStateRequestDTO request) {
        return processService.actualizarEstado(id, request);
    }
}