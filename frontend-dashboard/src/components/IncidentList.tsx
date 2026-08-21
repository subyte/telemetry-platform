'use client';

import { useState, useEffect } from 'react';
import { Incident } from '@/types/telemetry';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function IncidentList() {
  const [incidents, setIncidents] = useState<Incident[]>([]);

  const fetchIncidents = async () => {
    try {
      const res = await fetch('http://localhost:8081/api/incidents');
      if (res.ok) setIncidents(await res.json());
    } catch (err) {
      console.error('Failed to load incidents', err);
    }
  };

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 3000);
    return () => clearInterval(interval);
  }, []);

  const resolveIncident = async (id: number) => {
    await fetch(`http://localhost:8081/api/incidents/${id}/resolve`, { method: 'PATCH' });
    fetchIncidents();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
        <AlertCircle className="text-amber-400 h-5 w-5" /> Active Incidents
      </h2>
      <div className="overflow-x-auto max-h-[340px] overflow-y-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-xs uppercase bg-slate-800/60 text-slate-400 border-b border-slate-700">
            <tr>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {incidents.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  No active incidents detected.
                </td>
              </tr>
            ) : (
              incidents.map((inc) => (
                <tr key={inc.id} className="border-b border-slate-800/60 hover:bg-slate-800/30">
                  <td className="px-4 py-3 font-medium text-slate-200">{inc.serviceName || 'auth-service'}</td>
                  <td className="px-4 py-3">{inc.incidentType || 'HIGH_LATENCY'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        inc.severity === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {inc.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3">{inc.status}</td>
                  <td className="px-4 py-3">
                    {inc.status === 'OPEN' && (
                      <button
                        onClick={() => resolveIncident(inc.id)}
                        className="flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-2 py-1 rounded transition"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}