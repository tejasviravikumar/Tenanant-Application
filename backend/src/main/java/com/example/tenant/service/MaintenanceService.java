package com.example.tenant.service;

import java.util.List;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

import com.example.tenant.models.Maintenance;
import com.example.tenant.repository.MaintenanceRepository;

@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;

    public List<Maintenance> getMaintenanceByApartment(Long apartmentId){
        return maintenanceRepository.findByApartmentId(apartmentId);
    }

    public Maintenance createRequest(Maintenance maintenance){
        return maintenanceRepository.save(maintenance);
    }

    public Maintenance updateRequest(Maintenance maintenance){
        return maintenanceRepository.save(maintenance);
    }

}