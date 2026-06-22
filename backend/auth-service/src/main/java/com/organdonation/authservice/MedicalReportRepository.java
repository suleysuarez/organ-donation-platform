package com.organdonation.authservice;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.List;
import java.time.LocalDate;

public interface MedicalReportRepository extends JpaRepository<MedicalReport, Long>,
        JpaSpecificationExecutor<MedicalReport> {
    List<MedicalReport> findByRecipientId(Long recipientId);
    // Obtener todos los reportes de un receptor, ordenados por fecha descendente
    List<MedicalReport> findByRecipientIdOrderByReportDateDesc(Long recipientId);

    // Con filtro de estado adicional
    List<MedicalReport> findByRecipientIdAndStatusOrderByReportDateDesc(Long recipientId, MedicalReport.ReportStatus status);

    // Con rango de fechas
    List<MedicalReport> findByRecipientIdAndReportDateBetweenOrderByReportDateDesc(Long recipientId, LocalDate fechaInicio, LocalDate fechaFin);
}
