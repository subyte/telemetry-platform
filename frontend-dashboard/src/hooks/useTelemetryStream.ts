'use client';

import { useState, useEffect } from 'react';
import { TelemetryEvent } from '@/types/telemetry';

export function useTelemetryStream() {
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource('http://localhost:8081/api/stream');

    eventSource.onopen = () => setIsConnected(true);

    const handleTelemetry = (event: MessageEvent) => {
      try {
        const data: TelemetryEvent = JSON.parse(event.data);
        setEvents((prev) => [...prev.slice(-29), data]);
      } catch (err) {
        console.error('Failed to parse SSE payload', err);
      }
    };

    // Listen to the custom named SSE event
    eventSource.addEventListener('telemetry-event', handleTelemetry);
    // Fallback for default message events
    eventSource.onmessage = handleTelemetry;

    eventSource.onerror = () => {
      setIsConnected(false);
      eventSource.close();
    };

    return () => {
      eventSource.removeEventListener('telemetry-event', handleTelemetry);
      eventSource.close();
    };
  }, []);

  return { events, isConnected };
}