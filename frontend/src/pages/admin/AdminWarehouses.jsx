import React, { useEffect, useMemo, useState } from 'react';
import {
  getWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  getWarehouseStock,
  receiveStock,
} from '../../services/warehouseService';
import api from '../../services/api';
const emptyForm = { name: '', location: '', contactPerson: '', phone: '', active: true };
const AdminWarehouses = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [busyId, setBusyId] = useState(null);
  // Stock drawer for a single warehouse
  const [stockWarehouse, setStockWarehouse] = useState(null); // the warehouse object
  const [stockRows, setStockRows] = useState([]);
  const [stockLoading, setStockLoading] = useState(false);
  const [receiveProductId, setReceiveProductId] = useState('');
  const [receiveQty, setReceiveQty] = useState('');
  const [receiving, setReceiving] = useState(false);
  const [stockError, setStockError] = useState('');
  const loadAll = async () => {
    try {
      setLoading(true);
      setError('');
      const [warehousesRes, productsRes] = await Promise.all([
        getWarehouses(),
        api.get('/products'),
      ]);
      setWarehouses(Array.isArray(warehousesRes) ? warehousesRes : []);
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
    } catch (err) {
      console.error('Failed to load warehouses:', err);
      setError('Unable to load warehouse information. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadAll();
  }, []);
  const totals = useMemo(() => {
    return warehouses.reduce(
      (acc, w) => {
        acc.available += Number(w.totalAvailableStock || 0);
        acc.allocated += Number(w.totalAllocatedStock || 0);
        acc.toPick += Number(w.pendingPickCount || 0);
        acc.toPack += Number(w.pendingPackCount || 0);
        acc.toShip += Number(w.pendingShipCount || 0);
        return acc;
      },
      { available: 0, allocated: 0, toPick: 0, toPack: 0, toShip: 0 }
    );
  }, [warehouses]);
  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setShowForm(true);
  };
  const openEditForm = (w) => {
    setEditingId(w.id);
    setForm({
      name: w.name || '',
      location: w.location || '',
      contactPerson: w.contactPerson || '',
      phone: w.phone || '',
      active: w.active,
    });
    setFormError('');
    setShowForm(true);
  };
  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      if (editingId) {
        await updateWarehouse(editingId, form);
      } else {
        await createWarehouse(form);
      }
      closeForm();
      await loadAll();
    } catch (err) {
      setFormError(err.response?.data || 'Failed to save this warehouse.');
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async (w) => {
    if (!window.confirm(`Delete warehouse "${w.name}"? This cannot be undone.`)) return;
    try {
      setBusyId(w.id);
      await deleteWarehouse(w.id);
      await loadAll();
    } catch (err) {
      alert(err.response?.data || 'Failed to delete this warehouse.');
    } finally {
      setBusyId(null);
    }
  };
  const openStockDrawer = async (w) => {
    setStockWarehouse(w);
    setStockError('');
    setReceiveProductId('');
    setReceiveQty('');
    setStockLoading(true);
    try {
      const rows = await getWarehouseStock(w.id);
      setStockRows(Array.isArray(rows) ? rows : []);
    } catch (err) {
      console.error('Failed to load warehouse stock:', err);
      setStockRows([]);
    } finally {
      setStockLoading(false);
    }
  };
  const closeStockDrawer = () => {
    setStockWarehouse(null);
    setStockRows([]);
  };
  const handleReceiveStock = async (e) => {
    e.preventDefault();
    if (!receiveProductId || !receiveQty) return;
    setReceiving(true);
    setStockError('');
    try {
      await receiveStock(stockWarehouse.id, Number(receiveProductId), Number(receiveQty));
      const rows = await getWarehouseStock(stockWarehouse.id);
      setStockRows(Array.isArray(rows) ? rows : []);
      setReceiveProductId('');
      setReceiveQty('');
      await loadAll();
    } catch (err) {
      setStockError(err.response?.data || 'Failed to receive stock.');
    } finally {
      setReceiving(false);
    }
  };
  if (loading) {
    return <LoadingSkeleton />;
  }
  return (
    <div className="min-h-[calc(100vh-64px)] bg-stone-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-serif">
              Warehouse Management
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage warehouse locations and receive stock into inventory.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer shadow-xs"
          >
            + Add Warehouse
          </button>
        </div>
        {/* SUMMARY */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <SummaryCard label="Available Stock" value={totals.available} />
          <SummaryCard label="Allocated Stock" value={totals.allocated} />
          <SummaryCard label="To Pick" value={totals.toPick} accent="amber" />
          <SummaryCard label="To Pack" value={totals.toPack} accent="blue" />
          <SummaryCard label="To Ship" value={totals.toShip} accent="emerald" />
        </div>
        {error && (
          <div className="bg-rose-50 border border-rose-200/80 text-rose-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}
        {/* CREATE/EDIT FORM */}
        {showForm && (
          <div className="bg-white border border-stone-200 rounded-2xl shadow-xs p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-900">
                {editingId ? 'Edit Warehouse' : 'Add Warehouse'}
              </h2>
              <button type="button" onClick={closeForm} className="text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer">
                Cancel
              </button>
            </div>
            {formError && (
              <div className="bg-rose-50 border border-rose-200/80 text-rose-700 text-xs px-3 py-2 rounded-lg mb-4">
                {formError}
              </div>
            )}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Warehouse Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Bangalore Central"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Location *</label>
                <input
                  type="text"
                  required
                  value={form.location}
                  onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                  placeholder="e.g. Whitefield, Bangalore"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Contact Person</label>
                <input
                  type="text"
                  value={form.contactPerson}
                  onChange={(e) => setForm((p) => ({ ...p, contactPerson: e.target.value }))}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <input
                  type="checkbox"
                  id="wh-active"
                  checked={form.active}
                  onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
                  className="accent-slate-900"
                />
                <label htmlFor="wh-active" className="text-sm text-slate-700">
                  Active (available for new order allocation)
                </label>
              </div>
              <div className="sm:col-span-2 flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white transition disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Warehouse'}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-stone-300 text-slate-700 hover:bg-stone-50 transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
        {/* WAREHOUSE LIST */}
        <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-200">
            <h2 className="text-sm font-semibold text-slate-900">All Warehouses</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Products</th>
                  <th className="px-6 py-4">Available / Allocated</th>
                  <th className="px-6 py-4">Pick / Pack / Ship</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm text-slate-700">
                {warehouses.length > 0 ? (
                  warehouses.map((w) => (
                    <tr key={w.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{w.name}</td>
                      <td className="px-6 py-4 text-slate-600">{w.location}</td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {w.contactPerson || '\u2014'}{w.phone ? ` \u2022 ${w.phone}` : ''}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{w.distinctProductCount}</td>
                      <td className="px-6 py-4 text-slate-600">
                        {w.totalAvailableStock} / {w.totalAllocatedStock}
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-xs">
                        {w.pendingPickCount} / {w.pendingPackCount} / {w.pendingShipCount}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
                          w.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-stone-100 text-slate-600 border-stone-200'
                        }`}>
                          {w.active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                          <button type="button" onClick={() => openStockDrawer(w)} className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer">
                            Stock
                          </button>
                          <button type="button" onClick={() => openEditForm(w)} className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer">
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(w)}
                            disabled={busyId === w.id}
                            className="text-xs font-semibold text-rose-600 hover:text-rose-800 cursor-pointer disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-10 text-center text-slate-500">
                      No warehouses yet. Click "Add Warehouse" to create your first one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* STOCK DRAWER */}
        {stockWarehouse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={closeStockDrawer}>
            <div
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between sticky top-0 bg-white">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">{stockWarehouse.name} — Stock</h2>
                  <p className="text-xs text-slate-500">{stockWarehouse.location}</p>
                </div>
                <button type="button" onClick={closeStockDrawer} className="text-slate-400 hover:text-slate-700 cursor-pointer text-xl leading-none">
                  &times;
                </button>
              </div>
              <div className="p-6 space-y-6">
                {/* Distribute stock from vendor pool */}
                <form onSubmit={handleReceiveStock} className="bg-stone-50 border border-stone-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Distribute Stock</p>
                  <p className="text-xs text-slate-500 mb-3">
                    Moves stock out of the vendor's pool and into this warehouse — only warehouse stock is orderable by customers.
                  </p>
                  {stockError && (
                    <div className="bg-rose-50 border border-rose-200/80 text-rose-700 text-xs px-3 py-2 rounded-lg mb-3">
                      {stockError}
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={receiveProductId}
                      onChange={(e) => setReceiveProductId(e.target.value)}
                      required
                      className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    >
                      <option value="">Select a product...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — {p.vendorPoolQuantity ?? 0} in vendor pool
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      required
                      value={receiveQty}
                      onChange={(e) => setReceiveQty(e.target.value)}
                      placeholder="Qty"
                      className="w-full sm:w-28 border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    />
                    <button
                      type="submit"
                      disabled={receiving}
                      className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white transition disabled:opacity-50 cursor-pointer whitespace-nowrap"
                    >
                      {receiving ? 'Distributing...' : 'Distribute'}
                    </button>
                  </div>
                </form>
                {/* Current stock table */}
                <div>
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Current Inventory</p>
                  {stockLoading ? (
                    <p className="text-sm text-slate-500">Loading...</p>
                  ) : stockRows.length > 0 ? (
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-stone-200">
                          <th className="py-2">Product</th>
                          <th className="py-2 text-right">Available</th>
                          <th className="py-2 text-right">Allocated</th>
                          <th className="py-2 text-right">Damaged</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {stockRows.map((row) => (
                          <tr key={row.id}>
                            <td className="py-2 font-medium text-slate-800">{row.productName}</td>
                            <td className="py-2 text-right text-emerald-700 font-semibold">{row.availableQuantity}</td>
                            <td className="py-2 text-right text-amber-700 font-semibold">{row.allocatedQuantity}</td>
                            <td className="py-2 text-right text-rose-700 font-semibold">{row.damagedQuantity || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-sm text-slate-500">No stock distributed to this warehouse yet.</p>
                  )}
                </div>
              </div>
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
    blue: 'bg-blue-50 border-blue-200/80 text-blue-800',
    emerald: 'bg-emerald-50 border-emerald-200/80 text-emerald-800',
  };
  const style = accent ? accentClasses[accent] : 'bg-white border-stone-200 text-slate-900';
  return (
    <div className={`border rounded-2xl p-4 shadow-xs ${style}`}>
      <span className="text-2xs font-medium uppercase tracking-wider opacity-70 block">{label}</span>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  );
};
const LoadingSkeleton = () => (
  <div className="min-h-[calc(100vh-64px)] bg-stone-50/50 py-8 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-64 bg-stone-200 rounded-md"></div>
          <div className="h-4 w-80 bg-stone-200 rounded-md"></div>
        </div>
        <div className="h-10 w-36 bg-stone-200 rounded-xl"></div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-stone-200 rounded-2xl"></div>
        ))}
      </div>
      <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
        <div className="h-8 bg-stone-100 rounded-md w-full"></div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 bg-stone-50 rounded-md w-full"></div>
        ))}
      </div>
    </div>
  </div>
);
export default AdminWarehouses;