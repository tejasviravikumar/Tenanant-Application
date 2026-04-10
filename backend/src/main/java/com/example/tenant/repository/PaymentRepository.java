package com.example.tenant.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.tenant.models.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByMonthAndApartmentId(String month, Long apartmentId);

    List<Payment> findByApartmentIdOrderByPaymentDateDesc(Long apartmentId);
}