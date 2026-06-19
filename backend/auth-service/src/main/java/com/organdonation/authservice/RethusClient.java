package com.organdonation.authservice;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
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

    public IniciarValidacionResponse iniciarValidacion() {
        try {
            String url = baseUrl + "/validar-medico/iniciar";
            return restTemplate.postForObject(url, null, IniciarValidacionResponse.class);
        } catch (ResourceAccessException ex) {
            throw new ExternalServiceException("RETHUS",
                    "No se pudo conectar con el microservicio RETHUS", ex);
        } catch (RestClientException ex) {
            throw new ExternalServiceException("RETHUS",
                    "Error al iniciar la sesión de validación RETHUS: " + ex.getMessage(), ex);
        }
    }

    public ValidarMedicoResponseDTO validarMedico(ValidarMedicoRequestDTO request) {
        try {
            String url = baseUrl + "/validar-medico";
            return restTemplate.postForObject(url, request, ValidarMedicoResponseDTO.class);
        } catch (ResourceAccessException ex) {
            throw new ExternalServiceException("RETHUS",
                    "No se pudo conectar con el microservicio RETHUS", ex);
        } catch (RestClientException ex) {
            throw new ExternalServiceException("RETHUS",
                    "Error al validar el médico en RETHUS: " + ex.getMessage(), ex);
        }
    }
}