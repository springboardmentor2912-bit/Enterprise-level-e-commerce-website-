package com.shopstack.repository;

import com.shopstack.model.Notification;
import com.shopstack.model.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Notification> findByRecipientEmailOrderByCreatedAtDesc(String email);

    List<Notification> findByReferenceIdOrderByCreatedAtDesc(String referenceId);

    List<Notification> findByTypeOrderByCreatedAtDesc(NotificationType type);

    long countByUserIdAndIsReadFalse(Long userId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user.id = :userId")
    void markAllAsReadForUser(@Param("userId") Long userId);
}
