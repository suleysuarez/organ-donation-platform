package com.organdonation.authservice;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO de entrada para actualizar el estado de un proceso de donación.
 *
 * @author Ceamerap
 * @task PDDO-92
 */
public class UpdateProcessStateRequestDTO {

    @NotBlank(message = "El nuevo estado es obligatorio")
    private String newState;

    @NotNull(message = "El id del usuario que cambia el estado es obligatorio")
    private Long changedById;

    private String clinicalObservation;

    public String getNewState() { return newState; }
    public void setNewState(String newState) { this.newState = newState; }
    public Long getChangedById() { return changedById; }
    public void setChangedById(Long changedById) { this.changedById = changedById; }
    public String getClinicalObservation() { return clinicalObservation; }
    public void setClinicalObservation(String o) { this.clinicalObservation = o; }
}