package com.shopstack.shopstack_backend.service.impl;

import com.shopstack.shopstack_backend.dto.response.SystemMonitoringResponse;
import com.shopstack.shopstack_backend.service.SystemMonitoringService;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;

@Service
public class SystemMonitoringServiceImpl
        implements SystemMonitoringService {

    private final DataSource dataSource;

    public SystemMonitoringServiceImpl(
            DataSource dataSource) {

        this.dataSource = dataSource;
    }

    @Override
    public SystemMonitoringResponse getSystemStatus() {

        String databaseStatus = checkDatabase();

        return new SystemMonitoringResponse(
                "RUNNING",
                databaseStatus,
                "ONLINE",
                "DEVELOPMENT"
        );
    }

    // =========================
    // CHECK DATABASE
    // =========================

    private String checkDatabase() {

        try (Connection connection =
                     dataSource.getConnection()) {

            if (connection.isValid(2)) {
                return "ONLINE";
            }

        } catch (Exception exception) {

            System.out.println(
                    "Database health check failed: "
                            + exception.getMessage()
            );
        }

        return "OFFLINE";
    }
}