package com.example.tenant.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.tenant.models.UserDetails;

public interface UserRepository extends JpaRepository<UserDetails,Long>{
    Optional<UserDetails> findByEmail(String email);
}
