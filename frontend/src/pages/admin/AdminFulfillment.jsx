import React, { useEffect, useState } from 'react';
import {
  getWarehouses,
  getWarehouseQueue,
  getWarehouseStaff,
} from '../../services/warehouseService';
import { Link } from 'react-router-dom';
const STAGES = [
  { key: 'ALLOCATED', title: 'To Pick', accent: 'amber' },
  { key: 'PICKED', title: 'To Pack', accent: 'blue' },
  { key: 'PACKED', title: 'To Ship', accent: 'emerald' },
  { key: 'READY_FOR_SHIPMENT', title: 'Ready for Shipment', accent: 'slate' },
];
const ACCENT_STYLES = {
  amber: 'bg-amber-50 border-amber-200/80 text-amber-800',
  blue: 'bg-blue-50 border-blue-200/80 text-blue-800',
  emerald: 'bg-emerald-50 border-emerald-200/80 text-emerald-800',
  slate: 'bg-stone-100 border-stone-200 text-slate-700',
};
const AdminFulfillment = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [queues, setQueues] = useState({ ALLOCATED: [], PICKED: [], PACKED: [], READY_FOR_SHIPMENT: [] });
  const [loading, setLoading] = useState(true);
  const [queueLoading, setQueueLoading] = useState(false);
  const [error, setError] = useState('');
  const loadWarehouses = async () => {
    try {
      setLoading(true);
      const [warehousesRes, staffRes] = await Promise.all([getWarehouses(), getWarehouseStaff()]);
      const list = Array.isArray(warehousesRes) ? warehousesRes : [];
      setWarehouses(list);
      setStaff(Array.isArray(staffRes) ? staffRes : []);
      if (list.length > 0) {
        setSelectedWarehouseId(String(list[0].id));
      }
    } catch (err) {
      console.error('Failed to load warehouses:', err);
      setError('Unable to load warehouses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadWarehouses();
  }, []);
  const loadQueues = async (warehouseId) => {
    if (!warehouseId) return;
    setQueueLoading(true);
    setError('');
    try {
      const [allocated, picked, packed, ready] = await Promise.all([
        getWarehouseQueue(warehouseId, 'ALLOCATED'),
        getWarehouseQueue(warehouseId, 'PICKED'),
        getWarehouseQueue(warehouseId, 'PACKED'),
        getWarehouseQueue(warehouseId, 'READY_FOR_SHIPMENT'),
      ]);
      setQueues({
        ALLOCATED: Array.isArray(allocated) ? allocated : [],
        PICKED: Array.isArray(picked) ? picked : [],
        PACKED: Array.isArray(packed) ? packed : [],
        READY_FOR_SHIPMENT: Array.isArray(ready) ? ready : [],
      });
    } catch (err) {
      console.error('Failed to load fulfillment queues:', err);
      setError('Unable to load the fulfillment queues for this warehouse.');
    } finally {
      setQueueLoading(false);
    }
  };
  useEffect(() => {
    if (selectedWarehouseId) {
      loadQueues(selectedWarehouseId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWarehouseId]);
  const formatDateTime = (value) => {
    if (!value) return '\u2014';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '\u2014';
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const assignedStaff = staff.filter((s) => String(s.warehouseId) === String(selectedWarehouseId));

  if (loading) {
    return <LoadingSkeleton />;
  }
  return (
    <div className="min-h-[calc(100vh-64px)] bg-stone-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-serif">
              Order Fulfillment
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Read-only oversight — this warehouse's own staff handle pick, pack, and shipment prep from their own dashboard.
            </p>
          </div>
          {warehouses.length > 0 && (
            <select
              value={selectedWarehouseId}
              onChange={(e) => setSelectedWarehouseId(e.target.value)}
              className="border border-stone-300 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          )}
        </div>
        {warehouses.length > 0 && (
          <div className={`flex items-center justify-between gap-3 text-sm px-4 py-3 rounded-xl border ${
            assignedStaff.length > 0
              ? 'bg-blue-50 border-blue-200/80 text-blue-800'
              : 'bg-amber-50 border-amber-200/80 text-amber-800'
          }`}>
            {assignedStaff.length > 0 ? (
              <span>
                <span className="font-semibold">Staff assigned:</span>{' '}
                {assignedStaff.map((s) => s.fullName).join(', ')}
              </span>
            ) : (
              <span>
                <span className="font-semibold">No staff assigned</span> to this warehouse yet — orders here won't be worked until someone is.
              </span>
            )}
            <Link
              to="/admin/warehouse-staff"
              className="text-xs font-semibold underline underline-offset-2 whitespace-nowrap"
            >
              Manage Staff
            </Link>
          </div>
        )}
        {error && (
          <div className="bg-rose-50 border border-rose-200/80 text-rose-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}
        {warehouses.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center text-slate-500">
            No warehouses set up yet. Add one under Warehouse Management first.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {STAGES.map((stage) => (
              <div key={stage.key} className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden flex flex-col">
                <div className={`px-4 py-3 border-b border-stone-200 flex items-center justify-between ${ACCENT_STYLES[stage.accent]}`}>
                  <span className="text-xs font-bold uppercase tracking-wider">{stage.title}</span>
                  <span className="text-xs font-bold bg-white/60 rounded-full px-2 py-0.5">
                    {queues[stage.key]?.length || 0}
                  </span>
                </div>
                <div className="p-3 space-y-2 flex-1 overflow-y-auto max-h-[60vh]">
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
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-6">Nothing here right now.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
const LoadingSkeleton = () => (
  <div className="min-h-[calc(100vh-64px)] bg-stone-50/50 py-8 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-56 bg-stone-200 rounded-md"></div>
          <div className="h-4 w-72 bg-stone-200 rounded-md"></div>
        </div>
        <div className="h-10 w-40 bg-stone-200 rounded-xl"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-72 bg-stone-200 rounded-2xl"></div>
        ))}
      </div>
    </div>
  </div>
);
export default AdminFulfillment;