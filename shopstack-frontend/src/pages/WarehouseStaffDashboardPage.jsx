import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import {
  fetchMyStaffProfile,
  fetchStaffAllocations,
  fetchStaffAllocatedOrders,
  fetchStaffInventory,
  fetchStaffStockMovements,
  pickStaffAllocation,
  packStaffAllocation,
  readyForShipmentStaffAllocation,
  clearWarehouseMessage,
} from '../store/slices/warehouseSlice';
import {
  Warehouse as WarehouseIcon,
  Package,
  Boxes,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Truck,
  ArrowRight,
  RefreshCw,
  Search,
  History,
  Layers,
  ClipboardList,
  PackageCheck,
  MapPin,
  Bell,
  CheckCheck,
  ShoppingBag,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  XCircle,
  Loader2,
} from 'lucide-react';

import { getErrorMessage } from '../api/errorUtils';

const WarehouseStaffDashboardPage = ({ defaultTab }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const {
    myStaffProfile,
    inventory,
    allocations,
    staffOrders,
    stockMovements,
    loading,
    error,
    successMessage,
  } = useSelector((state) => state.warehouse);

  const getInitialTab = () => {
    if (defaultTab) return defaultTab;
    if (location?.pathname?.includes('/qc') || location?.pathname?.includes('/returns')) {
      return 'returns_qc';
    }
    return 'allocated_orders';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab); // 'allocated_orders' | 'picking' | 'packing' | 'shipping' | 'returns_qc' | 'movements' | 'inventory'
  const [searchTerm, setSearchTerm] = useState('');
  const [staffReturns, setStaffReturns] = useState([]);
  const [qcSelectedResult, setQcSelectedResult] = useState({}); // { [retId]: 'PASSED' | 'DAMAGED' | 'FAILED' }
  const [qcDamageType, setQcDamageType] = useState({}); // { [retId]: 'PHYSICAL' | 'FUNCTIONAL' | 'PACKAGING' | 'WATER_DAMAGE' | 'OTHER' }
  const [qcDamageResp, setQcDamageResp] = useState({}); // { [retId]: 'CUSTOMER' | 'SELLER' | 'COURIER' | 'UNKNOWN' }
  const [qcNotes, setQcNotes] = useState({});
  const [processingQcId, setProcessingQcId] = useState(null);
  const [qcSuccess, setQcSuccess] = useState('');
  const [qcError, setQcError] = useState('');

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    } else if (location?.pathname?.includes('/qc') || location?.pathname?.includes('/returns')) {
      setActiveTab('returns_qc');
    }
  }, [defaultTab, location?.pathname]);

  const fetchStaffReturns = async () => {
    try {
      const res = await axiosClient.get('/warehouse-staff/returns');
      setStaffReturns(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn('Could not load staff returns', err);
      setStaffReturns([]);
      setQcError(getErrorMessage(err, 'Could not load returns for Quality Control.'));
    }
  };

  const loadData = () => {
    dispatch(fetchMyStaffProfile());
    dispatch(fetchStaffAllocatedOrders());
    dispatch(fetchStaffAllocations());
    dispatch(fetchStaffInventory());
    dispatch(fetchStaffStockMovements());
    fetchStaffReturns();
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  // Toast auto-clear
  useEffect(() => {
    if (successMessage || error || qcSuccess || qcError) {
      const timer = setTimeout(() => {
        dispatch(clearWarehouseMessage());
        setQcSuccess('');
        setQcError('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error, qcSuccess, qcError, dispatch]);

  const handlePick = async (allocationId) => {
    await dispatch(pickStaffAllocation(allocationId));
    loadData();
  };

  const handlePack = async (allocationId) => {
    await dispatch(packStaffAllocation(allocationId));
    loadData();
  };

  const handleReadyForShipment = async (allocationId) => {
    await dispatch(readyForShipmentStaffAllocation(allocationId));
    loadData();
  };

  const handlePerformQC = async (returnId) => {
    const result = qcSelectedResult[returnId] || 'PASSED';
    const dType = qcDamageType[returnId] || 'OTHER';
    const dResp = qcDamageResp[returnId] || 'UNKNOWN';
    const notes = qcNotes[returnId] || '';

    setProcessingQcId(returnId);
    setQcSuccess('');
    setQcError('');
    try {
      await axiosClient.post(`/warehouse-staff/returns/${returnId}/qc`, {
        qcResult: result,
        damageType: result === 'DAMAGED' ? dType : undefined,
        damageResponsibility: result === 'DAMAGED' ? dResp : undefined,
        damageDescription: notes,
      });

      let statusMsg = 'QC PASSED & Restocked to available inventory';
      if (result === 'DAMAGED') {
        statusMsg = dResp === 'CUSTOMER'
          ? 'QC DAMAGED (Customer Responsible) & Return Rejected'
          : `QC DAMAGED (${dResp} Responsible) & Quarantined (Refund Accepted)`;
      } else if (result === 'FAILED') {
        statusMsg = 'QC FAILED & Return Rejected';
      }

      setQcSuccess(`QC Processed successfully! ${statusMsg}.`);
      loadData();
    } catch (err) {
      setQcError(err.response?.data?.message || err.response?.data || err.message || 'QC submission failed.');
    } finally {
      setProcessingQcId(null);
    }
  };

  // Workflow Queues
  const newlyAllocatedOrders = staffOrders.filter((o) => o.status === 'WAREHOUSE_ALLOCATED');
  const readyForPickAllocations = allocations.filter((a) => a.status === 'ALLOCATED');
  const readyForPackAllocations = allocations.filter((a) => a.status === 'PICKED');
  const readyForShipmentAllocations = allocations.filter((a) => a.status === 'PACKED');
  const pendingQcReturns = (staffReturns || []).filter(
    (r) => r.returnStatus === 'RETURN_APPROVED' || r.returnStatus === 'PRODUCT_RETURNED' || r.returnStatus === 'RETURN_RECEIVED'
  );

  const filteredMovements = stockMovements.filter(
    (m) =>
      m.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.warehouseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.orderId?.toString().includes(searchTerm) ||
      m.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Title Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
                <WarehouseIcon className="w-3.5 h-3.5" /> Warehouse Operations Center
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Fulfillment Operations Dashboard
              </h1>

              {/* Assigned Warehouse Badge */}
              <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold shadow-md">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>
                  Assigned Warehouse: {myStaffProfile?.warehouseName ? `${myStaffProfile.warehouseName} (${myStaffProfile.warehouseCode})` : 'Central Warehouse Operations'}
                </span>
              </div>
            </div>

            <button
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
              <span>Refresh Operations</span>
            </button>
          </div>
        </div>

        {/* Real-time Allocation Alert Notification Banner */}
        {newlyAllocatedOrders.length > 0 && (
          <div className="flex items-center justify-between bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/30 text-amber-300 p-4 rounded-2xl text-xs sm:text-sm font-bold shadow-lg animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <p className="font-black text-amber-200 text-sm">
                  {newlyAllocatedOrders.length} New Order(s) Allocated to Your Warehouse!
                </p>
                <p className="text-xs text-amber-400/80 mt-0.5">
                  Admin has allocated Order #{newlyAllocatedOrders.map((o) => o.id).join(', #')} to {myStaffProfile?.warehouseName || 'your warehouse'}. Please begin picking.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('allocated_orders')}
              className="px-3.5 py-1.5 bg-amber-500 text-slate-950 hover:bg-amber-400 rounded-xl text-xs font-black shadow-md cursor-pointer transition-all whitespace-nowrap"
            >
              View Allocated Orders &rarr;
            </button>
          </div>
        )}

        {/* Toast Messages */}
        {(successMessage || qcSuccess) && (
          <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl text-xs sm:text-sm font-semibold shadow-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-400" />
              <span>{successMessage || qcSuccess}</span>
            </div>
            <button
              onClick={() => { dispatch(clearWarehouseMessage()); setQcSuccess(''); }}
              className="text-emerald-400 hover:text-emerald-300 text-xs underline font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {(error || qcError) && (
          <div className="flex items-center justify-between bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-2xl text-xs sm:text-sm font-semibold shadow-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
              <span>{error || qcError}</span>
            </div>
            <button
              onClick={() => { dispatch(clearWarehouseMessage()); setQcError(''); }}
              className="text-rose-400 hover:text-rose-300 text-xs underline font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div
            onClick={() => setActiveTab('allocated_orders')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'allocated_orders'
                ? 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/5'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Allocated Orders</span>
              <ClipboardList className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-white mt-1">{staffOrders.length}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Assigned by Admin</p>
          </div>

          <div
            onClick={() => setActiveTab('picking')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'picking'
                ? 'bg-cyan-500/10 border-cyan-500/40 shadow-lg shadow-cyan-500/5'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">Ready for Pick</span>
              <Boxes className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-black text-white mt-1">{readyForPickAllocations.length}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Retrieve items</p>
          </div>

          <div
            onClick={() => setActiveTab('packing')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'packing'
                ? 'bg-purple-500/10 border-purple-500/40 shadow-lg shadow-purple-500/5'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">Ready for Pack</span>
              <PackageCheck className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-black text-white mt-1">{readyForPackAllocations.length}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Box & seal</p>
          </div>

          <div
            onClick={() => setActiveTab('shipping')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'shipping'
                ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Ready for Shipment</span>
              <Truck className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-white mt-1">{readyForShipmentAllocations.length}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Packed boxes</p>
          </div>

          <div
            onClick={() => setActiveTab('returns_qc')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'returns_qc'
                ? 'bg-orange-500/10 border-orange-500/40 shadow-lg shadow-orange-500/5'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">Returns QC Queue</span>
              <RotateCcw className="w-4 h-4 text-orange-400" />
            </div>
            <p className="text-2xl font-black text-white mt-1">{pendingQcReturns.length}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Receive & inspect returns</p>
          </div>
        </div>

        {/* Workflow Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
          <button
            onClick={() => setActiveTab('allocated_orders')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'allocated_orders'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>1. Allocated Orders ({staffOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('picking')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'picking'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>2. Picking Queue ({readyForPickAllocations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('packing')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'packing'
                ? 'bg-purple-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            <span>3. Packing Queue ({readyForPackAllocations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('shipping')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'shipping'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>4. Ready for Shipment ({readyForShipmentAllocations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('returns_qc')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'returns_qc'
                ? 'bg-orange-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>5. Returns & QC ({staffReturns.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('movements')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'movements'
                ? 'bg-indigo-600 text-white shadow-md font-extrabold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Stock Movement Logs ({stockMovements.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-blue-600 text-white shadow-md font-extrabold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Warehouse Inventory</span>
          </button>
        </div>

        {/* TAB 1: ALLOCATED ORDERS FOR STAFF WAREHOUSE */}
        {activeTab === 'allocated_orders' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-amber-400" />
                  Orders Allocated to {myStaffProfile?.warehouseName || 'Your Warehouse'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Admin has assigned these confirmed orders to your warehouse location for fulfillment.
                </p>
              </div>
            </div>

            {staffOrders.length === 0 ? (
              <div className="text-center py-12 text-slate-400 bg-slate-950/60 rounded-xl border border-slate-800">
                <CheckCircle className="w-12 h-12 mx-auto text-emerald-400 mb-3 opacity-80" />
                <p className="text-sm font-semibold text-slate-300">No orders currently allocated to your warehouse.</p>
                <p className="text-xs text-slate-500 mt-1">When Admin allocates confirmed orders to {myStaffProfile?.warehouseName || 'your warehouse'}, they will appear here automatically.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {staffOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-slate-950 border border-slate-800 hover:border-slate-700 p-5 rounded-xl transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden"
                  >
                    <div className="space-y-1 z-10">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-white">Order #{order.id}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {order.status}
                        </span>
                        <span className="text-[11px] text-cyan-400 font-semibold bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                          Allocated to {order.warehouseName || myStaffProfile?.warehouseName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium">Customer: {order.customer?.name || 'Registered Customer'}</p>
                      <p className="text-xs text-slate-400">Shipping Address: {order.shippingAddress}</p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {order.items?.map((item) => (
                          <span
                            key={item.id}
                            className="text-xs bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg font-medium"
                          >
                            {item.productName} &times; <strong className="text-cyan-400">{item.quantity}</strong>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 w-full md:w-auto z-10">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Order #{order.id} has been allocated to your warehouse.</span>
                      </div>
                      <button
                        onClick={() => setActiveTab('picking')}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-extrabold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                      >
                        Proceed to Picking Queue &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: READY FOR PICKING */}
        {activeTab === 'picking' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Boxes className="w-5 h-5 text-cyan-400" />
                Allocated Orders - Picking Queue
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Staff retrieve allocated products from shelf locations. Valid transition: <strong>ALLOCATED &rarr; PICKED</strong>.
              </p>
            </div>

            {readyForPickAllocations.length === 0 ? (
              <div className="text-center py-12 text-slate-400 bg-slate-950/60 rounded-xl border border-slate-800">
                <Boxes className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                <p className="text-sm font-semibold text-slate-300">No items currently awaiting picking in your assigned warehouse.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Allocation ID</th>
                      <th className="p-3.5">Order</th>
                      <th className="p-3.5">Warehouse Location</th>
                      <th className="p-3.5">Product</th>
                      <th className="p-3.5">Qty</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {readyForPickAllocations.map((alloc) => (
                      <tr key={alloc.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 font-mono text-cyan-400">#ALLOC-{alloc.id}</td>
                        <td className="p-3.5 font-bold text-white">Order #{alloc.orderId}</td>
                        <td className="p-3.5">
                          <span className="font-semibold text-slate-200">{alloc.warehouseName}</span>
                          <span className="block text-[10px] text-slate-500">{alloc.warehouseCode}</span>
                        </td>
                        <td className="p-3.5 font-semibold text-slate-200">{alloc.productName}</td>
                        <td className="p-3.5 font-extrabold text-cyan-400 text-sm">{alloc.allocatedQuantity}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            {alloc.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handlePick(alloc.id)}
                            disabled={loading}
                            className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-extrabold text-xs rounded-lg transition-all shadow-md cursor-pointer disabled:opacity-50"
                          >
                            Mark Picked &rarr;
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: READY FOR PACKING */}
        {activeTab === 'packing' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-purple-400" />
                Picked Orders - Packing Queue
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspect items and pack into shipping boxes. Valid transition: <strong>PICKED &rarr; PACKED</strong>.
              </p>
            </div>

            {readyForPackAllocations.length === 0 ? (
              <div className="text-center py-12 text-slate-400 bg-slate-950/60 rounded-xl border border-slate-800">
                <PackageCheck className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                <p className="text-sm font-semibold text-slate-300">No items currently awaiting packing in your assigned warehouse.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Allocation ID</th>
                      <th className="p-3.5">Order</th>
                      <th className="p-3.5">Warehouse</th>
                      <th className="p-3.5">Product</th>
                      <th className="p-3.5">Qty</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {readyForPackAllocations.map((alloc) => (
                      <tr key={alloc.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 font-mono text-purple-400">#ALLOC-{alloc.id}</td>
                        <td className="p-3.5 font-bold text-white">Order #{alloc.orderId}</td>
                        <td className="p-3.5">{alloc.warehouseName}</td>
                        <td className="p-3.5 font-semibold text-slate-200">{alloc.productName}</td>
                        <td className="p-3.5 font-extrabold text-purple-400 text-sm">{alloc.allocatedQuantity}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            {alloc.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handlePack(alloc.id)}
                            disabled={loading}
                            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-lg transition-all shadow-md cursor-pointer disabled:opacity-50"
                          >
                            Mark Packed &rarr;
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: READY FOR SHIPMENT */}
        {activeTab === 'shipping' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-400" />
                Packed Orders - Shipment Preparation
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Generate shipping label and stage box for carrier pickup. Valid transition: <strong>PACKED &rarr; READY_FOR_SHIPMENT</strong>.
              </p>
            </div>

            {readyForShipmentAllocations.length === 0 ? (
              <div className="text-center py-12 text-slate-400 bg-slate-950/60 rounded-xl border border-slate-800">
                <Truck className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                <p className="text-sm font-semibold text-slate-300">No packed items currently awaiting shipment dispatch.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Allocation ID</th>
                      <th className="p-3.5">Order</th>
                      <th className="p-3.5">Warehouse</th>
                      <th className="p-3.5">Product</th>
                      <th className="p-3.5">Qty</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {readyForShipmentAllocations.map((alloc) => (
                      <tr key={alloc.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 font-mono text-emerald-400">#ALLOC-{alloc.id}</td>
                        <td className="p-3.5 font-bold text-white">Order #{alloc.orderId}</td>
                        <td className="p-3.5">{alloc.warehouseName}</td>
                        <td className="p-3.5 font-semibold text-slate-200">{alloc.productName}</td>
                        <td className="p-3.5 font-extrabold text-emerald-400 text-sm">{alloc.allocatedQuantity}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {alloc.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleReadyForShipment(alloc.id)}
                            disabled={loading}
                            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-lg transition-all shadow-md cursor-pointer disabled:opacity-50"
                          >
                            Mark Ready for Shipment &rarr;
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: RETURNS & QC INTAKE */}
        {activeTab === 'returns_qc' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-orange-400" />
                Customer Returns - Warehouse Intake & Quality Control (QC)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspect approved customer return items. Select <strong>ACCEPTED / GOOD</strong> to restock to available inventory, or <strong>DAMAGED / QUARANTINE</strong> to move quantity to damaged stock.
              </p>
            </div>

            {staffReturns.length === 0 ? (
              <div className="text-center py-12 text-slate-400 bg-slate-950/60 rounded-xl border border-slate-800">
                <RotateCcw className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                <p className="text-sm font-semibold text-slate-300">No return items currently assigned for QC at your warehouse.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {staffReturns.map((ret) => {
                  const isPending = ret.returnStatus === 'RETURN_APPROVED' || ret.returnStatus === 'PRODUCT_RETURNED' || ret.returnStatus === 'RETURN_RECEIVED';
                  const isDone = ret.returnStatus === 'RETURN_ACCEPTED' || ret.returnStatus === 'REFUNDED';
                  return (
                    <div
                      key={ret.id}
                      className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-extrabold text-orange-400">Return #{ret.id}</span>
                          <span className="text-xs text-slate-400">Order #{ret.orderId}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            ret.returnStatus === 'RETURN_APPROVED' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' :
                            ret.returnStatus === 'RETURN_ACCEPTED' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' :
                            'bg-teal-500/10 text-teal-400 border border-teal-500/30'
                          }`}>
                            {ret.returnStatus}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">
                          Customer: <strong className="text-slate-200">{ret.customerName}</strong> ({ret.customerEmail})
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                          <span className="text-slate-500 block">Product</span>
                          <span className="font-bold text-white line-clamp-1">{ret.productName}</span>
                          <span className="text-slate-400 text-[10px]">Return Qty: <strong className="text-orange-400">{ret.returnQuantity}</strong> / Ordered: {ret.orderedQuantity}</span>
                        </div>
                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                          <span className="text-slate-500 block">Customer Return Reason</span>
                          <span className="font-medium text-slate-200 italic">"{ret.reason}"</span>
                        </div>
                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                          <span className="text-slate-500 block">Refund Amount</span>
                          <span className="font-black text-teal-400 text-sm">₹{Number(ret.refundAmount || 0).toFixed(2)}</span>
                        </div>
                      </div>

                      {/* QC Action form if pending */}
                      {isPending ? (
                        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-4">
                          <p className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                            <ShieldCheck className="w-4 h-4 text-orange-400" />
                            Perform Physical Inspection & QC Decision:
                          </p>

                          {/* QC Result Selector Buttons */}
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              type="button"
                              onClick={() => setQcSelectedResult({ ...qcSelectedResult, [ret.id]: 'PASSED' })}
                              className={`py-2 px-3 rounded-xl font-extrabold text-xs border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                (qcSelectedResult[ret.id] || 'PASSED') === 'PASSED'
                                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> PASSED (Good)
                            </button>
                            <button
                              type="button"
                              onClick={() => setQcSelectedResult({ ...qcSelectedResult, [ret.id]: 'DAMAGED' })}
                              className={`py-2 px-3 rounded-xl font-extrabold text-xs border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                qcSelectedResult[ret.id] === 'DAMAGED'
                                  ? 'bg-amber-600 border-amber-500 text-white shadow-lg'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              <AlertTriangle className="w-3.5 h-3.5" /> DAMAGED
                            </button>
                            <button
                              type="button"
                              onClick={() => setQcSelectedResult({ ...qcSelectedResult, [ret.id]: 'FAILED' })}
                              className={`py-2 px-3 rounded-xl font-extrabold text-xs border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                qcSelectedResult[ret.id] === 'FAILED'
                                  ? 'bg-rose-600 border-rose-500 text-white shadow-lg'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              <XCircle className="w-3.5 h-3.5" /> FAILED (Reject)
                            </button>
                          </div>

                          {/* Conditional DAMAGED attributes */}
                          {qcSelectedResult[ret.id] === 'DAMAGED' && (
                            <div className="bg-amber-950/20 border border-amber-500/20 p-3.5 rounded-xl space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Damage Type</label>
                                  <select
                                    value={qcDamageType[ret.id] || 'OTHER'}
                                    onChange={(e) => setQcDamageType({ ...qcDamageType, [ret.id]: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 cursor-pointer"
                                  >
                                    <option value="PHYSICAL">PHYSICAL (Cracked, Scratched, Broken)</option>
                                    <option value="FUNCTIONAL">FUNCTIONAL (Not turning on / Hardware fault)</option>
                                    <option value="PACKAGING">PACKAGING (Torn / Tampered box)</option>
                                    <option value="WATER_DAMAGE">WATER_DAMAGE (Moisture / Liquid stain)</option>
                                    <option value="OTHER">OTHER (General damage)</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Damage Responsibility</label>
                                  <select
                                    value={qcDamageResp[ret.id] || 'UNKNOWN'}
                                    onChange={(e) => setQcDamageResp({ ...qcDamageResp, [ret.id]: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 cursor-pointer"
                                  >
                                    <option value="SELLER">SELLER (Defective before shipment - Refund Eligible)</option>
                                    <option value="COURIER">COURIER (Transit damage - Refund Eligible)</option>
                                    <option value="UNKNOWN">UNKNOWN (Pre-delivery suspected - Refund Eligible)</option>
                                    <option value="CUSTOMER">CUSTOMER (Customer damage - Refund Rejected)</option>
                                  </select>
                                </div>
                              </div>
                              <p className="text-[10px] text-amber-300/80 italic">
                                * Product will be moved to Quarantine Damaged Stock. Returns caused by Seller/Courier/Unknown are eligible for refund; Customer damage will reject refund.
                              </p>
                            </div>
                          )}

                          <input
                            type="text"
                            placeholder="QC Inspection Remarks / Damage Notes (e.g., Unopened box / Water stain on rear panel)..."
                            value={qcNotes[ret.id] || ''}
                            onChange={(e) => setQcNotes({ ...qcNotes, [ret.id]: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-orange-500"
                          />

                          <button
                            onClick={() => handlePerformQC(ret.id)}
                            disabled={processingQcId === ret.id}
                            className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                          >
                            {processingQcId === ret.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                            Submit QC Decision & Complete Inspection
                          </button>
                        </div>
                      ) : (
                        <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 font-bold text-slate-200">
                              <ShieldCheck className="w-4 h-4 text-cyan-400" />
                              QC Inspection Completed
                            </span>
                            <span className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] ${
                              ret.qcResult === 'PASSED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                              ret.qcResult === 'DAMAGED' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                              'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}>
                              QC RESULT: {ret.qcResult || (ret.isUsable ? 'PASSED' : 'DAMAGED')}
                            </span>
                          </div>

                          {ret.qcResult === 'DAMAGED' && (
                            <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-950 rounded-lg text-[11px]">
                              <div>
                                <span className="text-slate-500 block">Damage Type</span>
                                <span className="font-bold text-amber-400">{ret.damageType || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 block">Responsibility</span>
                                <span className={`font-bold ${ret.damageResponsibility === 'CUSTOMER' ? 'text-rose-400' : 'text-cyan-400'}`}>
                                  {ret.damageResponsibility || 'UNKNOWN'}
                                </span>
                              </div>
                            </div>
                          )}

                          {ret.damageDescription && (
                            <p className="text-slate-300 italic text-[11px]">
                              Remarks: "{ret.damageDescription}"
                            </p>
                          )}

                          <div className="text-[10px] text-slate-500 flex justify-between border-t border-slate-800 pt-2">
                            <span>QC Inspector: <strong className="text-slate-400">{ret.qcStaffName || ret.qcStaffEmail || 'Warehouse Staff'}</strong></span>
                            <span>Date: {ret.qcDate ? new Date(ret.qcDate).toLocaleString() : 'N/A'}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: STOCK MOVEMENT LOGS */}
        {activeTab === 'movements' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-400" />
                  Stock Movement History Logs
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complete audit record of stock status transitions (AVAILABLE &rarr; ALLOCATED &rarr; PICKED &rarr; PACKED &rarr; READY_FOR_SHIPMENT &rarr; RETURNED).
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter movement logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {filteredMovements.length === 0 ? (
              <div className="text-center py-12 text-slate-400 bg-slate-950/60 rounded-xl border border-slate-800">
                <History className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                <p className="text-sm font-semibold text-slate-300">No stock movement logs found for your warehouse.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Log ID</th>
                      <th className="p-3.5">Timestamp</th>
                      <th className="p-3.5">Product</th>
                      <th className="p-3.5">Warehouse</th>
                      <th className="p-3.5">Order</th>
                      <th className="p-3.5">Quantity</th>
                      <th className="p-3.5">Transition</th>
                      <th className="p-3.5">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredMovements.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 font-mono text-indigo-400">#LOG-{log.id}</td>
                        <td className="p-3.5 text-slate-400">
                          {log.timestamp ? new Date(log.timestamp).toLocaleString() : ''}
                        </td>
                        <td className="p-3.5 font-semibold text-white">{log.productName}</td>
                        <td className="p-3.5">{log.warehouseName}</td>
                        <td className="p-3.5 font-bold text-amber-400">
                          {log.orderId ? `Order #${log.orderId}` : 'N/A (Intake)'}
                        </td>
                        <td className="p-3.5 font-extrabold text-white">{log.quantity}</td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-1 text-[11px] font-bold">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {log.previousStatus || 'NONE'}
                            </span>
                            <ArrowRight className="w-3 h-3 text-cyan-400" />
                            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                              {log.newStatus || log.stage}
                            </span>
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-400 max-w-xs truncate">{log.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 7: WAREHOUSE INVENTORY */}
        {activeTab === 'inventory' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-400" />
                Warehouse Stock Inventory Levels
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time snapshot of Available Quantity, Allocated Quantity, and Damaged / Quarantine Stock in your assigned warehouse.
              </p>
            </div>

            {inventory.length === 0 ? (
              <div className="text-center py-12 text-slate-400 bg-slate-950/60 rounded-xl border border-slate-800">
                <Layers className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                <p className="text-sm font-semibold text-slate-300">No stock records available for your assigned warehouse.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Warehouse</th>
                      <th className="p-3.5">Product ID</th>
                      <th className="p-3.5">Product Name</th>
                      <th className="p-3.5">Available Quantity</th>
                      <th className="p-3.5">Allocated Quantity</th>
                      <th className="p-3.5">Damaged / Quarantine Stock</th>
                      <th className="p-3.5">Total Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {inventory.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 font-bold text-white">
                          {inv.warehouseName} ({inv.warehouseCode})
                        </td>
                        <td className="p-3.5 font-mono text-slate-400">#{inv.productId}</td>
                        <td className="p-3.5 font-semibold text-slate-200">{inv.productName}</td>
                        <td className="p-3.5 font-extrabold text-emerald-400 text-sm">
                          {inv.availableQuantity}
                        </td>
                        <td className="p-3.5 font-extrabold text-amber-400 text-sm">
                          {inv.allocatedQuantity}
                        </td>
                        <td className="p-3.5 font-extrabold text-rose-400 text-sm">
                          {inv.damagedQuantity || 0}
                        </td>
                        <td className="p-3.5 font-extrabold text-cyan-400 text-sm">
                          {(inv.availableQuantity || 0) + (inv.allocatedQuantity || 0) + (inv.damagedQuantity || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WarehouseStaffDashboardPage;
