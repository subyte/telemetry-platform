package com.telemetry.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class TelemetryEvent {

    @JsonProperty("eventId")
    private String eventId;

    @JsonProperty("timestamp")
    private String timestamp;

    @JsonProperty("serviceId")
    private String serviceId;

    @JsonProperty("environment")
    private String environment;

    @JsonProperty("host")
    private String host;

    @JsonProperty("metrics")
    private MetricData metrics;

    @JsonProperty("log")
    private LogData log;
}