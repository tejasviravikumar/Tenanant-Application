package com.example.tenant.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.tenant.models.Parking;

/**
 * Repository for parking_bookings table.
 * Method-naming mirrors PaymentRepository / MaintenanceRepository.
 */
@Repository
public interface ParkingRepository extends JpaRepository<Parking, Long> {

    /**
     * All bookings for a given apartment (used for the history table).
     * Returns newest booking first — mirrors findAllByApartmentOrdered in PaymentRepository.
     */
    @Query("""
        SELECT p FROM Parking p
        WHERE p.apartment.id = :apartmentId
        ORDER BY
            CASE WHEN p.status = 'UPCOMING' THEN 0
                 WHEN p.status = 'ACTIVE'   THEN 1
                 ELSE 2 END ASC,
            p.bookingDate DESC,
            p.timeFrom DESC
    """)
    List<Parking> findByApartmentIdOrdered(@Param("apartmentId") Long apartmentId);

    /**
     * Only active/upcoming bookings for a tenant — used to show current bookings
     * and to check spot occupancy when creating a new booking.
     */
    List<Parking> findByApartmentIdAndStatusIn(Long apartmentId, List<String> statuses);

    /**
     * Check whether a spot is occupied right now — used before creating a booking.
     * A spot is occupied if there is an ACTIVE booking on today's date whose
     * timeFrom–timeTo window overlaps the requested window.
     */
    @Query("""
        SELECT COUNT(p) > 0 FROM Parking p
        WHERE p.spotId      = :spotId
          AND p.bookingDate = :date
          AND p.status      IN ('ACTIVE', 'UPCOMING')
          AND p.timeFrom    < :timeTo
          AND p.timeTo      > :timeFrom
    """)
    boolean isSpotOccupied(
            @Param("spotId")   String spotId,
            @Param("date")     LocalDate date,
            @Param("timeFrom") LocalTime timeFrom,
            @Param("timeTo")   LocalTime timeTo
    );

    /**
     * All ACTIVE / UPCOMING bookings across ALL apartments on a given date.
     * Used by the parking-inventory endpoint to show live slot occupancy.
     */
    @Query("""
        SELECT p FROM Parking p
        WHERE p.bookingDate = :date
          AND p.status IN ('ACTIVE', 'UPCOMING')
    """)
    List<Parking> findActiveOnDate(@Param("date") LocalDate date);
}