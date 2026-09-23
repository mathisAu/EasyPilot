package com.easypilot.backend.support;

import com.easypilot.backend.user.AppUser;
import com.easypilot.backend.user.CurrentUserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/support/tickets")
public class SupportController {

    private final SupportTicketService ticketService;
    private final CurrentUserService currentUserService;

    public SupportController(SupportTicketService ticketService, CurrentUserService currentUserService) {
        this.ticketService = ticketService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public ResponseEntity<List<TicketSummaryDto>> list(Authentication authentication) {
        AppUser user = currentUserService.require(authentication);
        return ResponseEntity.ok(ticketService.listTickets(user));
    }

    @PostMapping
    public ResponseEntity<TicketDetailDto> create(@Valid @RequestBody CreateTicketRequest request,
                                                    Authentication authentication) {
        AppUser user = currentUserService.require(authentication);
        return ResponseEntity.ok(ticketService.createTicket(request, user));
    }

    @GetMapping("/{ticketId}")
    public ResponseEntity<TicketDetailDto> get(@PathVariable Long ticketId, Authentication authentication) {
        AppUser user = currentUserService.require(authentication);
        return ResponseEntity.ok(ticketService.getTicket(ticketId, user));
    }

    @PatchMapping("/{ticketId}/status")
    public ResponseEntity<TicketDetailDto> updateStatus(@PathVariable Long ticketId,
                                                          @Valid @RequestBody UpdateTicketStatusRequest request,
                                                          Authentication authentication) {
        AppUser user = currentUserService.require(authentication);
        return ResponseEntity.ok(ticketService.updateStatus(ticketId, request, user));
    }

    @PostMapping("/{ticketId}/messages")
    public ResponseEntity<TicketMessageDto> addMessage(@PathVariable Long ticketId,
                                                         @Valid @RequestBody MessageBodyRequest request,
                                                         Authentication authentication) {
        AppUser user = currentUserService.require(authentication);
        return ResponseEntity.ok(ticketService.addMessage(ticketId, request, user));
    }

    @PatchMapping("/{ticketId}/messages/{messageId}")
    public ResponseEntity<TicketMessageDto> editMessage(@PathVariable Long ticketId, @PathVariable Long messageId,
                                                          @Valid @RequestBody MessageBodyRequest request,
                                                          Authentication authentication) {
        AppUser user = currentUserService.require(authentication);
        return ResponseEntity.ok(ticketService.editMessage(ticketId, messageId, request, user));
    }

    @DeleteMapping("/{ticketId}/messages/{messageId}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long ticketId, @PathVariable Long messageId,
                                               Authentication authentication) {
        AppUser user = currentUserService.require(authentication);
        ticketService.deleteMessage(ticketId, messageId, user);
        return ResponseEntity.noContent().build();
    }
}
