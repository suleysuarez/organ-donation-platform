package com.organdonation.authservice;

import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    /** Lista los donantes con paginaciÃ³n y bÃºsqueda opcional. */
    @GetMapping
    public Page<DonorResponseDTO> listar(
            @RequestParam(required = false) String q,
            Pageable pageable) {
        return donorService.listar(q, pageable);
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
