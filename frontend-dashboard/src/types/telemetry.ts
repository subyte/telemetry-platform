export interface MetricData {
  cpuUsage: number;
  memoryUsage: number;
  latencyMs: number;
  statusCode: number;
  activeConnections: number;
}

export interface LogData {
  level: string;
  message: string;
  traceId: string;
}

export interface TelemetryEvent {
  eventId: string;
  timestamp: string;
  serviceId: string;
  environment: string;
  host: string;
  metrics: MetricData;
  log?: LogData;
}

export interface Incident {
  id: number;
  serviceName?: string;
  serviceId?: string;
  incidentType: string;
  severity: string;
  description: string;
  status: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface LogDocument {
  id?: string;
  serviceName: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  traceId?: string;
  timestamp: string;
}