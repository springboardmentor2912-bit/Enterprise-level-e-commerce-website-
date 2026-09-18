package com.shopstack.shopstack_backend.service;

import com.shopstack.shopstack_backend.dto.response.SystemMonitoringResponse;

public interface SystemMonitoringService {

    SystemMonitoringResponse getSystemStatus();
}