package com.telemetry.backend.consumer;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.telemetry.backend.controller.TelemetryController;
import com.telemetry.backend.dto.TelemetryEvent;
import com.telemetry.backend.service.AlertEngineService;
import com.telemetry.backend.service.LogIndexerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class TelemetryConsumer {

    private static final Logger log = LoggerFactory.getLogger(TelemetryConsumer.class);
    private final ObjectMapper objectMapper;
    private final AlertEngineService alertEngineService;
    private final TelemetryController telemetryController;
    private final LogIndexerService logIndexerService;

    public TelemetryConsumer(AlertEngineService alertEngineService,
                             TelemetryController telemetryController,
                             LogIndexerService logIndexerService) {
        this.alertEngineService = alertEngineService;
        this.telemetryController = telemetryController;
        this.logIndexerService = logIndexerService;
        this.objectMapper = new ObjectMapper()
                .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    @KafkaListener(topics = "telemetry-events", groupId = "telemetry-backend-group")
    public void consumeTelemetry(String message) {
        TelemetryEvent event;
        try {
            event = objectMapper.readValue(message, TelemetryEvent.class);
        } catch (Exception e) {
            log.error("JSON Deserialization failed for payload: {}", message, e);
            return;
        }

        log.info("Received event: [{}] service={} cpu={}% latency={}ms status={}",
                event.getEventId(),
                event.getServiceId(),
                event.getMetrics() != null ? event.getMetrics().getCpuUsage() : "N/A",
                event.getMetrics() != null ? event.getMetrics().getLatencyMs() : "N/A",
                event.getMetrics() != null ? event.getMetrics().getStatusCode() : "N/A");

        try {
            // 1. Evaluate alert rules -> PostgreSQL
            alertEngineService.evaluateEvent(event);
        } catch (Exception e) {
            log.error("AlertEngineService failed for eventId {}: {}", event.getEventId(), e.getMessage());
        }

        try {
            // 2. Index log payload -> Elasticsearch
            logIndexerService.indexLog(event);
        } catch (Exception e) {
            log.error("LogIndexerService failed for eventId {}: {}", event.getEventId(), e.getMessage());
        }

        try {
            // 3. Broadcast to UI via SSE
            telemetryController.broadcastEvent(event);
        } catch (Exception e) {
            log.error("SSE Broadcast failed for eventId {}: {}", event.getEventId(), e.getMessage());
        }
    }
}