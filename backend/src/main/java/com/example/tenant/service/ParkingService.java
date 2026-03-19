package com.example.tenant.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.tenant.models.Apartment;
import com.example.tenant.models.Parking;
import com.example.tenant.models.UserDetails;
import com.example.tenant.repository.ApartmentRepository;
import com.example.tenant.repository.ParkingRepository;
import com.example.tenant.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * ParkingService
 *
 * Follows the EXACT same pattern as PaymentController / MaintenanceController:
 *   - The controller passes email from Authentication.getName()
 *   - We call userRepository.findByEmail(email) to get the user
 *   - We call apartmentRepository.findById(user.getId()) to get the apartment
 *     (works because Apartment uses @MapsId — apartment.id == user.id)
 */
@Service
@RequiredArgsConstructor
public class ParkingService {

    private final ParkingRepository   parkingRepository;
    private final UserRepository      userRepository;
    private final ApartmentRepository apartmentRepository;

    private static final DateTimeFormatter DATE_FMT      = DateTimeFormatter.ofPattern("MMM dd, yyyy");
    private static final DateTimeFormatter TIME_FMT_HM   = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter TIME_FMT_DISP = DateTimeFormatter.ofPattern("hh:mm a");

    // ─────────────────────────────────────────────────────────────────────────
    // SHARED RESOLVER  — mirrors resolveApartment() in MaintenanceController
    // email comes from Authentication.getName() in the controller
    // ─────────────────────────────────────────────────────────────────────────

