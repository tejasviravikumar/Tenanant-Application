package com.example.tenant.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.example.tenant.models.LoginRequest;
import com.example.tenant.models.UserDetails;
import com.example.tenant.repository.UserRepository;
import com.example.tenant.service.UserService;
import com.example.tenant.utils.JwtUtil;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody UserDetails user){

        if(userRepository.findByEmail(user.getEmail()).isPresent()){
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        userService.createUser(user);

        return ResponseEntity.ok("Successfully registered");
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody LoginRequest request){

        var userOptional = userRepository.findByEmail(request.getEmail());

        if(userOptional.isEmpty()){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User Not Found");
        }

        UserDetails user = userOptional.get();

        if(!passwordEncoder.matches(request.getPassword(), user.getPassword())){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getEmail());

        return ResponseEntity.ok(Map.of("token", token));
    }
}