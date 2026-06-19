package com.organdonation.authservice;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Pruebas unitarias para el cliente HTTP de RETHUS.
 *
 * @author Ceamerap
 * @task PDDO-114
 */
@ExtendWith(MockitoExtension.class)
class RethusClientTest {

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private RethusClient rethusClient;

    @BeforeEach
    void setUp() {
        rethusClient = new RethusClient(restTemplate, "http://localhost:8000");
    }

    @Test
    void iniciarValidacion_devuelveRespuestaExitosa() {
        IniciarValidacionResponse mockResponse = new IniciarValidacionResponse();
        mockResponse.setSessionId("session-123");
        mockResponse.setCaptchaImagenBase64("base64data");
        mockResponse.setExpiraEnSegundos(180);

        when(restTemplate.postForObject(
                eq("http://localhost:8000/validar-medico/iniciar"),
                isNull(),
                eq(IniciarValidacionResponse.class)))
                .thenReturn(mockResponse);

        IniciarValidacionResponse result = rethusClient.iniciarValidacion();

        assertNotNull(result);
        assertEquals("session-123", result.getSessionId());
        assertEquals(180, result.getExpiraEnSegundos());
    }

    @Test
    void iniciarValidacion_cuandoServicioCaido_lanzaExternalServiceException() {
        when(restTemplate.postForObject(anyString(), isNull(), eq(IniciarValidacionResponse.class)))
                .thenThrow(new ResourceAccessException("Connection refused"));

        ExternalServiceException ex = assertThrows(ExternalServiceException.class,
                () -> rethusClient.iniciarValidacion());

        assertEquals("RETHUS", ex.getServicio());
        assertTrue(ex.getMessage().contains("No se pudo conectar"));
    }

    @Test
    void validarMedico_devuelveResultadoAutorizado() {
        ValidarMedicoRequestDTO request = new ValidarMedicoRequestDTO();
        request.setSessionId("session-123");
        request.setTipoDocumento("CC");
        request.setNumeroDocumento("123456789");
        request.setCaptchaTexto("abc123");

        ValidarMedicoResponseDTO mockResponse = new ValidarMedicoResponseDTO();
        mockResponse.setEncontrado(true);
        mockResponse.setEstado("AUTORIZADO");
        mockResponse.setMensaje("Médico autorizado para ejercer");

        when(restTemplate.postForObject(
                eq("http://localhost:8000/validar-medico"),
                eq(request),
                eq(ValidarMedicoResponseDTO.class)))
                .thenReturn(mockResponse);

        ValidarMedicoResponseDTO result = rethusClient.validarMedico(request);

        assertNotNull(result);
        assertTrue(result.isEncontrado());
        assertEquals("AUTORIZADO", result.getEstado());
    }

    @Test
    void validarMedico_cuandoServicioCaido_lanzaExternalServiceException() {
        ValidarMedicoRequestDTO request = new ValidarMedicoRequestDTO();
        request.setSessionId("session-123");
        request.setTipoDocumento("CC");
        request.setNumeroDocumento("123456789");
        request.setCaptchaTexto("abc123");

        when(restTemplate.postForObject(anyString(), any(), eq(ValidarMedicoResponseDTO.class)))
                .thenThrow(new ResourceAccessException("Connection refused"));

        ExternalServiceException ex = assertThrows(ExternalServiceException.class,
                () -> rethusClient.validarMedico(request));

        assertEquals("RETHUS", ex.getServicio());
    }
}