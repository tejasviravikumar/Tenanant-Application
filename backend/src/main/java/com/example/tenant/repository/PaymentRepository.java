package com.example.tenant.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.tenant.models.Payment;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByApartmentId(Long apartmentId);

    // Fetch all payments for an apartment: unpaid first, then latest paid first
    @Query("""
        SELECT p FROM Payment p
        WHERE p.apartment.id = :apartmentId
        ORDER BY
            CASE WHEN p.rentPaid = false THEN 0 ELSE 1 END ASC,
            p.paymentDate DESC
    """)
    List<Payment> findAllByApartmentOrdered(@Param("apartmentId") Long apartmentId);

}