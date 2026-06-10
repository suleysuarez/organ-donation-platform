package com.organdonation.authservice;

public enum BloodType {
    A_POSITIVE("A+"),
    A_NEGATIVE("A-"),
    B_POSITIVE("B+"),
    B_NEGATIVE("B-"),
    AB_POSITIVE("AB+"),
    AB_NEGATIVE("AB-"),
    O_POSITIVE("O+"),
    O_NEGATIVE("O-");

    private final String value;

    BloodType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
    public static BloodType fromString(String text) {
        if (text == null) return null;
        // Buscar por nombre (ej: "O_POSITIVE", "A_NEGATIVE")
        for (BloodType bt : BloodType.values()) {
            if (bt.name().equalsIgnoreCase(text)) {
                return bt;
            }
        }
        // Buscar por valor con símbolo (ej: "O+", "A-")
        for (BloodType bt : BloodType.values()) {
            if (bt.getValue().equalsIgnoreCase(text)) {
                return bt;
            }
        }
        throw new IllegalArgumentException("Tipo de sangre inválido: " + text);
    }
}