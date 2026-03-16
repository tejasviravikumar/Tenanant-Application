package com.example.tenant.service;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import com.example.tenant.repository.ApartmentRepository;
import com.example.tenant.models.Apartment;

@Service
@RequiredArgsConstructor
public class ApartmentService {
    private final ApartmentRepository apartmentRepository;

    public Apartment getProfile(Long userId){
        return apartmentRepository.findById(userId).orElse(null);
    }
}
