package com.organdonation.authservice;

import java.time.Instant;

/**
 * DTO de salida para un registro del historial de estados
 * de un proceso de donación.
 *
 * @author Ceamerap
 * @task PDDO-93
 */
public class ProcessStatusHistoryResponseDTO {

    private Long id;
    private String previousState;
    private String newState;
    private String clinicalObservation;
    private String changedByEmail;
    private Instant changedAt;

    public static ProcessStatusHistoryResponseDTO from(ProcessStatusHistory h) {
        ProcessStatusHistoryResponseDTO dto = new ProcessStatusHistoryResponseDTO();
        dto.id = h.getId();
        dto.previousState = h.getPreviousState();
        dto.newState = h.getNewState();
        dto.clinicalObservation = h.getClinicalObservation();
        if (h.getChangedBy() != null) {
            dto.changedByEmail = h.getChangedBy().getEmail();
        }
        dto.changedAt = h.getChangedAt();
        return dto;
    }

    public Long getId() { return id; }
    public String getPreviousState() { return previousState; }
    public String getNewState() { return newState; }
    public String getClinicalObservation() { return clinicalObservation; }
    public String getChangedByEmail() { return changedByEmail; }
    public Instant getChangedAt() { return changedAt; }
}