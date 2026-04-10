package com.example.tenant.models;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(
    name = "payments",
    uniqueConstraints = @UniqueConstraint(columnNames = {"month", "apartment_id"})
)
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String month;

    private LocalDate lastDateToPay;

    private Double rentAmount;

    private Boolean rentPaid;

    private Double maintenanceFee;

    private Boolean maintenancePaid;

    private Double additionalFee;

    private LocalDate paymentDate;

    @ManyToOne
    @JoinColumn(name = "apartment_id")
    @JsonIgnoreProperties({"payments", "maintenanceRequests"})
    private Apartment apartment;
}