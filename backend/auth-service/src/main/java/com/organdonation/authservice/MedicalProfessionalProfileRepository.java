package com.organdonation.authservice;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MedicalProfessionalProfileRepository
        extends JpaRepository<MedicalProfessionalProfile, Long> {

    /**
     * Búsqueda paginada por coincidencia parcial (case-insensitive) en nombre o documento.
     * Se invoca solo con {@code q} no nulo (el servicio usa findAll cuando no hay filtro).
     */
    @Query("SELECT p FROM MedicalProfessionalProfile p WHERE "
            + "LOWER(p.fullName) LIKE LOWER(CONCAT('%', :q, '%')) "
            + "OR p.documentNumber LIKE CONCAT('%', :q, '%')")
    Page<MedicalProfessionalProfile> buscar(@Param("q") String q, Pageable pageable);
}
