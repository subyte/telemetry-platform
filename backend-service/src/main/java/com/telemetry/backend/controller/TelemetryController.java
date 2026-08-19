package com.telemetry.backend.controller;

import com.telemetry.backend.document.LogDocument;
import com.telemetry.backend.entity.Incident;
import com.telemetry.backend.repository.IncidentRepository;
import com.telemetry.backend.service.LogIndexerService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class TelemetryController {

    private final IncidentRepository incidentRepository;
    private final LogIndexerService logIndexerService;
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    public TelemetryController(IncidentRepository incidentRepository, LogIndexerService logIndexerService) {
        this.incidentRepository = incidentRepository;
        this.logIndexerService = logIndexerService;
    }

    // 1. Incidents Endpoints
    @GetMapping("/incidents")
    public List<Incident> getAllIncidents(@RequestParam(required = false) String status) {
        if (status != null && !status.isEmpty()) {
            return incidentRepository.findByStatusOrderByCreatedAtDesc(status.toUpperCase());
        }
        return incidentRepository.findAll();
    }

    @PatchMapping("/incidents/{id}/resolve")
    public ResponseEntity<Incident> resolveIncident(@PathVariable Long id) {
        return incidentRepository.findById(id)
                .map(incident -> {
                    incident.setStatus("RESOLVED");
                    return ResponseEntity.ok(incidentRepository.save(incident));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 2. Elasticsearch Logs Search Endpoint
    @GetMapping("/logs")
    public List<LogDocument> searchLogs(@RequestParam(required = false) String q) {
        return logIndexerService.searchLogs(q);
    }

    // 3. SSE Stream Endpoint
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamTelemetry() {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.add(emitter);

        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError(e -> emitters.remove(emitter));

        return emitter;
    }

    public void broadcastEvent(Object event) {
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name("telemetry-event").data(event));
            } catch (IOException e) {
                emitters.remove(emitter);
            }
        }
    }
}