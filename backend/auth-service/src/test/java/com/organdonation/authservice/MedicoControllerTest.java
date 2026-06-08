package com.organdonation.authservice;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(MedicoController.class)
@AutoConfigureMockMvc(addFilters = false)  // sin filtros de seguridad en el slice de test
class MedicoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MedicoService medicoService;

    @TestConfiguration
    static class MockConfig {
        @Bean
        MedicoService medicoService() {
            return Mockito.mock(MedicoService.class);
        }
    }

    private MedicoResponseDTO carla() {
        MedicalProfessionalProfile p = Mockito.mock(MedicalProfessionalProfile.class);
        when(p.getId()).thenReturn(1L);
        when(p.getFullName()).thenReturn("Carla Restrepo Gómez");
        when(p.getDocumentType()).thenReturn("CC");
        when(p.getDocumentNumber()).thenReturn("1010101010");
        when(p.getVerificationStatus()).thenReturn("VERIFICADO");
        return MedicoResponseDTO.from(p);
    }

    @Test
    void listar_devuelvePaginaConContenido() throws Exception {
        Page<MedicoResponseDTO> page =
                new PageImpl<>(List.of(carla()), PageRequest.of(0, 20), 1);
        when(medicoService.listar(any(), any())).thenReturn(page);

        mockMvc.perform(get("/api/medicos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].fullName").value("Carla Restrepo Gómez"))
                .andExpect(jsonPath("$.content[0].verificationStatus").value("VERIFICADO"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    void listar_pasaFiltroQ() throws Exception {
        Page<MedicoResponseDTO> page =
                new PageImpl<>(List.of(carla()), PageRequest.of(0, 20), 1);
        when(medicoService.listar(eq("carla"), any())).thenReturn(page);

        mockMvc.perform(get("/api/medicos").param("q", "carla"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].documentNumber").value("1010101010"));
    }

    @Test
    void obtener_inexistente_devuelve404() throws Exception {
        when(medicoService.obtener(eq(999L)))
                .thenThrow(new ResourceNotFoundException("No se encontró un médico con id 999"));

        mockMvc.perform(get("/api/medicos/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").exists());
    }
}
