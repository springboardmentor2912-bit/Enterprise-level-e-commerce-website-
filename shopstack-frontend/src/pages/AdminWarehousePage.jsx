import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchWarehouses,
  createWarehouse,
  updateWarehouse,
  toggleWarehouseStatus,
  fetchAllWarehouseInventory,
  updateWarehouseStock,
  fetchAllocations,
  allocateOrder,
  autoAllocateOrder,
  fetchSuitableWarehousesForOrder,
  fetchStockMovements,
  fetchWarehouseAnalytics,
  fetchWarehouseStaff,
  createWarehouseStaff,
  assignStaffToWarehouse,
  fetchAdminUnallocatedOrders,
  clearWarehouseMessage,
} from '../store/slices/warehouseSlice';
import axiosClient from '../api/axiosClient';
import { getErrorMessage } from '../api/errorUtils';
import {
  Warehouse as WarehouseIcon,
  Package,
  Boxes,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  Edit,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Truck,
  Box,
  History,
  AlertTriangle,
  Search,
  Filter,
  BarChart2,
  Layers,
  ArrowUpRight,
  UserCheck,
  Users,
  ShieldCheck,
  UserPlus,
  MapPin,
} from 'lucide-react';

const AdminWarehousePage = () => {
  const dispatch = useDispatch();
  const {
    warehouses,
    inventory,
    allocations,
    unallocatedOrders,
    stockMovements,
    staffList,
    analytics,
    loading,
    error,
    successMessage,
  } = useSelector((state) => state.warehouse);

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'warehouses' | 'staff' | 'inventory' | 'fulfillment' | 'logs'
  const [allProducts, setAllProducts] = useState([]);

  // Modals state
  const [showAddWarehouseModal, setShowAddWarehouseModal] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [warehouseFormData, setWarehouseFormData] = useState({
    name: '',
    code: '',
    location: '',
    contact: '',
    status: 'ACTIVE',
  });

  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [staffFormData, setStaffFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    warehouseId: '',
  });

  const [showReassignStaffModal, setShowReassignStaffModal] = useState(false);
  const [selectedStaffForReassign, setSelectedStaffForReassign] = useState(null);
  const [newStaffWarehouseId, setNewStaffWarehouseId] = useState('');

  const [showStockModal, setShowStockModal] = useState(false);
  const [stockFormData, setStockFormData] = useState({
    warehouseId: '',
    productId: '',
    quantity: 0,
    notes: '',
  });

  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [selectedOrderForAllocation, setSelectedOrderForAllocation] = useState(null);
  const [targetWarehouseId, setTargetWarehouseId] = useState('');
  const [suitableWarehouses, setSuitableWarehouses] = useState([]);
  const [loadingSuitable, setLoadingSuitable] = useState(false);

  // Filters & Search
  const [movementSearch, setMovementSearch] = useState('');
  const [movementStageFilter, setMovementStageFilter] = useState('ALL');

  useEffect(() => {
    loadAllData();
  }, [dispatch]);

  const loadAllData = () => {
    dispatch(fetchWarehouses());
    dispatch(fetchWarehouseStaff());
    dispatch(fetchAllWarehouseInventory());
    dispatch(fetchAdminUnallocatedOrders());
    dispatch(fetchAllocations());
    dispatch(fetchStockMovements());
    dispatch(fetchWarehouseAnalytics());
    fetchProducts();
  };

  const fetchProducts = async () => {
    try {
      const productsRes = await axiosClient.get('/admin/products');
      setAllProducts(productsRes.data || []);
    } catch (e) {
      // Products fetch failure non-blocking for warehouse ops
    }
  };

  // Toast auto-clear
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        dispatch(clearWarehouseMessage());
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error, dispatch]);

  // Warehouse CRUD Handlers
  const handleSaveWarehouse = async (e) => {
    e.preventDefault();
    if (editingWarehouse) {
      await dispatch(updateWarehouse({ id: editingWarehouse.id, warehouseData: warehouseFormData }));
    } else {
      await dispatch(createWarehouse(warehouseFormData));
    }
    setShowAddWarehouseModal(false);
    setEditingWarehouse(null);
    setWarehouseFormData({ name: '', code: '', location: '', contact: '', status: 'ACTIVE' });
    loadAllData();
  };

  const handleOpenEditWarehouse = (wh) => {
    setEditingWarehouse(wh);
    setWarehouseFormData({
      name: wh.name || '',
      code: wh.code || '',
      location: wh.location || '',
      contact: wh.contact || '',
      status: wh.status || 'ACTIVE',
    });
    setShowAddWarehouseModal(true);
  };

  const handleToggleStatus = async (wh) => {
    const nextStatus = wh.status === 'ACTIVE' ? false : true;
    await dispatch(toggleWarehouseStatus({ id: wh.id, active: nextStatus }));
    loadAllData();
  };

  // Staff CRUD Handlers
  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!staffFormData.warehouseId) return;
    await dispatch(
      createWarehouseStaff({
        ...staffFormData,
        warehouseId: parseInt(staffFormData.warehouseId),
      })
    );
    setShowAddStaffModal(false);
    setStaffFormData({ name: '', email: '', password: '', phone: '', warehouseId: '' });
    loadAllData();
  };

  const handleReassignStaff = async (e) => {
    e.preventDefault();
    if (!selectedStaffForReassign || !newStaffWarehouseId) return;
    await dispatch(
      assignStaffToWarehouse({
        staffId: selectedStaffForReassign.id,
        warehouseId: parseInt(newStaffWarehouseId),
      })
    );
    setShowReassignStaffModal(false);
    setSelectedStaffForReassign(null);
    setNewStaffWarehouseId('');
    loadAllData();
  };

  // Stock Adjustment Handler
  const handleSaveStock = async (e) => {
    e.preventDefault();
    if (!stockFormData.warehouseId || !stockFormData.productId) return;
    await dispatch(
      updateWarehouseStock({
        warehouseId: stockFormData.warehouseId,
        stockData: {
          productId: parseInt(stockFormData.productId),
          quantity: parseInt(stockFormData.quantity),
          notes: stockFormData.notes,
        },
      })
    );
    setShowStockModal(false);
    setStockFormData({ warehouseId: '', productId: '', quantity: 0, notes: '' });
    loadAllData();
  };

  // Order Allocation Handlers
  const handleManualAllocate = async () => {
    if (!selectedOrderForAllocation || !targetWarehouseId) return;
    await dispatch(
      allocateOrder({
        orderId: selectedOrderForAllocation.id,
        warehouseId: parseInt(targetWarehouseId),
      })
    );
    setShowAllocateModal(false);
    setSelectedOrderForAllocation(null);
    setTargetWarehouseId('');
    loadAllData();
  };

  const handleAutoAllocate = async (orderId) => {
    await dispatch(autoAllocateOrder(orderId));
    loadAllData();
  };

  // Filtered Stock Movements
  const filteredMovements = stockMovements.filter((m) => {
    const matchesSearch =
      m.productName?.toLowerCase().includes(movementSearch.toLowerCase()) ||
      m.warehouseName?.toLowerCase().includes(movementSearch.toLowerCase()) ||
      (m.orderId && m.orderId.toString().includes(movementSearch));
    const matchesStage = movementStageFilter === 'ALL' || m.stage === movementStageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 font-sans">
      {/* Toast Notifications */}
      {successMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500/90 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-xl border border-emerald-400/30 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span className="text-sm font-semibold">{successMessage}</span>
        </div>
      )}
      {error && (
        <div className="fixed bottom-6 right-6 z-50 bg-rose-600/90 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-xl border border-rose-400/30 flex items-center gap-3 animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-white" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl backdrop-blur-md shadow-2xl">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <WarehouseIcon className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Warehouse Management & Allocation Portal
              </h1>
            </div>
            <p className="text-sm text-slate-400">
              Manage warehouses (Bangalore, Hyderabad, Delhi, Pune), staff assignments, order stock allocation, and real-time inventory movements.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadAllData}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 cursor-pointer shadow-md"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Data</span>
            </button>
            <button
              onClick={() => {
                setEditingWarehouse(null);
                setWarehouseFormData({ name: '', code: '', location: '', contact: '', status: 'ACTIVE' });
                setShowAddWarehouseModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Warehouse</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Warehouses</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <WarehouseIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{analytics?.totalWarehouses ?? warehouses.length}</div>
          <div className="text-[11px] text-emerald-400 mt-1 font-semibold">
            {analytics?.activeWarehouses ?? warehouses.filter((w) => w.status === 'ACTIVE').length} Active Locations
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned Staff</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{staffList.length}</div>
          <div className="text-[11px] text-blue-400 mt-1 font-semibold">
            Warehouse Operations Staff
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Available Stock</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{analytics?.totalAvailableStock ?? 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Across all warehouses</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Allocated Stock</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{analytics?.totalAllocatedStock ?? 0}</div>
          <div className="text-[11px] text-purple-400 mt-1 font-semibold">Reserved for confirmed orders</div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'overview', name: 'Overview & Analytics', icon: BarChart2 },
          { id: 'warehouses', name: 'Warehouses', icon: WarehouseIcon },
          { id: 'staff', name: 'Warehouse Staff', icon: Users },
          { id: 'inventory', name: 'Stock Inventory', icon: Boxes },
          { id: 'fulfillment', name: 'Order Allocation Workflow', icon: Package },
          { id: 'logs', name: 'Stock Movement Audit Log', icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs">
                  1
                </div>
                <h3 className="font-extrabold text-white text-sm">Allocated</h3>
              </div>
              <div className="text-3xl font-black text-amber-400">{analytics?.pendingAllocationsCount ?? 0}</div>
              <p className="text-xs text-slate-400 mt-2">Orders allocated to warehouse, awaiting staff picking.</p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">
                  2
                </div>
                <h3 className="font-extrabold text-white text-sm">Picked</h3>
              </div>
              <div className="text-3xl font-black text-blue-400">{analytics?.pickedAllocationsCount ?? 0}</div>
              <p className="text-xs text-slate-400 mt-2">Items retrieved from shelf by staff, awaiting packing.</p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xs">
                  3
                </div>
                <h3 className="font-extrabold text-white text-sm">Packed</h3>
              </div>
              <div className="text-3xl font-black text-purple-400">{analytics?.packedAllocationsCount ?? 0}</div>
              <p className="text-xs text-slate-400 mt-2">Boxed and sealed by staff, awaiting shipment labels.</p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">
                  4
                </div>
                <h3 className="font-extrabold text-white text-sm">Ready for Shipment</h3>
              </div>
              <div className="text-3xl font-black text-emerald-400">{analytics?.readyForShipmentCount ?? 0}</div>
              <p className="text-xs text-slate-400 mt-2">Labeled and staged for courier pickup.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WAREHOUSES MANAGEMENT */}
      {activeTab === 'warehouses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white">Warehouses ({warehouses.length})</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {warehouses.map((wh) => (
              <div
                key={wh.id}
                className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-800 text-amber-400 border border-slate-700 font-mono">
                      {wh.code}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        wh.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {wh.status}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-white">{wh.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {wh.location || 'Location Not Specified'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">Contact: {wh.contact || 'N/A'}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                  <button
                    onClick={() => handleToggleStatus(wh)}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {wh.status === 'ACTIVE' ? (
                      <ToggleRight className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-slate-600" />
                    )}
                    <span>{wh.status === 'ACTIVE' ? 'Active' : 'Inactive'}</span>
                  </button>

                  <button
                    onClick={() => handleOpenEditWarehouse(wh)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: WAREHOUSE STAFF MANAGEMENT */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white">Warehouse Operations Staff ({staffList.length})</h2>
              <p className="text-xs text-slate-400 mt-0.5">Assign staff members to specific warehouses (Bangalore, Hyderabad, Delhi, Pune).</p>
            </div>

            <button
              onClick={() => {
                setStaffFormData({ name: '', email: '', password: '', phone: '', warehouseId: warehouses[0]?.id || '' });
                setShowAddStaffModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Staff Member</span>
            </button>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-4 px-6">Staff Member</th>
                    <th className="py-4 px-6">Email</th>
                    <th className="py-4 px-6">Phone</th>
                    <th className="py-4 px-6">Assigned Warehouse</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {staffList.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-500">
                        No warehouse staff registered yet. Click "Add Staff Member" to assign staff to a warehouse.
                      </td>
                    </tr>
                  ) : (
                    staffList.map((staff) => (
                      <tr key={staff.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 px-6 font-bold text-white flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center">
                            {staff.name?.charAt(0) || 'S'}
                          </div>
                          <span>{staff.name}</span>
                        </td>
                        <td className="py-4 px-6 text-slate-300">{staff.email}</td>
                        <td className="py-4 px-6 text-slate-400">{staff.phone || 'N/A'}</td>
                        <td className="py-4 px-6">
                          {staff.warehouseName ? (
                            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                              {staff.warehouseName} ({staff.warehouseCode})
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              Unassigned
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => {
                              setSelectedStaffForReassign(staff);
                              setNewStaffWarehouseId(staff.warehouseId || warehouses[0]?.id || '');
                              setShowReassignStaffModal(true);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all cursor-pointer"
                          >
                            Reassign Warehouse
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STOCK INVENTORY MANAGEMENT */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white">Warehouse Stock Inventory</h2>
            <button
              onClick={() => {
                setStockFormData({ warehouseId: warehouses[0]?.id || '', productId: allProducts[0]?.id || '', quantity: 10, notes: '' });
                setShowStockModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Adjust Warehouse Stock</span>
            </button>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-4 px-6">Warehouse</th>
                    <th className="py-4 px-6">Product</th>
                    <th className="py-4 px-6 text-center">Available Stock</th>
                    <th className="py-4 px-6 text-center">Allocated Stock</th>
                    <th className="py-4 px-6 text-right">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {inventory.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-500">
                        No inventory records found across warehouses.
                      </td>
                    </tr>
                  ) : (
                    inventory.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 px-6 font-bold text-white">
                          <div>{inv.warehouseName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{inv.warehouseCode}</div>
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-200">
                          {inv.productName}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black">
                            {inv.availableQuantity}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-black">
                            {inv.allocatedQuantity}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right text-slate-400 font-mono text-[11px]">
                          {inv.updatedAt ? new Date(inv.updatedAt).toLocaleString() : 'N/A'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ORDER FULFILLMENT WORKFLOW (ADMIN ALLOCATES CONFIRMED ORDERS) */}
      {activeTab === 'fulfillment' && (
        <div className="space-y-8">
          {/* Confirmed Orders Needing Allocation Section */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl">
            <h2 className="text-base font-black text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <span>Confirmed Orders Awaiting Warehouse Stock Allocation</span>
            </h2>

            <div className="space-y-4">
              {unallocatedOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-slate-950/80 border border-slate-800 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-white text-sm">Order #{order.id}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Customer: <span className="text-slate-200">{order.customerName || order.customerEmail || 'Customer'}</span> |
                      Total Amount: <span className="font-bold text-white">₹{order.totalAmount}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">Shipping Address: {order.shippingAddress}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {order.items?.map((it) => (
                        <span key={it.id} className="text-[11px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-lg text-slate-300">
                          {it.productName} × <strong className="text-amber-400">{it.quantity}</strong>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAutoAllocate(order.id)}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
                    >
                      Auto Allocate
                    </button>
                    <button
                      onClick={async () => {
                        setSelectedOrderForAllocation(order);
                        setTargetWarehouseId('');
                        setSuitableWarehouses([]);
                        setLoadingSuitable(true);
                        setShowAllocateModal(true);
                        const result = await dispatch(fetchSuitableWarehousesForOrder(order.id));
                        const whs = result.payload || [];
                        setSuitableWarehouses(whs);
                        if (whs.length > 0) setTargetWarehouseId(String(whs[0].id));
                        setLoadingSuitable(false);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all cursor-pointer"
                    >
                      Select Warehouse
                    </button>
                  </div>
                </div>
              ))}
              {unallocatedOrders.length === 0 && (
                <p className="text-xs text-slate-500 italic py-2">No unallocated confirmed orders at this moment. All confirmed orders are allocated to suitable warehouses.</p>
              )}
            </div>
          </div>

          {/* Active Allocations Monitoring Table (Read-Only for Admin - Pick/Pack executed by Staff) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-400" />
                <span>Active Warehouse Allocations & Fulfillment Pipeline</span>
              </h2>
              <span className="text-xs text-slate-400 font-medium">Note: Pick, Pack, & Ready for Shipment operations are handled by assigned Warehouse Staff.</span>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-4 px-6">Alloc. ID</th>
                      <th className="py-4 px-6">Order ID</th>
                      <th className="py-4 px-6">Target Warehouse</th>
                      <th className="py-4 px-6">Product & Qty</th>
                      <th className="py-4 px-6 text-center">Fulfillment Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {allocations.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-slate-500">
                          No active order allocations found. Allocate a confirmed order above to begin fulfillment.
                        </td>
                      </tr>
                    ) : (
                      allocations.map((alloc) => (
                        <tr key={alloc.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-4 px-6 font-mono text-amber-400 font-bold">#{alloc.id}</td>
                          <td className="py-4 px-6 font-bold text-white">Order #{alloc.orderId}</td>
                          <td className="py-4 px-6">
                            <div className="font-bold text-slate-200">{alloc.warehouseName}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{alloc.warehouseCode}</div>
                          </td>
                          <td className="py-4 px-6 font-semibold text-slate-200">
                            {alloc.productName} <span className="text-amber-400 font-bold">× {alloc.allocatedQuantity}</span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                alloc.status === 'ALLOCATED'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  : alloc.status === 'PICKED'
                                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                  : alloc.status === 'PACKED'
                                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              }`}
                            >
                              {alloc.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: STOCK MOVEMENT AUDIT LOG */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-black text-white">Stock Movement Audit History</h2>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search product, warehouse..."
                  value={movementSearch}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-2xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50 w-56"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-4 px-6">Timestamp</th>
                    <th className="py-4 px-6">Product</th>
                    <th className="py-4 px-6">Warehouse</th>
                    <th className="py-4 px-6">Order ID</th>
                    <th className="py-4 px-6 text-center">Stage Transition</th>
                    <th className="py-4 px-6 text-center">Qty</th>
                    <th className="py-4 px-6">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredMovements.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-500">
                        No stock movement logs recorded yet.
                      </td>
                    </tr>
                  ) : (
                    filteredMovements.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 px-6 text-slate-400 font-mono text-[11px]">
                          {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                        </td>
                        <td className="py-4 px-6 font-bold text-white">{log.productName}</td>
                        <td className="py-4 px-6 text-slate-300">{log.warehouseName}</td>
                        <td className="py-4 px-6 font-mono text-amber-400 font-bold">
                          {log.orderId ? `#${log.orderId}` : 'N/A'}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                            {log.previousStatus || 'NONE'} → {log.newStatus || log.stage}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center font-extrabold text-white">{log.quantity}</td>
                        <td className="py-4 px-6 text-slate-400">{log.notes || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT WAREHOUSE */}
      {showAddWarehouseModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <h3 className="text-lg font-black text-white">
              {editingWarehouse ? 'Edit Warehouse' : 'Add New Warehouse'}
            </h3>

            <form onSubmit={handleSaveWarehouse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Warehouse Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bangalore Central Warehouse"
                  value={warehouseFormData.name}
                  onChange={(e) => setWarehouseFormData({ ...warehouseFormData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Warehouse Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WH-BLR"
                  disabled={!!editingWarehouse}
                  value={warehouseFormData.code}
                  onChange={(e) => setWarehouseFormData({ ...warehouseFormData, code: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Location / Address</label>
                <input
                  type="text"
                  placeholder="e.g. Electronics City, Bangalore"
                  value={warehouseFormData.location}
                  onChange={(e) => setWarehouseFormData({ ...warehouseFormData, location: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Contact Email / Phone</label>
                <input
                  type="text"
                  placeholder="e.g. blr-manager@shopstack.com"
                  value={warehouseFormData.contact}
                  onChange={(e) => setWarehouseFormData({ ...warehouseFormData, contact: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddWarehouseModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold shadow-md"
                >
                  Save Warehouse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD WAREHOUSE STAFF MEMBER */}
      {showAddStaffModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <h3 className="text-lg font-black text-white">Add Warehouse Staff Member</h3>

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Staff Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bangalore Staff"
                  value={staffFormData.name}
                  onChange={(e) => setStaffFormData({ ...staffFormData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Staff Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. blr-staff@shopstack.com"
                  value={staffFormData.email}
                  onChange={(e) => setStaffFormData({ ...staffFormData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={staffFormData.password}
                  onChange={(e) => setStaffFormData({ ...staffFormData, password: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210"
                  value={staffFormData.phone}
                  onChange={(e) => setStaffFormData({ ...staffFormData, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Assign to Warehouse</label>
                <select
                  required
                  value={staffFormData.warehouseId}
                  onChange={(e) => setStaffFormData({ ...staffFormData, warehouseId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Choose Warehouse --</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold shadow-md"
                >
                  Create & Assign Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REASSIGN STAFF WAREHOUSE */}
      {showReassignStaffModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <h3 className="text-lg font-black text-white">Reassign Warehouse Staff</h3>
            <p className="text-xs text-slate-400">
              Reassign <strong className="text-white">{selectedStaffForReassign?.name}</strong> to a different warehouse location.
            </p>

            <form onSubmit={handleReassignStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Target Warehouse</label>
                <select
                  required
                  value={newStaffWarehouseId}
                  onChange={(e) => setNewStaffWarehouseId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Select New Warehouse --</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowReassignStaffModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold shadow-md"
                >
                  Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MANUAL ORDER ALLOCATION — Shows only warehouses with sufficient stock */}
      {showAllocateModal && selectedOrderForAllocation && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div>
              <h3 className="text-lg font-black text-white">
                Select Warehouse — Order #{selectedOrderForAllocation.id}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Only warehouses with <strong className="text-emerald-400">sufficient stock</strong> for all items in this order are shown.
              </p>
            </div>

            {/* Order Items Summary */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Order Items</p>
              {selectedOrderForAllocation.items?.map((it) => (
                <div key={it.id} className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">{it.productName}</span>
                  <span className="text-xs font-bold text-amber-400">× {it.quantity}</span>
                </div>
              ))}
            </div>

            {/* Warehouse Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2">Available Warehouses with Sufficient Stock</label>
              {loadingSuitable ? (
                <div className="flex items-center justify-center py-6 text-slate-400 text-xs gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Checking warehouse stock levels...
                </div>
              ) : suitableWarehouses.length === 0 ? (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-center">
                  <AlertTriangle className="w-6 h-6 text-rose-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-rose-400">No suitable warehouse found</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    No active warehouse has sufficient stock for all items in this order. Please restock a warehouse first.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {suitableWarehouses.map((w) => (
                    <label
                      key={w.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        targetWarehouseId === String(w.id)
                          ? 'border-indigo-500/50 bg-indigo-500/10'
                          : 'border-slate-700 bg-slate-950/50 hover:border-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="warehouseSelect"
                        value={String(w.id)}
                        checked={targetWarehouseId === String(w.id)}
                        onChange={(e) => setTargetWarehouseId(e.target.value)}
                        className="accent-indigo-500"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-bold text-white">{w.name}</div>
                        <div className="text-[11px] text-slate-400">{w.location} · <span className="font-mono text-slate-500">{w.code}</span></div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">Has Stock</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => { setShowAllocateModal(false); setSelectedOrderForAllocation(null); setSuitableWarehouses([]); }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleManualAllocate}
                disabled={!targetWarehouseId || loadingSuitable || suitableWarehouses.length === 0}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-extrabold shadow-md transition-all"
              >
                Confirm Allocation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: STOCK ADJUSTMENT */}
      {showStockModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <h3 className="text-lg font-black text-white">Adjust Warehouse Stock Quantity</h3>

            <form onSubmit={handleSaveStock} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Warehouse</label>
                <select
                  value={stockFormData.warehouseId}
                  onChange={(e) => setStockFormData({ ...stockFormData, warehouseId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {warehouses
                    .filter((w) => w.status === 'ACTIVE')
                    .map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.code})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Product</label>
                <select
                  value={stockFormData.productId}
                  onChange={(e) => setStockFormData({ ...stockFormData, productId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {allProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {p.stockQuantity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Quantity Adjustment (+ or -)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 20 or -5"
                  value={stockFormData.quantity}
                  onChange={(e) => setStockFormData({ ...stockFormData, quantity: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Reason / Audit Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Inbound shipment arrival"
                  value={stockFormData.notes}
                  onChange={(e) => setStockFormData({ ...stockFormData, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowStockModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-md"
                >
                  Update Inventory Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWarehousePage;
