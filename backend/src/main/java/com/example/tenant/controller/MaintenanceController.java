package com.example.tenant.controller;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    private final String uploadDir = "uploads/maintenance/";

    @GetMapping
    public List<Maintenance> getAllRequests(){
        return maintenanceRepository.findAll();
    }

    @PostMapping(consumes = "multipart/form-data")
    public Maintenance raiseRequest(
            @RequestParam String issue,
            @RequestParam String category,
            @RequestParam String location,
            @RequestParam String description,
            @RequestParam String priorityLevel,
            @RequestParam(required = false) List<MultipartFile> images,
            Authentication authentication
    ) throws IOException {

        String email = authentication.getName();

        UserDetails user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Apartment apartment = user.getApartment();

        Maintenance maintenance = Maintenance.builder()
                .issue(issue)
                .category(category)
                .location(location)
                .description(description)
                .priorityLevel(priorityLevel)
                .status("OPEN")
                .submittedDate(LocalDate.now())
                .apartment(apartment)
                .build();

        Maintenance savedMaintenance = maintenanceRepository.save(maintenance);

        if(images != null){
            for(MultipartFile file : images){
                saveImage(file, savedMaintenance);
            }
        }

        return savedMaintenance;
    }

    private void saveImage(MultipartFile file, Maintenance maintenance) throws IOException {

        File directory = new File(uploadDir);
        if(!directory.exists()){
            directory.mkdirs();
        }

        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();

        File dest = new File(uploadDir + filename);

        file.transferTo(dest);

        MaintenanceImage image = MaintenanceImage.builder()
                .imagePath("/uploads/maintenance/" + filename)
                .maintenance(maintenance)
                .build();

        imageRepository.save(image);
    }

    @PutMapping("/resolve/{id}")
    public Maintenance resolveIssue(@PathVariable Long id,@RequestParam Double amount){

        Maintenance maintenance = maintenanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Maintenance not found"));

        maintenance.setStatus("RESOLVED");
        maintenance.setResolvedDate(LocalDate.now());
        maintenance.setAmountToPay(amount);

        return maintenanceRepository.save(maintenance);
    }
}