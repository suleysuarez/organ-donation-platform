package com.organdonation.authservice;

import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * Controlador REST para la gestión de profesionales de salud (médicos).
 *
 * <p>Expone los endpoints bajo {@code /api/medicos} para listar,
 * consultar y registrar médicos en la plataforma.
 *
 * @author Ceamerap
 * @task PDDO-28
 */
@RestController
@RequestMapping("/api/medicos")
public class MedicoController {

    private final MedicoService medicoService;

    public MedicoController(MedicoService medicoService) {
        this.medicoService = medicoService;
    }

    /** Listado paginado de médicos. Filtro opcional {@code q} por nombre o documento. */
    @GetMapping
    public Page<MedicoResponseDTO> listar(
            @RequestParam(value = "q", required = false) String q,
            @PageableDefault(size = 20, sort = "fullName", direction = Sort.Direction.ASC)
            Pageable pageable) {
        return medicoService.listar(q, pageable);
    }

    /** Detalle de un médico por id de perfil. */
    @GetMapping("/{id}")
    public MedicoResponseDTO obtener(@PathVariable Long id) {
        return medicoService.obtener(id);
    }

    /** Registro de un nuevo médico. */
    @PostMapping
    public ResponseEntity<MedicoResponseDTO> crear(
            @Valid @RequestBody MedicoRequestDTO request) {
        MedicoResponseDTO response = medicoService.crear(request);
        return ResponseEntity.status(201).body(response);
    }
    /** Valida un médico contra RETHUS y actualiza su estado de verificación. */
    @PostMapping("/{id}/validar-rethus")
    public RethusValidationResultDTO validarRethus(
            @PathVariable Long id,
            @RequestBody ValidarMedicoRequestDTO request) {
        return medicoService.validarConRethus(id, request);
    }
    /** Sube el certificado de un médico y lo asocia a su perfil. */
    @PostMapping("/{id}/certificado")
    public ResponseEntity<FileUploadResponseDTO> subirCertificado(
            @PathVariable Long id,
            @RequestParam("archivo") MultipartFile archivo) {
        FileUploadResponseDTO response = medicoService.subirCertificado(id, archivo);
        return ResponseEntity.status(201).body(response);
    }
}