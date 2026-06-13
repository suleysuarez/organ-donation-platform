package com.organdonation.authservice;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

/**
 * Capa de servicio para la gestión de perfiles de profesionales de salud (médicos).
 *
 * <p>Contiene la lógica de negocio para listar, consultar y crear registros de
 * {@link MedicalProfessionalProfile}, incluyendo la creación de la cuenta
 * {@link User} asociada.
 *
 * <p>Responsabilidades:
 * <ul>
 *   <li>Validar que el correo no esté registrado antes de crear un médico</li>
 *   <li>Persistir un nuevo {@link User} con rol MEDICO</li>
 *   <li>Persistir el {@link MedicalProfessionalProfile} asociado al usuario</li>
 *   <li>Retornar listados paginados con filtro opcional por nombre o documento</li>
 * </ul>
 *
 * @author Ceamerap
 * @task PDDO-27, PDDO-49
 */
@Service
public class MedicoService {
    private final MedicalProfessionalProfileRepository repository;
    private final UserRepository userRepository;
    private final RethusClient rethusClient;

    public MedicoService(MedicalProfessionalProfileRepository repository,
                         UserRepository userRepository,
                         RethusClient rethusClient) {
        this.repository = repository;
        this.userRepository = userRepository;
        this.rethusClient = rethusClient;
    }

    /** Listado paginado de médicos, con filtro opcional de texto libre {@code q}. */
    public Page<MedicoResponseDTO> listar(String q, Pageable pageable) {
        Page<MedicalProfessionalProfile> page;
        if (q == null || q.isBlank()) {
            // Sin filtro: evitamos enlazar un parámetro null (Postgres no infiere el tipo).
            page = repository.findAll(pageable);
        } else {
            page = repository.buscar(q.trim(), pageable);
        }
        return page.map(MedicoResponseDTO::from);
    }

    /** Detalle de un médico por id de perfil. Lanza 404 si no existe. */
    public MedicoResponseDTO obtener(Long id) {
        return repository.findById(id)
                .map(MedicoResponseDTO::from)
                .orElseThrow(() ->
                        new ResourceNotFoundException("No se encontró un médico con id " + id));
    }
    /**
     * Registra un nuevo profesional de salud en el sistema.
     *
     * <p>Crea primero la cuenta {@link User} con rol MEDICO y luego
     * el {@link MedicalProfessionalProfile} asociado.
     *
     * @param dto datos de entrada del médico a registrar
     * @return perfil creado como {@link MedicoResponseDTO}
     * @throws RuntimeException si el correo ya está registrado
     */
    public MedicoResponseDTO crear(MedicoRequestDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("El correo ya está registrado");
        }

        User user = new User();
        user.setEmail(dto.getEmail());
        user.setPasswordHash(dto.getPassword());
        user.setRole("MEDICO");
        User savedUser = userRepository.save(user);

        MedicalProfessionalProfile profile = new MedicalProfessionalProfile(
                savedUser,
                dto.getFullName(),
                dto.getDocumentType(),
                dto.getDocumentNumber(),
                dto.getRethusRegistrationNumber(),
                dto.getProfessionalProfile()
        );

        MedicalProfessionalProfile saved = repository.save(profile);
        return MedicoResponseDTO.from(saved);
    }
    /**
     * Valida un médico contra RETHUS y actualiza su estado de verificación
     * según el resultado.
     *
     * @param id id del perfil del médico
     * @param request datos de validación (session_id, captcha, etc.)
     * @return resultado de la validación y nuevo estado de verificación
     */
    public RethusValidationResultDTO validarConRethus(Long id, ValidarMedicoRequestDTO request) {
        MedicalProfessionalProfile profile = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró un médico con id " + id));

        ValidarMedicoResponseDTO resultado = rethusClient.validarMedico(request);

        String nuevoEstado = switch (resultado.getEstado()) {
            case "AUTORIZADO" -> "VERIFICADO";
            case "NO_ENCONTRADO" -> "RECHAZADO";
            default -> profile.getVerificationStatus();
        };

        if (!nuevoEstado.equals(profile.getVerificationStatus())) {
            profile.marcarVerificacion(nuevoEstado, null);
            repository.save(profile);
        }

        return new RethusValidationResultDTO(
                resultado.isEncontrado(),
                resultado.getEstado(),
                resultado.getMensaje(),
                profile.getVerificationStatus()
        );
    }
}
