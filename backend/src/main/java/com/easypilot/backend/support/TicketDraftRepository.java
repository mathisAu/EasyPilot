package com.easypilot.backend.support;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TicketDraftRepository extends JpaRepository<TicketDraft, Long> {

    List<TicketDraft> findByAuthorIdOrderByUpdatedAtDesc(Long authorId);

    Optional<TicketDraft> findByAuthorIdAndTicketId(Long authorId, Long ticketId);

    void deleteByAuthorIdAndTicketId(Long authorId, Long ticketId);
}
