package com.example.tenant.models;

import java.time.LocalDate;
import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import lombok.*;

/**
 * Represents a visitor-parking booking made by a tenant.
 *
 * Table: parking_bookings
 *
 * Relationships (mirrors the existing pattern in Apartment / Payment / Maintenance):
 *   - ManyToOne → UserDetails  (the tenant who created the booking)
 *   - ManyToOne → Apartment    (the apartment the booking belongs to)
 */
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "parking_bookings")
public class Parking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Human-readable pass identifier — e.g. "PASS-A3F9K2" */
    @Column(unique = true, nullable = false)
    private String passId;

    /** The parking spot — e.g. "V-01", "A-12" */
    @Column(nullable = false)
    private String spotId;

    /** Optional visitor name */
    private String visitorName;

    /** Vehicle plate number */
    private String vehicleNumber;

    /** Optional vehicle description — e.g. "Guest Sedan" */
    private String vehicleDesc;

    /** Date of the booking — maps to booked_at column */
    @Column(name = "booked_at", nullable = false)
    private LocalDate bookingDate;

    /** Hibernate also generated booking_date — kept to satisfy the NOT NULL constraint */
    @Column(name = "booking_date", nullable = false)
    private LocalDate bookingDateAlt;

    /** Booking start time — e.g. 14:00 */
    @Column(nullable = false)
    private LocalTime timeFrom;

    /** Booking end time — e.g. 18:00 */
    @Column(nullable = false)
    private LocalTime timeTo;

    /** Expiry timestamp — date + timeTo combined, stored as LocalDateTime */
    @Column(name = "expires_at", nullable = false)
    private java.time.LocalDateTime expiresAt;

    /** Duration in hours — 1, 2, 4, or 8 */
    @Column(nullable = false)
    private Integer durationHours;

    /**
     * UPCOMING  – future booking not yet started
     * ACTIVE    – currently in progress
     * COMPLETED – finished
     * CANCELLED – cancelled by the tenant
     */
    @Column(nullable = false)
    private String status;

    /**
     * Tenant who made the booking.
     * Mirrors the @JsonIgnoreProperties pattern used in Payment.java.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"password", "apartment", "payments", "maintenanceRequests"})
    private UserDetails tenant;

    /**
     * Apartment the booking belongs to.
     * Mirrors the @ManyToOne pattern used in Payment.java / Maintenance.java.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apartment_id", nullable = false)
    @JsonIgnoreProperties({"payments", "maintenanceRequests", "user"})
    private Apartment apartment;
}