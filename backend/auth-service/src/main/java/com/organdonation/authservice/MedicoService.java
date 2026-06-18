package com.organdonation.authservice;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

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
    /**
     * Sube y almacena el certificado de un médico en el servidor local.
     *
     * <p>Valida formato (PDF, JPG, PNG) y tamaño máximo (5 MB).
     * Guarda el archivo en la carpeta {@code uploads/certificados/} y
     * actualiza {@code certificate_file_path} en el perfil.
     *
     * @param id   id del perfil del médico
     * @param file archivo a subir
     * @return ruta relativa del archivo guardado
     * @task PDDO-86, PDDO-87, PDDO-88
     */
    public FileUploadResponseDTO subirCertificado(Long id, MultipartFile file) {
        // PDDO-87: validar que el médico existe
        MedicalProfessionalProfile profile = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se encontró un médico con id " + id));

        // PDDO-87: validar que el archivo no está vacío
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("El archivo no puede estar vacío");
        }

        // PDDO-87: validar formato permitido
        String contentType = file.getContentType();
        List<String> formatosPermitidos = List.of(
                "application/pdf", "image/jpeg", "image/png");
        if (contentType == null || !formatosPermitidos.contains(contentType)) {
            throw new RuntimeException(
                    "Formato no permitido. Use PDF, JPG o PNG");
        }

        // PDDO-87: validar tamaño máximo (5 MB)
        long maxBytes = 5 * 1024 * 1024;
        if (file.getSize() > maxBytes) {
            throw new RuntimeException(
                    "El archivo supera el tamaño máximo permitido de 5 MB");
        }

        try {
            // PDDO-86: crear carpeta si no existe
            Path carpeta = Paths.get("uploads/certificados");
            Files.createDirectories(carpeta);

            // PDDO-86: generar nombre único para evitar colisiones
            String extension = contentType.equals("application/pdf") ? ".pdf"
                    : contentType.equals("image/jpeg") ? ".jpg" : ".png";
            String nombreArchivo = "medico_" + id + "_" + UUID.randomUUID() + extension;

            // PDDO-86: guardar archivo en disco
            Path rutaCompleta = carpeta.resolve(nombreArchivo);
            Files.write(rutaCompleta, file.getBytes());

            // PDDO-88: asociar ruta al perfil del médico
            String rutaRelativa = "uploads/certificados/" + nombreArchivo;
            profile.actualizarCertificado(rutaRelativa);
            repository.save(profile);

            return new FileUploadResponseDTO(
                    "Certificado subido exitosamente", rutaRelativa);

        } catch (IOException e) {
            throw new RuntimeException(
                    "Error al guardar el archivo: " + e.getMessage());
        }
    }
}
