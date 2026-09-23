package com.easypilot.backend.support;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface TicketMessageRepository extends JpaRepository<TicketMessage, Long> {

    @EntityGraph(attributePaths = "author")
    List<TicketMessage> findByTicketIdOrderByCreatedAtAsc(Long ticketId);

    long countByTicketId(Long ticketId);

    @EntityGraph(attributePaths = "author")
    Optional<TicketMessage> findFirstByTicketIdOrderByCreatedAtDesc(Long ticketId);

    boolean existsByAuthorIdAndCreatedAtAfter(Long authorId, Instant after);
}
