package com.example.tenant.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.tenant.models.Payment;
import com.example.tenant.repository.PaymentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public Payment createPayment(Payment payment) {
        return paymentRepository.save(payment);
    }

    public Payment save(Payment payment) {
        return paymentRepository.save(payment);
    }

    public Payment getPaymentByMonthAndApartment(String month, Long apartmentId) {
        return paymentRepository
                .findByMonthAndApartmentId(month, apartmentId)
                .orElse(null);
    }

    public List<Payment> getPaymentsByApartment(Long apartmentId) {
        return paymentRepository.findByApartmentIdOrderByPaymentDateDesc(apartmentId);
    }

    public List<Payment> getLast6MonthsPayments(Long apartmentId) {
        List<Payment> payments = paymentRepository
                .findByApartmentIdOrderByPaymentDateDesc(apartmentId);

        return payments.size() > 6 ? payments.subList(0, 6) : payments;
    }
}