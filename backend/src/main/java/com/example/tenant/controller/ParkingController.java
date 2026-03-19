package com.example.tenant.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.example.tenant.models.Parking;
import com.example.tenant.service.ParkingService;

import lombok.RequiredArgsConstructor;

/**
 * ParkingController
 *
 * Mirrors PaymentController / MaintenanceController EXACTLY:
 *   - Uses Authentication authentication (injected by Spring from JWT via JwtFilter)
 *   - Calls authentication.getName() to get the email
 *   - Passes email to ParkingService which resolves user + apartment
 *     via userRepository.findByEmail(email) → apartmentRepository.findById(user.getId())
 *
 * No @PreAuthorize needed — SecurityConfig already permits /api/** after JWT validation.
 */
@RestController
@RequestMapping("/api/parking")
@RequiredArgsConstructor
public class ParkingController {

    private final ParkingService parkingService;

    // ── 1. GET /api/parking/user-details ─────────────────────────────────────
    /**
     * Returns the logged-in tenant's personal info + apartment details.
     *
     * Mirrors ProfileController.getProfile(Authentication authentication):
     *   email = authentication.getName()
     *   user  = userRepository.findByEmail(email)
     *
     * Frontend uses this to populate:
     *   • "Your Allocated Slot" card  (apartmentNumber, phoneNumber)
     *   • Booking drawer header       (tenantName, propertyName, aptNumber)
     *
     * Response:
     * {
     *   "userDetails": { firstname, lastname, email, phoneNumber, apartmentNumber },
     *   "apartment":   { propertyName, apartmentNumber, leaseEnd, monthlyRent }
     * }
     */
    @GetMapping("/user-details")
    public ResponseEntity<Map<String, Object>> getUserDetails(Authentication authentication) {
        String email = authentication.getName();
        try {
            return ResponseEntity.ok(parkingService.getUserAndApartmentInfo(email));
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    // ── 2. GET /api/parking/slots ─────────────────────────────────────────────
    /**
     * Returns the live parking slot inventory.
     * Active bookings from parking_bookings table are overlaid on the fixture list
     * so the grid reflects real-time occupancy.
     *
     * Each entry: { id, zone, floor, status, assignedTo, unit, note }
     * status values: VACANT | ASSIGNED | MAINTENANCE
     */
    @GetMapping("/slots")
    public ResponseEntity<List<Map<String, Object>>> getSlots(Authentication authentication) {
        // authentication param ensures only logged-in users can call this
        return ResponseEntity.ok(parkingService.getSlotInventory());
    }

    // ── 3. POST /api/parking/bookings/create ─────────────────────────────────
    /**
     * Creates a visitor parking booking for the logged-in tenant.
     *
     * Mirrors MaintenanceController.raiseRequest — resolves apartment from
     * authentication.getName(), then saves a Parking row.
     *
     * Request body (JSON):
     * {
     *   "visitorName":   "Michael Chen",
     *   "vehicleNumber": "NY-890-B",
     *   "vehicleDesc":   "Guest Sedan",   // optional
     *   "date":          "2024-10-24",    // ISO yyyy-MM-dd
     *   "durationHours": 4,               // 1 | 2 | 4 | 8
     *   "spotId":        "V-01"          // optional — auto-assigned if blank
     * }
     *
     * Response: full pass object including qrContent string
     * { passId, spotId, tenantName, apartmentNumber, propertyName,
     *   visitorName, vehicleNumber, durationHours, date, timeFrom,
     *   timeTo, validUntil, status, qrContent }
     */
    @PostMapping("/bookings/create")
    public ResponseEntity<Map<String, Object>> createBooking(
            @RequestBody Map<String, Object> body,
            Authentication authentication) {

        String email         = authentication.getName();
        String visitorName   = str(body, "visitorName");
        String vehicleNumber = str(body, "vehicleNumber");
        String vehicleDesc   = str(body, "vehicleDesc");
        String date          = str(body, "date");
        int    durationHours = body.containsKey("durationHours")
                                   ? Integer.parseInt(body.get("durationHours").toString()) : 1;
        String spotId        = str(body, "spotId");

        try {
            Map<String, Object> pass = parkingService.createBooking(
                    email, spotId, visitorName, vehicleNumber, vehicleDesc, date, durationHours);
            return ResponseEntity.ok(pass);
        } catch (IllegalStateException e) {
            // Spot already occupied
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage());
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    // ── 4. GET /api/parking/bookings/history ─────────────────────────────────
    /**
     * Returns all parking bookings for the logged-in tenant's apartment.
     * Ordered: UPCOMING first, then ACTIVE, then COMPLETED/CANCELLED newest-first.
     *
     * Mirrors PaymentController.getPayments — resolves apartment from email,
     * then calls the repository.
     *
     * Each entry:
     * { id, passId, visitorName, vehicleNumber, vehicleDesc, slotId,
     *   date, timeFrom, timeTo, duration, status }
     */
    @GetMapping("/bookings/history")
    public ResponseEntity<List<Map<String, Object>>> getBookingHistory(Authentication authentication) {
        String email = authentication.getName();
        try {
            return ResponseEntity.ok(parkingService.getBookingHistory(email));
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    // ── 5. PATCH /api/parking/bookings/{id}/cancel ───────────────────────────
    /**
     * Cancels an UPCOMING or ACTIVE booking.
     * Mirrors MaintenanceController.resolveIssue — finds by ID, updates status.
     *
     * Response: { id, status, passId }
     */
    @PatchMapping("/bookings/{id}/cancel")
    public ResponseEntity<Map<String, Object>> cancelBooking(
            @PathVariable Long id,
            Authentication authentication) {

        // authentication ensures only logged-in users can cancel
        try {
            Parking cancelled = parkingService.cancelBooking(id);
            return ResponseEntity.ok(Map.of(
                    "id",     cancelled.getId(),
                    "status", cancelled.getStatus(),
                    "passId", cancelled.getPassId()
            ));
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage());
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    // ── Utility ───────────────────────────────────────────────────────────────
    private String str(Map<String, Object> m, String k) {
        Object v = m.get(k);
        return v != null ? v.toString().trim() : "";
    }
}