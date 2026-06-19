package com.organdonation.authservice;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.List;
import java.time.LocalDate;

public interface MedicalReportRepository extends JpaRepository<MedicalReport, Long>,
        JpaSpecificationExecutor<MedicalReport> {
    List<MedicalReport> findByPatientId(Long patientId);
    // Obtener todos los reportes de un paciente, ordenados por fecha descendente
    List<MedicalReport> findByPatientIdOrderByReportDateDesc(Long patientId);

    // Con filtro de estado adicional
    List<MedicalReport> findByPatientIdAndStatusOrderByReportDateDesc(Long patientId, MedicalReport.ReportStatus status);

    // Con rango de fechas
    List<MedicalReport> findByPatientIdAndReportDateBetweenOrderByReportDateDesc(Long patientId, LocalDate fechaInicio, LocalDate fechaFin);
}