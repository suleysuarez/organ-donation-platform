package com.organdonation.authservice;

public enum Gender {
    MALE("Masculino"),
    FEMALE("Femenino"),
    OTHER("Otro");

    private final String value;

    Gender(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
    public static Gender fromString(String text) {
        if (text == null) return null;
        // Buscar por nombre del enum (ej: "MALE", "FEMALE")
        for (Gender g : Gender.values()) {
            if (g.name().equalsIgnoreCase(text)) {
                return g;
            }
        }
        // Buscar por valor en español (ej: "Masculino", "Femenino")
        for (Gender g : Gender.values()) {
            if (g.getValue().equalsIgnoreCase(text)) {
                return g;
            }
        }
        throw new IllegalArgumentException("Género inválido: " + text);
    }
}