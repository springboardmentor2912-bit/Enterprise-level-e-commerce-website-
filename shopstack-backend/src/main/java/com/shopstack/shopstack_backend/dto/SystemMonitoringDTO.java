package com.shopstack.shopstack_backend.dto;

public class SystemMonitoringDTO {

    private String application;
    private String status;
    private String database;
    private String environment;

    private long uptimeSeconds;

    private long memoryUsed;
    private long memoryMax;

    private String timestamp;

    public SystemMonitoringDTO() {
    }

    public SystemMonitoringDTO(
            String application,
            String status,
            String database,
            String environment,
            long uptimeSeconds,
            long memoryUsed,
            long memoryMax,
            String timestamp) {

        this.application = application;
        this.status = status;
        this.database = database;
        this.environment = environment;
        this.uptimeSeconds = uptimeSeconds;
        this.memoryUsed = memoryUsed;
        this.memoryMax = memoryMax;
        this.timestamp = timestamp;
    }

    public String getApplication() {
        return application;
    }

    public String getStatus() {
        return status;
    }

    public String getDatabase() {
        return database;
    }

    public String getEnvironment() {
        return environment;
    }

    public long getUptimeSeconds() {
        return uptimeSeconds;
    }

    public long getMemoryUsed() {
        return memoryUsed;
    }

    public long getMemoryMax() {
        return memoryMax;
    }

    public String getTimestamp() {
        return timestamp;
    }
}