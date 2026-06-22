package com.organdonation.authservice;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.criteria.Predicate;

@RestController
@RequestMapping("/api/reportes")
public class MedicalReportController {

    private final MedicalReportRepository reportRepository;
    private final UserRepository userRepository;
    private final RecipientRepository recipientRepository;

    public MedicalReportController(MedicalReportRepository reportRepository,
                                   UserRepository userRepository,
                                   RecipientRepository recipientRepository) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.recipientRepository = recipientRepository;
    }

    @GetMapping
    public ResponseEntity<List<MedicalReportResponseDTO>> listarReportes(
            @RequestParam(required = false) Long recipientId,
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) LocalDate fechaDesde,
            @RequestParam(required = false) LocalDate fechaHasta) {

        Specification<MedicalReport> spec = (root, query, cb) -> cb.conjunction();

        if (recipientId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("recipient").get("id"), recipientId));
        }
        if (doctorId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("doctor").get("id"), doctorId));
        }
        if (status != null && !status.isEmpty()) {
            MedicalReport.ReportStatus reportStatus = MedicalReport.ReportStatus.valueOf(status.toUpperCase());
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), reportStatus));
        }
        if (fechaDesde != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("reportDate"), fechaDesde));
        }
        if (fechaHasta != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("reportDate"), fechaHasta));
        }

        List<MedicalReport> reports = reportRepository.findAll(spec);
        List<MedicalReportResponseDTO> response = reports.stream()
                .map(MedicalReportResponseDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerReporte(@PathVariable Long id) {
        Optional<MedicalReport> reportOpt = reportRepository.findById(id);
        if (reportOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(new MedicalReportResponseDTO(reportOpt.get()));
    }

    @PostMapping
    public ResponseEntity<?> crearReporte(@Valid @RequestBody MedicalReportRequestDTO dto) {
        Optional<Recipient> recipientOpt = recipientRepository.findById(dto.getRecipientId());
        if (recipientOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("El receptor no existe");
        }

        Optional<User> doctorOpt = userRepository.findById(dto.getDoctorId());
        if (doctorOpt.isEmpty() || !"MEDICO".equals(doctorOpt.get().getRole())) {
            return ResponseEntity.badRequest().body("El doctor no existe o no tiene rol MEDICO");
        }

        if (dto.getReportDate().isAfter(LocalDate.now())) {
            return ResponseEntity.badRequest().body("La fecha del reporte no puede ser futura");
        }

        MedicalReport report = new MedicalReport();
        report.setRecipient(recipientOpt.get());
        report.setDoctor(doctorOpt.get());
        report.setDescription(dto.getDescription());
        report.setDiagnosis(dto.getDiagnosis());
        report.setReportDate(dto.getReportDate());
        report.setStatus(MedicalReport.ReportStatus.valueOf(dto.getStatus().toUpperCase()));

        reportRepository.save(report);
        return ResponseEntity.ok(new MedicalReportResponseDTO(report));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarReporte(@PathVariable Long id,
                                               @Valid @RequestBody MedicalReportRequestDTO dto) {
        Optional<MedicalReport> reportOpt = reportRepository.findById(id);
        if (reportOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        MedicalReport report = reportOpt.get();

        Optional<Recipient> recipientOpt = recipientRepository.findById(dto.getRecipientId());
        if (recipientOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("El receptor no existe");
        }
        report.setRecipient(recipientOpt.get());

        Optional<User> doctorOpt = userRepository.findById(dto.getDoctorId());
        if (doctorOpt.isEmpty() || !"MEDICO".equals(doctorOpt.get().getRole())) {
            return ResponseEntity.badRequest().body("El doctor no existe o no tiene rol MEDICO");
        }
        report.setDoctor(doctorOpt.get());

        if (dto.getReportDate().isAfter(LocalDate.now())) {
            return ResponseEntity.badRequest().body("La fecha del reporte no puede ser futura");
        }

        report.setDescription(dto.getDescription());
        report.setDiagnosis(dto.getDiagnosis());
        report.setReportDate(dto.getReportDate());
        report.setStatus(MedicalReport.ReportStatus.valueOf(dto.getStatus().toUpperCase()));
        report.setUpdatedAt(java.time.LocalDateTime.now());

        reportRepository.save(report);
        return ResponseEntity.ok(new MedicalReportResponseDTO(report));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarReporte(@PathVariable Long id) {
        if (!reportRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        reportRepository.deleteById(id);
        return ResponseEntity.ok("Reporte eliminado exitosamente");
    }
    // ========== CONSULTA DE HISTORIAL CLÍNICO DE UN RECEPTOR ==========
    @GetMapping("/historial/{recipientId}")
    public ResponseEntity<?> historialPaciente(
            @PathVariable Long recipientId,
            @RequestParam(required = false) LocalDate fechaDesde,
            @RequestParam(required = false) LocalDate fechaHasta,
            @RequestParam(required = false) String status) {

        // Validar que el receptor existe
        Optional<Recipient> recipientOpt = recipientRepository.findById(recipientId);
        if (recipientOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("El receptor no existe");
        }

        // Convertir estado a enum, de forma que sea efectivamente final para la lambda
        final MedicalReport.ReportStatus reportStatus = (status != null && !status.isEmpty())
                ? MedicalReport.ReportStatus.valueOf(status.toUpperCase())
                : null;

        List<MedicalReport> reportes;

        if (fechaDesde != null && fechaHasta != null) {
            if (reportStatus != null) {
                // Filtro combinado: receptor + rango de fechas + estado
                final MedicalReport.ReportStatus finalStatus = reportStatus;
                reportes = reportRepository.findAll((root, query, cb) -> {
                    List<Predicate> predicates = new ArrayList<>();
                    predicates.add(cb.equal(root.get("recipient").get("id"), recipientId));
                    predicates.add(cb.between(root.get("reportDate"), fechaDesde, fechaHasta));
                    predicates.add(cb.equal(root.get("status"), finalStatus));
                    query.orderBy(cb.desc(root.get("reportDate")));
                    return cb.and(predicates.toArray(new Predicate[0]));
                });
            } else {
                reportes = reportRepository.findByRecipientIdAndReportDateBetweenOrderByReportDateDesc(recipientId, fechaDesde, fechaHasta);
            }
        } else if (reportStatus != null) {
            reportes = reportRepository.findByRecipientIdAndStatusOrderByReportDateDesc(recipientId, reportStatus);
        } else {
            reportes = reportRepository.findByRecipientIdOrderByReportDateDesc(recipientId);
        }

        List<MedicalReportResponseDTO> response = reportes.stream()
                .map(MedicalReportResponseDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
}
