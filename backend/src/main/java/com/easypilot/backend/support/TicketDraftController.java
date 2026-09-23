package com.easypilot.backend.support;

import com.easypilot.backend.user.CurrentUserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/support/drafts")
public class TicketDraftController {

    private final TicketDraftService draftService;
    private final CurrentUserService currentUserService;

    public TicketDraftController(TicketDraftService draftService, CurrentUserService currentUserService) {
        this.draftService = draftService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public List<TicketDraftDto> list(Authentication authentication) {
        return draftService.listDrafts(currentUserService.require(authentication));
    }

    @GetMapping("/reply/{ticketId}")
    public ResponseEntity<TicketDraftDto> getReply(@PathVariable Long ticketId, Authentication authentication) {
        return draftService.getReplyDraft(ticketId, currentUserService.require(authentication))
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PutMapping("/reply/{ticketId}")
    public ResponseEntity<TicketDraftDto> saveReply(@PathVariable Long ticketId,
                                                    @Valid @RequestBody TicketDraftRequest request,
                                                    Authentication authentication) {
        return draftService.saveReplyDraft(ticketId, request.body(), currentUserService.require(authentication))
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PostMapping
    public TicketDraftDto createNewTicketDraft(@Valid @RequestBody TicketDraftRequest request,
                                               Authentication authentication) {
        return draftService.createNewTicketDraft(request, currentUserService.require(authentication));
    }

    @PutMapping("/{draftId}")
    public TicketDraftDto updateNewTicketDraft(@PathVariable Long draftId, @Valid @RequestBody TicketDraftRequest request,
                                               Authentication authentication) {
        return draftService.updateNewTicketDraft(draftId, request, currentUserService.require(authentication));
    }

    @DeleteMapping("/{draftId}")
    public ResponseEntity<Void> delete(@PathVariable Long draftId, Authentication authentication) {
        draftService.deleteDraft(draftId, currentUserService.require(authentication));
        return ResponseEntity.noContent().build();
    }
}
