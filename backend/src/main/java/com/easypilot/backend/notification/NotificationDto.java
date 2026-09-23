package com.easypilot.backend.notification;

import java.time.Instant;

public record NotificationDto(
        Long id,
        String title,
        String body,
        NotificationTargetType targetType,
        Long targetId,
        boolean read,
        Instant createdAt
) {
    static NotificationDto from(Notification notification) {
        return new NotificationDto(
                notification.getId(),
                notification.getTitle(),
                notification.getBody(),
                notification.getTargetType(),
                notification.getTargetId(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }
}
