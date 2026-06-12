package com.organdonation.authservice;

/** Recurso no encontrado → el manejador global la traduce a HTTP 404. */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
