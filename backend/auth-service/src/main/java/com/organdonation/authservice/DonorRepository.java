package com.organdonation.authservice;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repositorio JPA para la gestión de donantes.
 *
 * @author Ceamerap
 * @task PDDO-91
 */
public interface DonorRepository extends JpaRepository<Donor, Long> {
    boolean existsByDocumentNumber(String documentNumber);
}