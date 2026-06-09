package com.organdonation.authservice;

public enum DonorStatus {
    REGISTERED("Registrado"),
    PENDING_APPROVAL("Pendiente de aprobación"),
    ACTIVE_DONOR("Donante activo"),
    INACTIVE("Inactivo");

    private final String value;

    DonorStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}