package com.easypilot.backend.notification;

import com.easypilot.backend.common.ResourceNotFoundException;
import com.easypilot.backend.user.AppUser;
import com.easypilot.backend.user.AppUserRepository;
import com.easypilot.backend.user.Role;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final AppUserRepository appUserRepository;

    public NotificationService(NotificationRepository notificationRepository, AppUserRepository appUserRepository) {
        this.notificationRepository = notificationRepository;
        this.appUserRepository = appUserRepository;
    }

    @Transactional
    public void notifyUser(AppUser recipient, String title, String body, NotificationTargetType targetType, Long targetId) {
        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setTitle(title);
        notification.setBody(body);
        notification.setTargetType(targetType);
        notification.setTargetId(targetId);
        notificationRepository.save(notification);
    }

    @Transactional
    public void notifyAllAdmins(String title, String body, NotificationTargetType targetType, Long targetId) {
        for (AppUser admin : appUserRepository.findAllByRole(Role.ADMIN)) {
            notifyUser(admin, title, body, targetType, targetId);
        }
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> listForUser(AppUser user) {
        return notificationRepository.findTop50ByRecipientIdOrderByCreatedAtDesc(user.getId())
                .stream().map(NotificationDto::from).toList();
    }

    @Transactional(readOnly = true)
    public long countUnread(AppUser user) {
        return notificationRepository.countByRecipientIdAndReadFalse(user.getId());
    }

    @Transactional
    public NotificationDto markRead(Long id, AppUser user) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Melding niet gevonden"));
        if (!notification.getRecipient().getId().equals(user.getId())) {
            throw new AccessDeniedException("Geen toegang tot deze melding");
        }
        notification.setRead(true);
        notificationRepository.save(notification);
        return NotificationDto.from(notification);
    }

    @Transactional
    public void markAllRead(AppUser user) {
        notificationRepository.findByRecipientIdAndReadFalse(user.getId())
                .forEach(notification -> notification.setRead(true));
    }
}
