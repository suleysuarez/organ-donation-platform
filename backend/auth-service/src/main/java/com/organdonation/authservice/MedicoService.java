package com.organdonation.authservice;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class MedicoService {

    private final MedicalProfessionalProfileRepository repository;
    private final UserRepository userRepository;

    public MedicoService(MedicalProfessionalProfileRepository repository,
                         UserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
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
}
