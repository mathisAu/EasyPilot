package com.easypilot.backend.notification;

import com.easypilot.backend.user.AppUser;
import com.easypilot.backend.user.CurrentUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final CurrentUserService currentUserService;

    public NotificationController(NotificationService notificationService, CurrentUserService currentUserService) {
        this.notificationService = notificationService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    public ResponseEntity<List<NotificationDto>> list(Authentication authentication) {
        AppUser user = currentUserService.require(authentication);
        return ResponseEntity.ok(notificationService.listForUser(user));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> unreadCount(Authentication authentication) {
        AppUser user = currentUserService.require(authentication);
        return ResponseEntity.ok(Map.of("count", notificationService.countUnread(user)));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<NotificationDto> markRead(@PathVariable Long id, Authentication authentication) {
        AppUser user = currentUserService.require(authentication);
        return ResponseEntity.ok(notificationService.markRead(id, user));
    }

    @PostMapping("/read-all")
    public ResponseEntity<Void> markAllRead(Authentication authentication) {
        AppUser user = currentUserService.require(authentication);
        notificationService.markAllRead(user);
        return ResponseEntity.noContent().build();
    }
}
