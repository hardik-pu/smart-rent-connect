'use client';

import React, { useEffect, useState } from 'react';
import { checkBackendHealth, HealthResponse } from '@/lib/api';
import { CheckCircle2, AlertCircle, RefreshCw, Server, Database, Activity } from 'lucide-react';

export default function HealthChecker() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await checkBackendHealth();
      setHealth(data);
    } catch (err: any) {
      setError(err.message || 'Unable to reach backend API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    // Re-check periodically every 15 seconds
    const timer = setInterval(fetchHealth, 15000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              System Health & Service Gateway
            </h3>
            <p className="text-xs text-slate-500">
              Real-time synchronization between Frontend, Express API, and MongoDB
            </p>
          </div>
        </div>

        <button
          onClick={fetchHealth}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-60 rounded-lg transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Verifying...' : 'Refresh Status'}
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Backend Status */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-3">
          <Server className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <div className="text-xs font-medium text-slate-500">Backend Express API</div>
            <div className="mt-1 flex items-center gap-1.5 font-semibold text-sm text-slate-800">
              {loading && !health ? (
                <span className="text-slate-400">Connecting...</span>
              ) : health?.status === 'healthy' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-700">Online (v{health.version})</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  <span className="text-rose-700">Offline / Waiting</span>
                </>
              )}
            </div>
            {health && (
              <div className="text-[11px] text-slate-400 mt-0.5">
                Uptime: {health.uptimeSeconds}s
              </div>
            )}
          </div>
        </div>

        {/* Database Status */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-3">
          <Database className="w-5 h-5 text-emerald-600 mt-0.5" />
          <div>
            <div className="text-xs font-medium text-slate-500">MongoDB Database</div>
            <div className="mt-1 flex items-center gap-1.5 font-semibold text-sm text-slate-800">
              {loading && !health ? (
                <span className="text-slate-400">Checking...</span>
              ) : health?.database?.connected ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-700">Connected ({health.database.status})</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span className="text-amber-700">
                    {health ? health.database.status : 'Pending'}
                  </span>
                </>
              )}
            </div>
            {health && (
              <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[170px]" title={health.database.host}>
                Host: {health.database.host}
              </div>
            )}
          </div>
        </div>

        {/* Frontend Connection */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-3">
          <Activity className="w-5 h-5 text-indigo-600 mt-0.5" />
          <div>
            <div className="text-xs font-medium text-slate-500">API Handshake</div>
            <div className="mt-1 flex items-center gap-1.5 font-semibold text-sm text-slate-800">
              {error ? (
                <>
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  <span className="text-rose-700 text-xs">Error Connecting</span>
                </>
              ) : health ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-700">Operational</span>
                </>
              ) : (
                <span className="text-slate-400">Verifying...</span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Target: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>Backend connection notice: {error}. Ensure backend server is running on port 5000.</span>
        </div>
      )}
    </div>
  );
}
