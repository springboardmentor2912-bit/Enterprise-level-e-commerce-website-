package com.shopstack.shopstack_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SystemMonitoringResponse {

    private String applicationStatus;

    private String databaseStatus;

    private String apiStatus;

    private String environment;
}