package com.organdonation.authservice;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

/**
 * Repositorio JPA para la gestión de procesos de donación.
 *
 * @author Ceamerap
 * @task PDDO-92
 */
public interface DonationProcessRepository extends JpaRepository<DonationProcess, Long> {
    List<DonationProcess> findByDonorId(Long donorId);
    List<DonationProcess> findByRecipientId(Long recipientId);
}