import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { getErrorMessage } from '../api/errorUtils';
import {
  Activity,
  Database,
  Shield,
  Package,
  ShoppingBag,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Wifi,
} from 'lucide-react';

const AdminSystemMonitoringPage = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await axiosClient.get('/admin/system/health');
      setHealth(res.data);
      setLastRefreshed(new Date());
    } catch (err) {
      setErrorMsg(getErrorMessage(err, 'Failed to load system health.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const OverallStatusBadge = ({ status }) => {
    if (status === 'UP') {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">All Systems Operational</span>
        </div>
      );
    }
    if (status === 'DEGRADED') {
      return (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-black text-amber-400 uppercase tracking-wider">Degraded Performance</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/30 rounded-full">
        <div className="w-2 h-2 rounded-full bg-rose-400" />
        <span className="text-xs font-black text-rose-400 uppercase tracking-wider">System Issues Detected</span>
      </div>
    );
  };

  const ServiceCard = ({ title, icon: Icon, data, accentColor = 'emerald' }) => {
    if (!data) return null;

    const isUp = data.status === 'UP';
    const colorMap = {
      emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
      blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', dot: 'bg-blue-400' },
      amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-400' },
      purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', dot: 'bg-purple-400' },
      indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-400', dot: 'bg-indigo-400' },
    };
    const c = colorMap[accentColor];

    return (
      <div className={`bg-slate-900/90 border rounded-2xl p-5 shadow-lg transition-all ${isUp ? 'border-slate-800' : 'border-rose-900/40'}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${c.bg} ${c.border}`}>
              <Icon className={`w-5 h-5 ${c.text}`} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">{title}</p>
              <p className="text-[10px] text-slate-400">{data.message}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isUp ? c.dot + ' animate-pulse' : 'bg-rose-400'}`} />
            <span className={`text-[11px] font-bold ${isUp ? c.text : 'text-rose-400'}`}>
              {data.status}
            </span>
          </div>
        </div>

        {/* Latency */}
        {data.latencyMs !== null && data.latencyMs !== undefined && (
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs text-slate-400">Response Time:</span>
            <span className={`text-xs font-bold ${data.latencyMs < 10 ? 'text-emerald-400' : data.latencyMs < 100 ? 'text-amber-400' : 'text-rose-400'}`}>
              {data.latencyMs}ms
            </span>
          </div>
        )}

        {/* Details */}
        {data.details && Object.keys(data.details).length > 0 && (
          <div className="bg-slate-950 rounded-xl p-3 space-y-1.5 mt-2">
            {Object.entries(data.details).map(([key, val]) => (
              <div key={key} className="flex justify-between text-xs">
                <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span className="font-mono text-slate-200 font-bold">{String(val)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading && !health) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 text-sm">Checking System Health...</p>
        </div>
      </div>
    );
  }

  if (errorMsg && !health) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center">
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-3xl p-6 text-center max-w-lg space-y-3">
          <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">System Monitoring Error</h2>
          <p className="text-xs text-rose-300">{errorMsg}</p>
          <button onClick={fetchHealth} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 mx-auto cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Activity className="w-6 h-6" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">System Monitoring</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">Live health checks — auto-refreshes every 30 seconds</p>
          </div>
          <div className="flex items-center gap-3">
            {lastRefreshed && (
              <span className="text-[11px] text-slate-500">
                Last refreshed: {lastRefreshed.toLocaleTimeString('en-IN')}
              </span>
            )}
            <button
              onClick={fetchHealth}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
              Refresh Now
            </button>
          </div>
        </div>

        {/* Overall Status */}
        <div className="flex items-center justify-center py-2">
          <OverallStatusBadge status={health?.overallStatus} />
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ServiceCard
            title="Backend API"
            icon={Wifi}
            data={health?.backendApi}
            accentColor="emerald"
          />
          <ServiceCard
            title="PostgreSQL Database"
            icon={Database}
            data={health?.database}
            accentColor="blue"
          />
          <ServiceCard
            title="Authentication (JWT)"
            icon={Shield}
            data={health?.authentication}
            accentColor="amber"
          />
          <ServiceCard
            title="Product Service"
            icon={Package}
            data={health?.productService}
            accentColor="purple"
          />
        </div>

        {/* Order Service – full width */}
        <ServiceCard
          title="Order Service"
          icon={ShoppingBag}
          data={health?.orderService}
          accentColor="indigo"
        />

        {/* Timestamp */}
        {health?.timestamp && (
          <p className="text-center text-[11px] text-slate-500">
            Health snapshot taken at: {new Date(health.timestamp).toLocaleString('en-IN')}
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminSystemMonitoringPage;
