package com.organdonation.authservice;

/**
 * Respuesta tras la subida exitosa de un certificado médico.
 *
 * @author Ceamerap
 * @task PDDO-86
 */
public class FileUploadResponseDTO {

    private String mensaje;
    private String rutaArchivo;

    public FileUploadResponseDTO(String mensaje, String rutaArchivo) {
        this.mensaje = mensaje;
        this.rutaArchivo = rutaArchivo;
    }

    public String getMensaje() { return mensaje; }
    public String getRutaArchivo() { return rutaArchivo; }
}