package com.shopstack.backend.controller;

import com.shopstack.backend.entity.Notification;
import com.shopstack.backend.service.JwtService;
import com.shopstack.backend.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private JwtService jwtService;


    // ==========================================
    // GET ALL NOTIFICATIONS
    // ==========================================

    @GetMapping
    public ResponseEntity<?> getNotifications(
            @RequestHeader("Authorization") String authHeader
    ) {

        try {

            String token = authHeader.substring(7);

            String email = jwtService.extractEmail(token);

            List<Notification> notifications =
                    notificationService.getMyNotifications(email);

            return ResponseEntity.ok(notifications);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // ==========================================
    // GET UNREAD COUNT
    // ==========================================

    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(
            @RequestHeader("Authorization") String authHeader
    ) {

        try {

            String token = authHeader.substring(7);

            String email = jwtService.extractEmail(token);

            long count =
                    notificationService.getUnreadCount(email);

            return ResponseEntity.ok(count);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // ==========================================
    // MARK AS READ
    // ==========================================

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader
    ) {

        try {

            String token = authHeader.substring(7);

            String email = jwtService.extractEmail(token);

            notificationService.markAsRead(
                    id,
                    email
            );

            return ResponseEntity.ok(
                    "Notification marked as read"
            );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}