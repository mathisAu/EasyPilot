package com.easypilot.backend.support;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {

    @EntityGraph(attributePaths = {"createdBy", "organization"})
    List<SupportTicket> findAllByOrderByUpdatedAtDesc();

    @EntityGraph(attributePaths = {"createdBy", "organization"})
    List<SupportTicket> findByOrganizationIdOrderByUpdatedAtDesc(Long organizationId);

    boolean existsByCreatedByIdAndCreatedAtAfter(Long createdById, Instant after);

    List<SupportTicket> findByCreatedById(Long createdById);
}
