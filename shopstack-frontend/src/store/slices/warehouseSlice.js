import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

// ─── Admin Thunks ─────────────────────────────────────────────────────────────

export const fetchWarehouses = createAsyncThunk(
  'warehouse/fetchWarehouses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/admin/warehouses');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch warehouses');
    }
  }
);

export const createWarehouse = createAsyncThunk(
  'warehouse/createWarehouse',
  async (warehouseData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/admin/warehouses', warehouseData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create warehouse');
    }
  }
);

export const updateWarehouse = createAsyncThunk(
  'warehouse/updateWarehouse',
  async ({ id, warehouseData }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.put(`/admin/warehouses/${id}`, warehouseData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update warehouse');
    }
  }
);

export const toggleWarehouseStatus = createAsyncThunk(
  'warehouse/toggleWarehouseStatus',
  async ({ id, active }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.patch(`/admin/warehouses/${id}/status?active=${active}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to toggle status');
    }
  }
);

export const fetchWarehouseStaff = createAsyncThunk(
  'warehouse/fetchWarehouseStaff',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/admin/warehouses/staff');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch warehouse staff');
    }
  }
);

export const createWarehouseStaff = createAsyncThunk(
  'warehouse/createWarehouseStaff',
  async (staffData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/admin/warehouses/staff', staffData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create warehouse staff');
    }
  }
);

export const assignStaffToWarehouse = createAsyncThunk(
  'warehouse/assignStaffToWarehouse',
  async ({ staffId, warehouseId }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.put(`/admin/warehouses/staff/${staffId}/warehouse?warehouseId=${warehouseId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to assign staff to warehouse');
    }
  }
);

export const fetchAllWarehouseInventory = createAsyncThunk(
  'warehouse/fetchAllWarehouseInventory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/admin/warehouses/inventory/all');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch inventory');
    }
  }
);

export const updateWarehouseStock = createAsyncThunk(
  'warehouse/updateWarehouseStock',
  async ({ warehouseId, stockData }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(`/admin/warehouses/${warehouseId}/inventory`, stockData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update stock');
    }
  }
);

export const fetchAdminUnallocatedOrders = createAsyncThunk(
  'warehouse/fetchAdminUnallocatedOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/admin/warehouses/unallocated-orders');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch unallocated orders');
    }
  }
);

export const fetchAllocations = createAsyncThunk(
  'warehouse/fetchAllocations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/admin/warehouses/allocations');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch allocations');
    }
  }
);

export const allocateOrder = createAsyncThunk(
  'warehouse/allocateOrder',
  async (allocationData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/admin/warehouses/allocate', allocationData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to allocate order');
    }
  }
);

export const autoAllocateOrder = createAsyncThunk(
  'warehouse/autoAllocateOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(`/admin/warehouses/auto-allocate/${orderId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to auto-allocate order');
    }
  }
);

export const fetchSuitableWarehousesForOrder = createAsyncThunk(
  'warehouse/fetchSuitableWarehousesForOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`/admin/warehouses/suitable-warehouses/${orderId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch suitable warehouses');
    }
  }
);

export const fetchStockMovements = createAsyncThunk(
  'warehouse/fetchStockMovements',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/admin/warehouses/stock-movements');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch stock movements');
    }
  }
);

export const fetchWarehouseAnalytics = createAsyncThunk(
  'warehouse/fetchWarehouseAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/admin/warehouses/analytics');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch warehouse analytics');
    }
  }
);

// ─── Warehouse Staff Thunks ──────────────────────────────────────────────────

export const fetchMyStaffProfile = createAsyncThunk(
  'warehouse/fetchMyStaffProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/warehouse-staff/me');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch staff profile');
    }
  }
);

export const fetchStaffAllocations = createAsyncThunk(
  'warehouse/fetchStaffAllocations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/warehouse-staff/allocations');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch staff allocations');
    }
  }
);

export const fetchStaffAllocatedOrders = createAsyncThunk(
  'warehouse/fetchStaffAllocatedOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/warehouse-staff/allocated-orders');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch staff allocated orders');
    }
  }
);

export const pickStaffAllocation = createAsyncThunk(
  'warehouse/pickStaffAllocation',
  async (allocationId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.put(`/warehouse-staff/allocations/${allocationId}/pick`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to pick item');
    }
  }
);

export const packStaffAllocation = createAsyncThunk(
  'warehouse/packStaffAllocation',
  async (allocationId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.put(`/warehouse-staff/allocations/${allocationId}/pack`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to pack item');
    }
  }
);

export const readyForShipmentStaffAllocation = createAsyncThunk(
  'warehouse/readyForShipmentStaffAllocation',
  async (allocationId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.put(`/warehouse-staff/allocations/${allocationId}/ready-for-shipment`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to mark ready for shipment');
    }
  }
);

export const fetchStaffStockMovements = createAsyncThunk(
  'warehouse/fetchStaffStockMovements',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/warehouse-staff/stock-movements');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch stock movements');
    }
  }
);

export const fetchStaffWarehouses = createAsyncThunk(
  'warehouse/fetchStaffWarehouses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/warehouse-staff/warehouses');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch active warehouses');
    }
  }
);

