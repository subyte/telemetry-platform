package com.telemetry.backend.service;

import com.telemetry.backend.dto.TelemetryEvent;
import com.telemetry.backend.entity.Incident;
import com.telemetry.backend.repository.IncidentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AlertEngineService {

    private static final Logger log = LoggerFactory.getLogger(AlertEngineService.class);
    private final IncidentRepository incidentRepository;

    public AlertEngineService(IncidentRepository incidentRepository) {
        this.incidentRepository = incidentRepository;
    }

    public void evaluateEvent(TelemetryEvent event) {
        // Rule 1: High CPU Check (> 80%)
        if (event.getMetrics() != null && event.getMetrics().getCpuUsage() != null && event.getMetrics().getCpuUsage() > 80.0) {
            triggerIncident(
                    event,
                    "HIGH_CPU_UTILIZATION",
                    event.getMetrics().getCpuUsage() > 90.0 ? "CRITICAL" : "WARNING",
                    String.format("CPU utilization reached %.1f%% on host %s", event.getMetrics().getCpuUsage(), event.getHost())
            );
        }

        // Rule 2: HTTP 500 or Error Log Check
        boolean isServerError = event.getMetrics() != null && event.getMetrics().getStatusCode() != null && event.getMetrics().getStatusCode() == 500;
        boolean isErrorLog = event.getLog() != null && "ERROR".equalsIgnoreCase(event.getLog().getLevel());

        if (isServerError || isErrorLog) {
            String logMsg = (event.getLog() != null && event.getLog().getMessage() != null) 
                    ? event.getLog().getMessage() 
                    : "HTTP 500 Internal Server Error returned";
            
            triggerIncident(
                    event,
                    "SERVICE_ERROR_SPIKE",
                    "CRITICAL",
                    String.format("Error detected in %s: %s", event.getServiceId(), logMsg)
            );
        }
    }

    private void triggerIncident(TelemetryEvent event, String ruleName, String severity, String description) {
        Incident incident = Incident.builder()
                .eventId(event.getEventId())
                .serviceId(event.getServiceId())
                .ruleName(ruleName)
                .severity(severity)
                .description(description)
                .createdAt(LocalDateTime.now())
                .status("OPEN")
                .build();

        Incident saved = incidentRepository.save(incident);
        log.warn("🚨 [INCIDENT TRIGGERED] ID: {} | Service: {} | Rule: {} | Severity: {} | Description: {}",
                saved.getId(), saved.getServiceId(), saved.getRuleName(), saved.getSeverity(), saved.getDescription());
    }
}
