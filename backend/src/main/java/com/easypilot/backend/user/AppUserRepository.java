package com.easypilot.backend.user;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {

    @EntityGraph(attributePaths = "organization")
    Optional<AppUser> findByUsernameIgnoreCase(String username);

    Optional<AppUser> findFirstByOrganizationId(Long organizationId);

    List<AppUser> findAllByOrganizationId(Long organizationId);

    boolean existsByUsernameIgnoreCase(String username);

    Optional<AppUser> findFirstByEmailIgnoreCase(String email);

    List<AppUser> findAllByRole(Role role);
}