export const fetchStaffInventory = createAsyncThunk(
  'warehouse/fetchStaffInventory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/warehouse-staff/inventory');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch warehouse inventory');
    }
  }
);

const initialState = {
  warehouses: [],
  inventory: [],
  allocations: [],
  unallocatedOrders: [],
  staffOrders: [],
  stockMovements: [],
  staffList: [],
  myStaffProfile: null,
  analytics: null,
  loading: false,
  error: null,
  successMessage: null,
};

const warehouseSlice = createSlice({
  name: 'warehouse',
  initialState,
  reducers: {
    clearWarehouseMessage: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Warehouses
      .addCase(fetchWarehouses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWarehouses.fulfilled, (state, action) => {
        state.loading = false;
        state.warehouses = action.payload;
      })
      .addCase(fetchWarehouses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Warehouse
      .addCase(createWarehouse.fulfilled, (state, action) => {
        state.warehouses.unshift(action.payload);
        state.successMessage = `Warehouse '${action.payload.name}' created successfully.`;
      })
      // Update Warehouse
      .addCase(updateWarehouse.fulfilled, (state, action) => {
        const index = state.warehouses.findIndex((w) => w.id === action.payload.id);
        if (index !== -1) {
          state.warehouses[index] = action.payload;
        }
        state.successMessage = `Warehouse updated successfully.`;
      })
      // Toggle Status
      .addCase(toggleWarehouseStatus.fulfilled, (state, action) => {
        const index = state.warehouses.findIndex((w) => w.id === action.payload.id);
        if (index !== -1) {
          state.warehouses[index] = action.payload;
        }
        state.successMessage = `Warehouse status updated to ${action.payload.status}.`;
      })
      // Staff Management
      .addCase(fetchWarehouseStaff.fulfilled, (state, action) => {
        state.staffList = action.payload;
      })
      .addCase(createWarehouseStaff.fulfilled, (state, action) => {
        state.staffList.unshift(action.payload);
        state.successMessage = `Staff member '${action.payload.name}' created and assigned to ${action.payload.warehouseName || 'warehouse'}.`;
      })
      .addCase(createWarehouseStaff.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(assignStaffToWarehouse.fulfilled, (state, action) => {
        const index = state.staffList.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.staffList[index] = action.payload;
        }
        state.successMessage = `Assigned ${action.payload.name} to ${action.payload.warehouseName}.`;
      })
      .addCase(assignStaffToWarehouse.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchMyStaffProfile.fulfilled, (state, action) => {
        state.myStaffProfile = action.payload;
      })
      // Inventory
      .addCase(fetchAllWarehouseInventory.fulfilled, (state, action) => {
        state.inventory = action.payload;
      })
      .addCase(updateWarehouseStock.fulfilled, (state) => {
        state.successMessage = `Inventory stock updated successfully.`;
      })
      // Allocations & Unallocated Orders
      .addCase(fetchAdminUnallocatedOrders.fulfilled, (state, action) => {
        state.unallocatedOrders = action.payload;
      })
      .addCase(fetchAllocations.fulfilled, (state, action) => {
        state.allocations = action.payload;
      })
      .addCase(allocateOrder.fulfilled, (state) => {
        state.successMessage = `Order allocated successfully.`;
      })
      .addCase(allocateOrder.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(autoAllocateOrder.fulfilled, (state) => {
        state.successMessage = `Order auto-allocated successfully.`;
      })
      .addCase(autoAllocateOrder.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Movements
      .addCase(fetchStockMovements.fulfilled, (state, action) => {
        state.stockMovements = action.payload;
      })
      // Analytics
      .addCase(fetchWarehouseAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload;
      })
      // Staff Thunks
      .addCase(fetchStaffAllocations.fulfilled, (state, action) => {
        state.allocations = action.payload;
      })
      .addCase(fetchStaffAllocatedOrders.fulfilled, (state, action) => {
        state.staffOrders = action.payload;
      })
      .addCase(fetchStaffWarehouses.fulfilled, (state, action) => {
        state.warehouses = action.payload;
      })
      .addCase(fetchStaffInventory.fulfilled, (state, action) => {
        state.inventory = action.payload;
      })
      .addCase(fetchStaffStockMovements.fulfilled, (state, action) => {
        state.stockMovements = action.payload;
      })
      .addCase(pickStaffAllocation.fulfilled, (state, action) => {
        const index = state.allocations.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) state.allocations[index] = action.payload;
        state.successMessage = `Item marked as PICKED.`;
      })
      .addCase(pickStaffAllocation.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(packStaffAllocation.fulfilled, (state, action) => {
        const index = state.allocations.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) state.allocations[index] = action.payload;
        state.successMessage = `Item marked as PACKED.`;
      })
      .addCase(packStaffAllocation.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(readyForShipmentStaffAllocation.fulfilled, (state, action) => {
        const index = state.allocations.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) state.allocations[index] = action.payload;
        state.successMessage = `Item marked READY FOR SHIPMENT.`;
      })
      .addCase(readyForShipmentStaffAllocation.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearWarehouseMessage } = warehouseSlice.actions;
export default warehouseSlice.reducer;
