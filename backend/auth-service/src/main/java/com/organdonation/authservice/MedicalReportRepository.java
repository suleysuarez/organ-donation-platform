package com.organdonation.authservice;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.List;

public interface MedicalReportRepository extends JpaRepository<MedicalReport, Long>,
        JpaSpecificationExecutor<MedicalReport> {
    List<MedicalReport> findByPatientId(Long patientId);
}