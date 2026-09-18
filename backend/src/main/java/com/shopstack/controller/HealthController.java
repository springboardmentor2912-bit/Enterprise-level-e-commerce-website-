package com.shopstack.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final DataSource dataSource;

    @Value("${server.port:8081}")
    private int serverPort;

    public HealthController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "ShopStack Enterprise Multi-Vendor Platform Backend");
        health.put("version", "1.0.0");
        health.put("serverPort", serverPort);
        health.put("timestamp", LocalDateTime.now().toString());

        String dbStatus = "UNKNOWN";
        try (Connection conn = dataSource.getConnection()) {
            if (conn.isValid(2)) {
                dbStatus = "CONNECTED";
                health.put("databaseProduct", conn.getMetaData().getDatabaseProductName());
            } else {
                dbStatus = "DEGRADED";
            }
        } catch (Exception ex) {
            dbStatus = "DISCONNECTED: " + ex.getMessage();
        }
        health.put("database", dbStatus);

        return ResponseEntity.ok(health);
    }
}
