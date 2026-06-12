package com.organdonation.authservice;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Datos del médico extraídos del registro RETHUS, cuando existe.
 *
 * <p>Parte de la respuesta de POST /validar-medico cuando {@code encontrado}
 * es {@code true}.
 *
 * @author Ceamerap
 * @task PDDO-57
 */
public class DatosMedicoRethus {

    @JsonProperty("nombre_completo")
    private String nombreCompleto;

    @JsonProperty("profesion_perfil")
    private String profesionPerfil;

    @JsonProperty("fecha_registro")
    private String fechaRegistro;

    @JsonProperty("autorizado_para_ejercer")
    private Boolean autorizadoParaEjercer;

    @JsonProperty("sanciones")
    private String sanciones;

    public String getNombreCompleto() { return nombreCompleto; }
    public void setNombreCompleto(String nombreCompleto) { this.nombreCompleto = nombreCompleto; }

    public String getProfesionPerfil() { return profesionPerfil; }
    public void setProfesionPerfil(String profesionPerfil) { this.profesionPerfil = profesionPerfil; }

    public String getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(String fechaRegistro) { this.fechaRegistro = fechaRegistro; }

    public Boolean getAutorizadoParaEjercer() { return autorizadoParaEjercer; }
    public void setAutorizadoParaEjercer(Boolean autorizadoParaEjercer) { this.autorizadoParaEjercer = autorizadoParaEjercer; }

    public String getSanciones() { return sanciones; }
    public void setSanciones(String sanciones) { this.sanciones = sanciones; }
}