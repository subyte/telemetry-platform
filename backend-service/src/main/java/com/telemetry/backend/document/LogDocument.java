package com.telemetry.backend.document;

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
public class LogDocument {
    private String id;
    private String eventId;
    private String timestamp;
    private String serviceId;
    private String environment;
    private String host;
    private String level;
    private String message;
    private String traceId;
}