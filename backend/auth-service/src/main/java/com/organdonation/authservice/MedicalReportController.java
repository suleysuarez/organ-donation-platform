package com.organdonation.authservice;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reportes")
public class MedicalReportController {

    private final MedicalReportRepository reportRepository;
    private final UserRepository userRepository;

    public MedicalReportController(MedicalReportRepository reportRepository,
                                   UserRepository userRepository) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<MedicalReportResponseDTO>> listarReportes(
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) LocalDate fechaDesde,
            @RequestParam(required = false) LocalDate fechaHasta) {

        Specification<MedicalReport> spec = (root, query, cb) -> cb.conjunction();

        if (patientId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("patient").get("id"), patientId));
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
        Optional<User> patientOpt = userRepository.findById(dto.getPatientId());
        if (patientOpt.isEmpty() || !"PACIENTE".equals(patientOpt.get().getRole())) {
            return ResponseEntity.badRequest().body("El paciente no existe o no tiene rol PACIENTE");
        }

        User doctor = null;
        if (dto.getDoctorId() != null) {
            Optional<User> doctorOpt = userRepository.findById(dto.getDoctorId());
            if (doctorOpt.isEmpty() || !"MEDICO".equals(doctorOpt.get().getRole())) {
                return ResponseEntity.badRequest().body("El doctor no existe o no tiene rol MEDICO");
            }
            doctor = doctorOpt.get();
        }

        if (dto.getReportDate().isAfter(LocalDate.now())) {
            return ResponseEntity.badRequest().body("La fecha del reporte no puede ser futura");
        }

        MedicalReport report = new MedicalReport();
        report.setPatient(patientOpt.get());
        report.setDoctor(doctor);
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

        Optional<User> patientOpt = userRepository.findById(dto.getPatientId());
        if (patientOpt.isEmpty() || !"PACIENTE".equals(patientOpt.get().getRole())) {
            return ResponseEntity.badRequest().body("El paciente no existe o no tiene rol PACIENTE");
        }
        report.setPatient(patientOpt.get());

        if (dto.getDoctorId() != null) {
            Optional<User> doctorOpt = userRepository.findById(dto.getDoctorId());
            if (doctorOpt.isEmpty() || !"MEDICO".equals(doctorOpt.get().getRole())) {
                return ResponseEntity.badRequest().body("El doctor no existe o no tiene rol MEDICO");
            }
            report.setDoctor(doctorOpt.get());
        } else {
            report.setDoctor(null);
        }

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
}