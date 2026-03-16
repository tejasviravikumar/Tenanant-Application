package com.example.tenant.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.tenant.models.Apartment;

public interface ApartmentRepository extends JpaRepository<Apartment, Long>{

}
