// RecipientRepository.java
package com.organdonation.authservice;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RecipientRepository extends JpaRepository<Recipient, Long> {
    boolean existsByDocumentNumber(String documentNumber);

    @Query("SELECT r FROM Recipient r WHERE "
            + "LOWER(r.fullName) LIKE LOWER(CONCAT('%', :q, '%')) "
            + "OR r.documentNumber LIKE CONCAT('%', :q, '%')")
    Page<Recipient> buscar(@Param("q") String q, Pageable pageable);
}