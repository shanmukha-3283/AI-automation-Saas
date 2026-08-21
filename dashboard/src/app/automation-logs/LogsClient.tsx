"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Menu, X, Terminal, ArrowDownToLine } from "lucide-react";

interface LogEntry {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  createdAt: string;
  leadName: string | null;
  channel: string;
}

export function LogsClient({ clientId }: { clientId: string }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch(`${API_URL}/api/logs?clientId=${clientId}`);
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs || []);
        }
      } catch (err) {
        console.error("Failed to fetch logs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
    
    // Optional: Poll every 10s for new logs
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, [clientId, API_URL]);

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-900 font-sans overflow-hidden">
      <button 
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-lg border border-slate-200 shadow-sm"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="w-5 h-5 text-slate-500" /> : <Menu className="w-5 h-5 text-slate-500" />}
      </button>

      <Sidebar role="tenant" isMobileMenuOpen={isMobileMenuOpen} />

      <main className="flex-1 flex flex-col bg-white border-l border-slate-200 shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-30 min-w-0">
        <header className="h-20 border-b border-slate-200 px-6 md:px-10 flex items-center justify-between shrink-0 bg-white">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Terminal className="w-6 h-6 text-slate-400" />
              Automation Logs
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">Raw telemetry of all AI interactions in your workspace.</p>
          </div>
          <button className="hidden md:flex items-center gap-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors">
            <ArrowDownToLine className="w-4 h-4" />
            Export CSV
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-0 overflow-hidden ring-1 ring-slate-900/5 animate-fade-in-up">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-xs text-slate-500 bg-slate-50/80 sticky top-0 z-10 border-b border-slate-200 shadow-sm uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-bold">Timestamp</th>
                    <th className="px-6 py-4 font-bold">Role</th>
                    <th className="px-6 py-4 font-bold">Lead</th>
                    <th className="px-6 py-4 font-bold">Channel</th>
                    <th className="px-6 py-4 font-bold w-full">Payload / Content</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="h-32 text-center text-slate-400">Loading logs...</td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="h-32 text-center text-slate-400">No automation logs recorded yet.</td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors font-mono text-[13px]">
                        <td className="px-6 py-4 text-slate-500">
                          {new Date(log.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full font-semibold text-[11px] uppercase tracking-wider ${
                            log.role === 'agent' ? 'bg-blue-100 text-blue-700' :
                            log.role === 'system' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {log.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-700">
                          {log.leadName || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {log.channel}
                        </td>
                        <td className="px-6 py-4 whitespace-normal break-words max-w-xl">
                          <div className="text-slate-800 line-clamp-2 hover:line-clamp-none">
                            {log.content}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
