import React, { useEffect, useState } from 'react';
import {
  getWarehouses,
  getWarehouseStaff,
  createWarehouseStaff,
  reassignWarehouseStaff,
  deleteWarehouseStaff,
} from '../../services/warehouseService';

const emptyForm = { fullName: '', email: '', password: '', warehouseId: '' };

const AdminWarehouseStaff = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [reassignTarget, setReassignTarget] = useState(null); // staff row being reassigned
  const [reassignWarehouseId, setReassignWarehouseId] = useState('');

  const loadAll = async () => {
    try {
      setLoading(true);
      setError('');
      const [warehousesRes, staffRes] = await Promise.all([getWarehouses(), getWarehouseStaff()]);
      setWarehouses(Array.isArray(warehousesRes) ? warehousesRes : []);
      setStaff(Array.isArray(staffRes) ? staffRes : []);
    } catch (err) {
      console.error('Failed to load warehouse staff:', err);
      setError('Unable to load warehouse staff. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const openCreateForm = () => {
    setForm(emptyForm);
    setFormError('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setForm(emptyForm);
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      await createWarehouseStaff({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        warehouseId: Number(form.warehouseId),
      });
      closeForm();
      await loadAll();
    } catch (err) {
      setFormError(err.response?.data || 'Failed to create this staff account.');
    } finally {
      setSaving(false);
    }
  };

  const openReassign = (member) => {
    setReassignTarget(member);
    setReassignWarehouseId(member.warehouseId ? String(member.warehouseId) : '');
  };

  const closeReassign = () => {
    setReassignTarget(null);
    setReassignWarehouseId('');
  };

  const handleReassign = async (e) => {
    e.preventDefault();
    if (!reassignTarget || !reassignWarehouseId) return;
    setBusyId(reassignTarget.id);
    try {
      await reassignWarehouseStaff(reassignTarget.id, Number(reassignWarehouseId));
      closeReassign();
      await loadAll();
    } catch (err) {
      alert(err.response?.data || 'Failed to reassign this staff member.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (member) => {
    if (!window.confirm(`Remove staff account "${member.fullName}"? This cannot be undone.`)) return;
    try {
      setBusyId(member.id);
      await deleteWarehouseStaff(member.id);
      await loadAll();
    } catch (err) {
      alert(err.response?.data || 'Failed to remove this staff account.');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-stone-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-serif">
              Warehouse Staff
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Create staff accounts and assign each one to a single warehouse. They'll only see and act on that warehouse's orders and stock.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateForm}
            disabled={warehouses.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer shadow-xs disabled:opacity-50"
          >
            + Add Staff
          </button>
        </div>

        {warehouses.length === 0 && (
          <div className="bg-amber-50 border border-amber-200/80 text-amber-800 text-sm px-4 py-3 rounded-xl">
            Create at least one warehouse first, under Warehouse Management.
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200/80 text-rose-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-stone-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-stone-200">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Assigned Warehouse</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {staff.length > 0 ? (
                staff.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 font-medium text-slate-800">{member.fullName}</td>
                    <td className="px-6 py-4 text-slate-600">{member.email}</td>
                    <td className="px-6 py-4">
                      {member.warehouseName ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border bg-blue-50 text-blue-700 border-blue-200">
                          {member.warehouseName}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openReassign(member)}
                          className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                        >
                          Reassign
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(member)}
                          disabled={busyId === member.id}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-800 cursor-pointer disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-slate-500">
                    No warehouse staff accounts yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>

        {/* CREATE FORM MODAL */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={closeForm}>
            <div
              className="bg-white rounded-2xl shadow-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">Add Warehouse Staff</h2>
                <button type="button" onClick={closeForm} className="text-slate-400 hover:text-slate-700 cursor-pointer text-xl leading-none">
                  &times;
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {formError && (
                  <div className="bg-rose-50 border border-rose-200/80 text-rose-700 text-xs px-3 py-2 rounded-lg">
                    {formError}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Temporary Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Assigned Warehouse</label>
                  <select
                    required
                    value={form.warehouseId}
                    onChange={(e) => setForm({ ...form, warehouseId: e.target.value })}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  >
                    <option value="">Select a warehouse...</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white transition disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Creating...' : 'Create Staff Account'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* REASSIGN MODAL */}
        {reassignTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={closeReassign}>
            <div
              className="bg-white rounded-2xl shadow-xl max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">Reassign {reassignTarget.fullName}</h2>
                <button type="button" onClick={closeReassign} className="text-slate-400 hover:text-slate-700 cursor-pointer text-xl leading-none">
                  &times;
                </button>
              </div>
              <form onSubmit={handleReassign} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">New Warehouse</label>
                  <select
                    required
                    value={reassignWarehouseId}
                    onChange={(e) => setReassignWarehouseId(e.target.value)}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  >
                    <option value="">Select a warehouse...</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={busyId === reassignTarget.id}
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white transition disabled:opacity-50 cursor-pointer"
                >
                  {busyId === reassignTarget.id ? 'Saving...' : 'Save'}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="min-h-[calc(100vh-64px)] bg-stone-50/50 py-8 px-4 sm:px-6 lg:px-8">
    <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-56 bg-stone-200 rounded-md"></div>
          <div className="h-4 w-96 bg-stone-200 rounded-md"></div>
        </div>
        <div className="h-10 w-32 bg-stone-200 rounded-xl"></div>
      </div>
      <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 bg-stone-50 rounded-md w-full"></div>
        ))}
      </div>
    </div>
  </div>
);

export default AdminWarehouseStaff;
