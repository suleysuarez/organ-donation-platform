package com.organdonation.authservice;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repositorio JPA para la gestión de receptores.
 *
 * @author Ceamerap
 * @task PDDO-91
 */
public interface RecipientRepository extends JpaRepository<Recipient, Long> {
    boolean existsByDocumentNumber(String documentNumber);
}