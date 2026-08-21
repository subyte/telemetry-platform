'use client';

import React from 'react';
import { TelemetryEvent } from '@/types/telemetry';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function MetricsChart({ events }: { events: TelemetryEvent[] }) {
  const chartData = events.map((e) => ({
    time: e.timestamp ? new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '',
    cpu: e.metrics?.cpuUsage ?? 0,
    latency: e.metrics?.latencyMs ?? 0,
    service: e.serviceId ?? 'unknown',
  }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-100 mb-4">Live CPU & Latency Telemetry</h2>
      <div className="h-72 w-full min-h-[280px]">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm">
            Waiting for real-time telemetry stream...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
              />
              <Line type="monotone" dataKey="cpu" stroke="#38bdf8" name="CPU (%)" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="latency" stroke="#f43f5e" name="Latency (ms)" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}