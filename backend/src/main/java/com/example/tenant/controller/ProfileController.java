package com.example.tenant.controller;

import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.example.tenant.models.UserDetails;
import com.example.tenant.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/profile")
public class ProfileController {

    private final UserRepository userRepository;

    @GetMapping
    public Map<String, Object> getProfile(Authentication authentication) {
        String email = authentication.getName();
        UserDetails user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return Map.of("user", user);
    }

    @PutMapping
    public UserDetails updateProfile(
            Authentication authentication,
            @RequestBody UserDetails updatedUser
    ) {
        String email = authentication.getName();
        UserDetails user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setFirstname(updatedUser.getFirstname());
        user.setLastname(updatedUser.getLastname());
        user.setPhoneNumber(updatedUser.getPhoneNumber());
        user.setEmergencyContact(updatedUser.getEmergencyContact());
        user.setPermanentAddress(updatedUser.getPermanentAddress());

        return userRepository.save(user);
    }
}