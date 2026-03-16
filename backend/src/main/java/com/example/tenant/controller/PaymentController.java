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

    // Get last 5 paid + unpaid payments for the logged-in tenant
    @GetMapping
    public ResponseEntity<?> getPayments(Authentication authentication) {
        String email = authentication.getName();

        UserDetails user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // apartment.id == user.id because of @MapsId
        Long apartmentId = user.getId();

        Apartment apartment = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No apartment linked to user: " + email));

        return ResponseEntity.ok(paymentService.getLast6MonthsPayments(apartment.getId()));
    }

    // Get ALL payments for the logged-in tenant
    @GetMapping("/all")
    public ResponseEntity<?> getAllPayments(Authentication authentication) {
        String email = authentication.getName();

        UserDetails user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Long apartmentId = user.getId();

        Apartment apartment = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No apartment linked to user: " + email));

        return ResponseEntity.ok(paymentService.getPaymentsByApartment(apartment.getId()));
    }

    // Pay rent / maintenance
    @PostMapping
    public ResponseEntity<?> createPayment(@RequestBody Payment payment, Authentication authentication) {
        String email = authentication.getName();

        UserDetails user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Long apartmentId = user.getId();

        Apartment apartment = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No apartment linked to user: " + email));

        payment.setApartment(apartment);
        payment.setPaymentDate(LocalDate.now());

        return ResponseEntity.ok(paymentService.createPayment(payment));
    }
}