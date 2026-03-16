package com.example.tenant.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "userdetails")
public class UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstname;
    private String lastname;
    private String phoneNumber;
    private String apartmentNumber;
    private String emergencyContact;
    private String permanentAddress;

    @Email
    @Column(unique = true, nullable = false)
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Column(nullable = false)  
    private String password;

    @JsonIgnoreProperties({"user", "payments", "maintenanceRequests"})
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private Apartment apartment;
}