    public UserDetails resolveUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }

    public Apartment resolveApartment(String email) {
        UserDetails user = resolveUser(email);
        // apartment.id == user.id because of @MapsId in Apartment.java
        return apartmentRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("No apartment linked to: " + email));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 1. USER + APARTMENT INFO
    //    GET /api/parking/user-details
    //    Mirrors ProfileController.getProfile + PaymentController field lookups
    // ─────────────────────────────────────────────────────────────────────────

    public Map<String, Object> getUserAndApartmentInfo(String email) {
        UserDetails user = resolveUser(email);
        // apartmentRepository.findById(user.getId()) — same as PaymentController
        Apartment apt = apartmentRepository.findById(user.getId()).orElse(null);

        Map<String, Object> userMap = new LinkedHashMap<>();
        userMap.put("firstname",       nvl(user.getFirstname()));
        userMap.put("lastname",        nvl(user.getLastname()));
        userMap.put("email",           nvl(user.getEmail()));
        userMap.put("phoneNumber",     nvl(user.getPhoneNumber()));
        userMap.put("apartmentNumber", nvl(user.getApartmentNumber()));

        Map<String, Object> aptMap = new LinkedHashMap<>();
        if (apt != null) {
            aptMap.put("propertyName",    nvl(apt.getPropertyName()));
            aptMap.put("apartmentNumber", nvl(apt.getApartmentNumber()));
            aptMap.put("leaseEnd",        apt.getLeaseEnd() != null ? apt.getLeaseEnd().toString() : "");
            aptMap.put("monthlyRent",     apt.getMonthlyRent() != null ? apt.getMonthlyRent() : 0.0);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("userDetails", userMap);
        result.put("apartment",   aptMap);
        return result;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. SLOT INVENTORY
    //    GET /api/parking/slots
    //    Overlays live parking_bookings on the fixture list
    // ─────────────────────────────────────────────────────────────────────────

    public List<Map<String, Object>> getSlotInventory() {
        List<Parking>             liveBookings = parkingRepository.findActiveOnDate(LocalDate.now());
        List<Map<String, Object>> slots        = buildFixtureSlots();

        // Mark any fixture slot as ASSIGNED if there's a live booking for it
        for (Parking b : liveBookings) {
            slots.stream()
                 .filter(s -> s.get("id").toString().equalsIgnoreCase(b.getSpotId()))
                 .findFirst()
                 .ifPresent(s -> {
                     s.put("status",     "ASSIGNED");
                     s.put("assignedTo", b.getVisitorName() != null
                             ? b.getVisitorName()
                             : b.getTenant().getFirstname() + " " + b.getTenant().getLastname());
                     s.put("unit", "Apt " + b.getApartment().getApartmentNumber());
                     s.put("note", null);
                 });
        }
        return slots;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. CREATE BOOKING
    //    POST /api/parking/bookings/create
    //    Mirrors MaintenanceController — resolves apartment from email,
    //    then saves a Parking row
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public Map<String, Object> createBooking(String email, String spotId,
            String visitorName, String vehicleNumber,
            String vehicleDesc, String date, int durationHours) {

        UserDetails user = resolveUser(email);
        // apartment.id == user.id  (see @MapsId in Apartment.java)
        Apartment apt = apartmentRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("No apartment linked to: " + email));

        LocalDate bookingDate = LocalDate.parse(date);
        LocalTime timeFrom    = LocalTime.now().withSecond(0).withNano(0);
        LocalTime timeTo      = timeFrom.plusHours(durationHours);
        java.time.LocalDateTime expiresAt = java.time.LocalDateTime.of(bookingDate, timeTo);

        // Auto-assign the first free visitor slot if none was provided
        if (spotId == null || spotId.isBlank()) {
            List<Parking> occupied = parkingRepository.findActiveOnDate(bookingDate);
            spotId = buildFixtureSlots().stream()
                    .filter(s -> s.get("id").toString().startsWith("V-"))
                    .filter(s -> occupied.stream()
                            .noneMatch(b -> b.getSpotId().equalsIgnoreCase(s.get("id").toString())))
                    .map(s -> s.get("id").toString())
                    .findFirst()
                    .orElseThrow(() -> new IllegalStateException("No visitor slots available for " + date));
        } else {
            if (parkingRepository.isSpotOccupied(spotId, bookingDate, timeFrom, timeTo)) {
                throw new IllegalStateException("Spot " + spotId + " is already booked for that time.");
            }
        }

        // UPCOMING if booking date is in the future, ACTIVE if today
        String status = bookingDate.isAfter(LocalDate.now()) ? "UPCOMING" : "ACTIVE";
        String passId = "PASS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Parking booking = Parking.builder()
                .passId(passId)
                .spotId(spotId)
                .visitorName(visitorName)
                .vehicleNumber(vehicleNumber)
                .vehicleDesc(vehicleDesc)
                .bookingDate(bookingDate)
                .bookingDateAlt(bookingDate)
                .timeFrom(timeFrom)
                .timeTo(timeTo)
                .expiresAt(expiresAt)
                .durationHours(durationHours)
                .status(status)
                .tenant(user)
                .apartment(apt)
                .build();

        Parking saved = parkingRepository.save(booking);
        return buildPassResponse(saved, apt);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. BOOKING HISTORY
    //    GET /api/parking/bookings/history
    //    Mirrors PaymentController.getPayments — resolves apartment from email,
    //    then calls repository
    // ─────────────────────────────────────────────────────────────────────────

    public List<Map<String, Object>> getBookingHistory(String email) {
        UserDetails user = resolveUser(email);
        // apartment.id == user.id  (see @MapsId)
        List<Parking> bookings = parkingRepository.findByApartmentIdOrdered(user.getId());

        List<Map<String, Object>> result = new ArrayList<>();
        for (Parking b : bookings) {
            int dh = b.getDurationHours();
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id",            b.getId());
            m.put("passId",        b.getPassId());
            m.put("visitorName",   nvl(b.getVisitorName()));
            m.put("vehicleNumber", nvl(b.getVehicleNumber()));
            m.put("vehicleDesc",   nvl(b.getVehicleDesc()));
            m.put("slotId",        b.getSpotId());
            m.put("date",          b.getBookingDate().format(DATE_FMT));
            m.put("timeFrom",      b.getTimeFrom().format(TIME_FMT_HM));
            m.put("timeTo",        b.getTimeTo().format(TIME_FMT_HM));
            m.put("duration",      dh >= 8 ? "Full Day" : dh + " Hour" + (dh > 1 ? "s" : ""));
            m.put("status",        b.getStatus());
            result.add(m);
        }
        return result;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 5. CANCEL BOOKING
    //    PATCH /api/parking/bookings/{id}/cancel
    //    Mirrors MaintenanceService.updateRequest
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public Parking cancelBooking(Long bookingId) {
        Parking booking = parkingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));
        if (!"UPCOMING".equals(booking.getStatus()) && !"ACTIVE".equals(booking.getStatus())) {
            throw new IllegalStateException("Only UPCOMING or ACTIVE bookings can be cancelled.");
        }
        booking.setStatus("CANCELLED");
        return parkingRepository.save(booking);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    private Map<String, Object> buildPassResponse(Parking b, Apartment apt) {
        String qrContent = String.join("\n",
                "=== PARKING PASS ===",
                "Pass ID : " + b.getPassId(),
                "Visitor : " + nvl(b.getVisitorName()),
                "Vehicle : " + nvl(b.getVehicleNumber()),
                "Tenant  : " + b.getTenant().getFirstname() + " " + b.getTenant().getLastname(),
                "Apt     : " + apt.getApartmentNumber() + " @ " + apt.getPropertyName(),
                "Spot    : " + b.getSpotId(),
                "Date    : " + b.getBookingDate().format(DATE_FMT),
                "Time    : " + b.getTimeFrom().format(TIME_FMT_HM) + " - " + b.getTimeTo().format(TIME_FMT_HM),
                "====================");

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("passId",          b.getPassId());
        m.put("spotId",          b.getSpotId());
        m.put("tenantName",      b.getTenant().getFirstname() + " " + b.getTenant().getLastname());
        m.put("apartmentNumber", apt.getApartmentNumber());
        m.put("propertyName",    apt.getPropertyName());
        m.put("visitorName",     nvl(b.getVisitorName()));
        m.put("vehicleNumber",   nvl(b.getVehicleNumber()));
        m.put("vehicleDesc",     nvl(b.getVehicleDesc()));
        m.put("durationHours",   b.getDurationHours());
        m.put("date",            b.getBookingDate().format(DATE_FMT));
        m.put("timeFrom",        b.getTimeFrom().format(TIME_FMT_HM));
        m.put("timeTo",          b.getTimeTo().format(TIME_FMT_HM));
        m.put("validUntil",      b.getTimeTo().format(TIME_FMT_DISP));
        m.put("status",          b.getStatus());
        m.put("qrContent",       qrContent);
        return m;
    }

    private String nvl(String v) { return v != null ? v : ""; }

    /**
     * Static slot fixture — overlaid with live DB bookings in getSlotInventory().
     * Replace with a ParkingSlot entity table in production.
     */
    private List<Map<String, Object>> buildFixtureSlots() {
        Object[][] rows = {
            {"V-01","Visitor Zone","Basement 1","VACANT",      null,            null,         null},
            {"A-12","Block A",     "Basement 1","ASSIGNED",    "Sarah Johnson", "Unit 402B",  null},
            {"P-05","Block P",     "Ground",    "MAINTENANCE", null,            null,         "Repairs Ongoing"},
            {"V-02","Visitor Zone","Basement 1","VACANT",      null,            null,         null},
            {"B-07","Block B",     "Basement 2","ASSIGNED",    "John Doe",      "Unit 101A",  null},
            {"V-03","Visitor Zone","Ground",    "VACANT",      null,            null,         null},
            {"C-14","Block C",     "Basement 2","ASSIGNED",    "Priya Sharma",  "Unit 203C",  null},
            {"P-11","Block P",     "Ground",    "ASSIGNED",    "Michael Chen",  "Unit 302B",  null},
            {"V-04","Visitor Zone","Basement 1","MAINTENANCE", null,            null,         "Line marking"},
            {"D-03","Block D",     "Basement 2","ASSIGNED",    "Lisa Wong",     "Unit 501D",  null},
            {"V-05","Visitor Zone","Ground",    "VACANT",      null,            null,         null},
            {"A-08","Block A",     "Basement 1","VACANT",      null,            null,         null},
        };
        List<Map<String, Object>> list = new ArrayList<>();
        for (Object[] r : rows) {
            Map<String, Object> slot = new LinkedHashMap<>();
            slot.put("id",         r[0]);
            slot.put("zone",       r[1]);
            slot.put("floor",      r[2]);
            slot.put("status",     r[3]);
            slot.put("assignedTo", r[4]);
            slot.put("unit",       r[5]);
            slot.put("note",       r[6]);
            list.add(slot);
        }
        return list;
    }
}