package com.organdonation.authservice;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Capa de servicio para la gestión de perfiles de profesionales de salud (médicos).
 */
@Service
public class MedicoService {
    private final MedicalProfessionalProfileRepository repository;
    private final UserRepository userRepository;
    private final RethusClient rethusClient;
    private final PasswordEncoder passwordEncoder;

    public MedicoService(MedicalProfessionalProfileRepository repository,
                         UserRepository userRepository,
                         RethusClient rethusClient,
                         PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.userRepository = userRepository;
        this.rethusClient = rethusClient;
        this.passwordEncoder = passwordEncoder;
    }

    /** Listado paginado de médicos, con filtro opcional de texto libre {@code q}. */
    public Page<MedicoResponseDTO> listar(String q, Pageable pageable) {
        Page<MedicalProfessionalProfile> page;
        if (q == null || q.isBlank()) {
            page = repository.findAll(pageable);
        } else {
            page = repository.buscar(q.trim(), pageable);
        }
        return page.map(MedicoResponseDTO::from);
    }

    /** Detalle de un médico por id de perfil. */
    public MedicoResponseDTO obtener(Long id) {
        return repository.findById(id)
                .map(MedicoResponseDTO::from)
                .orElseThrow(() ->
                        new ResourceNotFoundException("No se encontró un médico con id " + id));
    }

    /**
     * Registra un nuevo profesional de salud en el sistema.
     * Encripta la contraseña antes de guardarla.
     */
    public MedicoResponseDTO crear(MedicoRequestDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("El correo ya está registrado");
        }

        if (repository.existsByDocumentNumber(dto.getDocumentNumber())) {
            throw new RuntimeException("El numero de documento ya esta registrado");
        }

        User user = new User();
        user.setEmail(dto.getEmail());
        // CORRECCIÓN: Contraseña encriptada
        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
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

    /** Valida un médico contra RETHUS. */
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

    /** Sube y almacena el certificado de un médico. */
    public FileUploadResponseDTO subirCertificado(Long id, MultipartFile file) {
        MedicalProfessionalProfile profile = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se encontró un médico con id " + id));

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("El archivo no puede estar vacío");
        }

        String contentType = file.getContentType();
        List<String> formatosPermitidos = List.of(
                "application/pdf", "image/jpeg", "image/png");
        if (contentType == null || !formatosPermitidos.contains(contentType)) {
            throw new RuntimeException("Formato no permitido. Use PDF, JPG o PNG");
        }

        long maxBytes = 5 * 1024 * 1024;
        if (file.getSize() > maxBytes) {
            throw new RuntimeException("El archivo supera el tamaño máximo permitido de 5 MB");
        }

        try {
            Path carpeta = Paths.get("uploads/certificados");
            Files.createDirectories(carpeta);

            String extension = contentType.equals("application/pdf") ? ".pdf"
                    : contentType.equals("image/jpeg") ? ".jpg" : ".png";
            String nombreArchivo = "medico_" + id + "_" + UUID.randomUUID() + extension;

            Path rutaCompleta = carpeta.resolve(nombreArchivo);
            Files.write(rutaCompleta, file.getBytes());

            String rutaRelativa = "uploads/certificados/" + nombreArchivo;
            profile.actualizarCertificado(rutaRelativa);
            repository.save(profile);

            return new FileUploadResponseDTO(
                    "Certificado subido exitosamente", rutaRelativa);

        } catch (IOException e) {
            throw new RuntimeException("Error al guardar el archivo: " + e.getMessage());
        }
    }
}
