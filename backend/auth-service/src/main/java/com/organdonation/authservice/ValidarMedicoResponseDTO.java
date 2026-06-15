package com.organdonation.authservice;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Respuesta final del paso 2 de validación RETHUS.
 *
 * <p>Mapea la respuesta de POST /validar-medico del microservicio RETHUS.
 * Indica si el médico fue encontrado, su estado de validación y, si aplica,
 * sus datos registrados.
 *
 * @author Ceamerap
 * @task PDDO-57
 */
public class ValidarMedicoResponseDTO {

    @JsonProperty("encontrado")
    private boolean encontrado;

    @JsonProperty("estado")
    private String estado;

    @JsonProperty("datos")
    private DatosMedicoRethus datos;

    @JsonProperty("mensaje")
    private String mensaje;

    public boolean isEncontrado() { return encontrado; }
    public void setEncontrado(boolean encontrado) { this.encontrado = encontrado; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public DatosMedicoRethus getDatos() { return datos; }
    public void setDatos(DatosMedicoRethus datos) { this.datos = datos; }

    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }
}