import React, { useEffect, useState } from 'react';
import {
  getMyProfile,
  getMyQueue,
  pickAllocation,
  packAllocation,
  markReadyForShipment,
} from '../../services/warehouseStaffService';

const STAGES = [
  { key: 'ALLOCATED', title: 'To Pick', action: 'Pick', actionFn: pickAllocation, accent: 'amber' },
  { key: 'PICKED', title: 'To Pack', action: 'Pack', actionFn: packAllocation, accent: 'blue' },
  { key: 'PACKED', title: 'To Ship', action: 'Mark Ready', actionFn: markReadyForShipment, accent: 'emerald' },
  { key: 'READY_FOR_SHIPMENT', title: 'Ready for Shipment', action: null, actionFn: null, accent: 'slate' },
];

const ACCENT_STYLES = {
  amber: 'bg-amber-50 border-amber-200/80 text-amber-800',
  blue: 'bg-blue-50 border-blue-200/80 text-blue-800',
  emerald: 'bg-emerald-50 border-emerald-200/80 text-emerald-800',
  slate: 'bg-stone-100 border-stone-200 text-slate-700',
};

const WarehouseStaffDashboard = () => {
  const [warehouseName, setWarehouseName] = useState('');
  const [notAssigned, setNotAssigned] = useState(false);
  const [queues, setQueues] = useState({ ALLOCATED: [], PICKED: [], PACKED: [], READY_FOR_SHIPMENT: [] });
  const [loading, setLoading] = useState(true);
  const [queueLoading, setQueueLoading] = useState(false);
  const [error, setError] = useState('');
  const [busyAllocationId, setBusyAllocationId] = useState(null);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profile = await getMyProfile();
      if (typeof profile === 'string' || !profile?.warehouseId) {
        setNotAssigned(true);
        return;
      }
      setWarehouseName(profile.warehouseName || '');
      await loadQueues();
    } catch (err) {
      console.error('Failed to load warehouse staff profile:', err);
      setError('Unable to load your warehouse assignment. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadQueues = async () => {
    setQueueLoading(true);
    setError('');
    try {
      const [allocated, picked, packed, ready] = await Promise.all([
        getMyQueue('ALLOCATED'),
        getMyQueue('PICKED'),
        getMyQueue('PACKED'),
        getMyQueue('READY_FOR_SHIPMENT'),
      ]);
      setQueues({
        ALLOCATED: Array.isArray(allocated) ? allocated : [],
        PICKED: Array.isArray(picked) ? picked : [],
        PACKED: Array.isArray(packed) ? packed : [],
        READY_FOR_SHIPMENT: Array.isArray(ready) ? ready : [],
      });
    } catch (err) {
      console.error('Failed to load fulfillment queues:', err);
      setError('Unable to load your fulfillment queues.');
    } finally {
      setQueueLoading(false);
    }
  };

  const handleAction = async (stage, allocation) => {
    const stageConfig = STAGES.find((s) => s.key === stage);
    if (!stageConfig?.actionFn) return;
    try {
      setBusyAllocationId(allocation.id);
      await stageConfig.actionFn(allocation.id);
      await loadQueues();
    } catch (err) {
      alert(err.response?.data || `Failed to mark this item as ${stageConfig.action.toLowerCase()}.`);
    } finally {
      setBusyAllocationId(null);
    }
  };

  const formatDateTime = (value) => {
    if (!value) return '\u2014';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '\u2014';
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (notAssigned) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-stone-50/50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center text-slate-500">
            <p className="font-semibold text-slate-900 mb-1">No warehouse assigned yet</p>
            <p className="text-sm">Ask an administrator to assign your account to a warehouse before you can start working.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-stone-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-serif">
            Order Fulfillment {warehouseName && `— ${warehouseName}`}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Orders allocated to your warehouse. Pick, pack, and prepare them for shipment.
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200/80 text-rose-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {STAGES.map((stage) => (
            <div key={stage.key} className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden flex flex-col">
              <div className={`px-4 py-3 border-b border-stone-200 flex items-center justify-between ${ACCENT_STYLES[stage.accent]}`}>
                <span className="text-xs font-bold uppercase tracking-wider">{stage.title}</span>
                <span className="text-xs font-bold bg-white/60 rounded-full px-2 py-0.5">
                  {queues[stage.key]?.length || 0}
                </span>
              </div>
              <div className="p-3 space-y-2 flex-1 overflow-y-auto max-h-[65vh]">
                {queueLoading ? (
                  <p className="text-xs text-slate-400 text-center py-6">Loading...</p>
                ) : queues[stage.key]?.length > 0 ? (
                  queues[stage.key].map((allocation) => (
                    <div key={allocation.id} className="border border-stone-200 rounded-xl p-3 bg-stone-50/50">
                      <p className="text-sm font-bold text-slate-900">{allocation.productName}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Order #{allocation.orderId} \u2022 Qty {allocation.quantity}
                      </p>
                      <p className="text-2xs text-slate-400 mt-1">
                        {formatDateTime(
                          stage.key === 'ALLOCATED' ? allocation.allocatedAt
                            : stage.key === 'PICKED' ? allocation.pickedAt
                            : stage.key === 'PACKED' ? allocation.packedAt
                            : allocation.readyAt
                        )}
                      </p>
                      {stage.actionFn && (
                        <button
                          type="button"
                          onClick={() => handleAction(stage.key, allocation)}
                          disabled={busyAllocationId === allocation.id}
                          className="mt-2 w-full text-center px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition disabled:opacity-50 cursor-pointer"
                        >
                          {busyAllocationId === allocation.id ? 'Updating...' : stage.action}
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-6">Nothing here right now.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="min-h-[calc(100vh-64px)] bg-stone-50/50 py-8 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-64 bg-stone-200 rounded-md"></div>
        <div className="h-4 w-80 bg-stone-200 rounded-md"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-72 bg-stone-200 rounded-2xl"></div>
        ))}
      </div>
    </div>
  </div>
);

export default WarehouseStaffDashboard;
