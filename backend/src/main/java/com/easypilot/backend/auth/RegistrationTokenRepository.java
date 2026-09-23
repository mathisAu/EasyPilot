package com.easypilot.backend.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;

public interface RegistrationTokenRepository extends JpaRepository<RegistrationToken, Long> {

    Optional<RegistrationToken> findByTokenHash(String tokenHash);

    boolean existsByUserIdAndCreatedAtAfter(Long userId, Instant cutoff);

    java.util.List<RegistrationToken> findByUserIdAndUsedFalse(Long userId);

    void deleteByUserId(Long userId);
}
