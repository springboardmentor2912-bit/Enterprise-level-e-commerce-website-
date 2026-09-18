package com.shopstack.dto;

import java.util.Map;

public class AdminSystemHealthDTO {

    private String overallStatus; // "UP", "DEGRADED", "DOWN"
    private long timestamp;
    private ComponentHealth backendApi;
    private ComponentHealth database;
    private ComponentHealth authentication;
    private ComponentHealth productService;
    private ComponentHealth orderService;

    public AdminSystemHealthDTO() {
        this.timestamp = System.currentTimeMillis();
    }

    public static class ComponentHealth {
        private String status; // "UP", "DOWN"
        private String message;
        private Long latencyMs;
        private Map<String, Object> details;

        public ComponentHealth() {
        }

        public ComponentHealth(String status, String message, Long latencyMs, Map<String, Object> details) {
            this.status = status;
            this.message = message;
            this.latencyMs = latencyMs;
            this.details = details;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public Long getLatencyMs() {
            return latencyMs;
        }

        public void setLatencyMs(Long latencyMs) {
            this.latencyMs = latencyMs;
        }

        public Map<String, Object> getDetails() {
            return details;
        }

        public void setDetails(Map<String, Object> details) {
            this.details = details;
        }
    }

    public String getOverallStatus() {
        return overallStatus;
    }

    public void setOverallStatus(String overallStatus) {
        this.overallStatus = overallStatus;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    public ComponentHealth getBackendApi() {
        return backendApi;
    }

    public void setBackendApi(ComponentHealth backendApi) {
        this.backendApi = backendApi;
    }

    public ComponentHealth getDatabase() {
        return database;
    }

    public void setDatabase(ComponentHealth database) {
        this.database = database;
    }

    public ComponentHealth getAuthentication() {
        return authentication;
    }

    public void setAuthentication(ComponentHealth authentication) {
        this.authentication = authentication;
    }

    public ComponentHealth getProductService() {
        return productService;
    }

    public void setProductService(ComponentHealth productService) {
        this.productService = productService;
    }

    public ComponentHealth getOrderService() {
        return orderService;
    }

    public void setOrderService(ComponentHealth orderService) {
        this.orderService = orderService;
    }
}
