package com.organdonation.authservice;

import org.springframework.stereotype.Service;

/**
 * Capa de servicio para la gestión de donantes de órganos.
 *
 * <p>Responsabilidades:
 * <ul>
 *   <li>Validar que el documento no esté registrado</li>
 *   <li>Buscar el médico registrador por id</li>
 *   <li>Persistir el nuevo donante</li>
 * </ul>
 *
 * @author Ceamerap
 * @task PDDO-91
 */
@Service
public class DonorService {

    private final DonorRepository donorRepository;
    private final UserRepository userRepository;

    public DonorService(DonorRepository donorRepository,
                        UserRepository userRepository) {
        this.donorRepository = donorRepository;
        this.userRepository = userRepository;
    }

    /**
     * Registra un nuevo donante en el sistema.
     *
     * @param dto datos de entrada del donante
     * @return donante creado como {@link DonorResponseDTO}
     */
    public DonorResponseDTO crear(DonorRequestDTO dto) {
        if (donorRepository.existsByDocumentNumber(dto.getDocumentNumber())) {
            throw new RuntimeException("Ya existe un donante con ese número de documento");
        }

        User registeredBy = userRepository.findById(dto.getRegisteredById())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se encontró el usuario registrador con id: " + dto.getRegisteredById()));

        Donor donor = new Donor(
                registeredBy,
                dto.getDocumentType(),
                dto.getDocumentNumber(),
                dto.getFullName(),
                dto.getBirthDate(),
                dto.getSex(),
                dto.getBloodType(),
                dto.getContactPhone(),
                dto.getContactEmail(),
                dto.getAddress(),
                dto.getMedicalNotes()
        );

        return DonorResponseDTO.from(donorRepository.save(donor));
    }

    /**
     * Obtiene un donante por su id.
     *
     * @param id id del donante
     * @return donante como {@link DonorResponseDTO}
     */
    public DonorResponseDTO obtener(Long id) {
        return donorRepository.findById(id)
                .map(DonorResponseDTO::from)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se encontró un donante con id: " + id));
    }
}