package com.organdonation.authservice;

import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador REST para la gestión de receptores de órganos.
 *
 * <p>Expone los endpoints bajo {@code /api/receptores}.
 *
 * @author Ceamerap
 * @task PDDO-91
 */
@RestController
@RequestMapping("/api/receptores")
public class RecipientController {

    private final RecipientService recipientService;

    public RecipientController(RecipientService recipientService) {
        this.recipientService = recipientService;
    }

    /** Lista los receptores con paginación y búsqueda opcional. */
    @GetMapping
    public Page<RecipientResponseDTO> listar(
            @RequestParam(required = false) String q,
            Pageable pageable) {
        return recipientService.listar(q, pageable);
    }

    /** Registra un nuevo receptor. */
    @PostMapping
    public ResponseEntity<RecipientResponseDTO> crear(
            @Valid @RequestBody RecipientRequestDTO request) {
        return ResponseEntity.status(201).body(recipientService.crear(request));
    }

    /** Obtiene un receptor por id. */
    @GetMapping("/{id}")
    public RecipientResponseDTO obtener(@PathVariable Long id) {
        return recipientService.obtener(id);
    }
}