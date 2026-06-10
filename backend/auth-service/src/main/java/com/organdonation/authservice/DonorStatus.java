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
    public static DonorStatus fromString(String text) {
        if (text == null) return null;
        for (DonorStatus ds : DonorStatus.values()) {
            if (ds.name().equalsIgnoreCase(text) || ds.getValue().equalsIgnoreCase(text)) {
                return ds;
            }
        }
        throw new IllegalArgumentException("Estado de donante inválido: " + text);
    }
}