import React, { useEffect, useMemo, useState } from 'react';
import { getMyProfile, getMyStock, getMyMovements } from '../../services/warehouseStaffService';

const TABS = [
  { key: 'STOCK', label: 'Current Stock' },
  { key: 'MOVEMENTS', label: 'Movement History' },
];

const WarehouseStaffStock = () => {
  const [warehouseName, setWarehouseName] = useState('');
  const [notAssigned, setNotAssigned] = useState(false);
  const [stock, setStock] = useState([]);
  const [movements, setMovements] = useState([]);
  const [activeTab, setActiveTab] = useState('STOCK');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAll = async () => {
    try {
      setLoading(true);
      setError('');
      const profile = await getMyProfile();
      if (typeof profile === 'string' || !profile?.warehouseId) {
        setNotAssigned(true);
        return;
      }
      setWarehouseName(profile.warehouseName || '');
      const [stockRes, movementsRes] = await Promise.all([getMyStock(), getMyMovements()]);
      setStock(Array.isArray(stockRes) ? stockRes : []);
      setMovements(Array.isArray(movementsRes) ? movementsRes : []);
    } catch (err) {
      console.error('Failed to load warehouse stock:', err);
      setError('Unable to load your warehouse\u2019s stock information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const totals = useMemo(() => {
    return stock.reduce(
      (acc, row) => {
        acc.available += Number(row.availableQuantity || 0);
        acc.allocated += Number(row.allocatedQuantity || 0);
        acc.damaged += Number(row.damagedQuantity || 0);
        return acc;
      },
      { available: 0, allocated: 0, damaged: 0 }
    );
  }, [stock]);

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
            <p className="text-sm">Ask an administrator to assign your account to a warehouse first.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-stone-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-serif">
            Inventory {warehouseName && `— ${warehouseName}`}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            What's currently on your shelves, and how it got there.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryCard label="Available" value={totals.available} accent="emerald" />
          <SummaryCard label="Allocated" value={totals.allocated} accent="amber" />
          <SummaryCard label="Damaged / Quarantined" value={totals.damaged} accent="rose" />
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200/80 text-rose-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="flex gap-2 border-b border-stone-200">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition cursor-pointer ${
                activeTab === tab.key
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'STOCK' ? (
          <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-stone-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-stone-200">
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3 text-right">Available</th>
                  <th className="px-6 py-3 text-right">Allocated</th>
                  <th className="px-6 py-3 text-right">Damaged</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {stock.length > 0 ? (
                  stock.map((row) => (
                    <tr key={row.id}>
                      <td className="px-6 py-4 font-medium text-slate-800">{row.productName}</td>
                      <td className="px-6 py-4 text-right text-emerald-700 font-semibold">{row.availableQuantity}</td>
                      <td className="px-6 py-4 text-right text-amber-700 font-semibold">{row.allocatedQuantity}</td>
                      <td className="px-6 py-4 text-right text-rose-700 font-semibold">{row.damagedQuantity || 0}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center text-slate-500">
                      No stock has been distributed to your warehouse yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-stone-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-stone-200">
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">From \u2192 To</th>
                  <th className="px-6 py-3 text-right">Qty</th>
                  <th className="px-6 py-3">Note</th>
                  <th className="px-6 py-3">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {movements.length > 0 ? (
                  movements.map((m) => (
                    <tr key={m.id}>
                      <td className="px-6 py-4 font-medium text-slate-800">{m.productName}</td>
                      <td className="px-6 py-4 text-slate-600 text-xs">
                        {m.fromStage || '\u2014'} \u2192 {m.toStage}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-700 font-semibold">{m.quantity}</td>
                      <td className="px-6 py-4 text-slate-500 text-xs">{m.note || '\u2014'}</td>
                      <td className="px-6 py-4 text-slate-400 text-xs whitespace-nowrap">{formatDateTime(m.movedAt)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-slate-500">
                      No stock movements recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SummaryCard = ({ label, value, accent }) => {
  const accentClasses = {
    amber: 'bg-amber-50 border-amber-200/80 text-amber-800',
    emerald: 'bg-emerald-50 border-emerald-200/80 text-emerald-800',
    rose: 'bg-rose-50 border-rose-200/80 text-rose-800',
  };
  return (
    <div className={`border rounded-2xl p-4 shadow-xs ${accentClasses[accent] || 'bg-white border-stone-200 text-slate-900'}`}>
      <span className="text-2xs font-medium uppercase tracking-wider opacity-70 block">{label}</span>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="min-h-[calc(100vh-64px)] bg-stone-50/50 py-8 px-4 sm:px-6 lg:px-8">
    <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-64 bg-stone-200 rounded-md"></div>
        <div className="h-4 w-80 bg-stone-200 rounded-md"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-stone-200 rounded-2xl"></div>
        ))}
      </div>
      <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 bg-stone-50 rounded-md w-full"></div>
        ))}
      </div>
    </div>
  </div>
);

export default WarehouseStaffStock;
