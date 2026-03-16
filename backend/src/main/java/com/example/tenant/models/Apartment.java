package com.example.tenant.models;

import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "apartment")
public class Apartment {

    @Id
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    @JsonIgnoreProperties({"password","apartment"})
    private UserDetails user;

    private String propertyName;

    private String apartmentNumber;

    private Double monthlyRent;

    private Double advancePaid;

    private LocalDate leaseStart;

    private LocalDate leaseEnd;

    @OneToMany(mappedBy = "apartment", cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"apartment"})
    private List<Payment> payments;

    @OneToMany(mappedBy = "apartment", cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"apartment"})
    private List<Maintenance> maintenanceRequests;
}