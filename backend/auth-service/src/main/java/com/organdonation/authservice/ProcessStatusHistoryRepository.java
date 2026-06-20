package com.organdonation.authservice;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

/**
 * Repositorio JPA para el historial de estados de procesos de donación.
 *
 * @author Ceamerap
 * @task PDDO-92
 */
public interface ProcessStatusHistoryRepository
        extends JpaRepository<ProcessStatusHistory, Long> {
    List<ProcessStatusHistory> findByProcessIdOrderByChangedAtAsc(Long processId);
}