package com.shopstack.dto;

import java.util.Map;

public class SystemHealthResponse {
    private String status;
    private long uptimeSeconds;
    private int serverPort;
    private String javaVersion;
    private double heapMemoryUsedMB;
    private double heapMemoryMaxMB;
    private double heapMemoryTotalMB;
    private double nonHeapMemoryUsedMB;
    private int activeThreadCount;
    private int availableProcessors;
    private String databaseStatus;
    private String databaseType;
    private Map<String, Long> entityCounts;
    private String paymentGatewayStatus;
    private String timestamp;

    public SystemHealthResponse() {}

    public SystemHealthResponse(String status, long uptimeSeconds, int serverPort, String javaVersion,
                                double heapMemoryUsedMB, double heapMemoryMaxMB, double heapMemoryTotalMB,
                                double nonHeapMemoryUsedMB, int activeThreadCount, int availableProcessors,
                                String databaseStatus, String databaseType, Map<String, Long> entityCounts,
                                String paymentGatewayStatus, String timestamp) {
        this.status = status;
        this.uptimeSeconds = uptimeSeconds;
        this.serverPort = serverPort;
        this.javaVersion = javaVersion;
        this.heapMemoryUsedMB = heapMemoryUsedMB;
        this.heapMemoryMaxMB = heapMemoryMaxMB;
        this.heapMemoryTotalMB = heapMemoryTotalMB;
        this.nonHeapMemoryUsedMB = nonHeapMemoryUsedMB;
        this.activeThreadCount = activeThreadCount;
        this.availableProcessors = availableProcessors;
        this.databaseStatus = databaseStatus;
        this.databaseType = databaseType;
        this.entityCounts = entityCounts;
        this.paymentGatewayStatus = paymentGatewayStatus;
        this.timestamp = timestamp;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public long getUptimeSeconds() { return uptimeSeconds; }
    public void setUptimeSeconds(long uptimeSeconds) { this.uptimeSeconds = uptimeSeconds; }

    public int getServerPort() { return serverPort; }
    public void setServerPort(int serverPort) { this.serverPort = serverPort; }

    public String getJavaVersion() { return javaVersion; }
    public void setJavaVersion(String javaVersion) { this.javaVersion = javaVersion; }

    public double getHeapMemoryUsedMB() { return heapMemoryUsedMB; }
    public void setHeapMemoryUsedMB(double heapMemoryUsedMB) { this.heapMemoryUsedMB = heapMemoryUsedMB; }

    public double getHeapMemoryMaxMB() { return heapMemoryMaxMB; }
    public void setHeapMemoryMaxMB(double heapMemoryMaxMB) { this.heapMemoryMaxMB = heapMemoryMaxMB; }

    public double getHeapMemoryTotalMB() { return heapMemoryTotalMB; }
    public void setHeapMemoryTotalMB(double heapMemoryTotalMB) { this.heapMemoryTotalMB = heapMemoryTotalMB; }

    public double getNonHeapMemoryUsedMB() { return nonHeapMemoryUsedMB; }
    public void setNonHeapMemoryUsedMB(double nonHeapMemoryUsedMB) { this.nonHeapMemoryUsedMB = nonHeapMemoryUsedMB; }

    public int getActiveThreadCount() { return activeThreadCount; }
    public void setActiveThreadCount(int activeThreadCount) { this.activeThreadCount = activeThreadCount; }

    public int getAvailableProcessors() { return availableProcessors; }
    public void setAvailableProcessors(int availableProcessors) { this.availableProcessors = availableProcessors; }

    public String getDatabaseStatus() { return databaseStatus; }
    public void setDatabaseStatus(String databaseStatus) { this.databaseStatus = databaseStatus; }

    public String getDatabaseType() { return databaseType; }
    public void setDatabaseType(String databaseType) { this.databaseType = databaseType; }

    public Map<String, Long> getEntityCounts() { return entityCounts; }
    public void setEntityCounts(Map<String, Long> entityCounts) { this.entityCounts = entityCounts; }

    public String getPaymentGatewayStatus() { return paymentGatewayStatus; }
    public void setPaymentGatewayStatus(String paymentGatewayStatus) { this.paymentGatewayStatus = paymentGatewayStatus; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}
