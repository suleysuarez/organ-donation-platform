package com.organdonation.authservice;

public enum ValidationStatus {
    PENDIENTE("Pendiente"),
    VALIDADO("Validado"),
    RECHAZADO("Rechazado");

    private final String value;

    ValidationStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static ValidationStatus fromString(String text) {
        if (text == null) return null;
        for (ValidationStatus vs : ValidationStatus.values()) {
            if (vs.name().equalsIgnoreCase(text) || vs.value.equalsIgnoreCase(text)) {
                return vs;
            }
        }
        throw new IllegalArgumentException("Estado de validación inválido: " + text);
    }
}