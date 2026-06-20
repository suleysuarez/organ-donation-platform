package com.organdonation.authservice;

import jakarta.persistence.*;
import java.time.Instant;

/**
 * Entidad que representa un proceso de donación de órganos.
 * Mapea la tabla core.donation_processes creada por la migración Flyway V1.
 *
 * @author Ceamerap
 * @task PDDO-92
 */
@Entity
@Table(name = "donation_processes", schema = "core")
public class DonationProcess {

    protected DonationProcess() {}

    public DonationProcess(Donor donor, Recipient recipient, User openedBy) {
        this.donor = donor;
        this.recipient = recipient;
        this.openedBy = openedBy;
        this.currentState = "REGISTRADO";
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "donor_id")
    private Donor donor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "recipient_id")
    private Recipient recipient;

    @Column(name = "current_state", nullable = false)
    private String currentState;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "opened_by", nullable = false)
    private User openedBy;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private Instant updatedAt;

    /**
     * Actualiza el estado actual del proceso de donación.
     *
     * @param nuevoEstado nuevo estado del proceso
     */
    public void actualizarEstado(String nuevoEstado) {
        this.currentState = nuevoEstado;
    }

    public Long getId() { return id; }
    public Donor getDonor() { return donor; }
    public Recipient getRecipient() { return recipient; }
    public String getCurrentState() { return currentState; }
    public User getOpenedBy() { return openedBy; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}