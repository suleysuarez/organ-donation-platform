package com.organdonation.authservice;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/medicos")
public class MedicoController {

    private final MedicoService medicoService;

    public MedicoController(MedicoService medicoService) {
        this.medicoService = medicoService;
    }

    /** Listado paginado de médicos. Filtro opcional `q` (nombre o documento). */
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
}
