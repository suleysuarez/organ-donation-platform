package com.organdonation.authservice;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

/**
 * Capa de servicio para la gestión de receptores de órganos.
 *
 * <p>Responsabilidades:
 * <ul>
 * <li>Validar que el documento no esté registrado</li>
 * <li>Buscar el médico registrador por id</li>
 * <li>Persistir el nuevo receptor</li>
 * <li>Listar receptores con paginación y búsqueda</li>
 * </ul>
 *
 * @author Ceamerap
 * @task PDDO-91
 */
@Service
public class RecipientService {

    private final RecipientRepository recipientRepository;
    private final UserRepository userRepository;

    public RecipientService(RecipientRepository recipientRepository,
                            UserRepository userRepository) {
        this.recipientRepository = recipientRepository;
        this.userRepository = userRepository;
    }

    /**
     * Lista los receptores de forma paginada con filtro opcional.
     */
    public Page<RecipientResponseDTO> listar(String q, Pageable pageable) {
        Page<Recipient> page;
        if (q == null || q.isBlank()) {
            page = recipientRepository.findAll(pageable);
        } else {
            page = recipientRepository.buscar(q.trim(), pageable);
        }
        return page.map(RecipientResponseDTO::from);
    }

    /**
     * Registra un nuevo receptor en el sistema.
     *
     * @param dto datos de entrada del receptor
     * @return receptor creado como {@link RecipientResponseDTO}
     */
    public RecipientResponseDTO crear(RecipientRequestDTO dto) {
        if (recipientRepository.existsByDocumentNumber(dto.getDocumentNumber())) {
            throw new RuntimeException("Ya existe un receptor con ese número de documento");
        }

        User registeredBy = userRepository.findById(dto.getRegisteredById())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se encontró el usuario registrador con id: " + dto.getRegisteredById()));

        Recipient recipient = new Recipient(
                registeredBy,
                dto.getDocumentType(),
                dto.getDocumentNumber(),
                dto.getFullName(),
                dto.getBirthDate(),
                dto.getSex(),
                dto.getBloodType(),
                dto.getOrganNeeded(),
                dto.getUrgencyLevel(),
                dto.getContactPhone(),
                dto.getContactEmail()
        );

        return RecipientResponseDTO.from(recipientRepository.save(recipient));
    }

    /**
     * Obtiene un receptor por su id.
     *
     * @param id id del receptor
     * @return receptor como {@link RecipientResponseDTO}
     */
    public RecipientResponseDTO obtener(Long id) {
        return recipientRepository.findById(id)
                .map(RecipientResponseDTO::from)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se encontró un receptor con id: " + id));
    }
}