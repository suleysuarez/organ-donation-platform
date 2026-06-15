package com.organdonation.authservice;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Respuesta del paso 1 de validación RETHUS.
 *
 * <p>Mapea la respuesta de POST /validar-medico/iniciar del microservicio
 * RETHUS (FastAPI). Contiene el identificador de sesión y el captcha que
 * el usuario debe resolver.
 *
 * @author Ceamerap
 * @task PDDO-57
 */
public class IniciarValidacionResponse {

    @JsonProperty("session_id")
    private String sessionId;

    @JsonProperty("captcha_imagen_base64")
    private String captchaImagenBase64;

    @JsonProperty("expira_en_segundos")
    private int expiraEnSegundos;

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public String getCaptchaImagenBase64() { return captchaImagenBase64; }
    public void setCaptchaImagenBase64(String captchaImagenBase64) { this.captchaImagenBase64 = captchaImagenBase64; }

    public int getExpiraEnSegundos() { return expiraEnSegundos; }
    public void setExpiraEnSegundos(int expiraEnSegundos) { this.expiraEnSegundos = expiraEnSegundos; }
}