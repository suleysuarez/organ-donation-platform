package com.organdonation.authservice;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Repositorio JPA para la gestión de donantes.
 *
 * @author Ceamerap
 * @task PDDO-91
 */
public interface DonorRepository extends JpaRepository<Donor, Long> {
    boolean existsByDocumentNumber(String documentNumber);

    @Query("SELECT d FROM Donor d WHERE "
            + "LOWER(d.fullName) LIKE LOWER(CONCAT('%', :q, '%')) "
            + "OR d.documentNumber LIKE CONCAT('%', :q, '%')")
    Page<Donor> buscar(@Param("q") String q, Pageable pageable);
}
