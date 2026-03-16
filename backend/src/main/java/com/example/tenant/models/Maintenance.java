package com.example.tenant.models;

import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "maintenance")
public class Maintenance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String issue;

    private String category;

    private String location;

    private String status;

    private LocalDate submittedDate;

    private LocalDate resolvedDate;

    private String description;

    private String priorityLevel;

    private Double amountToPay;

    @ManyToOne
    @JoinColumn(name = "apartment_id")
    @JsonIgnore
    private Apartment apartment;

    @OneToMany(mappedBy = "maintenance", cascade = CascadeType.ALL)
    private List<MaintenanceImage> images;
}