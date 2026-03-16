package com.example.tenant.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.tenant.models.MaintenanceImage;

public interface MaintenanceImageRepository extends JpaRepository<MaintenanceImage, Long> {
}