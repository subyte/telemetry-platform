'use client';

import React, { useState } from 'react';
import { LogDocument } from '@/types/telemetry';
import { Search, Terminal } from 'lucide-react';

export function LogViewer() {
  const [query, setQuery] = useState('');
  const [logs, setLogs] = useState<LogDocument[]>([]);
  const [loading, setLoading] = useState(false);

  const searchLogs = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8081/api/logs?query=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error('Failed to search logs', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <Terminal className="text-sky-400 h-5 w-5" /> Elasticsearch Log Query
        </h2>
        <form onSubmit={searchLogs} className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search error, traceId, service..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-lg pl-9 pr-4 py-1.5 focus:outline-none focus:border-sky-500 w-64"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-sky-600 hover:bg-sky-500 text-white text-sm px-3 py-1.5 rounded-lg transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-4 font-mono text-xs text-slate-300 h-64 overflow-y-auto space-y-2">
        {logs.length === 0 ? (
          <p className="text-slate-600 text-center py-20">No matching logs found. Enter a keyword or click Search to query.</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 border-b border-slate-900 pb-2">
              <span className="text-slate-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
              <span
                className={`font-semibold px-1 rounded ${
                  log.level === 'ERROR'
                    ? 'text-rose-400 bg-rose-950/40'
                    : log.level === 'WARN'
                    ? 'text-amber-400 bg-amber-950/40'
                    : 'text-emerald-400 bg-emerald-950/40'
                }`}
              >
                {log.level}
              </span>
              <span className="text-sky-400">{log.serviceName}:</span>
              <span className="text-slate-200 flex-1">{log.message}</span>
              <span className="text-slate-600">trace:{log.traceId?.slice(0, 8) ?? 'N/A'}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}