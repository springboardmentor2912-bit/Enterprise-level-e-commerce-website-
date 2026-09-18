import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { warehouseApi } from '../api';
import { getErrorMessage } from '../api/axios';
import {
  Package, Truck, CheckCircle2, Clock, AlertTriangle, ArrowRight,
  RefreshCw, Search, Filter, MapPin, Box, ShieldCheck, FileText,
  Sliders, ArrowUpRight, BarChart3, Database, Send, PlayCircle, Check,
  X, Sparkles, Navigation, Phone, Mail, Edit2, ChevronRight, Archive,
  Info, QrCode, Tag, RotateCcw, AlertOctagon, CheckSquare, Layers
} from 'lucide-react';

const WarehouseStaffPortal = () => {
  const { user } = useAuth();
  const { showToast } = useCart();

  // State
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(user?.assignedWarehouseId || null);
  const [activeTab, setActiveTab] = useState('PIPELINE'); // 'PIPELINE' | 'RETURNS_QC' | 'INVENTORY' | 'MOVEMENTS'

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Data
  const [allocations, setAllocations] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);
  const [returnsList, setReturnsList] = useState([]);
  const [movements, setMovements] = useState([]);

  // Modals
  const [selectedAllocForPick, setSelectedAllocForPick] = useState(null);
  const [pickForm, setPickForm] = useState({ pickerName: user?.fullName || 'Staff Associate', notes: 'Item physically picked and verified from shelf' });

  const [selectedAllocForPack, setSelectedAllocForPack] = useState(null);
  const [packForm, setPackForm] = useState({
    packerName: user?.fullName || 'Staff Specialist',
    boxType: 'Corrugated Box B2',
    boxDimension: '25x20x15 cm',
    packageWeightKg: 0.85,
    notes: 'Item verified, bubble wrapped and tamper-sealed'
  });

  const [selectedAllocForShip, setSelectedAllocForShip] = useState(null);
  const [shipForm, setShipForm] = useState({
    carrier: 'BlueDart Express',
    trackingNumber: '',
    notes: 'Air Express manifest created'
  });

  const [selectedReturnForQc, setSelectedReturnForQc] = useState(null);
  const [qcForm, setQcForm] = useState({
    qcDecision: 'PASS',
    qcNotes: 'Product inspected. Hardware intact, original packaging verified.',
    inspectedBy: user?.fullName || 'QC Specialist'
  });

  const [showRestockModal, setShowRestockModal] = useState(false);
  const [restockForm, setRestockForm] = useState({
    productId: '',
    quantity: 10,
    aisleLocation: 'Aisle 02, Shelf 04',
    notes: 'Inbound stock received'
  });

  // Fetch initial warehouses
  useEffect(() => {
    warehouseApi.getAll()
      .then(res => {
        const whs = res.data || [];
        setWarehouses(whs);
        if (!selectedWarehouseId && whs.length > 0) {
          const userWh = whs.find(w => w.id === user?.assignedWarehouseId);
          setSelectedWarehouseId(userWh ? userWh.id : whs[0].id);
        }
      })
      .catch(err => console.error('Failed to load warehouses:', err));
  }, [user]);

  // Fetch data for selected warehouse
  useEffect(() => {
    if (!selectedWarehouseId) return;
    setLoading(true);

    Promise.all([
      warehouseApi.getAllocations({ warehouseId: selectedWarehouseId }).catch(() => ({ data: [] })),
      warehouseApi.getInventoryByWarehouse(selectedWarehouseId).catch(() => ({ data: [] })),
      warehouseApi.getAllReturns({ warehouseId: selectedWarehouseId }).catch(() => ({ data: [] })),
      warehouseApi.getStockMovements({ warehouseId: selectedWarehouseId }).catch(() => ({ data: [] }))
    ]).then(([allocRes, invRes, retRes, movRes]) => {
      setAllocations(allocRes.data || []);
      setInventoryList(invRes.data || []);
      setReturnsList(retRes.data || []);
      setMovements(movRes.data || []);
    }).finally(() => setLoading(false));
  }, [selectedWarehouseId, refreshKey]);

  const currentWarehouse = warehouses.find(w => w.id === Number(selectedWarehouseId));

  // Handler: Pick Item
  const handlePickSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAllocForPick) return;
    setActionLoading(true);
    try {
      await warehouseApi.pickItem(selectedAllocForPick.id, pickForm);
      showToast('Item successfully picked from shelf!', 'success');
      setSelectedAllocForPick(null);
      setRefreshKey(k => k + 1);
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to confirm pick'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handler: Pack Item
  const handlePackSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAllocForPack) return;
    setActionLoading(true);
    try {
      await warehouseApi.packItem(selectedAllocForPack.id, packForm);
      showToast('Item successfully packed and sealed!', 'success');
      setSelectedAllocForPack(null);
      setRefreshKey(k => k + 1);
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to confirm pack'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handler: Prepare Shipment
  const handleShipSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAllocForShip) return;
    setActionLoading(true);
    try {
      await warehouseApi.prepareShipment(selectedAllocForShip.id, shipForm);
      showToast('Shipment prepared with tracking manifest!', 'success');
      setSelectedAllocForShip(null);
      setRefreshKey(k => k + 1);
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to prepare shipment'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handler: Dispatch Item
  const handleDispatch = async (allocationId) => {
    setActionLoading(true);
    try {
      await warehouseApi.dispatchItem(allocationId);
      showToast('Package dispatched with courier driver!', 'success');
      setRefreshKey(k => k + 1);
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to dispatch shipment'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handler: Confirm Delivery
  const handleDeliver = async (allocationId) => {
    setActionLoading(true);
    try {
      await warehouseApi.deliverItem(allocationId);
      showToast('Delivery confirmed to customer address!', 'success');
      setRefreshKey(k => k + 1);
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to mark package as delivered'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handler: Receive Return at Dock
  const handleReceiveReturn = async (returnId) => {
    setActionLoading(true);
    try {
      await warehouseApi.receiveReturn(returnId);
      showToast('Return shipment received at dock!', 'success');
      setRefreshKey(k => k + 1);
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to mark return received'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handler: QC Inspection
  const handleQcSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReturnForQc) return;
    setActionLoading(true);
    try {
      await warehouseApi.performQcInspection(selectedReturnForQc.id, qcForm);
      showToast(`QC Inspection recorded: ${qcForm.qcDecision}`, 'success');
      setSelectedReturnForQc(null);
      setRefreshKey(k => k + 1);
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to record QC inspection'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Compute Metrics
  const toPickCount = allocations.filter(a => a.stage === 'ALLOCATED').length;
  const toPackCount = allocations.filter(a => a.stage === 'PICKED').length;
  const readyShipCount = allocations.filter(a => a.stage === 'READY_FOR_SHIPMENT').length;
  const pendingQcCount = returnsList.filter(r => r.status === 'APPROVED' || r.status === 'RECEIVED_AT_WAREHOUSE').length;
  const totalDamagedStock = inventoryList.reduce((acc, curr) => acc + (curr.damagedStock || 0), 0);

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.5rem', minHeight: '85vh' }}>
      
      {/* Top Header Card */}
      <div style={{
        background: 'linear-gradient(135deg, #111827 0%, #1e1b4b 100%)',
        border: '1px solid #312e81',
        borderRadius: '16px',
        padding: '1.75rem',
        marginBottom: '1.75rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span style={{
              background: '#4f46e5',
              color: '#fff',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <ShieldCheck size={14} /> WAREHOUSE STAFF OPERATIONS
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
              Staff ID: #{user?.id || 101} • {user?.fullName || 'Vikram Rao'}
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Package size={28} color="#818cf8" />
            {currentWarehouse?.name || 'Regional Fulfillment Center'}
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: '0.35rem 0 0 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={15} color="#38bdf8" />
            {currentWarehouse?.city || 'Hyderabad'}, {currentWarehouse?.state || 'India'} • Code: <strong style={{ color: '#a5b4fc' }}>{currentWarehouse?.code}</strong>
          </p>
        </div>

        {/* Hub Selector & Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Active Hub:</span>
            <select
              value={selectedWarehouseId || ''}
              onChange={(e) => setSelectedWarehouseId(Number(e.target.value))}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#f8fafc',
                fontWeight: 700,
                fontSize: '0.9rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {warehouses.map(wh => (
                <option key={wh.id} value={wh.id} style={{ background: '#1e293b', color: '#fff' }}>
                  {wh.code} — {wh.city} ({wh.name})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="btn btn-secondary"
            style={{ padding: '0.65rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', borderRadius: '10px' }}
            title="Refresh Live Data"
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        
        {/* To Pick */}
        <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '14px', padding: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Orders To Pick</span>
            <Box size={20} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.4rem' }}>{toPickCount}</div>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Allocated on shelves</span>
        </div>

        {/* To Pack */}
        <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '14px', padding: '1.25rem', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Orders To Pack</span>
            <Layers size={20} color="#3b82f6" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.4rem' }}>{toPackCount}</div>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Items picked from bin</span>
        </div>

        {/* Ready to Ship */}
        <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '14px', padding: '1.25rem', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Ready To Dispatch</span>
            <Truck size={20} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.4rem' }}>{readyShipCount}</div>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Manifest & label ready</span>
        </div>

        {/* Returns Pending QC */}
        <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '14px', padding: '1.25rem', borderLeft: '4px solid #ec4899' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Returns Pending QC</span>
            <RotateCcw size={20} color="#ec4899" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.4rem' }}>{pendingQcCount}</div>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Awaiting quality inspection</span>
        </div>

        {/* Quarantine Stock */}
        <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '14px', padding: '1.25rem', borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Quarantined Units</span>
            <AlertOctagon size={20} color="#ef4444" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fca5a5', marginTop: '0.4rem' }}>{totalDamagedStock}</div>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Damaged return stock</span>
        </div>

      </div>

      {/* Tabs Navigation */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid #1f2937',
        marginBottom: '1.5rem',
        paddingBottom: '0.25rem'
      }}>
        <button
          onClick={() => setActiveTab('PIPELINE')}
          style={{
            background: activeTab === 'PIPELINE' ? '#1e293b' : 'transparent',
            color: activeTab === 'PIPELINE' ? '#38bdf8' : '#94a3b8',
            border: 'none',
            borderBottom: activeTab === 'PIPELINE' ? '2px solid #38bdf8' : 'none',
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            borderRadius: '8px 8px 0 0',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Box size={16} /> 1. Fulfillment Pipeline ({allocations.length})
        </button>

        <button
          onClick={() => setActiveTab('RETURNS_QC')}
          style={{
            background: activeTab === 'RETURNS_QC' ? '#1e293b' : 'transparent',
            color: activeTab === 'RETURNS_QC' ? '#ec4899' : '#94a3b8',
            border: 'none',
            borderBottom: activeTab === 'RETURNS_QC' ? '2px solid #ec4899' : 'none',
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            borderRadius: '8px 8px 0 0',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <RotateCcw size={16} /> 2. Returns & QC Inspection ({returnsList.length})
        </button>

        <button
          onClick={() => setActiveTab('INVENTORY')}
          style={{
            background: activeTab === 'INVENTORY' ? '#1e293b' : 'transparent',
            color: activeTab === 'INVENTORY' ? '#38bdf8' : '#94a3b8',
            border: 'none',
            borderBottom: activeTab === 'INVENTORY' ? '2px solid #38bdf8' : 'none',
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            borderRadius: '8px 8px 0 0',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Database size={16} /> 3. Hub Inventory & Quarantine ({inventoryList.length})
        </button>

        <button
          onClick={() => setActiveTab('MOVEMENTS')}
          style={{
            background: activeTab === 'MOVEMENTS' ? '#1e293b' : 'transparent',
            color: activeTab === 'MOVEMENTS' ? '#38bdf8' : '#94a3b8',
            border: 'none',
            borderBottom: activeTab === 'MOVEMENTS' ? '2px solid #38bdf8' : 'none',
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            borderRadius: '8px 8px 0 0',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FileText size={16} /> 4. Stock Movement Audit Trail
        </button>
      </div>

      {/* =========================================================================
          TAB 1: FULFILLMENT PIPELINE (KANBAN COLUMNS)
      ========================================================================= */}
      {activeTab === 'PIPELINE' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', alignItems: 'flex-start' }}>
          
          {/* COLUMN 1: ALLOCATED (Ready to Pick) */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>
              <span style={{ fontWeight: 800, color: '#f59e0b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} /> 1. ALLOCATED ({allocations.filter(a => a.stage === 'ALLOCATED').length})
              </span>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Step: Pick</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {allocations.filter(a => a.stage === 'ALLOCATED').map(alloc => (
                <div key={alloc.id} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8' }}>
                    <span>Order: <strong style={{ color: '#cbd5e1' }}>{alloc.orderNumber}</strong></span>
                    <span style={{ background: '#f59e0b20', color: '#f59e0b', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>Qty: {alloc.allocatedQuantity}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', margin: '0.75rem 0', alignItems: 'center' }}>
                    <img src={alloc.productImageUrl} alt="" style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '6px', background: '#fff' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{alloc.productTitle}</div>
                      <div style={{ fontSize: '0.78rem', color: '#38bdf8', marginTop: '2px', fontWeight: 600 }}>📍 Shelf: {alloc.aisleLocation || 'Aisle 01'}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedAllocForPick(alloc);
                      setPickForm({ pickerName: user?.fullName || 'Staff Associate', notes: 'Verified and picked from ' + alloc.aisleLocation });
                    }}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', background: '#f59e0b', borderColor: '#f59e0b', color: '#000', fontWeight: 800 }}
                  >
                    <Check size={14} /> Pick Product
                  </button>
                </div>
              ))}
              {allocations.filter(a => a.stage === 'ALLOCATED').length === 0 && (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>No orders waiting to be picked</div>
              )}
            </div>
          </div>

          {/* COLUMN 2: PICKED (Ready to Pack) */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>
              <span style={{ fontWeight: 800, color: '#3b82f6', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Package size={16} /> 2. PICKED ({allocations.filter(a => a.stage === 'PICKED').length})
              </span>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Step: Pack</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {allocations.filter(a => a.stage === 'PICKED').map(alloc => (
                <div key={alloc.id} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8' }}>
                    <span>Order: <strong style={{ color: '#cbd5e1' }}>{alloc.orderNumber}</strong></span>
                    <span style={{ color: '#60a5fa' }}>Picker: {alloc.pickerName || 'Staff'}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', margin: '0.75rem 0', alignItems: 'center' }}>
                    <img src={alloc.productImageUrl} alt="" style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '6px', background: '#fff' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{alloc.productTitle}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>Qty: {alloc.allocatedQuantity}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedAllocForPack(alloc);
                      setPackForm({
                        packerName: user?.fullName || 'Staff Specialist',
                        boxType: 'Standard Box B2',
                        boxDimension: '25x20x15 cm',
                        packageWeightKg: 0.85,
                        notes: 'Packed safely'
                      });
                    }}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', background: '#3b82f6', borderColor: '#3b82f6', color: '#fff', fontWeight: 700 }}
                  >
                    <Box size={14} /> Pack Product
                  </button>
                </div>
              ))}
              {allocations.filter(a => a.stage === 'PICKED').length === 0 && (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>No orders waiting to be packed</div>
              )}
            </div>
          </div>

          {/* COLUMN 3: PACKED (Ready to Prepare Shipment) */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>
              <span style={{ fontWeight: 800, color: '#8b5cf6', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Tag size={16} /> 3. PACKED ({allocations.filter(a => a.stage === 'PACKED').length})
              </span>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Step: Manifest</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {allocations.filter(a => a.stage === 'PACKED').map(alloc => (
                <div key={alloc.id} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8' }}>
                    <span>Order: <strong style={{ color: '#cbd5e1' }}>{alloc.orderNumber}</strong></span>
                    <span style={{ color: '#a78bfa' }}>Slip: {alloc.packingSlipNumber}</span>
                  </div>

                  <div style={{ margin: '0.5rem 0', fontSize: '0.82rem', color: '#cbd5e1' }}>
                    <strong>{alloc.productTitle}</strong> (Qty: {alloc.allocatedQuantity})
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '2px' }}>Box: {alloc.boxType} • {alloc.packageWeightKg} kg</div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedAllocForShip(alloc);
                      setShipForm({
                        carrier: 'BlueDart Express',
                        trackingNumber: 'TRK-BLD-' + Math.floor(100000 + Math.random() * 900000),
                        notes: 'Air manifest generated'
                      });
                    }}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', background: '#8b5cf6', borderColor: '#8b5cf6', color: '#fff', fontWeight: 700 }}
                  >
                    <Truck size={14} /> Prepare Shipment
                  </button>
                </div>
              ))}
              {allocations.filter(a => a.stage === 'PACKED').length === 0 && (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>No orders waiting for shipment preparation</div>
              )}
            </div>
          </div>

          {/* COLUMN 4: READY_FOR_SHIPMENT (Ready to Dispatch) */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>
              <span style={{ fontWeight: 800, color: '#10b981', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Send size={16} /> 4. READY TO SHIP ({allocations.filter(a => a.stage === 'READY_FOR_SHIPMENT').length})
              </span>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Step: Dispatch</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {allocations.filter(a => a.stage === 'READY_FOR_SHIPMENT').map(alloc => (
                <div key={alloc.id} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8' }}>
                    <span>Order: <strong style={{ color: '#cbd5e1' }}>{alloc.orderNumber}</strong></span>
                    <span style={{ color: '#34d399', fontWeight: 700 }}>{alloc.carrier}</span>
                  </div>

                  <div style={{ margin: '0.5rem 0', fontSize: '0.82rem', color: '#cbd5e1' }}>
                    <strong>{alloc.productTitle}</strong> (Qty: {alloc.allocatedQuantity})
                    <div style={{ color: '#38bdf8', fontSize: '0.78rem', marginTop: '2px', fontWeight: 600 }}>Tracking: {alloc.trackingNumber}</div>
                  </div>

                  <button
                    onClick={() => handleDispatch(alloc.id)}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', background: '#10b981', borderColor: '#10b981', color: '#fff', fontWeight: 800 }}
                  >
                    <Send size={14} /> Dispatch Outbound
                  </button>
                </div>
              ))}
              {allocations.filter(a => a.stage === 'READY_FOR_SHIPMENT').length === 0 && (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>No orders waiting for dispatch</div>
              )}
            </div>
          </div>

          {/* COLUMN 5: IN-TRANSIT & DELIVERED */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>
              <span style={{ fontWeight: 800, color: '#38bdf8', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Truck size={16} /> 5. IN-TRANSIT ({allocations.filter(a => a.stage === 'SHIPPED').length})
              </span>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Step: Delivery</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {allocations.filter(a => a.stage === 'SHIPPED').map(alloc => (
                <div key={alloc.id} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8' }}>
                    <span>Order: <strong style={{ color: '#cbd5e1' }}>{alloc.orderNumber}</strong></span>
                    <span style={{ color: '#38bdf8', fontWeight: 700 }}>🚚 {alloc.carrier}</span>
                  </div>

                  <div style={{ margin: '0.5rem 0', fontSize: '0.82rem', color: '#cbd5e1' }}>
                    <strong>{alloc.productTitle}</strong> (Qty: {alloc.allocatedQuantity})
                    <div style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: '2px' }}>Tracking: {alloc.trackingNumber}</div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '2px' }}>Customer: {alloc.customerName}</div>
                  </div>

                  <button
                    onClick={() => handleDeliver(alloc.id)}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', borderColor: '#0284c7', color: '#fff', fontWeight: 800 }}
                  >
                    <CheckCircle2 size={14} /> Confirm Delivery
                  </button>
                </div>
              ))}
              {allocations.filter(a => a.stage === 'SHIPPED').length === 0 && (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>No orders currently in transit</div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 2: RETURNS & QC INSPECTION (WORKFLOW)
      ========================================================================= */}
      {activeTab === 'RETURNS_QC' && (
        <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '14px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RotateCcw size={22} color="#ec4899" />
                Customer Returns & Quality Control (QC)
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                Inspect returned products at this hub, restock verified units or quarantine damaged inventory
              </p>
            </div>
          </div>

          <div className="table-responsive-wrapper">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#0f172a', borderBottom: '2px solid #1e293b', color: '#94a3b8' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Return ID</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Order / Customer</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Product Item</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Return Reason</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Return Status</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>QC Action</th>
                </tr>
              </thead>
              <tbody>
                {returnsList.map(ret => (
                  <tr key={ret.id} style={{ borderBottom: '1px solid #1f2937' }}>
                    <td style={{ padding: '1rem', fontWeight: 700, color: '#ec4899' }}>
                      RET-#{ret.id}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 700, color: '#f8fafc' }}>{ret.orderNumber}</div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{ret.customerName}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img src={ret.productImageUrl} alt="" style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '6px', background: '#fff' }} />
                        <div>
                          <div style={{ fontWeight: 600, color: '#cbd5e1' }}>{ret.productTitle}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Qty: {ret.quantity || 1} • ₹{ret.refundAmount?.toFixed(2)}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ background: '#334155', color: '#e2e8f0', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                        {ret.returnReasonType || 'DEFECTIVE'}
                      </span>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px', maxWidth: '240px' }}>{ret.reason}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {ret.status === 'PENDING_REVIEW' && <span style={{ background: '#f59e0b20', color: '#f59e0b', padding: '4px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 800 }}>PENDING ADMIN REVIEW</span>}
                      {ret.status === 'APPROVED' && <span style={{ background: '#3b82f620', color: '#60a5fa', padding: '4px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 800 }}>APPROVED • IN TRANSIT</span>}
                      {ret.status === 'RECEIVED_AT_WAREHOUSE' && <span style={{ background: '#ec489920', color: '#f472b6', padding: '4px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 800 }}>RECEIVED AT HUB (AWAITING QC)</span>}
                      {ret.status === 'QC_PASSED_RESTOCKED' && <span style={{ background: '#10b98120', color: '#34d399', padding: '4px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 800 }}>🟢 QC PASSED • RESTOCKED</span>}
                      {ret.status === 'QC_FAILED_DAMAGED' && <span style={{ background: '#ef444420', color: '#f87171', padding: '4px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 800 }}>🔴 QC FAILED • QUARANTINED</span>}
                      {ret.status === 'REJECTED' && <span style={{ background: '#64748b20', color: '#94a3b8', padding: '4px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 800 }}>REJECTED</span>}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      {ret.status === 'APPROVED' && (
                        <button
                          onClick={() => handleReceiveReturn(ret.id)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.78rem' }}
                        >
                          Mark Received at Dock
                        </button>
                      )}

                      {ret.status === 'RECEIVED_AT_WAREHOUSE' && (
                        <button
                          onClick={() => {
                            setSelectedReturnForQc(ret);
                            setQcForm({
                              qcDecision: 'PASS',
                              qcNotes: 'Physical and functional test verified.',
                              inspectedBy: user?.fullName || 'QC Specialist'
                            });
                          }}
                          className="btn btn-primary btn-sm"
                          style={{ background: '#ec4899', borderColor: '#ec4899', color: '#fff', fontSize: '0.78rem', fontWeight: 800 }}
                        >
                          <CheckSquare size={14} /> Perform QC
                        </button>
                      )}

                      {(ret.status === 'QC_PASSED_RESTOCKED' || ret.status === 'QC_FAILED_DAMAGED') && (
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                          Inspected by: <strong style={{ color: '#cbd5e1' }}>{ret.inspectedBy || 'Staff'}</strong>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {returnsList.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748b' }}>
                      No customer returns currently assigned to this warehouse.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: HUB INVENTORY & QUARANTINE DAMAGED STOCK
      ========================================================================= */}
      {activeTab === 'INVENTORY' && (
        <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '14px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={22} color="#38bdf8" />
                Physical Inventory & Shelf Tracking ({currentWarehouse?.name})
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                Live stock levels, allocated customer orders, and quarantine damaged stock
              </p>
            </div>

            <button
              onClick={() => setShowRestockModal(true)}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem' }}
            >
              <Package size={16} /> Inbound Restock
            </button>
          </div>

          <div className="table-responsive-wrapper">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#0f172a', borderBottom: '2px solid #1e293b', color: '#94a3b8' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Product</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Shelf Location</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Total Stock</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Allocated</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Available</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Quarantine Damaged</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {inventoryList.map(inv => (
                  <tr key={inv.id} style={{ borderBottom: '1px solid #1f2937' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img src={inv.productImageUrl} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', background: '#fff' }} />
                        <div>
                          <div style={{ fontWeight: 700, color: '#f8fafc' }}>{inv.productTitle}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>SKU: {inv.productSku} • Seller: {inv.vendorStoreName}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: '#38bdf8', fontWeight: 600 }}>
                      📍 {inv.aisleLocation || 'Aisle 01, Bay A'}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 700, color: '#f8fafc' }}>
                      {inv.totalStock}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 700, color: '#f59e0b' }}>
                      {inv.allocatedStock}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 800, color: '#10b981' }}>
                      {inv.availableStock}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 800, color: (inv.damagedStock > 0 ? '#ef4444' : '#64748b') }}>
                      {inv.damagedStock || 0} {inv.damagedStock > 0 ? '⚠️' : ''}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      {inv.isLowStock ? (
                        <span style={{ background: '#ef444420', color: '#fca5a5', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>LOW STOCK</span>
                      ) : (
                        <span style={{ background: '#10b98120', color: '#86efac', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>IN STOCK</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: STOCK MOVEMENTS AUDIT LOG
      ========================================================================= */}
      {activeTab === 'MOVEMENTS' && (
        <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '14px', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={22} color="#38bdf8" />
            Immutable Stock Movement Audit Log ({currentWarehouse?.name})
          </h3>

          <div className="table-responsive-wrapper">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#0f172a', borderBottom: '2px solid #1e293b', color: '#94a3b8' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Timestamp</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Movement Type</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Product</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Quantity</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Performed By</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Notes / Reference</th>
                </tr>
              </thead>
              <tbody>
                {movements.map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid #1f2937' }}>
                    <td style={{ padding: '0.85rem 1rem', color: '#94a3b8', fontSize: '0.78rem' }}>
                      {new Date(m.createdAt).toLocaleString()}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{
                        background: m.movementType?.includes('RESTOCK') ? '#10b98120' : m.movementType?.includes('QUARANTINE') ? '#ef444420' : '#3b82f620',
                        color: m.movementType?.includes('RESTOCK') ? '#34d399' : m.movementType?.includes('QUARANTINE') ? '#f87171' : '#60a5fa',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 800
                      }}>
                        {m.movementType}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#cbd5e1', fontWeight: 600 }}>
                      {m.productTitle}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center', fontWeight: 800, color: '#f8fafc' }}>
                      {m.quantity}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#94a3b8' }}>
                      {m.performedBy || 'System'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.78rem' }}>
                      {m.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: PICK PRODUCT
      ========================================================================= */}
      {selectedAllocForPick && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#111827', border: '1px solid #334155', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Box size={20} color="#f59e0b" /> Confirm Item Pick
            </h3>

            <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 700, color: '#f8fafc' }}>{selectedAllocForPick.productTitle}</div>
              <div style={{ fontSize: '0.85rem', color: '#38bdf8', marginTop: '4px', fontWeight: 600 }}>📍 Pick Location: {selectedAllocForPick.aisleLocation || 'Aisle 01, Bay A'}</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}>Order: {selectedAllocForPick.orderNumber} • Quantity: <strong>{selectedAllocForPick.allocatedQuantity}</strong></div>
            </div>

            <form onSubmit={handlePickSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '4px' }}>Picker Staff Name / Badge</label>
                <input
                  type="text"
                  required
                  value={pickForm.pickerName}
                  onChange={(e) => setPickForm({ ...pickForm, pickerName: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '4px' }}>Pick Confirmation Notes</label>
                <input
                  type="text"
                  value={pickForm.notes}
                  onChange={(e) => setPickForm({ ...pickForm, notes: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setSelectedAllocForPick(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={actionLoading} className="btn btn-primary" style={{ background: '#f59e0b', borderColor: '#f59e0b', color: '#000', fontWeight: 800 }}>
                  {actionLoading ? 'Verifying...' : 'Confirm Picked'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: PACK PRODUCT
      ========================================================================= */}
      {selectedAllocForPack && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#111827', border: '1px solid #334155', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package size={20} color="#3b82f6" /> Packaging & Box Slip
            </h3>

            <form onSubmit={handlePackSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '4px' }}>Packaging Box Type</label>
                <select
                  value={packForm.boxType}
                  onChange={(e) => setPackForm({ ...packForm, boxType: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                >
                  <option value="Corrugated Box B2">Corrugated Box B2 (Standard Electronics)</option>
                  <option value="Electro-Shield Antistatic Box E1">Electro-Shield Antistatic Box E1</option>
                  <option value="Reinforced Heavy Carton #3">Reinforced Heavy Carton #3</option>
                  <option value="Padded Bubble Mailer M1">Padded Bubble Mailer M1</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '4px' }}>Weight (kg)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={packForm.packageWeightKg}
                    onChange={(e) => setPackForm({ ...packForm, packageWeightKg: parseFloat(e.target.value) })}
                    style={{ width: '100%', padding: '0.65rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '4px' }}>Box Dimensions</label>
                  <input
                    type="text"
                    value={packForm.boxDimension}
                    onChange={(e) => setPackForm({ ...packForm, boxDimension: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '4px' }}>Packer Specialist Name</label>
                <input
                  type="text"
                  required
                  value={packForm.packerName}
                  onChange={(e) => setPackForm({ ...packForm, packerName: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setSelectedAllocForPack(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={actionLoading} className="btn btn-primary" style={{ background: '#3b82f6', borderColor: '#3b82f6', color: '#fff', fontWeight: 700 }}>
                  {actionLoading ? 'Sealing...' : 'Complete Packaging'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: PREPARE SHIPMENT
      ========================================================================= */}
      {selectedAllocForShip && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#111827', border: '1px solid #334155', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={20} color="#8b5cf6" /> Courier Manifest & Label
            </h3>

            <form onSubmit={handleShipSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '4px' }}>Logistics Carrier</label>
                <select
                  value={shipForm.carrier}
                  onChange={(e) => setShipForm({ ...shipForm, carrier: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                >
                  <option value="BlueDart Express">BlueDart Express (Air Priority)</option>
                  <option value="Delhivery Logistics">Delhivery Logistics (Surface Fast)</option>
                  <option value="DTDC Air Cargo">DTDC Air Cargo</option>
                  <option value="FedEx SupplyChain">FedEx SupplyChain Express</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '4px' }}>Tracking / AWB Number</label>
                <input
                  type="text"
                  required
                  value={shipForm.trackingNumber}
                  onChange={(e) => setShipForm({ ...shipForm, trackingNumber: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontWeight: 700 }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setSelectedAllocForShip(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={actionLoading} className="btn btn-primary" style={{ background: '#8b5cf6', borderColor: '#8b5cf6', color: '#fff', fontWeight: 700 }}>
                  {actionLoading ? 'Generating...' : 'Generate Shipping Label'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: QC INSPECTION ON RETURN
      ========================================================================= */}
      {selectedReturnForQc && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#111827', border: '1px solid #ec4899', borderRadius: '16px', maxWidth: '520px', width: '100%', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckSquare size={22} color="#ec4899" /> Quality Control (QC) Inspection
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Return #{selectedReturnForQc.id} • Order: <strong>{selectedReturnForQc.orderNumber}</strong>
            </p>

            <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 700, color: '#f8fafc' }}>{selectedReturnForQc.productTitle}</div>
              <div style={{ fontSize: '0.82rem', color: '#fca5a5', marginTop: '4px' }}>Customer Stated Issue: "{selectedReturnForQc.reason}"</div>
              {selectedReturnForQc.customerComments && (
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>Comments: {selectedReturnForQc.customerComments}</div>
              )}
            </div>

            <form onSubmit={handleQcSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#f8fafc', fontWeight: 700, marginBottom: '0.5rem' }}>QC Decision</label>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <label style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '0.85rem',
                    background: qcForm.qcDecision === 'PASS' ? '#065f46' : '#1e293b',
                    border: qcForm.qcDecision === 'PASS' ? '2px solid #10b981' : '1px solid #334155',
                    borderRadius: '10px',
                    cursor: 'pointer'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: '#86efac', fontSize: '0.9rem' }}>
                      <input
                        type="radio"
                        name="qcDecision"
                        value="PASS"
                        checked={qcForm.qcDecision === 'PASS'}
                        onChange={(e) => setQcForm({ ...qcForm, qcDecision: e.target.value, qcNotes: 'Item verified intact, hardware tested ok, restocked.' })}
                      />
                      🟢 PASS (Restock)
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '4px' }}>
                      Item intact ➔ Adds back to available inventory & refunds customer.
                    </span>
                  </label>

                  <label style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '0.85rem',
                    background: qcForm.qcDecision === 'FAIL' ? '#7f1d1d' : '#1e293b',
                    border: qcForm.qcDecision === 'FAIL' ? '2px solid #ef4444' : '1px solid #334155',
                    borderRadius: '10px',
                    cursor: 'pointer'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: '#fca5a5', fontSize: '0.9rem' }}>
                      <input
                        type="radio"
                        name="qcDecision"
                        value="FAIL"
                        checked={qcForm.qcDecision === 'FAIL'}
                        onChange={(e) => setQcForm({ ...qcForm, qcDecision: e.target.value, qcNotes: 'Physical damage confirmed. Moved to Quarantine Damaged Stock.' })}
                      />
                      🔴 FAIL (Quarantine)
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '4px' }}>
                      Item damaged ➔ Moves to Quarantine Damaged stock & refunds customer.
                    </span>
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '4px' }}>QC Inspection Notes</label>
                <textarea
                  rows="3"
                  required
                  value={qcForm.qcNotes}
                  onChange={(e) => setQcForm({ ...qcForm, qcNotes: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '4px' }}>Inspector Name</label>
                <input
                  type="text"
                  required
                  value={qcForm.inspectedBy}
                  onChange={(e) => setQcForm({ ...qcForm, inspectedBy: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setSelectedReturnForQc(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={actionLoading} className="btn btn-primary" style={{ background: '#ec4899', borderColor: '#ec4899', color: '#fff', fontWeight: 800 }}>
                  {actionLoading ? 'Recording QC...' : 'Submit QC Result & Process Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: INBOUND RESTOCK
      ========================================================================= */}
      {showRestockModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#111827', border: '1px solid #334155', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package size={20} color="#38bdf8" /> Inbound Product Restock
            </h3>

            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!restockForm.productId) {
                showToast('Please select a product to restock.', 'warning');
                return;
              }
              setActionLoading(true);
              try {
                await warehouseApi.restock(selectedWarehouseId, {
                  productId: Number(restockForm.productId),
                  quantity: Number(restockForm.quantity),
                  aisleLocation: restockForm.aisleLocation,
                  notes: restockForm.notes,
                  performedBy: user?.fullName || 'Warehouse Staff'
                });
                showToast('Inbound stock received and added to inventory!', 'success');
                setShowRestockModal(false);
                setRefreshKey(k => k + 1);
              } catch (err) {
                showToast(getErrorMessage(err, 'Failed to restock'), 'error');
              } finally {
                setActionLoading(false);
              }
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '4px' }}>Product</label>
                <select
                  required
                  value={restockForm.productId}
                  onChange={(e) => setRestockForm({ ...restockForm, productId: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                >
                  <option value="">-- Select Product --</option>
                  {inventoryList.map(inv => (
                    <option key={inv.productId} value={inv.productId}>
                      {inv.productTitle} (Current: {inv.availableStock} avail)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '4px' }}>Restock Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={restockForm.quantity}
                    onChange={(e) => setRestockForm({ ...restockForm, quantity: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '4px' }}>Aisle Shelf Location</label>
                  <input
                    type="text"
                    value={restockForm.aisleLocation}
                    onChange={(e) => setRestockForm({ ...restockForm, aisleLocation: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowRestockModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={actionLoading} className="btn btn-primary">
                  {actionLoading ? 'Updating...' : 'Confirm Inbound Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default WarehouseStaffPortal;
