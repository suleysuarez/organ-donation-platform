package com.organdonation.authservice;

import java.time.Instant;

/**
 * DTO de salida para un proceso de donación.
 *
 * @author Ceamerap
 * @task PDDO-92
 */
public class DonationProcessResponseDTO {

    private Long id;
    private Long donorId;
    private String donorName;
    private Long recipientId;
    private String recipientName;
    private String currentState;
    private String openedByEmail;
    private Instant createdAt;

    public static DonationProcessResponseDTO from(DonationProcess p) {
        DonationProcessResponseDTO dto = new DonationProcessResponseDTO();
        dto.id = p.getId();
        if (p.getDonor() != null) {
            dto.donorId = p.getDonor().getId();
            dto.donorName = p.getDonor().getFullName();
        }
        if (p.getRecipient() != null) {
            dto.recipientId = p.getRecipient().getId();
            dto.recipientName = p.getRecipient().getFullName();
        }
        dto.currentState = p.getCurrentState();
        if (p.getOpenedBy() != null) {
            dto.openedByEmail = p.getOpenedBy().getEmail();
        }
        dto.createdAt = p.getCreatedAt();
        return dto;
    }

    public Long getId() { return id; }
    public Long getDonorId() { return donorId; }
    public String getDonorName() { return donorName; }
    public Long getRecipientId() { return recipientId; }
    public String getRecipientName() { return recipientName; }
    public String getCurrentState() { return currentState; }
    public String getOpenedByEmail() { return openedByEmail; }
    public Instant getCreatedAt() { return createdAt; }
}