package com.telemetry.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class MetricData {
    private Double cpuUsage;
    private Double memoryUsage;
    private Double latencyMs;
    private Integer statusCode;
    private Integer activeConnections;
}