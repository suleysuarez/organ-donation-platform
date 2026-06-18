package com.organdonation.authservice;

import jakarta.validation.constraints.NotNull;

/**
 * DTO de entrada para la creación de un proceso de donación.
 *
 * @author Ceamerap
 * @task PDDO-92
 */
public class DonationProcessRequestDTO {

    @NotNull(message = "El id del donante es obligatorio")
    private Long donorId;

    @NotNull(message = "El id del receptor es obligatorio")
    private Long recipientId;

    @NotNull(message = "El id del médico que abre el proceso es obligatorio")
    private Long openedById;

    public Long getDonorId() { return donorId; }
    public void setDonorId(Long donorId) { this.donorId = donorId; }
    public Long getRecipientId() { return recipientId; }
    public void setRecipientId(Long recipientId) { this.recipientId = recipientId; }
    public Long getOpenedById() { return openedById; }
    public void setOpenedById(Long openedById) { this.openedById = openedById; }
}