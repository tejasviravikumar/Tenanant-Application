package com.example.tenant.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.tenant.models.UserDetails;
import com.example.tenant.repository.UserRepository;
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public UserDetails createUser(UserDetails user){
        return userRepository.save(user);
    }

    public UserDetails getUserById(Long id){
        return userRepository.findById(id).orElseThrow(()-> new RuntimeException("User not found"));
    }
}
