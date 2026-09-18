import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { warehouseApi, productApi, orderApi, adminApi } from '../../api';
import { getErrorMessage } from '../../api/axios';
import {
  Layers, Package, Truck, CheckCircle2, Clock, AlertTriangle, ArrowRight,
  RefreshCw, Plus, Search, Filter, MapPin, Box, ShieldCheck, FileText,
  Sliders, ArrowUpRight, BarChart3, Database, Send, PlayCircle, Check,
  X, Sparkles, Navigation, Phone, Mail, Edit2, ChevronRight, Archive,
  Info, QrCode, Tag, RotateCcw
} from 'lucide-react';

const WarehouseManagementTab = () => {
  const { showToast } = useCart();
  // Sub-tabs: 'PIPELINE' | 'RETURNS_APPROVAL' | 'VENDOR_TRANSFER' | 'INVENTORY' | 'WAREHOUSES' | 'MOVEMENTS' | 'SIMULATOR'
  const [subTab, setSubTab] = useState('PIPELINE');

  // Loading states
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Data states
  const [analytics, setAnalytics] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [returnsList, setReturnsList] = useState([]);
  const [orders, setOrders] = useState([]);

  // Filter states
  const [pipelineWarehouseFilter, setPipelineWarehouseFilter] = useState('ALL');
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryWarehouseFilter, setInventoryWarehouseFilter] = useState('ALL');
  const [movementStageFilter, setMovementStageFilter] = useState('ALL');
  const [movementSearch, setMovementSearch] = useState('');

  // Manual Allocation Modal State
  const [showManualAllocateModal, setShowManualAllocateModal] = useState(false);
  const [manualAllocateForm, setManualAllocateForm] = useState({
    orderItemId: '',
    warehouseId: '',
    notes: 'Manual warehouse allocation assigned by Administrator'
  });
  const [allocateLoading, setAllocateLoading] = useState(false);

  // Return Review Modal State
  const [selectedReturnForReview, setSelectedReturnForReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    approved: true,
    adminNotes: 'Return request approved. Item routed to regional hub for physical QC.',
    targetWarehouseId: ''
  });

  // Vendor Stock Transfer State
  const [showVendorTransferModal, setShowVendorTransferModal] = useState(false);
  const [vendorTransferForm, setVendorTransferForm] = useState({
    productId: '',
    warehouseId: '',
    quantity: 20,
    aisleLocation: 'Aisle 01, Inbound Bay 1',
    notes: 'Vendor bulk batch replenishment',
    transferredBy: 'Vendor Operations'
  });

  // Modal states
  const [selectedAllocationForPick, setSelectedAllocationForPick] = useState(null);
  const [pickForm, setPickForm] = useState({ pickerName: 'Vikram Rao (Staff #402)', notes: 'Picked verified items from warehouse shelf' });

  const [selectedAllocationForPack, setSelectedAllocationForPack] = useState(null);
  const [packForm, setPackForm] = useState({
    packerName: 'Anita Sharma (Staff #118)',
    boxType: 'Standard Corrugated Box B2',
    boxDimension: '25x20x15 cm',
    packageWeightKg: 0.85,
    notes: 'Item checked, cushioned with bubble wrap, and sealed with tamper-evident tape.'
  });

  const [selectedAllocationForShip, setSelectedAllocationForShip] = useState(null);
  const [shipForm, setShipForm] = useState({
    carrier: 'BlueDart Express',
    trackingNumber: '',
    notes: 'Priority air express manifest generated'
  });

  const [showRestockModal, setShowRestockModal] = useState(false);
  const [restockForm, setRestockForm] = useState({
    warehouseId: '',
    productId: '',
    quantity: 20,
    aisleLocation: 'Aisle 03, Bay B-08',
    notes: 'Inbound supplier replenishment',
    performedBy: 'Warehouse Manager'
  });

  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [warehouseForm, setWarehouseForm] = useState({
    code: '',
    name: '',
    city: '',
    state: '',
    address: '',
    pincode: '',
    contactPhone: '',
    contactEmail: '',
    capacity: 50000,
    active: true
  });

  const [simulationLog, setSimulationLog] = useState([]);
  const [simRunning, setSimRunning] = useState(false);

  // Fetch all initial warehouse data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, warehousesRes, inventoryRes, allocationsRes, movementsRes, productsRes, returnsRes, ordersRes] = await Promise.all([
        warehouseApi.getAnalyticsSummary().catch(() => ({ data: null })),
        warehouseApi.getAll().catch(() => ({ data: [] })),
        warehouseApi.getAllInventory().catch(() => ({ data: [] })),
        warehouseApi.getAllocations().catch(() => ({ data: [] })),
        warehouseApi.getStockMovements().catch(() => ({ data: [] })),
        productApi.getAll({ size: 50 }).catch(() => ({ data: { content: [] } })),
        warehouseApi.getAllReturns().catch(() => ({ data: [] })),
        adminApi.getAllOrders().catch(() => ({ data: { content: [] } }))
      ]);

      setAnalytics(analyticsRes.data);
      setWarehouses(warehousesRes.data || []);
      setInventoryList(inventoryRes.data || []);
      setAllocations(allocationsRes.data || []);
      setMovements(movementsRes.data || []);
      setProducts(productsRes.data?.content || productsRes.data || []);
      setReturnsList(returnsRes.data || []);
      setOrders(ordersRes.data?.content || ordersRes.data || []);
    } catch (err) {
      console.error('Failed to load warehouse data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  // Refresh handler
  const handleRefresh = () => setRefreshKey(prev => prev + 1);

  // Manual Allocation Operation
  const handleManualAllocateSubmit = async (e) => {
    e.preventDefault();
    if (!manualAllocateForm.orderItemId || !manualAllocateForm.warehouseId) {
      showToast('Please select both an Order Item and a Target Warehouse.', 'warning');
      return;
    }
    setAllocateLoading(true);
    try {
      await warehouseApi.manualAllocate({
        orderItemId: Number(manualAllocateForm.orderItemId),
        warehouseId: Number(manualAllocateForm.warehouseId),
        notes: manualAllocateForm.notes
      });
      showToast('Order item successfully allocated to regional warehouse hub!', 'success');
      setShowManualAllocateModal(false);
      handleRefresh();
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to allocate order to warehouse.'), 'error');
    } finally {
      setAllocateLoading(false);
    }
  };

  // Pick Operation
  const handleConfirmPick = async () => {
    if (!selectedAllocationForPick) return;
    setActionLoading(true);
    try {
      await warehouseApi.pickItem(selectedAllocationForPick.id, pickForm);
      showToast('Pick operation completed successfully!', 'success');
      setSelectedAllocationForPick(null);
      handleRefresh();
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to complete pick operation.'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Pack Operation
  const handleConfirmPack = async () => {
    if (!selectedAllocationForPack) return;
    setActionLoading(true);
    try {
      await warehouseApi.packItem(selectedAllocationForPack.id, packForm);
      showToast('Pack operation completed and parcel sealed!', 'success');
      setSelectedAllocationForPack(null);
      handleRefresh();
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to complete pack operation.'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Shipment Preparation (Ready for Shipment)
  const handleConfirmShipmentPrep = async () => {
    if (!selectedAllocationForShip) return;
    setActionLoading(true);
    try {
      await warehouseApi.prepareShipment(selectedAllocationForShip.id, shipForm);
      showToast('Shipment prepared and tracking assigned!', 'success');
      setSelectedAllocationForShip(null);
      handleRefresh();
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to prepare shipment.'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Dispatch Operation
  const handleDispatch = async (allocationId) => {
    setActionLoading(true);
    try {
      await warehouseApi.dispatchItem(allocationId);
      showToast('Package handed over to carrier dispatch truck!', 'success');
      handleRefresh();
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to dispatch shipment.'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Deliver Operation
  const handleDeliver = async (allocationId) => {
    setActionLoading(true);
    try {
      await warehouseApi.deliverItem(allocationId);
      showToast('Package delivery confirmed!', 'success');
      handleRefresh();
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to confirm delivery.'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Restock Submit
  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    if (!restockForm.warehouseId || !restockForm.productId) {
      showToast('Please select both a warehouse and a product to restock.', 'warning');
      return;
    }
    setActionLoading(true);
    try {
      await warehouseApi.restock(restockForm.warehouseId, {
        productId: Number(restockForm.productId),
        quantity: Number(restockForm.quantity),
        aisleLocation: restockForm.aisleLocation,
        notes: restockForm.notes,
        performedBy: restockForm.performedBy
      });
      showToast('Inventory restocked successfully!', 'success');
      setShowRestockModal(false);
      handleRefresh();
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to restock inventory.'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Save / Update Warehouse
  const handleSaveWarehouse = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingWarehouse) {
        await warehouseApi.update(editingWarehouse.id, warehouseForm);
        showToast('Warehouse details updated!', 'success');
      } else {
        await warehouseApi.create(warehouseForm);
        showToast('New regional warehouse facility created!', 'success');
      }
      setShowWarehouseModal(false);
      setEditingWarehouse(null);
      handleRefresh();
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to save warehouse.'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Review Customer Return (Admin Approve / Reject)
  const handleReviewReturn = async (returnId, approved, notes, warehouseId) => {
    setActionLoading(true);
    try {
      await warehouseApi.reviewReturn(returnId, {
        approved,
        adminNotes: notes,
        targetWarehouseId: warehouseId ? Number(warehouseId) : (warehouses[0]?.id || 1)
      });
      setSelectedReturnForReview(null);
      handleRefresh();
      showToast(approved ? 'Return approved! Product routed to regional warehouse for QC inspection.' : 'Return request rejected.', approved ? 'success' : 'info');
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to review return request.'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Vendor Stock Transfer Submission
  const handleVendorTransferSubmit = async (e) => {
    e.preventDefault();
    if (!vendorTransferForm.productId || !vendorTransferForm.warehouseId) {
      showToast('Please select both a product and destination warehouse.', 'warning');
      return;
    }
    setActionLoading(true);
    try {
      await warehouseApi.transferVendorStock({
        productId: Number(vendorTransferForm.productId),
        warehouseId: Number(vendorTransferForm.warehouseId),
        quantity: Number(vendorTransferForm.quantity),
        aisleLocation: vendorTransferForm.aisleLocation,
        notes: vendorTransferForm.notes,
        transferredBy: vendorTransferForm.transferredBy
      });
      setShowVendorTransferModal(false);
      handleRefresh();
      showToast('Vendor stock successfully distributed to target warehouse hub!', 'success');
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to transfer vendor stock.'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Warehouse Active Status
  const handleToggleWarehouseStatus = async (id) => {
    try {
      await warehouseApi.toggleStatus(id);
      showToast('Warehouse active status toggled.', 'info');
      handleRefresh();
    } catch (err) {
      showToast('Failed to toggle warehouse status.', 'error');
    }
  };

  // Open Edit Warehouse Modal
  const openEditWarehouse = (wh) => {
    setEditingWarehouse(wh);
    setWarehouseForm({
      code: wh.code,
      name: wh.name,
      city: wh.city,
      state: wh.state || '',
      address: wh.address || '',
      pincode: wh.pincode || '',
      contactPhone: wh.contactPhone || '',
      contactEmail: wh.contactEmail || '',
      capacity: wh.capacity || 50000,
      active: wh.active ?? true
    });
    setShowWarehouseModal(true);
  };

  // Open Create Warehouse Modal
  const openCreateWarehouse = () => {
    setEditingWarehouse(null);
    setWarehouseForm({
      code: 'WH-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-01',
      name: '',
      city: '',
      state: '',
      address: '',
      pincode: '',
      contactPhone: '+91 ',
      contactEmail: '',
      capacity: 50000,
      active: true
    });
    setShowWarehouseModal(true);
  };

  // Open Quick Restock Modal for specific inventory row
  const openQuickRestock = (inv) => {
    setRestockForm({
      warehouseId: inv.warehouseId,
      productId: inv.productId,
      quantity: 25,
      aisleLocation: inv.aisleLocation || 'Aisle 01, Rack A',
      notes: 'Quick replenishment for ' + inv.productTitle,
      performedBy: 'Warehouse Operations'
    });
    setShowRestockModal(true);
  };

  // Run Step-by-Step Simulator for reviewers
  const runEndToEndSimulation = async () => {
    setSimRunning(true);
    setSimulationLog([]);
    const addLog = (msg, stage = 'INFO') => {
      setSimulationLog(prev => [...prev, { time: new Date().toLocaleTimeString(), msg, stage }]);
    };

    try {
      addLog('🚀 Starting End-to-End Warehouse Allocation & Fulfillment Simulation...', 'START');
      await new Promise(r => setTimeout(r, 600));

      // 1. Pick an unpicked allocation or existing ALLOCATED item
      const allocatedItem = allocations.find(a => a.stage === 'ALLOCATED') || allocations[0];
      if (!allocatedItem) {
        addLog('⚠️ No allocated order item found to simulate. Refreshing data...', 'WARN');
        setSimRunning(false);
        return;
      }

      addLog(`📦 Step 1: Selected Order #${allocatedItem.orderNumber} (Item: ${allocatedItem.productTitle}, Qty: ${allocatedItem.allocatedQuantity})`, 'STEP');
      addLog(`🏢 Assigned Warehouse: ${allocatedItem.warehouseName} (${allocatedItem.warehouseCode}) | Storage Location: ${allocatedItem.aisleLocation}`, 'DETAIL');
      await new Promise(r => setTimeout(r, 800));

      // 2. Pick Operation
      addLog(`🧑‍🔧 Step 2: Warehouse picker retrieving product from ${allocatedItem.aisleLocation}...`, 'STEP');
      const pickRes = await warehouseApi.pickItem(allocatedItem.id, {
        pickerName: 'Simulated Picker (Robo-Wave 1)',
        notes: 'Autonomous picker confirmed item barcode match'
      });
      addLog(`✅ Pick Complete! Stage -> PICKED. Verified by ${pickRes.data.pickerName}`, 'SUCCESS');
      await new Promise(r => setTimeout(r, 800));

      // 3. Pack Operation
      addLog(`📦 Step 3: Moving to packing station. Verifying SKU, weighing, and carton selection...`, 'STEP');
      const packRes = await warehouseApi.packItem(allocatedItem.id, {
        packerName: 'Simulated Packaging Lead',
        boxType: 'Eco Heavy Carton #3',
        boxDimension: '30x20x15 cm',
        packageWeightKg: 1.2,
        notes: 'Bubble wrapped and sealed with security label'
      });
      addLog(`✅ Pack Complete! Stage -> PACKED. Slip #${packRes.data.packingSlipNumber} generated.`, 'SUCCESS');
      await new Promise(r => setTimeout(r, 800));

      // 4. Prepare Shipment (Ready for Shipment)
      addLog(`🚚 Step 4: Dispatch station assigning courier partner and generating tracking manifest...`, 'STEP');
      const shipRes = await warehouseApi.prepareShipment(allocatedItem.id, {
        carrier: 'BlueDart Express Air Cargo',
        trackingNumber: 'TRK-SIM-' + Math.floor(100000 + Math.random() * 900000),
        notes: 'Air Cargo Manifest Printed & Inventory Deducted from Warehouse'
      });
      addLog(`✅ Ready for Shipment! Tracking #${shipRes.data.trackingNumber} via ${shipRes.data.carrier}`, 'SUCCESS');
      addLog(`📉 Physical warehouse inventory successfully deducted from total stock.`, 'DETAIL');
      await new Promise(r => setTimeout(r, 800));

      // 5. Dispatch
      addLog(`🚛 Step 5: Package handed over to courier vehicle...`, 'STEP');
      await warehouseApi.dispatchItem(allocatedItem.id);
      addLog(`🎉 Fulfilled & Dispatched! Order is now in-transit to customer.`, 'FINISH');

      handleRefresh();
    } catch (err) {
      addLog(`❌ Simulation Error: ${err.message}`, 'ERROR');
    } finally {
      setSimRunning(false);
    }
  };

  // Pipeline filter
  const filteredAllocations = allocations.filter(a => {
    if (pipelineWarehouseFilter !== 'ALL' && String(a.warehouseId) !== String(pipelineWarehouseFilter)) {
      return false;
    }
    return true;
  });

  const allocatedStageItems = filteredAllocations.filter(a => a.stage === 'ALLOCATED');
  const pickedStageItems = filteredAllocations.filter(a => a.stage === 'PICKED');
  const packedStageItems = filteredAllocations.filter(a => a.stage === 'PACKED');
  const readyShipStageItems = filteredAllocations.filter(a => a.stage === 'READY_FOR_SHIPMENT');
  const shippedStageItems = filteredAllocations.filter(a => a.stage === 'SHIPPED');

  // Inventory matrix filter
  const filteredInventory = inventoryList.filter(inv => {
    if (inventoryWarehouseFilter !== 'ALL' && String(inv.warehouseId) !== String(inventoryWarehouseFilter)) {
      return false;
    }
    if (inventorySearch.trim()) {
      const q = inventorySearch.toLowerCase();
      return (
        inv.productTitle?.toLowerCase().includes(q) ||
        inv.productSku?.toLowerCase().includes(q) ||
        inv.warehouseName?.toLowerCase().includes(q) ||
        inv.aisleLocation?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Movement logs filter
  const filteredMovements = movements.filter(m => {
    if (movementStageFilter !== 'ALL' && m.stage !== movementStageFilter) {
      return false;
    }
    if (movementSearch.trim()) {
      const q = movementSearch.toLowerCase();
      return (
        m.productTitle?.toLowerCase().includes(q) ||
        m.warehouseName?.toLowerCase().includes(q) ||
        m.referenceNumber?.toLowerCase().includes(q) ||
        m.performedBy?.toLowerCase().includes(q) ||
        m.notes?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* 1. TOP HEADER & SUMMARY METRICS BANNER */}
      <div className="card" style={{
        padding: '1.75rem',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #311042 100%)',
        color: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 10px 30px -10px rgba(15, 23, 42, 0.4)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, rgba(139, 92, 246, 0) 70%)', pointerEvents: 'none' }}></div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(139, 92, 246, 0.25)', border: '1px solid rgba(139, 92, 246, 0.4)', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, color: '#c4b5fd', marginBottom: '0.75rem' }}>
              <Layers size={14} /> Enterprise Logistics & Warehouse Hub
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
              Warehouse Allocation & Fulfillment Engine
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.4rem', maxWidth: '680px' }}>
              Real-time multi-warehouse inventory management, intelligent single-hub order routing, barcode aisle picking, precision carton packing, and stock movement audit tracking.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleRefresh}
              className="btn btn-secondary"
              style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.2)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <RefreshCw size={14} className={loading ? 'spin-icon' : ''} /> Refresh Hub
            </button>

            <button
              onClick={() => {
                const firstOrderItem = orders.flatMap(o => o.items || [])[0];
                setManualAllocateForm({
                  orderItemId: firstOrderItem?.id || '',
                  warehouseId: warehouses[0]?.id || '',
                  notes: 'Manual warehouse allocation assigned by Administrator'
                });
                setShowManualAllocateModal(true);
              }}
              className="btn"
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Navigation size={14} /> Manually Allocate Order
            </button>

            <button
              onClick={() => {
                setRestockForm({
                  warehouseId: warehouses[0]?.id || '',
                  productId: products[0]?.id || '',
                  quantity: 20,
                  aisleLocation: 'Aisle 01, Rack A',
                  notes: 'Inbound stock replenishment',
                  performedBy: 'Warehouse Manager'
                });
                setShowRestockModal(true);
              }}
              className="btn btn-primary"
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Box size={14} /> Restock Inventory
            </button>

            <button
              onClick={openCreateWarehouse}
              className="btn"
              style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Plus size={14} /> Add Warehouse Hub
            </button>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '1.75rem', position: 'relative', zIndex: 1 }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.06)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Total Regional Hubs</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#60a5fa', marginTop: '0.25rem' }}>
              {analytics?.totalWarehouses ?? warehouses.length} <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>Active Nodes</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.25rem' }}>Nationwide Distribution</div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.06)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Physical Units Stored</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399', marginTop: '0.25rem' }}>
              {(analytics?.totalStoredStock ?? 0).toLocaleString()} <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>Units</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.25rem' }}>Cap: {(analytics?.totalStorageCapacity ?? 270000).toLocaleString()} max</div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.06)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Allocated / In-Fulfillment</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.25rem' }}>
              {(analytics?.totalAllocatedStock ?? 0)} <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>Reserved</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.25rem' }}>Across active orders</div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.06)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Available for Orders</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#a78bfa', marginTop: '0.25rem' }}>
              {(analytics?.totalAvailableStock ?? 0).toLocaleString()} <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>Sellable</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.25rem' }}>Stock Buffer Health: 100%</div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.06)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Movement Audit Events</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f43f5e', marginTop: '0.25rem' }}>
              {analytics?.totalStockMovements ?? movements.length} <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>Logged</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.25rem' }}>Immutable History Trail</div>
          </div>
        </div>
      </div>

      {/* 2. SUB-NAVIGATION BAR */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'PIPELINE', label: 'Fulfillment Pipeline', icon: Layers, badge: allocations.filter(a => a.stage !== 'SHIPPED').length },
            { id: 'RETURNS_APPROVAL', label: 'Returns Review & QC', icon: RotateCcw, badge: returnsList.filter(r => r.status === 'PENDING_REVIEW').length },
            { id: 'VENDOR_TRANSFER', label: 'Vendor Stock Assignment', icon: Box, badge: 'Transfer' },
            { id: 'INVENTORY', label: 'Inventory & Quarantine', icon: Database, badge: inventoryList.length },
            { id: 'WAREHOUSES', label: 'Warehouse Hubs', icon: MapPin, badge: warehouses.length },
            { id: 'MOVEMENTS', label: 'Stock Movement Audit Logs', icon: FileText, badge: movements.length },
            { id: 'SIMULATOR', label: '1-Click Review Simulator', icon: Sparkles, badge: 'Live Demo' }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = subTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.1rem',
                  borderRadius: '10px',
                  border: isActive ? '1px solid #2563eb' : '1px solid #e2e8f0',
                  background: isActive ? '#eff6ff' : '#ffffff',
                  color: isActive ? '#1d4ed8' : '#64748b',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={16} color={isActive ? '#2563eb' : '#64748b'} />
                {tab.label}
                {tab.badge !== undefined && (
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '10px',
                    background: isActive ? '#2563eb' : '#f1f5f9',
                    color: isActive ? '#ffffff' : '#64748b'
                  }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. TAB 1: FULFILLMENT PIPELINE (KANBAN STAGES) */}
      {subTab === 'PIPELINE' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Pipeline Controls */}
          <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>Filter by Warehouse:</span>
              <select
                value={pipelineWarehouseFilter}
                onChange={e => setPipelineWarehouseFilter(e.target.value)}
                style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', color: '#1e293b', background: '#fff' }}
              >
                <option value="ALL">All Warehouse Hubs ({warehouses.length})</option>
                {warehouses.map(wh => (
                  <option key={wh.id} value={wh.id}>{wh.name} ({wh.code}) - {wh.city}</option>
                ))}
              </select>
            </div>

            <div style={{ fontSize: '0.82rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Info size={14} color="#3b82f6" />
              Workflow order: <strong>Allocated → Picked → Packed → Ready for Shipment → Dispatched</strong>
            </div>
          </div>

          {/* Kanban Columns Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', alignItems: 'start' }}>
            
            {/* Column 1: ALLOCATED (Waiting to Pick) */}
            <div style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', minHeight: '400px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #3b82f6', paddingBottom: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#1e293b', fontSize: '0.92rem' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#3b82f6' }}></div>
                  1. Stock Allocated
                </div>
                <span className="badge badge-primary">{allocatedStageItems.length}</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Stock reserved in hub. Awaiting picker retrieval.</p>

              {allocatedStageItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94a3b8', fontSize: '0.82rem' }}>
                  <CheckCircle2 size={32} color="#cbd5e1" style={{ marginBottom: '0.5rem' }} />
                  <div>No items in allocation queue</div>
                </div>
              ) : (
                allocatedStageItems.map(item => (
                  <div key={item.id} className="card" style={{ padding: '1rem', border: '1px solid #bfdbfe', background: '#ffffff', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb' }}>Order #{item.orderNumber}</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>{item.productTitle}</div>
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                        Qty: {item.allocatedQuantity}
                      </span>
                    </div>

                    <div style={{ marginTop: '0.6rem', padding: '0.5rem', background: '#f8fafc', borderRadius: '6px', fontSize: '0.78rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div>🏢 <strong>{item.warehouseName}</strong> ({item.warehouseCode})</div>
                      <div>📍 Bin/Aisle: <strong style={{ color: '#2563eb' }}>{item.aisleLocation}</strong></div>
                      <div>👤 Customer: {item.customerName}</div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedAllocationForPick(item);
                        setPickForm({
                          pickerName: 'Vikram Rao (Staff #402)',
                          notes: `Picked ${item.allocatedQuantity} unit(s) from ${item.aisleLocation}`
                        });
                      }}
                      className="btn btn-primary btn-sm"
                      style={{ width: '100%', marginTop: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
                    >
                      <Navigation size={13} /> Start Pick Operation
                    </button>

                    <button
                      onClick={() => {
                        setManualAllocateForm({
                          orderItemId: item.orderItemId || item.orderItem?.id || item.id,
                          warehouseId: warehouses.find(w => w.id !== item.warehouseId)?.id || warehouses[0]?.id || '',
                          notes: `Admin re-allocated from ${item.warehouseName || 'previous hub'} to new hub`
                        });
                        setShowManualAllocateModal(true);
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%', marginTop: '0.4rem', fontSize: '0.74rem', padding: '0.25rem 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}
                      title="Re-allocate order to a different warehouse hub"
                    >
                      <Navigation size={11} /> Re-Route / Change Hub
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Column 2: PICKED (In Pick Bin) */}
            <div style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', minHeight: '400px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #8b5cf6', paddingBottom: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#1e293b', fontSize: '0.92rem' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#8b5cf6' }}></div>
                  2. Picked (In Bin)
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.55rem', borderRadius: '10px', background: '#ede9fe', color: '#6d28d9' }}>
                  {pickedStageItems.length}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Item in staging bin. Ready for box packing.</p>

              {pickedStageItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94a3b8', fontSize: '0.82rem' }}>
                  <Box size={32} color="#cbd5e1" style={{ marginBottom: '0.5rem' }} />
                  <div>No items in picking bin</div>
                </div>
              ) : (
                pickedStageItems.map(item => (
                  <div key={item.id} className="card" style={{ padding: '1rem', border: '1px solid #ddd6fe', background: '#ffffff', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#7c3aed' }}>Order #{item.orderNumber}</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>{item.productTitle}</div>
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                        Qty: {item.allocatedQuantity}
                      </span>
                    </div>

                    <div style={{ marginTop: '0.6rem', padding: '0.5rem', background: '#f8fafc', borderRadius: '6px', fontSize: '0.78rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div>🧑‍🔧 Picked By: <strong>{item.pickerName}</strong></div>
                      <div>🕒 Picked At: {item.pickedAt ? new Date(item.pickedAt).toLocaleTimeString() : 'Recent'}</div>
                      <div>🏢 Hub: {item.warehouseName}</div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedAllocationForPack(item);
                        setPackForm({
                          packerName: 'Anita Sharma (Staff #118)',
                          boxType: 'Standard Corrugated Box B2',
                          boxDimension: '25x20x15 cm',
                          packageWeightKg: 0.85,
                          notes: `Verified SKU ${item.productSku || ''} in excellent condition.`
                        });
                      }}
                      className="btn btn-sm"
                      style={{ width: '100%', marginTop: '0.8rem', background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
                    >
                      <Box size={13} /> Verify & Pack Item
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Column 3: PACKED (Carton Ready) */}
            <div style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', minHeight: '400px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #f59e0b', paddingBottom: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#1e293b', fontSize: '0.92rem' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }}></div>
                  3. Packed & Sealed
                </div>
                <span className="badge badge-warning">{packedStageItems.length}</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Packed in carton box. Awaiting carrier label.</p>

              {packedStageItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94a3b8', fontSize: '0.82rem' }}>
                  <Package size={32} color="#cbd5e1" style={{ marginBottom: '0.5rem' }} />
                  <div>No packed packages pending dispatch</div>
                </div>
              ) : (
                packedStageItems.map(item => (
                  <div key={item.id} className="card" style={{ padding: '1rem', border: '1px solid #fde68a', background: '#ffffff', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#d97706' }}>Order #{item.orderNumber}</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>{item.productTitle}</div>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400e', background: '#fef3c7', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                        Slip: {item.packingSlipNumber || 'PS-9901'}
                      </span>
                    </div>

                    <div style={{ marginTop: '0.6rem', padding: '0.5rem', background: '#f8fafc', borderRadius: '6px', fontSize: '0.78rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div>📦 Box: <strong>{item.boxType}</strong> ({item.boxDimension})</div>
                      <div>⚖️ Weight: <strong>{item.packageWeightKg} kg</strong></div>
                      <div>👩‍💼 Packed by: {item.packerName}</div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedAllocationForShip(item);
                        setShipForm({
                          carrier: 'BlueDart Express',
                          trackingNumber: 'TRK-BLD-' + Math.floor(100000 + Math.random() * 900000),
                          notes: `Air cargo manifest prepared for ${item.customerName || 'Customer'}`
                        });
                      }}
                      className="btn btn-sm"
                      style={{ width: '100%', marginTop: '0.8rem', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
                    >
                      <Truck size={13} /> Prepare Shipment & Label
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Column 4: READY FOR SHIPMENT (Awaiting Handover) */}
            <div style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', minHeight: '400px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #10b981', paddingBottom: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#1e293b', fontSize: '0.92rem' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }}></div>
                  4. Ready for Shipment
                </div>
                <span className="badge badge-customer">{readyShipStageItems.length}</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Labeled & manifested. Ready for courier pickup.</p>

              {readyShipStageItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94a3b8', fontSize: '0.82rem' }}>
                  <Truck size={32} color="#cbd5e1" style={{ marginBottom: '0.5rem' }} />
                  <div>No shipments staging at dock</div>
                </div>
              ) : (
                readyShipStageItems.map(item => (
                  <div key={item.id} className="card" style={{ padding: '1rem', border: '1px solid #a7f3d0', background: '#ffffff', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669' }}>Order #{item.orderNumber}</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>{item.productTitle}</div>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#065f46', background: '#d1fae5', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                        {item.carrier}
                      </span>
                    </div>

                    <div style={{ marginTop: '0.6rem', padding: '0.5rem', background: '#f8fafc', borderRadius: '6px', fontSize: '0.78rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div>🏷️ Tracking #: <strong style={{ color: '#059669' }}>{item.trackingNumber}</strong></div>
                      <div>📍 Destination: {item.shippingAddress ? item.shippingAddress.substring(0, 32) + '...' : 'Customer Address'}</div>
                    </div>

                    <button
                      onClick={() => handleDispatch(item.id)}
                      className="btn btn-sm"
                      style={{ width: '100%', marginTop: '0.8rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
                    >
                      <Send size={13} /> Dispatch to Carrier
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Column 5: SHIPPED (Handed Over / In-Transit) */}
            <div style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', minHeight: '400px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #64748b', paddingBottom: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#1e293b', fontSize: '0.92rem' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#64748b' }}></div>
                  5. Shipped / In-Transit
                </div>
                <span className="badge badge-secondary">{shippedStageItems.length}</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Handed over to logistics carrier for delivery.</p>

              {shippedStageItems.slice(0, 5).map(item => (
                <div key={item.id} className="card" style={{ padding: '0.85rem 1rem', border: '1px solid #e2e8f0', background: '#ffffff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>{item.productTitle}</div>
                    <span className="badge badge-customer" style={{ fontSize: '0.72rem' }}>Dispatched</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.3rem' }}>
                    Tracking: <strong>{item.trackingNumber}</strong> • {item.carrier}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.2rem' }}>
                    Customer: <strong>{item.customerName || 'Customer'}</strong>
                  </div>
                  <button
                    onClick={() => handleDeliver(item.id)}
                    className="btn btn-sm"
                    style={{ width: '100%', marginTop: '0.6rem', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.78rem' }}
                  >
                    <CheckCircle2 size={13} /> Confirm Delivery
                  </button>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* 3b. TAB: RETURNS REVIEW & QC PIPELINE */}
      {subTab === 'RETURNS_APPROVAL' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RotateCcw size={20} color="#be185d" /> Customer Return Requests & Warehouse Routing
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                Review return cases submitted by customers. Approve and designate the destination regional warehouse for Staff QC inspection.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <span className="badge badge-warning" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                Pending Review: {returnsList.filter(r => r.status === 'PENDING_REVIEW').length}
              </span>
            </div>
          </div>

          <div className="card table-responsive-wrapper" style={{ overflowX: 'auto', padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Return ID & Order</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Customer</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Product Item</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Return Category & Reason</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Assigned QC Hub</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Current Status</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Admin Decision</th>
                </tr>
              </thead>
              <tbody>
                {returnsList.map(ret => (
                  <tr key={ret.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ fontWeight: 800, color: '#be185d' }}>RET-#{ret.id}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Order: <strong>{ret.orderNumber}</strong></div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{ret.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{ret.customerEmail}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img src={ret.productImageUrl} alt="" style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{ret.productTitle}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Qty: {ret.quantity || 1} • Refund: <strong>₹{ret.refundAmount?.toFixed(2)}</strong></div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ background: '#f1f5f9', color: '#334155', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                        {ret.returnReasonType || 'DEFECTIVE'}
                      </span>
                      <div style={{ fontSize: '0.8rem', color: '#1e293b', marginTop: '4px', maxWidth: '240px' }}>{ret.reason}</div>
                      {ret.customerComments && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic', marginTop: '2px' }}>"{ret.customerComments}"</div>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{ret.warehouseName || 'Pending Hub Assignment'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#2563eb' }}>{ret.warehouseCode}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${
                        ret.status === 'PENDING_REVIEW' ? 'badge-warning' :
                        ret.status === 'APPROVED' ? 'badge-primary' :
                        ret.status === 'RECEIVED_AT_WAREHOUSE' ? 'badge-primary' :
                        ret.status === 'QC_PASSED_RESTOCKED' ? 'badge-customer' :
                        ret.status === 'QC_FAILED_DAMAGED' ? 'badge-danger' : 'badge-secondary'
                      }`}>
                        {ret.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      {ret.status === 'PENDING_REVIEW' ? (
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => {
                              setSelectedReturnForReview(ret);
                              setReviewForm({
                                approved: true,
                                adminNotes: 'Return verified and approved. Send to assigned warehouse for inspection.',
                                targetWarehouseId: warehouses[0]?.id || ''
                              });
                            }}
                            className="btn btn-primary btn-sm"
                            style={{ background: '#10b981', borderColor: '#10b981', fontSize: '0.78rem' }}
                          >
                            <Check size={12} /> Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedReturnForReview(ret);
                              setReviewForm({
                                approved: false,
                                adminNotes: 'Return rejected: Issue outside 7-day policy window.',
                                targetWarehouseId: warehouses[0]?.id || ''
                              });
                            }}
                            className="btn btn-danger btn-sm"
                            style={{ fontSize: '0.78rem' }}
                          >
                            <X size={12} /> Reject
                          </button>
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          Reviewed: <strong style={{ color: '#0f172a' }}>{ret.adminNotes ? 'Yes' : 'Auto'}</strong>
                          {ret.qcDecision && (
                            <div style={{ color: ret.qcDecision === 'PASS' ? '#16a34a' : '#dc2626', fontWeight: 700 }}>
                              QC: {ret.qcDecision}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {returnsList.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748b' }}>
                      No customer return requests submitted.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3c. TAB: VENDOR STOCK ASSIGNMENT */}
      {subTab === 'VENDOR_TRANSFER' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ padding: '1.5rem', background: '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Box size={22} color="#2563eb" /> Vendor Inbound Stock Distribution
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
                  Distribute merchant inventory to regional warehouse fulfillment centers across India.
                </p>
              </div>

              <button
                onClick={() => {
                  setVendorTransferForm({
                    productId: products[0]?.id || '',
                    warehouseId: warehouses[0]?.id || '',
                    quantity: 25,
                    aisleLocation: 'Aisle 02, Inbound Bay 3',
                    notes: 'Merchant bulk catalog replenishment',
                    transferredBy: 'Merchant Logistics Rep'
                  });
                  setShowVendorTransferModal(true);
                }}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Plus size={16} /> New Stock Distribution Batch
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {warehouses.map(wh => {
                const whInventory = inventoryList.filter(i => i.warehouseId === wh.id);
                const totalStockInWh = whInventory.reduce((acc, curr) => acc + curr.totalStock, 0);

                return (
                  <div key={wh.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>{wh.name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 600 }}>{wh.code} • {wh.city}</div>
                      </div>
                      <span className="badge badge-customer" style={{ fontSize: '0.72rem' }}>Active Node</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Catalog SKUs Stored:</span>
                      <strong style={{ color: '#0f172a' }}>{whInventory.length} products</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Physical Units:</span>
                      <strong style={{ color: '#16a34a' }}>{totalStockInWh.toLocaleString()} units</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 2: INVENTORY MATRIX & QUICK RESTOCK */}
      {subTab === 'INVENTORY' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Inventory Filters */}
          <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '280px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 12 }} />
                <input
                  type="text"
                  placeholder="Search product title, SKU, aisle location..."
                  value={inventorySearch}
                  onChange={e => setInventorySearch(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <select
                value={inventoryWarehouseFilter}
                onChange={e => setInventoryWarehouseFilter(e.target.value)}
                style={{ padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#fff' }}
              >
                <option value="ALL">All Warehouses</option>
                {warehouses.map(wh => (
                  <option key={wh.id} value={wh.id}>{wh.name} ({wh.city})</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setRestockForm({
                  warehouseId: warehouses[0]?.id || '',
                  productId: products[0]?.id || '',
                  quantity: 20,
                  aisleLocation: 'Aisle 01, Rack A',
                  notes: 'Restock inventory',
                  performedBy: 'Warehouse Staff'
                });
                setShowRestockModal(true);
              }}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Plus size={15} /> Inbound Restock Shipment
            </button>
          </div>

          {/* Inventory Table */}
          <div className="card table-responsive-wrapper" style={{ overflowX: 'auto', padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Product & SKU</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Warehouse Hub</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Physical Total</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Allocated</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Available Stock</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Aisle / Bin</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ padding: '3rem 1.25rem', textAlign: 'center', color: '#94a3b8' }}>
                      No inventory records matching filters.
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map(inv => (
                    <tr key={inv.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.1s ease' }}>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img
                            src={inv.productImageUrl}
                            alt=""
                            style={{ width: 38, height: 38, borderRadius: '6px', objectFit: 'cover', background: '#f1f5f9' }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{inv.productTitle}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>SKU: <strong style={{ color: '#2563eb' }}>{inv.productSku}</strong> • {inv.productCategory}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{inv.warehouseName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{inv.warehouseCode} • {inv.warehouseCity}</div>
                      </td>

                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#0f172a' }}>
                        {inv.totalStock} units
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{ fontWeight: 700, color: inv.allocatedStock > 0 ? '#d97706' : '#64748b' }}>
                          {inv.allocatedStock} reserved
                        </span>
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{
                          fontWeight: 800,
                          fontSize: '0.95rem',
                          color: inv.availableStock <= inv.minThreshold ? '#dc2626' : '#16a34a'
                        }}>
                          {inv.availableStock}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '0.25rem' }}>avail</span>
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{ background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.78rem', color: '#334155', fontWeight: 600 }}>
                          {inv.aisleLocation || 'Aisle 01'}
                        </span>
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        {inv.isLowStock ? (
                          <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem' }}>
                            <AlertTriangle size={11} /> Low Stock (≤{inv.minThreshold})
                          </span>
                        ) : (
                          <span className="badge badge-customer" style={{ fontSize: '0.72rem' }}>Healthy</span>
                        )}
                      </td>

                      <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                        <button
                          onClick={() => openQuickRestock(inv)}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <Plus size={12} /> Restock
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. TAB 3: WAREHOUSE HUBS & CAPACITY */}
      {subTab === 'WAREHOUSES' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Regional Fulfillment Network Hubs
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.2rem 0 0' }}>
                Configured physical distribution centers across Indian metro clusters for optimized single-day deliveries.
              </p>
            </div>

            <button
              onClick={openCreateWarehouse}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Plus size={15} /> Add New Warehouse Hub
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {warehouses.map(wh => {
              const utilPercent = wh.utilizationPercentage || 0;
              return (
                <div key={wh.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid #e2e8f0' }}>
                  
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                        {wh.code}
                      </span>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginTop: '0.4rem', margin: 0 }}>
                        {wh.name}
                      </h4>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                        <MapPin size={13} color="#2563eb" /> {wh.city}, {wh.state} ({wh.country})
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleWarehouseStatus(wh.id)}
                      className={`badge ${wh.active ? 'badge-customer' : 'badge-danger'}`}
                      style={{ cursor: 'pointer', border: 'none', fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                      title="Click to toggle active status"
                    >
                      {wh.active ? '● Active' : '○ Inactive'}
                    </button>
                  </div>

                  {/* Address & Contact */}
                  <div style={{ fontSize: '0.8rem', color: '#475569', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div>🏢 Address: {wh.address || 'Logistics Park, Phase 1'} (PIN: {wh.pincode || '500001'})</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <span><Phone size={12} style={{ verticalAlign: 'middle' }} /> {wh.contactPhone || 'N/A'}</span>
                      <span><Mail size={12} style={{ verticalAlign: 'middle' }} /> {wh.contactEmail || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Storage Capacity & Utilization Progress */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      <span>Storage Utilization</span>
                      <span>{utilPercent}% ({wh.totalStoredUnits ?? 0} / {wh.capacity?.toLocaleString()} units)</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${Math.min(100, Math.max(5, utilPercent))}%`,
                          height: '100%',
                          background: utilPercent > 85 ? '#ef4444' : utilPercent > 50 ? '#3b82f6' : '#10b981',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                  </div>

                  {/* Metric Sub-Counters */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', textAlign: 'center' }}>
                    <div style={{ background: '#f1f5f9', padding: '0.5rem', borderRadius: '6px' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>AVAILABLE</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#16a34a' }}>{wh.totalAvailableUnits ?? 0}</div>
                    </div>
                    <div style={{ background: '#f1f5f9', padding: '0.5rem', borderRadius: '6px' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>RESERVED</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#d97706' }}>{wh.totalAllocatedUnits ?? 0}</div>
                    </div>
                    <div style={{ background: '#f1f5f9', padding: '0.5rem', borderRadius: '6px' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>SKU COUNT</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#2563eb' }}>{wh.distinctProductCount ?? 0}</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                    <button
                      onClick={() => openEditWarehouse(wh)}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontSize: '0.8rem' }}
                    >
                      <Edit2 size={13} /> Edit Hub
                    </button>
                    <button
                      onClick={() => {
                        setInventoryWarehouseFilter(wh.id);
                        setSubTab('INVENTORY');
                      }}
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontSize: '0.8rem' }}
                    >
                      <Database size={13} /> View Stock Matrix
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. TAB 4: STOCK MOVEMENT AUDIT TRAIL LOGS */}
      {subTab === 'MOVEMENTS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Movement Filters */}
          <div className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '280px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 12 }} />
                <input
                  type="text"
                  placeholder="Search reference #, product, performer, notes..."
                  value={movementSearch}
                  onChange={e => setMovementSearch(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <select
                value={movementStageFilter}
                onChange={e => setMovementStageFilter(e.target.value)}
                style={{ padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#fff' }}
              >
                <option value="ALL">All Stages ({movements.length})</option>
                <option value="ALLOCATED">ALLOCATED (Stock Reserved)</option>
                <option value="PICKED">PICKED (Item in Bin)</option>
                <option value="PACKED">PACKED (Carton Box)</option>
                <option value="READY_FOR_SHIPMENT">READY FOR SHIPMENT</option>
                <option value="SHIPPED">SHIPPED (In-Transit)</option>
                <option value="RESTOCKED">RESTOCKED (Inbound)</option>
              </select>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Showing <strong>{filteredMovements.length}</strong> immutable audit movements
            </div>
          </div>

          {/* Audit Log Table */}
          <div className="card table-responsive-wrapper" style={{ overflowX: 'auto', padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Timestamp</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Reference #</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Product & Hub</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Movement Stage</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Qty</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Available Stock</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Allocated Stock</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Performed By & Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovements.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ padding: '3rem 1.25rem', textAlign: 'center', color: '#94a3b8' }}>
                      No movement audit records matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredMovements.map(m => {
                    const getStageColor = (st) => {
                      switch (st) {
                        case 'ALLOCATED': return { bg: '#eff6ff', text: '#1d4ed8' };
                        case 'PICKED': return { bg: '#ede9fe', text: '#6d28d9' };
                        case 'PACKED': return { bg: '#fef3c7', text: '#b45309' };
                        case 'READY_FOR_SHIPMENT': return { bg: '#d1fae5', text: '#047857' };
                        case 'SHIPPED': return { bg: '#e2e8f0', text: '#334155' };
                        case 'RESTOCKED': return { bg: '#dbeafe', text: '#1e40af' };
                        default: return { bg: '#f1f5f9', text: '#475569' };
                      }
                    };
                    const color = getStageColor(m.stage);

                    return (
                      <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.85rem 1.25rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                          {new Date(m.createdAt).toLocaleString()}
                        </td>

                        <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#0f172a' }}>
                          {m.referenceNumber || 'N/A'}
                        </td>

                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 700, color: '#1e293b' }}>{m.productTitle}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{m.warehouseName} ({m.warehouseCode})</div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{
                            padding: '0.25rem 0.6rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            background: color.bg,
                            color: color.text,
                            display: 'inline-block'
                          }}>
                            {m.stage}
                          </span>
                        </td>

                        <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#0f172a' }}>
                          {m.quantity}
                        </td>

                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontSize: '0.82rem' }}>
                            <span style={{ color: '#94a3b8' }}>{m.previousAvailableStock}</span> → <strong style={{ color: '#16a34a' }}>{m.newAvailableStock}</strong>
                          </div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontSize: '0.82rem' }}>
                            <span style={{ color: '#94a3b8' }}>{m.previousAllocatedStock}</span> → <strong style={{ color: '#d97706' }}>{m.newAllocatedStock}</strong>
                          </div>
                        </td>

                        <td style={{ padding: '0.85rem 1.25rem' }}>
                          <div style={{ fontWeight: 600, color: '#334155' }}>{m.performedBy}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>{m.notes}</div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. TAB 5: 1-CLICK WORKFLOW REVIEW SIMULATOR */}
      {subTab === 'SIMULATOR' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card" style={{ padding: '1.75rem', background: '#f8fafc', border: '1px solid #cbd5e1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#7c3aed', fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <Sparkles size={16} /> Interactive Live Demonstration Simulator
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Automate Order → Warehouse Allocation → Pick → Pack → Ready for Shipment → Dispatch
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '0.35rem' }}>
                  Click the button below to run an end-to-end fulfillment test run on an active order item and watch real-time status transitions, barcode generation, inventory deductions, and audit trail updates!
                </p>
              </div>

              <button
                onClick={runEndToEndSimulation}
                disabled={simRunning}
                className="btn btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <PlayCircle size={18} /> {simRunning ? 'Running Simulation...' : 'Run 1-Click Fulfillment Simulator'}
              </button>
            </div>

            {/* Visual Stepper diagram */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '1.75rem 0 1rem', background: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
              {[
                { title: '1. Order Confirmed', desc: 'Availability checked' },
                { title: '2. Warehouse Selected', desc: 'Stock allocated' },
                { title: '3. Product Picked', desc: 'Retrieved from bin' },
                { title: '4. Product Packed', desc: 'Carton sealed & slip' },
                { title: '5. Prepare Shipment', desc: 'Carrier & tracking #' },
                { title: '6. Dispatched', desc: 'Out for delivery' }
              ].map((step, idx, arr) => (
                <React.Fragment key={idx}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: '150px' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#7c3aed', color: '#fff', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {idx + 1}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{step.title}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{step.desc}</div>
                    </div>
                  </div>
                  {idx < arr.length - 1 && (
                    <ChevronRight size={18} color="#cbd5e1" style={{ margin: '0 0.5rem', flexShrink: 0 }} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Real-time simulation console */}
            <div style={{ background: '#0f172a', color: '#f8fafc', padding: '1.25rem', borderRadius: '10px', fontFamily: 'monospace', fontSize: '0.85rem', minHeight: '180px', maxHeight: '320px', overflowY: 'auto' }}>
              <div style={{ color: '#94a3b8', borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '0.75rem', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Simulation Console Output:
              </div>

              {simulationLog.length === 0 ? (
                <div style={{ color: '#64748b' }}>Click "Run 1-Click Fulfillment Simulator" above to execute live test workflow...</div>
              ) : (
                simulationLog.map((l, i) => (
                  <div key={i} style={{ marginBottom: '0.35rem' }}>
                    <span style={{ color: '#64748b' }}>[{l.time}]</span>{' '}
                    <span style={{
                      color: l.stage === 'SUCCESS' ? '#4ade80' : l.stage === 'FINISH' ? '#38bdf8' : l.stage === 'ERROR' ? '#f87171' : '#f1f5f9'
                    }}>
                      {l.msg}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODALS
      ========================================== */}

      {/* 1. PICK OPERATION MODAL */}
      {selectedAllocationForPick && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '520px', width: '100%', padding: '1.75rem', background: '#fff', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.15rem', color: '#0f172a' }}>
                <Navigation size={18} color="#2563eb" /> Warehouse Pick Sheet
              </div>
              <button onClick={() => setSelectedAllocationForPick(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            {/* Product & Location Banner */}
            <div style={{ display: 'flex', gap: '1rem', background: '#eff6ff', padding: '1rem', borderRadius: '10px', border: '1px solid #bfdbfe', marginBottom: '1.25rem' }}>
              <img src={selectedAllocationForPick.productImageUrl} alt="" style={{ width: 50, height: 50, borderRadius: '8px', objectFit: 'cover' }} />
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1e3a8a' }}>{selectedAllocationForPick.productTitle}</div>
                <div style={{ fontSize: '0.78rem', color: '#1e40af', marginTop: '0.2rem' }}>
                  SKU: <strong>{selectedAllocationForPick.productSku}</strong> • Order: #{selectedAllocationForPick.orderNumber}
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2563eb', marginTop: '0.35rem' }}>
                  📍 Shelf Location: <strong>{selectedAllocationForPick.aisleLocation}</strong>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Picker Staff Name / ID:
                </label>
                <input
                  type="text"
                  value={pickForm.pickerName}
                  onChange={e => setPickForm({ ...pickForm, pickerName: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Picker Verification Notes:
                </label>
                <textarea
                  rows="2"
                  value={pickForm.notes}
                  onChange={e => setPickForm({ ...pickForm, notes: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                onClick={() => setSelectedAllocationForPick(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPick}
                disabled={actionLoading}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Check size={16} /> {actionLoading ? 'Saving...' : 'Confirm Pick Complete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. PACK OPERATION MODAL */}
      {selectedAllocationForPack && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '520px', width: '100%', padding: '1.75rem', background: '#fff', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.15rem', color: '#0f172a' }}>
                <Box size={18} color="#7c3aed" /> Packaging & Quality Verification
              </div>
              <button onClick={() => setSelectedAllocationForPack(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', background: '#f5f3ff', padding: '1rem', borderRadius: '10px', border: '1px solid #ddd6fe', marginBottom: '1.25rem' }}>
              <img src={selectedAllocationForPack.productImageUrl} alt="" style={{ width: 50, height: 50, borderRadius: '8px', objectFit: 'cover' }} />
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#5b21b6' }}>{selectedAllocationForPack.productTitle}</div>
                <div style={{ fontSize: '0.78rem', color: '#6d28d9', marginTop: '0.2rem' }}>
                  Qty: {selectedAllocationForPack.allocatedQuantity} • Order: #{selectedAllocationForPack.orderNumber}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#7c3aed', marginTop: '0.2rem' }}>
                  Picked by: <strong>{selectedAllocationForPack.pickerName}</strong>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Carton / Box Packaging Type:
                </label>
                <select
                  value={packForm.boxType}
                  onChange={e => setPackForm({ ...packForm, boxType: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#fff' }}
                >
                  <option value="Standard Corrugated Box B2">Standard Corrugated Box B2</option>
                  <option value="Reinforced Heavy Carton #3">Reinforced Heavy Carton #3 (Electronics)</option>
                  <option value="Eco Apparel Pouch #2">Eco Apparel Pouch #2 (Apparel & Soft Goods)</option>
                  <option value="Electro-Shield Box E1">Electro-Shield Box E1 (Anti-Static)</option>
                  <option value="Luxury Velvet Box #1">Luxury Velvet Box #1 (Watches & Jewelry)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Box Dimensions:
                  </label>
                  <input
                    type="text"
                    value={packForm.boxDimension}
                    onChange={e => setPackForm({ ...packForm, boxDimension: e.target.value })}
                    placeholder="25x20x15 cm"
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Package Weight (kg):
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={packForm.packageWeightKg}
                    onChange={e => setPackForm({ ...packForm, packageWeightKg: parseFloat(e.target.value) || 0.5 })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Packaging Specialist Name:
                </label>
                <input
                  type="text"
                  value={packForm.packerName}
                  onChange={e => setPackForm({ ...packForm, packerName: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                onClick={() => setSelectedAllocationForPack(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPack}
                disabled={actionLoading}
                className="btn"
                style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Check size={16} /> {actionLoading ? 'Packing...' : 'Generate Packing Slip & Seal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. SHIPMENT PREPARATION (READY FOR SHIPMENT) MODAL */}
      {selectedAllocationForShip && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '520px', width: '100%', padding: '1.75rem', background: '#fff', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.15rem', color: '#0f172a' }}>
                <Truck size={18} color="#059669" /> Shipment Preparation & Manifest
              </div>
              <button onClick={() => setSelectedAllocationForShip(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', background: '#ecfdf5', padding: '1rem', borderRadius: '10px', border: '1px solid #a7f3d0', marginBottom: '1.25rem' }}>
              <img src={selectedAllocationForShip.productImageUrl} alt="" style={{ width: 50, height: 50, borderRadius: '8px', objectFit: 'cover' }} />
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#065f46' }}>{selectedAllocationForShip.productTitle}</div>
                <div style={{ fontSize: '0.78rem', color: '#047857', marginTop: '0.2rem' }}>
                  Packing Slip: <strong>{selectedAllocationForShip.packingSlipNumber || 'PS-9920'}</strong> • Box: {selectedAllocationForShip.boxType}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#047857', marginTop: '0.2rem' }}>
                  Deliver to: <strong>{selectedAllocationForShip.shippingAddress}</strong>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Logistics Carrier Partner:
                </label>
                <select
                  value={shipForm.carrier}
                  onChange={e => setShipForm({ ...shipForm, carrier: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#fff' }}
                >
                  <option value="BlueDart Express">BlueDart Express (Air Priority)</option>
                  <option value="Delhivery Air">Delhivery Air Express</option>
                  <option value="FedEx SupplyChain">FedEx SupplyChain Cargo</option>
                  <option value="DHL Express">DHL Express India</option>
                  <option value="DTDC Express">DTDC Prime Express</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Carrier Tracking / Waybill Number:
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={shipForm.trackingNumber}
                    onChange={e => setShipForm({ ...shipForm, trackingNumber: e.target.value })}
                    placeholder="e.g. TRK-BLD-882910"
                    style={{ flex: 1, padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShipForm({ ...shipForm, trackingNumber: 'TRK-BLD-' + Math.floor(100000 + Math.random() * 900000) })}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.78rem' }}
                  >
                    Auto-Generate
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Manifest / Shipping Notes:
                </label>
                <input
                  type="text"
                  value={shipForm.notes}
                  onChange={e => setShipForm({ ...shipForm, notes: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                onClick={() => setSelectedAllocationForShip(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmShipmentPrep}
                disabled={actionLoading}
                className="btn"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Check size={16} /> {actionLoading ? 'Preparing...' : 'Mark Ready for Shipment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. RESTOCK INVENTORY MODAL */}
      {showRestockModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '520px', width: '100%', padding: '1.75rem', background: '#fff', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.15rem', color: '#0f172a' }}>
                <Box size={18} color="#2563eb" /> Inbound Stock Replenishment
              </div>
              <button onClick={() => setShowRestockModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Select Target Warehouse:
                </label>
                <select
                  required
                  value={restockForm.warehouseId}
                  onChange={e => setRestockForm({ ...restockForm, warehouseId: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#fff' }}
                >
                  <option value="">-- Choose Warehouse Hub --</option>
                  {warehouses.map(wh => (
                    <option key={wh.id} value={wh.id}>{wh.name} ({wh.code}) - {wh.city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Select Catalog Product:
                </label>
                <select
                  required
                  value={restockForm.productId}
                  onChange={e => setRestockForm({ ...restockForm, productId: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#fff' }}
                >
                  <option value="">-- Choose Product --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.title} (SKU: {p.sku})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Restock Quantity:
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={restockForm.quantity}
                    onChange={e => setRestockForm({ ...restockForm, quantity: parseInt(e.target.value) || 1 })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Aisle / Bin Coordinate:
                  </label>
                  <input
                    type="text"
                    value={restockForm.aisleLocation}
                    onChange={e => setRestockForm({ ...restockForm, aisleLocation: e.target.value })}
                    placeholder="Aisle 02, Bay B-04"
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Inbound Notes:
                </label>
                <input
                  type="text"
                  value={restockForm.notes}
                  onChange={e => setRestockForm({ ...restockForm, notes: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowRestockModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn btn-primary"
                >
                  {actionLoading ? 'Replenishing...' : 'Execute Inbound Restock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. CREATE / EDIT WAREHOUSE MODAL */}
      {showWarehouseModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '560px', width: '100%', padding: '1.75rem', background: '#fff', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.15rem', color: '#0f172a' }}>
                <MapPin size={18} color="#2563eb" /> {editingWarehouse ? 'Edit Warehouse Hub' : 'Register New Regional Warehouse'}
              </div>
              <button onClick={() => setShowWarehouseModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveWarehouse} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Warehouse Code:
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingWarehouse}
                    value={warehouseForm.code}
                    onChange={e => setWarehouseForm({ ...warehouseForm, code: e.target.value.toUpperCase() })}
                    placeholder="WH-HYD-01"
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Warehouse Name:
                  </label>
                  <input
                    type="text"
                    required
                    value={warehouseForm.name}
                    onChange={e => setWarehouseForm({ ...warehouseForm, name: e.target.value })}
                    placeholder="e.g. Central Metro Fulfillment Hub"
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    City:
                  </label>
                  <input
                    type="text"
                    required
                    value={warehouseForm.city}
                    onChange={e => setWarehouseForm({ ...warehouseForm, city: e.target.value })}
                    placeholder="Hyderabad"
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    State:
                  </label>
                  <input
                    type="text"
                    value={warehouseForm.state}
                    onChange={e => setWarehouseForm({ ...warehouseForm, state: e.target.value })}
                    placeholder="Telangana"
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Street / Logistics Zone Address:
                </label>
                <input
                  type="text"
                  value={warehouseForm.address}
                  onChange={e => setWarehouseForm({ ...warehouseForm, address: e.target.value })}
                  placeholder="Plot 44, Gachibowli Outer Ring Rd"
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Storage Capacity (Units):
                  </label>
                  <input
                    type="number"
                    value={warehouseForm.capacity}
                    onChange={e => setWarehouseForm({ ...warehouseForm, capacity: parseInt(e.target.value) || 50000 })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    PIN Code:
                  </label>
                  <input
                    type="text"
                    value={warehouseForm.pincode}
                    onChange={e => setWarehouseForm({ ...warehouseForm, pincode: e.target.value })}
                    placeholder="500032"
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Contact Phone:
                  </label>
                  <input
                    type="text"
                    value={warehouseForm.contactPhone}
                    onChange={e => setWarehouseForm({ ...warehouseForm, contactPhone: e.target.value })}
                    placeholder="+91 40 4829 1100"
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Contact Email:
                  </label>
                  <input
                    type="email"
                    value={warehouseForm.contactEmail}
                    onChange={e => setWarehouseForm({ ...warehouseForm, contactEmail: e.target.value })}
                    placeholder="hub@shopstack.com"
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowWarehouseModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn btn-primary"
                >
                  {actionLoading ? 'Saving...' : editingWarehouse ? 'Update Hub' : 'Register Warehouse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADMIN RETURN REVIEW (APPROVE / REJECT)
      ========================================================================= */}
      {selectedReturnForReview && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '520px', width: '100%', padding: '1.75rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RotateCcw size={20} color="#be185d" /> Review Customer Return #{selectedReturnForReview.id}
              </h3>
              <button onClick={() => setSelectedReturnForReview(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedReturnForReview.productTitle}</div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                Customer: <strong>{selectedReturnForReview.customerName}</strong> • Order #: <strong>{selectedReturnForReview.orderNumber}</strong>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#dc2626', marginTop: '4px', fontWeight: 600 }}>
                Stated Issue: {selectedReturnForReview.reason}
              </div>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleReviewReturn(
                selectedReturnForReview.id,
                reviewForm.approved,
                reviewForm.adminNotes,
                reviewForm.targetWarehouseId
              );
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                  Admin Decision:
                </label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 700, color: '#16a34a' }}>
                    <input
                      type="radio"
                      name="decision"
                      checked={reviewForm.approved === true}
                      onChange={() => setReviewForm({ ...reviewForm, approved: true })}
                    />
                    Approve Return (Route to Warehouse)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 700, color: '#dc2626' }}>
                    <input
                      type="radio"
                      name="decision"
                      checked={reviewForm.approved === false}
                      onChange={() => setReviewForm({ ...reviewForm, approved: false })}
                    />
                    Reject Return
                  </label>
                </div>
              </div>

              {reviewForm.approved && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Destination Regional Warehouse for Inspection:
                  </label>
                  <select
                    required
                    value={reviewForm.targetWarehouseId || (warehouses[0]?.id || '')}
                    onChange={(e) => setReviewForm({ ...reviewForm, targetWarehouseId: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  >
                    {warehouses.map(wh => (
                      <option key={wh.id} value={wh.id}>{wh.name} ({wh.code}) - {wh.city}</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Admin Review Notes:
                </label>
                <textarea
                  rows="3"
                  required
                  value={reviewForm.adminNotes}
                  onChange={(e) => setReviewForm({ ...reviewForm, adminNotes: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setSelectedReturnForReview(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn btn-primary"
                  style={{ background: reviewForm.approved ? '#10b981' : '#ef4444', borderColor: reviewForm.approved ? '#10b981' : '#ef4444' }}
                >
                  {actionLoading ? 'Saving...' : reviewForm.approved ? 'Approve & Route' : 'Reject Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: VENDOR STOCK TRANSFER
      ========================================================================= */}
      {showVendorTransferModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '500px', width: '100%', padding: '1.75rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Box size={20} color="#2563eb" /> Inbound Stock Distribution Batch
              </h3>
              <button onClick={() => setShowVendorTransferModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleVendorTransferSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Select Catalog Product:
                </label>
                <select
                  required
                  value={vendorTransferForm.productId}
                  onChange={(e) => setVendorTransferForm({ ...vendorTransferForm, productId: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                >
                  <option value="">-- Choose Product --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.title} (SKU: {p.sku || 'SKU-' + p.id})</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Destination Regional Warehouse Hub:
                </label>
                <select
                  required
                  value={vendorTransferForm.warehouseId}
                  onChange={(e) => setVendorTransferForm({ ...vendorTransferForm, warehouseId: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                >
                  <option value="">-- Choose Warehouse --</option>
                  {warehouses.map(wh => (
                    <option key={wh.id} value={wh.id}>{wh.name} ({wh.code}) - {wh.city}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Stock Units:
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={vendorTransferForm.quantity}
                    onChange={(e) => setVendorTransferForm({ ...vendorTransferForm, quantity: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Aisle Shelf Location:
                  </label>
                  <input
                    type="text"
                    value={vendorTransferForm.aisleLocation}
                    onChange={(e) => setVendorTransferForm({ ...vendorTransferForm, aisleLocation: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Distribution Batch Notes:
                </label>
                <input
                  type="text"
                  value={vendorTransferForm.notes}
                  onChange={(e) => setVendorTransferForm({ ...vendorTransferForm, notes: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowVendorTransferModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading} className="btn btn-primary">
                  {actionLoading ? 'Distributing...' : 'Transfer Stock to Warehouse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Order Allocation Modal (Admin) */}
      {showManualAllocateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '520px',
            padding: '1.75rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Navigation size={20} color="#4f46e5" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Manual Order Allocation to Warehouse
                </h3>
              </div>
              <button onClick={() => setShowManualAllocateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '1.2rem' }}>
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
              As Administrator, manually assign or re-route customer orders to the best regional fulfillment warehouse (e.g. Kolkata, Mumbai, Delhi, Bangalore, Hyderabad).
            </p>

            <form onSubmit={handleManualAllocateSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Select Customer Order Item *
                </label>
                <select
                  required
                  value={manualAllocateForm.orderItemId}
                  onChange={(e) => setManualAllocateForm({ ...manualAllocateForm, orderItemId: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                >
                  <option value="">-- Choose Order Item --</option>
                  {orders.flatMap(o => (o.items || []).map(item => ({
                    orderNumber: o.orderNumber,
                    customerName: o.customer?.fullName || 'Customer',
                    itemId: item.id,
                    productTitle: item.product?.title || 'Product Item',
                    quantity: item.quantity,
                    status: o.status
                  }))).map(item => (
                    <option key={item.itemId} value={item.itemId}>
                      {item.orderNumber} - {item.productTitle} (Qty: {item.quantity}) [{item.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Target Regional Warehouse Hub *
                </label>
                <select
                  required
                  value={manualAllocateForm.warehouseId}
                  onChange={(e) => setManualAllocateForm({ ...manualAllocateForm, warehouseId: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                >
                  <option value="">-- Choose Target Warehouse --</option>
                  {warehouses.map(wh => (
                    <option key={wh.id} value={wh.id}>
                      {wh.name} ({wh.code}) - {wh.city}, {wh.state}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Allocation Notes / Instructions:
                </label>
                <input
                  type="text"
                  value={manualAllocateForm.notes}
                  onChange={(e) => setManualAllocateForm({ ...manualAllocateForm, notes: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowManualAllocateModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={allocateLoading}
                  className="btn btn-primary"
                  style={{ background: '#4f46e5', borderColor: '#4f46e5', color: '#fff' }}
                >
                  {allocateLoading ? 'Allocating...' : 'Confirm Manual Allocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default WarehouseManagementTab;

