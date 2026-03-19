package com.example.tenant.controller;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.example.tenant.models.*;
import com.example.tenant.repository.*;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceRepository maintenanceRepository;
    private final MaintenanceImageRepository imageRepository;
    private final UserRepository userRepository;
    private final ApartmentRepository apartmentRepository;

    private static final String UPLOAD_DIR =
            System.getProperty("user.dir") + File.separator
            + "uploads" + File.separator
            + "maintenance" + File.separator;

    // ── GET /api/maintenance ──────────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<List<Maintenance>> getAllRequests(Authentication authentication) {
        Apartment apartment = resolveApartment(authentication.getName());
        if (apartment == null) return ResponseEntity.ok(Collections.emptyList());
        return ResponseEntity.ok(maintenanceRepository.findByApartmentId(apartment.getId()));
    }

    // ── POST /api/maintenance ─────────────────────────────────────────────────
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<Maintenance> raiseRequest(
            @RequestParam String issue,
            @RequestParam String category,
            @RequestParam(required = false, defaultValue = "Not specified") String location,
            @RequestParam String description,
            @RequestParam(required = false, defaultValue = "Low") String priorityLevel,
            @RequestParam(required = false) List<MultipartFile> images,
            Authentication authentication
    ) throws IOException {

        Apartment apartment = resolveApartment(authentication.getName());
        if (apartment == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "No apartment linked to your account. Contact the admin.");
        }

        Maintenance maintenance = Maintenance.builder()
                .issue(issue).category(category).location(location)
                .description(description).priorityLevel(priorityLevel)
                .status("OPEN").submittedDate(LocalDate.now())
                .apartment(apartment).build();

        Maintenance saved = maintenanceRepository.save(maintenance);

        if (images != null) {
            for (MultipartFile file : images) {
                if (file != null && !file.isEmpty()) saveImage(file, saved);
            }
        }

        return ResponseEntity.ok(saved);
    }

    // ── PUT /api/maintenance/resolve/{id} ─────────────────────────────────────
    @PutMapping("/resolve/{id}")
    public ResponseEntity<Maintenance> resolveIssue(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "0.0") Double amount) {

        Maintenance m = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Maintenance not found: " + id));
        m.setStatus("RESOLVED");
        m.setResolvedDate(LocalDate.now());
        m.setAmountToPay(amount);
        return ResponseEntity.ok(maintenanceRepository.save(m));
    }

    // ── DELETE /api/maintenance/{id} ─────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComplaint(
            @PathVariable Long id,
            Authentication authentication) {

        // Find the complaint
        Maintenance m = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Maintenance not found: " + id));

        // Verify it belongs to the authenticated tenant
        Apartment apartment = resolveApartment(authentication.getName());
        if (apartment == null || !m.getApartment().getId().equals(apartment.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You are not allowed to delete this complaint.");
        }

        // Only OPEN complaints can be deleted
        if (!"OPEN".equals(m.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Only OPEN complaints can be removed. This complaint is " + m.getStatus() + ".");
        }

        // Delete image files from disk
        if (m.getImages() != null) {
            for (MaintenanceImage img : m.getImages()) {
                try {
                    Path filePath = Paths.get(System.getProperty("user.dir") + img.getImagePath());
                    Files.deleteIfExists(filePath);
                } catch (IOException e) {
                    System.err.println("Could not delete image file: " + img.getImagePath());
                }
            }
        }

        // CascadeType.ALL on Maintenance.images handles MaintenanceImage rows automatically
        maintenanceRepository.deleteById(id);

        return ResponseEntity.noContent().build(); // 204 No Content
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Apartment.id == UserDetails.id because of @MapsId.
     * Returns null instead of throwing if no apartment is linked yet.
     */
    private Apartment resolveApartment(String email) {
        com.example.tenant.models.UserDetails user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found: " + email));
        return apartmentRepository.findById(user.getId()).orElse(null);
    }

    /**
     * Writes the file to <cwd>/uploads/maintenance/ and saves the URL path in DB.
     * CorsConfig serves /uploads/** from file:<cwd>/uploads/ so the browser can
     * load images directly at: http://localhost:8080/uploads/maintenance/<filename>
     */
    private void saveImage(MultipartFile file, Maintenance maintenance) throws IOException {
        Path dir = Paths.get(UPLOAD_DIR);
        if (!Files.exists(dir)) Files.createDirectories(dir);

        String safeName = file.getOriginalFilename() != null
                ? file.getOriginalFilename().replaceAll("[^a-zA-Z0-9._-]", "_") : "image";

        String filename = UUID.randomUUID() + "_" + safeName;
        Files.write(dir.resolve(filename), file.getBytes());

        imageRepository.save(MaintenanceImage.builder()
                .imagePath("/uploads/maintenance/" + filename)
                .maintenance(maintenance).build());
    }
}