package com.example.tenant.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String imagePath;

    @ManyToOne
    @JoinColumn(name = "maintenance_id")
    private Maintenance maintenance;
}