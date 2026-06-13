package com.organdonation.authservice;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

/**
 * Cliente HTTP para el microservicio RETHUS (FastAPI).
 *
 * <p>Encapsula las llamadas al servicio externo de validación de médicos
 * contra el registro RETHUS de SISPRO. Expone los dos pasos del flujo:
 * iniciar sesión (obtener captcha) y validar (enviar documento + captcha).
 *
 * @author Ceamerap
 * @task PDDO-57
 */
@Component
public class RethusClient {

    private final RestTemplate restTemplate;
    private final String baseUrl;

    public RethusClient(RestTemplate restTemplate,
                        @Value("${rethus.api.url}") String baseUrl) {
        this.restTemplate = restTemplate;
        this.baseUrl = baseUrl;
    }

    /**
     * Paso 1: inicia una sesión de validación en RETHUS.
     *
     * @return sessionId, imagen del captcha en base64 y tiempo de expiración
     */
    public IniciarValidacionResponse iniciarValidacion() {
        String url = baseUrl + "/validar-medico/iniciar";
        return restTemplate.postForObject(url, null, IniciarValidacionResponse.class);
    }

    /**
     * Paso 2: envía los datos del médico y el captcha resuelto para validar
     * contra el registro RETHUS.
     *
     * @param request datos del médico, session_id y captcha resuelto
     * @return resultado de la validación (encontrado, estado, datos, mensaje)
     */
    public ValidarMedicoResponseDTO validarMedico(ValidarMedicoRequestDTO request) {
        String url = baseUrl + "/validar-medico";
        return restTemplate.postForObject(url, request, ValidarMedicoResponseDTO.class);
    }
}