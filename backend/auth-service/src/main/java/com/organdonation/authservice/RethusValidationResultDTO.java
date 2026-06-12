package com.organdonation.authservice;

/**
 * Resultado de la validación RETHUS asociado a un médico.
 *
 * <p>Combina la respuesta del microservicio RETHUS con el nuevo estado
 * de verificación persistido en el perfil.
 *
 * @author Ceamerap
 * @task PDDO-58
 */
public class RethusValidationResultDTO {

    private boolean encontrado;
    private String estadoRethus;
    private String mensaje;
    private String verificationStatus;

    public RethusValidationResultDTO(boolean encontrado, String estadoRethus,
                                     String mensaje, String verificationStatus) {
        this.encontrado = encontrado;
        this.estadoRethus = estadoRethus;
        this.mensaje = mensaje;
        this.verificationStatus = verificationStatus;
    }

    public boolean isEncontrado() { return encontrado; }
    public String getEstadoRethus() { return estadoRethus; }
    public String getMensaje() { return mensaje; }
    public String getVerificationStatus() { return verificationStatus; }
}