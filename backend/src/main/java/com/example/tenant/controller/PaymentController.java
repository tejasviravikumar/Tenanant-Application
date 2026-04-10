package com.example.tenant.controller;

import java.time.LocalDate;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.example.tenant.models.Apartment;
import com.example.tenant.models.Payment;
import com.example.tenant.models.UserDetails;
import com.example.tenant.repository.ApartmentRepository;
import com.example.tenant.repository.UserRepository;
import com.example.tenant.service.PaymentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final UserRepository userRepository;
    private final ApartmentRepository apartmentRepository;

    @GetMapping
    public ResponseEntity<?> getPayments(Authentication authentication) {

        String email = authentication.getName();

        UserDetails user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Apartment apartment = apartmentRepository.findById(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Apartment not found"));

        return ResponseEntity.ok(paymentService.getLast6MonthsPayments(apartment.getId()));
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllPayments(Authentication authentication) {

        String email = authentication.getName();

        UserDetails user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Apartment apartment = apartmentRepository.findById(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Apartment not found"));

        return ResponseEntity.ok(paymentService.getPaymentsByApartment(apartment.getId()));
    }

    @PostMapping
    public ResponseEntity<?> createPayment(@RequestBody Payment payment, Authentication authentication) {

        String email = authentication.getName();

        UserDetails user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Apartment apartment = apartmentRepository.findById(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Apartment not found"));

        // 🔥 Check existing payment
        Payment existingPayment = paymentService
                .getPaymentByMonthAndApartment(payment.getMonth(), apartment.getId());

        // ❌ Already paid
        if (existingPayment != null && Boolean.TRUE.equals(existingPayment.getRentPaid())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Already paid for this month");
        }

        // ✅ Update existing
        if (existingPayment != null) {
            existingPayment.setRentPaid(true);
            existingPayment.setMaintenancePaid(payment.getMaintenancePaid());
            existingPayment.setPaymentDate(LocalDate.now());

            return ResponseEntity.ok(paymentService.save(existingPayment));
        }

        // ✅ Create new
        payment.setApartment(apartment);
        payment.setRentPaid(true);
        payment.setPaymentDate(LocalDate.now());

        return ResponseEntity.ok(paymentService.createPayment(payment));
    }
}