package com.organdonation.authservice;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Cuerpo de la petición del paso 2 de validación RETHUS.
 *
 * <p>Se envía a POST /validar-medico junto con el session_id obtenido en
 * el paso 1 y el texto del captcha resuelto por el usuario.
 *
 * @author Ceamerap
 * @task PDDO-57
 */
public class ValidarMedicoRequestDTO {

    @JsonProperty("session_id")
    private String sessionId;

    @JsonProperty("tipo_documento")
    private String tipoDocumento;

    @JsonProperty("numero_documento")
    private String numeroDocumento;

    @JsonProperty("primer_nombre")
    private String primerNombre;

    @JsonProperty("primer_apellido")
    private String primerApellido;

    @JsonProperty("captcha_texto")
    private String captchaTexto;

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public String getTipoDocumento() { return tipoDocumento; }
    public void setTipoDocumento(String tipoDocumento) { this.tipoDocumento = tipoDocumento; }

    public String getNumeroDocumento() { return numeroDocumento; }
    public void setNumeroDocumento(String numeroDocumento) { this.numeroDocumento = numeroDocumento; }

    public String getPrimerNombre() { return primerNombre; }
    public void setPrimerNombre(String primerNombre) { this.primerNombre = primerNombre; }

    public String getPrimerApellido() { return primerApellido; }
    public void setPrimerApellido(String primerApellido) { this.primerApellido = primerApellido; }

    public String getCaptchaTexto() { return captchaTexto; }
    public void setCaptchaTexto(String captchaTexto) { this.captchaTexto = captchaTexto; }
}
