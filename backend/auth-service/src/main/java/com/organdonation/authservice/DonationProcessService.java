package com.organdonation.authservice;

import org.springframework.stereotype.Service;
import java.util.List;

/**
 * Capa de servicio para la gestión y seguimiento de procesos de donación.
 *
 * <p>Responsabilidades:
 * <ul>
 *   <li>Crear nuevos procesos de donación</li>
 *   <li>Actualizar el estado del proceso y registrar el historial</li>
 *   <li>Consultar procesos por donante o receptor</li>
 * </ul>
 *
 * @author Ceamerap
 * @task PDDO-92
 */
@Service
public class DonationProcessService {

    private final DonationProcessRepository processRepository;
    private final ProcessStatusHistoryRepository historyRepository;
    private final DonorRepository donorRepository;
    private final RecipientRepository recipientRepository;
    private final UserRepository userRepository;

    public DonationProcessService(
            DonationProcessRepository processRepository,
            ProcessStatusHistoryRepository historyRepository,
            DonorRepository donorRepository,
            RecipientRepository recipientRepository,
            UserRepository userRepository) {
        this.processRepository = processRepository;
        this.historyRepository = historyRepository;
        this.donorRepository = donorRepository;
        this.recipientRepository = recipientRepository;
        this.userRepository = userRepository;
    }

    /**
     * Crea un nuevo proceso de donación.
     *
     * @param dto datos de entrada del proceso
     * @return proceso creado como {@link DonationProcessResponseDTO}
     */
    public DonationProcessResponseDTO crear(DonationProcessRequestDTO dto) {
        Donor donor = donorRepository.findById(dto.getDonorId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se encontró el donante con id: " + dto.getDonorId()));

        Recipient recipient = recipientRepository.findById(dto.getRecipientId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se encontró el receptor con id: " + dto.getRecipientId()));

        User openedBy = userRepository.findById(dto.getOpenedById())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se encontró el usuario con id: " + dto.getOpenedById()));

        DonationProcess process = new DonationProcess(donor, recipient, openedBy);
        DonationProcess saved = processRepository.save(process);

        historyRepository.save(new ProcessStatusHistory(
                saved, null, "REGISTRADO",
                "Apertura del proceso de donación.", openedBy));

        return DonationProcessResponseDTO.from(saved);
    }

    /**
     * Actualiza el estado de un proceso de donación y registra el cambio
     * en el historial.
     *
     * @param id  id del proceso
     * @param dto datos del nuevo estado
     * @return proceso actualizado como {@link DonationProcessResponseDTO}
     */
    public DonationProcessResponseDTO actualizarEstado(Long id,
                                                       UpdateProcessStateRequestDTO dto) {
        DonationProcess process = processRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se encontró el proceso con id: " + id));

        User changedBy = userRepository.findById(dto.getChangedById())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se encontró el usuario con id: " + dto.getChangedById()));

        String estadoAnterior = process.getCurrentState();
        process.actualizarEstado(dto.getNewState());
        processRepository.save(process);

        historyRepository.save(new ProcessStatusHistory(
                process, estadoAnterior, dto.getNewState(),
                dto.getClinicalObservation(), changedBy));

        return DonationProcessResponseDTO.from(process);
    }

    /**
     * Obtiene un proceso de donación por su id.
     *
     * @param id id del proceso
     * @return proceso como {@link DonationProcessResponseDTO}
     */
    public DonationProcessResponseDTO obtener(Long id) {
        return processRepository.findById(id)
                .map(DonationProcessResponseDTO::from)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se encontró el proceso con id: " + id));
    }
    /**
     * Obtiene todos los procesos de donación de un donante.
     *
     * @param donorId id del donante
     * @return lista de procesos como {@link DonationProcessResponseDTO}
     * @task PDDO-93
     */
    public List<DonationProcessResponseDTO> listarPorDonante(Long donorId) {
        donorRepository.findById(donorId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se encontró el donante con id: " + donorId));
        return processRepository.findByDonorId(donorId)
                .stream()
                .map(DonationProcessResponseDTO::from)
                .toList();
    }

    /**
     * Obtiene todos los procesos de donación de un receptor.
     *
     * @param recipientId id del receptor
     * @return lista de procesos como {@link DonationProcessResponseDTO}
     * @task PDDO-93
     */
    public List<DonationProcessResponseDTO> listarPorReceptor(Long recipientId) {
        recipientRepository.findById(recipientId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se encontró el receptor con id: " + recipientId));
        return processRepository.findByRecipientId(recipientId)
                .stream()
                .map(DonationProcessResponseDTO::from)
                .toList();
    }

    /**
     * Obtiene el historial de cambios de estado de un proceso de donación.
     *
     * @param processId id del proceso
     * @return lista de cambios de estado en orden cronológico
     * @task PDDO-93
     */
    public List<ProcessStatusHistoryResponseDTO> obtenerHistorial(Long processId) {
        processRepository.findById(processId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se encontró el proceso con id: " + processId));
        return historyRepository.findByProcessIdOrderByChangedAtAsc(processId)
                .stream()
                .map(ProcessStatusHistoryResponseDTO::from)
                .toList();
    }
}