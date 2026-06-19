package com.organdonation.authservice;

/**
 * Excepción lanzada cuando hay un error de comunicación con un servicio
 * externo (ej. microservicio RETHUS FastAPI).
 *
 * @author Ceamerap
 * @task PDDO-100
 */
public class ExternalServiceException extends RuntimeException {

    private final String servicio;

    public ExternalServiceException(String servicio, String mensaje) {
        super(mensaje);
        this.servicio = servicio;
    }

    public ExternalServiceException(String servicio, String mensaje, Throwable causa) {
        super(mensaje, causa);
        this.servicio = servicio;
    }

    public String getServicio() { return servicio; }
}