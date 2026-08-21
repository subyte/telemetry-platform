'use client';

import { useTelemetryStream } from '@/hooks/useTelemetryStream';
import { MetricsChart } from '@/components/MetricsChart';
import IncidentList from '@/components/IncidentList';
import { LogViewer } from '@/components/LogViewer';
import { Activity, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function Dashboard() {
  const { events, isConnected } = useTelemetryStream();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Real-Time Observability Engine</h1>
            <p className="text-sm text-slate-400">KRaft Kafka & Spring Boot Telemetry Pipeline</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {isConnected ? (
              <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-3 py-1 rounded-full">
                <ShieldCheck className="h-4 w-4" /> Live SSE Connected
              </span>
            ) : (
              <span className="flex items-center gap-1 text-rose-400 bg-rose-950/50 border border-rose-800/50 px-3 py-1 rounded-full">
                <ShieldAlert className="h-4 w-4" /> Stream Disconnected
              </span>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MetricsChart events={events} />
          <IncidentList />
        </div>
        <LogViewer />
      </div>
    </main>
  );
}