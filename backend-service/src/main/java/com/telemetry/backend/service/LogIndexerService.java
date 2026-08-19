package com.telemetry.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.telemetry.backend.document.LogDocument;
import com.telemetry.backend.dto.TelemetryEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
public class LogIndexerService {

    private static final Logger log = LoggerFactory.getLogger(LogIndexerService.class);
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public LogIndexerService() {
        this.restClient = RestClient.builder()
                .baseUrl("http://localhost:9200")
                .defaultHeader("Content-Type", "application/json")
                .defaultHeader("Accept", "application/json")
                .build();
        this.objectMapper = new ObjectMapper();
    }

    public void indexLog(TelemetryEvent event) {
        if (event.getLog() == null) {
            return;
        }

        try {
            LogDocument doc = LogDocument.builder()
                    .id(UUID.randomUUID().toString())
                    .eventId(event.getEventId())
                    .timestamp(event.getTimestamp())
                    .serviceId(event.getServiceId())
                    .environment(event.getEnvironment())
                    .host(event.getHost())
                    .level(event.getLog().getLevel())
                    .message(event.getLog().getMessage())
                    .traceId(event.getLog().getTraceId())
                    .build();

            restClient.post()
                    .uri("/telemetry-logs/_doc/" + doc.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(doc)
                    .retrieve()
                    .toBodilessEntity();

        } catch (Exception e) {
            log.error("Failed to index log in Elasticsearch: {}", e.getMessage());
        }
    }

    public List<LogDocument> searchLogs(String query) {
        try {
            String esQuery;
            if (query != null && !query.trim().isEmpty()) {
                esQuery = """
                {
                  "size": 50,
                  "sort": [ { "timestamp": "desc" } ],
                  "query": {
                    "multi_match": {
                      "query": "%s",
                      "fields": ["message", "serviceId", "level", "traceId"]
                    }
                  }
                }
                """.formatted(query);
            } else {
                esQuery = """
                {
                  "size": 50,
                  "sort": [ { "timestamp": "desc" } ],
                  "query": { "match_all": {} }
                }
                """;
            }

            String response = restClient.post()
                    .uri("/telemetry-logs/_search")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(esQuery)
                    .retrieve()
                    .body(String.class);

            List<LogDocument> logs = new ArrayList<>();
            JsonNode rootNode = objectMapper.readTree(response);
            JsonNode hits = rootNode.path("hits").path("hits");

            if (hits.isArray()) {
                for (JsonNode hit : hits) {
                    JsonNode source = hit.path("_source");
                    LogDocument doc = objectMapper.treeToValue(source, LogDocument.class);
                    logs.add(doc);
                }
            }
            return logs;

        } catch (Exception e) {
            log.warn("Log search failed (index might not exist yet or warming up): {}", e.getMessage());
            return Collections.emptyList();
        }
    }
}