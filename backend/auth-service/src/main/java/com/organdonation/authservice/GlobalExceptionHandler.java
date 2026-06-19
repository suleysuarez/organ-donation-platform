package com.organdonation.authservice;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {
        List<String> errores = new ArrayList<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errores.add(error.getDefaultMessage());
        }
        return ResponseEntity.badRequest().body(Map.of("errores", errores));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntime(RuntimeException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }
    /**
     * Maneja errores de comunicación con el microservicio RETHUS u otros
     * servicios externos.
     *
     * @task PDDO-100
     */
    @ExceptionHandler(ExternalServiceException.class)
    public ResponseEntity<?> handleExternalService(ExternalServiceException ex) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(Map.of(
                "error", "Error en servicio externo: " + ex.getServicio(),
                "detalle", ex.getMessage()
        ));
    }

    /**
     * Maneja errores de red al intentar conectar con un servicio externo
     * (ej. FastAPI caído o inaccesible).
     *
     * @task PDDO-100
     */
    @ExceptionHandler(ResourceAccessException.class)
    public ResponseEntity<?> handleConnectionError(ResourceAccessException ex) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                "error", "Servicio externo no disponible",
                "detalle", "No se pudo establecer conexión con el microservicio. Intente más tarde."
        ));
    }

    /**
     * Maneja errores generales del cliente REST al consumir servicios externos.
     *
     * @task PDDO-100
     */
    @ExceptionHandler(RestClientException.class)
    public ResponseEntity<?> handleRestClient(RestClientException ex) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(Map.of(
                "error", "Error al comunicarse con servicio externo",
                "detalle", ex.getMessage()
        ));
    }
}