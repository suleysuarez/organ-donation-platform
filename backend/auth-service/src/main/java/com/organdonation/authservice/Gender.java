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
}