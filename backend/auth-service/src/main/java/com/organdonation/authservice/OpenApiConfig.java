package com.organdonation.authservice;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Metadatos de la documentación OpenAPI (título/descripción mostrados en /docs). */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI authServiceOpenAPI() {
        return new OpenAPI().info(new Info()
                .title("Auth Service API")
                .description("Servicio de autenticación, usuarios y médicos — "
                        + "Plataforma de Gestión de Donación de Órganos.")
                .version("v1"));
    }
}
