package com.example.tenant.service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

import com.example.tenant.models.Payment;
import com.example.tenant.repository.PaymentRepository;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public List<Payment> getPaymentsByApartment(Long apartmentId) {
        return paymentRepository.findByApartmentId(apartmentId);
    }

    public List<Payment> getLast6MonthsPayments(Long apartmentId) {
        List<Payment> all = paymentRepository.findAllByApartmentOrdered(apartmentId);

        // All unpaid rows (typically just 1 — April)
        List<Payment> unpaid = all.stream()
                .filter(p -> Boolean.FALSE.equals(p.getRentPaid()))
                .collect(Collectors.toList());

        // 5 most recent paid rows (already sorted latest first by the query)
        List<Payment> paid = all.stream()
                .filter(p -> Boolean.TRUE.equals(p.getRentPaid()))
                .limit(5)
                .collect(Collectors.toList());

        // Unpaid first, then 5 most recent paid
        return Stream.concat(unpaid.stream(), paid.stream())
                .collect(Collectors.toList());
    }

    public Payment createPayment(Payment payment) {
        return paymentRepository.save(payment);
    }

    public Payment updatePayment(Payment payment) {
        return paymentRepository.save(payment);
    }

}