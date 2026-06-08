package com.organdonation.authservice;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class MedicoService {

    private final MedicalProfessionalProfileRepository repository;

    public MedicoService(MedicalProfessionalProfileRepository repository) {
        this.repository = repository;
    }

    /** Listado paginado de médicos, con filtro opcional de texto libre {@code q}. */
    public Page<MedicoResponseDTO> listar(String q, Pageable pageable) {
        Page<MedicalProfessionalProfile> page;
        if (q == null || q.isBlank()) {
            // Sin filtro: evitamos enlazar un parámetro null (Postgres no infiere el tipo).
            page = repository.findAll(pageable);
        } else {
            page = repository.buscar(q.trim(), pageable);
        }
        return page.map(MedicoResponseDTO::from);
    }

    /** Detalle de un médico por id de perfil. Lanza 404 si no existe. */
    public MedicoResponseDTO obtener(Long id) {
        return repository.findById(id)
                .map(MedicoResponseDTO::from)
                .orElseThrow(() ->
                        new ResourceNotFoundException("No se encontró un médico con id " + id));
    }
}
