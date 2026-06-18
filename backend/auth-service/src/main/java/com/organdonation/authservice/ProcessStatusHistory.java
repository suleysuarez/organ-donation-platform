package com.organdonation.authservice;

import jakarta.persistence.*;
import java.time.Instant;

/**
 * Entidad que representa el historial de cambios de estado
 * de un proceso de donación.
 * Mapea la tabla core.process_status_history creada por la migración Flyway V1.
 *
 * @author Ceamerap
 * @task PDDO-92
 */
@Entity
@Table(name = "process_status_history", schema = "core")
public class ProcessStatusHistory {

    protected ProcessStatusHistory() {}

    public ProcessStatusHistory(DonationProcess process, String previousState,
                                String newState, String clinicalObservation,
                                User changedBy) {
        this.process = process;
        this.previousState = previousState;
        this.newState = newState;
        this.clinicalObservation = clinicalObservation;
        this.changedBy = changedBy;
        this.changedAt = Instant.now();
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "process_id", nullable = false)
    private DonationProcess process;

    @Column(name = "previous_state")
    private String previousState;

    @Column(name = "new_state", nullable = false)
    private String newState;

    @Column(name = "clinical_observation")
    private String clinicalObservation;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "changed_by", nullable = false)
    private User changedBy;

    @Column(name = "changed_at")
    private Instant changedAt;

    public Long getId() { return id; }
    public DonationProcess getProcess() { return process; }
    public String getPreviousState() { return previousState; }
    public String getNewState() { return newState; }
    public String getClinicalObservation() { return clinicalObservation; }
    public User getChangedBy() { return changedBy; }
    public Instant getChangedAt() { return changedAt; }
}