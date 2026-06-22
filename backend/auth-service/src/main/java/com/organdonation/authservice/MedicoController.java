package com.organdonation.authservice;

import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
public class MedicoController {

    private final MedicoService medicoService;

    public MedicoController(MedicoService medicoService) {
        this.medicoService = medicoService;
    }

    /** Registra un nuevo médico (endpoint público de autorregistro). */
    @PostMapping("/medicos")
    public ResponseEntity<MedicoResponseDTO> crear(
            @Valid @RequestBody MedicoRequestDTO request) {
        return ResponseEntity.status(201).body(medicoService.crear(request));
    }

    /** Listado paginado de médicos, con filtro opcional de texto libre q. */
    @GetMapping("/medicos")
    public ResponseEntity<Page<MedicoResponseDTO>> listarMedicos(
            @RequestParam(required = false) String q,
            Pageable pageable) {
        return ResponseEntity.ok(medicoService.listar(q, pageable));
    }

    /** Detalle de un médico por id de perfil. */
    @GetMapping("/medicos/{id}")
    public ResponseEntity<MedicoResponseDTO> obtenerMedicoPorId(@PathVariable Long id) {
        return ResponseEntity.ok(medicoService.obtener(id));
    }

    /** Sube el certificado de un médico y lo asocia a su perfil. */
    @PostMapping("/medicos/{id}/certificado")
    public ResponseEntity<FileUploadResponseDTO> subirCertificado(
            @PathVariable Long id,
            @RequestParam("archivo") MultipartFile archivo) {
        FileUploadResponseDTO response = medicoService.subirCertificado(id, archivo);
        return ResponseEntity.status(201).body(response);
    }
}