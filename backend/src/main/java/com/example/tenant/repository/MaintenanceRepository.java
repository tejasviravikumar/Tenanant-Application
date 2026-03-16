package com.example.tenant.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.tenant.models.Maintenance;

@Repository
public interface MaintenanceRepository extends JpaRepository<Maintenance, Long> {

    List<Maintenance> findByApartmentId(Long apartmentId);

}