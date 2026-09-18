import { useEffect, useState } from "react";
import api from "../services/api";
import "./WarehouseDashboard.css";

function WarehouseDashboard() {

    const [activePage, setActivePage] = useState("dashboard");

    const [warehouses, setWarehouses] = useState([]);
    const [allocations, setAllocations] = useState([]);
    const [shipments, setShipments] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // =========================================================
    // WAREHOUSE FORM
    // =========================================================

    const [showWarehouseForm, setShowWarehouseForm] = useState(false);
    const [editingWarehouse, setEditingWarehouse] = useState(null);
    const [savingWarehouse, setSavingWarehouse] = useState(false);

    const emptyWarehouse = {
        warehouseName: "",
        location: "",
        address: "",
        city: "",
        state: "",
        postalCode: "",
        contactNumber: "",
        managerName: "",
        active: true
    };

    const [warehouseForm, setWarehouseForm] = useState(emptyWarehouse);

    // =========================================================
    // ALLOCATION FORM
    // =========================================================

    const [showAllocationForm, setShowAllocationForm] = useState(false);
    const [creatingAllocation, setCreatingAllocation] = useState(false);

    const [allocationForm, setAllocationForm] = useState({
        orderId: "",
        warehouseId: "",
        remarks: ""
    });

    // =========================================================
    // SHIPMENT FORM
    // =========================================================

    const [showShipmentForm, setShowShipmentForm] = useState(false);
    const [creatingShipment, setCreatingShipment] = useState(false);

    const [shipmentForm, setShipmentForm] = useState({
        orderId: "",
        warehouseId: "",
        trackingNumber: "",
        carrier: "",
        remarks: ""
    });

    // =========================================================
    // LOAD WAREHOUSES
    // =========================================================

    const loadWarehouses = async () => {

        try {

            const response = await api.get("/warehouse");

            setWarehouses(response.data);

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.message ||
                err.response?.data ||
                "Unable to load warehouses."
            );
        }
    };

    // =========================================================
    // LOAD ALLOCATIONS
    // =========================================================

    const loadAllocations = async () => {

        try {

            const response = await api.get("/warehouse/allocations");

            setAllocations(response.data);

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.message ||
                err.response?.data ||
                "Unable to load warehouse allocations."
            );
        }
    };

    // =========================================================
    // LOAD SHIPMENTS
    // =========================================================

    const loadShipments = async () => {

        try {

            const response = await api.get("/warehouse/shipments");

            setShipments(response.data);

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.message ||
                err.response?.data ||
                "Unable to load shipments."
            );
        }
    };

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {

        const loadInitialData = async () => {

            setLoading(true);
            setError("");

            try {

                await Promise.all([
                    loadWarehouses(),
                    loadAllocations(),
                    loadShipments()
                ]);

            } finally {

                setLoading(false);
            }
        };

        loadInitialData();

    }, []);

    // =========================================================
    // LOAD ALL DATA
    // =========================================================

    const loadAllData = async () => {

        try {

            setLoading(true);
            setError("");

            await Promise.all([
                loadWarehouses(),
                loadAllocations(),
                loadShipments()
            ]);

        } finally {

            setLoading(false);
        }
    };

    // =========================================================
    // NAVIGATION
    // =========================================================

    const openDashboard = async () => {

        setActivePage("dashboard");
        setError("");

        await loadAllData();
    };

    const openWarehouses = async () => {

        setActivePage("warehouses");
        setError("");
        setLoading(true);

        try {
            await loadWarehouses();
        } finally {
            setLoading(false);
        }
    };

    const openAllocations = async () => {

        setActivePage("allocations");
        setError("");
        setLoading(true);

        try {
            await loadAllocations();
        } finally {
            setLoading(false);
        }
    };

    const openShipments = async () => {

        setActivePage("shipments");
        setError("");
        setLoading(true);

        try {
            await loadShipments();
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // WAREHOUSE FORM
    // =========================================================

    const openCreateWarehouse = () => {

        setError("");
        setEditingWarehouse(null);
        setWarehouseForm({ ...emptyWarehouse });
        setShowWarehouseForm(true);
    };

    const openEditWarehouse = (warehouse) => {

        setError("");
        setEditingWarehouse(warehouse);

        setWarehouseForm({
            warehouseName: warehouse.warehouseName || "",
            location: warehouse.location || "",
            address: warehouse.address || "",
            city: warehouse.city || "",
            state: warehouse.state || "",
            postalCode: warehouse.postalCode || "",
            contactNumber: warehouse.contactNumber || "",
            managerName: warehouse.managerName || "",
            active:
                warehouse.active === null ||
                warehouse.active === undefined
                    ? true
                    : warehouse.active
        });

        setShowWarehouseForm(true);
    };

    const closeWarehouseForm = () => {

        if (savingWarehouse) {
            return;
        }

        setShowWarehouseForm(false);
        setEditingWarehouse(null);
        setWarehouseForm({ ...emptyWarehouse });
    };

    const handleWarehouseChange = (event) => {

        const {
            name,
            value,
            type,
            checked
        } = event.target;

        setWarehouseForm((previous) => ({
            ...previous,
            [name]:
                type === "checkbox"
                    ? checked
                    : value
        }));
    };

    // =========================================================
    // SAVE WAREHOUSE
    // =========================================================

    const saveWarehouse = async (event) => {

        event.preventDefault();

        setError("");

        if (!warehouseForm.warehouseName.trim()) {
            setError("Warehouse name is required.");
            return;
        }

        if (!warehouseForm.location.trim()) {
            setError("Location is required.");
            return;
        }

        if (!warehouseForm.city.trim()) {
            setError("City is required.");
            return;
        }

        try {

            setSavingWarehouse(true);

            const request = {
                warehouseName:
                    warehouseForm.warehouseName.trim(),

                location:
                    warehouseForm.location.trim(),

                address:
                    warehouseForm.address.trim(),

                city:
                    warehouseForm.city.trim(),

                state:
                    warehouseForm.state.trim(),

                postalCode:
                    warehouseForm.postalCode.trim(),

                contactNumber:
                    warehouseForm.contactNumber.trim(),

                managerName:
                    warehouseForm.managerName.trim(),

                active:
                    warehouseForm.active
            };

            if (editingWarehouse) {

                await api.put(
                    `/warehouse/${editingWarehouse.id}`,
                    request
                );

            } else {

                await api.post(
                    "/warehouse",
                    request
                );
            }

            setShowWarehouseForm(false);
            setEditingWarehouse(null);
            setWarehouseForm({ ...emptyWarehouse });

            await loadWarehouses();

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.message ||
                err.response?.data ||
                "Unable to save warehouse."
            );

        } finally {

            setSavingWarehouse(false);
        }
    };

    // =========================================================
    // DELETE WAREHOUSE
    // =========================================================

    const deleteWarehouse = async (id) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this warehouse?"
        );

        if (!confirmed) {
            return;
        }

        try {

            setError("");

            await api.delete(
                `/warehouse/${id}`
            );

            await loadWarehouses();

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.message ||
                err.response?.data ||
                "Unable to delete warehouse."
            );
        }
    };

    // =========================================================
    // TOGGLE WAREHOUSE
    // =========================================================

    const toggleWarehouse = async (id) => {

        try {

            setError("");

            await api.put(
                `/warehouse/${id}/toggle`,
                {}
            );

            await loadWarehouses();

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.message ||
                err.response?.data ||
                "Unable to change warehouse status."
            );
        }
    };

    // =========================================================
    // ALLOCATION FORM
    // =========================================================

    const openCreateAllocation = () => {

        setError("");

        setAllocationForm({
            orderId: "",
            warehouseId: "",
            remarks: ""
        });

        setShowAllocationForm(true);
    };

    const closeAllocationForm = () => {

        if (creatingAllocation) {
            return;
        }

        setShowAllocationForm(false);

        setAllocationForm({
            orderId: "",
            warehouseId: "",
            remarks: ""
        });
    };

    const handleAllocationChange = (event) => {

        const {
            name,
            value
        } = event.target;

        setAllocationForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // =========================================================
    // CREATE ALLOCATION
    // =========================================================

    const createAllocation = async (event) => {

        event.preventDefault();

        setError("");

        if (!allocationForm.orderId) {
            setError("Order ID is required.");
            return;
        }

        if (!allocationForm.warehouseId) {
            setError("Warehouse is required.");
            return;
        }

        try {

            setCreatingAllocation(true);

            const request = {
                orderId: Number(
                    allocationForm.orderId
                ),

                warehouseId: Number(
                    allocationForm.warehouseId
                ),

                remarks:
                    allocationForm.remarks.trim()
            };

            await api.post(
                "/warehouse/allocations",
                request
            );

            setShowAllocationForm(false);

            setAllocationForm({
                orderId: "",
                warehouseId: "",
                remarks: ""
            });

            await loadAllocations();

            setActivePage("allocations");

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.message ||
                err.response?.data ||
                "Unable to create allocation."
            );

        } finally {

            setCreatingAllocation(false);
        }
    };

    // =========================================================
    // UPDATE ALLOCATION STATUS
    // =========================================================

    const updateAllocationStatus = async (
        id,
        status
    ) => {

        try {

            setError("");

            await api.put(
                `/warehouse/allocations/${id}/status`,
                {},
                {
                    params: {
                        status: status
                    }
                }
            );

            await loadAllocations();

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.message ||
                err.response?.data ||
                "Unable to update allocation status."
            );
        }
    };

    // =========================================================
    // SHIPMENT FORM
    // =========================================================

    const openCreateShipment = (allocation) => {

        setError("");

        setShipmentForm({
            orderId: allocation.orderId || "",
            warehouseId: allocation.warehouseId || "",
            trackingNumber: "",
            carrier: "",
            remarks: ""
        });

        setShowShipmentForm(true);
    };

    const closeCreateShipment = () => {

        if (creatingShipment) {
            return;
        }

        setShowShipmentForm(false);

        setShipmentForm({
            orderId: "",
            warehouseId: "",
            trackingNumber: "",
            carrier: "",
            remarks: ""
        });
    };

    const handleShipmentChange = (event) => {

        const {
            name,
            value
        } = event.target;

        setShipmentForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // =========================================================
    // CREATE SHIPMENT
    // =========================================================

    const createShipment = async (event) => {

        event.preventDefault();

        setError("");

        if (!shipmentForm.orderId) {
            setError("Order ID is required.");
            return;
        }

        if (!shipmentForm.warehouseId) {
            setError("Warehouse ID is required.");
            return;
        }

        if (!shipmentForm.trackingNumber.trim()) {
            setError("Tracking number is required.");
            return;
        }

        if (!shipmentForm.carrier.trim()) {
            setError("Carrier is required.");
            return;
        }

        try {

            setCreatingShipment(true);

            const request = {
                orderId:
                    Number(shipmentForm.orderId),

                warehouseId:
                    Number(shipmentForm.warehouseId),

                trackingNumber:
                    shipmentForm.trackingNumber.trim(),

                carrier:
                    shipmentForm.carrier.trim(),

                remarks:
                    shipmentForm.remarks.trim()
            };

            await api.post(
                "/warehouse/shipments",
                request
            );

            setShowShipmentForm(false);

            setShipmentForm({
                orderId: "",
                warehouseId: "",
                trackingNumber: "",
                carrier: "",
                remarks: ""
            });

            await loadShipments();
            await loadAllocations();

            setActivePage("shipments");

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.message ||
                err.response?.data ||
                "Unable to create shipment."
            );

        } finally {

            setCreatingShipment(false);
        }
    };

    // =========================================================
    // UPDATE SHIPMENT STATUS
    // =========================================================

    const updateShipmentStatus = async (
        id,
        status
    ) => {

        try {

            setError("");

            await api.put(
                `/warehouse/shipments/${id}/status`,
                {},
                {
                    params: {
                        status: status
                    }
                }
            );

            await loadShipments();
            await loadAllocations();

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.message ||
                err.response?.data ||
                "Unable to update shipment status."
            );
        }
    };

    // =========================================================
    // LOGOUT
    // =========================================================

    const logout = () => {

        localStorage.removeItem("token");

        window.location.reload();
    };

    // =========================================================
    // DASHBOARD
    // =========================================================

    const renderDashboard = () => {

        return (
            <div className="warehouse-dashboard-home">

                <h1>Warehouse Dashboard</h1>

                <p className="warehouse-subtitle">
                    Manage warehouses, allocations and shipments
                </p>

                {error && (
                    <div className="warehouse-error">
                        {error}
                    </div>
                )}

                <div className="warehouse-cards">

                    <div className="warehouse-card">
                        <h2>{warehouses.length}</h2>
                        <p>Warehouses</p>
                    </div>

                    <div className="warehouse-card">
                        <h2>{allocations.length}</h2>
                        <p>Allocations</p>
                    </div>

                    <div className="warehouse-card">
                        <h2>{shipments.length}</h2>
                        <p>Shipments</p>
                    </div>

                </div>

            </div>
        );
    };

    // =========================================================
    // WAREHOUSES PAGE
    // =========================================================

    const renderWarehouses = () => {

        return (
            <div className="warehouse-page">

                <div className="warehouse-page-header">

                    <div>

                        <h1>Warehouses</h1>

                        <p className="warehouse-subtitle">
                            Manage warehouse locations and availability
                        </p>

                    </div>

                    <button
                        className="warehouse-primary-button"
                        onClick={openCreateWarehouse}
                    >
                        + Add Warehouse
                    </button>

                </div>

                {loading && (
                    <p className="warehouse-loading">
                        Loading...
                    </p>
                )}

                {error && (
                    <div className="warehouse-error">
                        {error}
                    </div>
                )}

                {!loading && warehouses.length === 0 && (
                    <div className="warehouse-empty-state">
                        No warehouses found.
                    </div>
                )}

                {warehouses.length > 0 && (

                    <div className="warehouse-table-wrapper">

                        <table>

                            <thead>

                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Location</th>
                                    <th>City</th>
                                    <th>State</th>
                                    <th>Manager</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>

                            </thead>

                            <tbody>

                                {warehouses.map((warehouse) => (

                                    <tr key={warehouse.id}>

                                        <td>
                                            {warehouse.id}
                                        </td>

                                        <td>
                                            {warehouse.warehouseName || "-"}
                                        </td>

                                        <td>
                                            {warehouse.location || "-"}
                                        </td>

                                        <td>
                                            {warehouse.city || "-"}
                                        </td>

                                        <td>
                                            {warehouse.state || "-"}
                                        </td>

                                        <td>
                                            {warehouse.managerName || "-"}
                                        </td>

                                        <td>

                                            <span
                                                className={
                                                    warehouse.active
                                                        ? "status-active"
                                                        : "status-inactive"
                                                }
                                            >
                                                {warehouse.active
                                                    ? "ACTIVE"
                                                    : "INACTIVE"}
                                            </span>

                                        </td>

                                        <td>

                                            <div className="warehouse-action-buttons">

                                                <button
                                                    className="warehouse-edit-button"
                                                    onClick={() =>
                                                        openEditWarehouse(
                                                            warehouse
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className="warehouse-toggle-button"
                                                    onClick={() =>
                                                        toggleWarehouse(
                                                            warehouse.id
                                                        )
                                                    }
                                                >
                                                    {warehouse.active
                                                        ? "Deactivate"
                                                        : "Activate"}
                                                </button>

                                                <button
                                                    className="warehouse-delete-button"
                                                    onClick={() =>
                                                        deleteWarehouse(
                                                            warehouse.id
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>
        );
    };

    // =========================================================
    // ALLOCATIONS PAGE
    // =========================================================

    const renderAllocations = () => {

        return (
            <div className="warehouse-page">

                <div className="warehouse-page-header">

                    <div>

                        <h1>Warehouse Allocations</h1>

                        <p className="warehouse-subtitle">
                            Assign orders to active warehouses
                        </p>

                    </div>

                    <button
                        className="warehouse-primary-button"
                        onClick={openCreateAllocation}
                    >
                        + Create Allocation
                    </button>

                </div>

                {loading && (
                    <p className="warehouse-loading">
                        Loading...
                    </p>
                )}

                {error && (
                    <div className="warehouse-error">
                        {error}
                    </div>
                )}

                {!loading && allocations.length === 0 && (
                    <div className="warehouse-empty-state">
                        No allocations found.
                    </div>
                )}

                {allocations.length > 0 && (

                    <div className="warehouse-table-wrapper">

                        <table>

                            <thead>

                                <tr>
                                    <th>ID</th>
                                    <th>Order ID</th>
                                    <th>Warehouse ID</th>
                                    <th>Status</th>
                                    <th>Remarks</th>
                                    <th>Action</th>
                                </tr>

                            </thead>

                            <tbody>

                                {allocations.map((allocation) => (

                                    <tr key={allocation.id}>

                                        <td>
                                            {allocation.id}
                                        </td>

                                        <td>
                                            {allocation.orderId}
                                        </td>

                                        <td>
                                            {allocation.warehouseId}
                                        </td>

                                        <td>

                                            <span className="status-badge">
                                                {allocation.status}
                                            </span>

                                        </td>

                                        <td>
                                            {allocation.remarks || "-"}
                                        </td>

                                        <td>

                                            {allocation.status === "ALLOCATED" && (

                                                <button
                                                    onClick={() =>
                                                        updateAllocationStatus(
                                                            allocation.id,
                                                            "PROCESSING"
                                                        )
                                                    }
                                                >
                                                    Processing
                                                </button>

                                            )}

                                            {allocation.status === "PROCESSING" && (

                                                <button
                                                    onClick={() =>
                                                        updateAllocationStatus(
                                                            allocation.id,
                                                            "READY_FOR_SHIPMENT"
                                                        )
                                                    }
                                                >
                                                    Ready for Shipment
                                                </button>

                                            )}

                                            {allocation.status === "READY_FOR_SHIPMENT" && (

                                                <button
                                                    onClick={() =>
                                                        openCreateShipment(
                                                            allocation
                                                        )
                                                    }
                                                >
                                                    Create Shipment
                                                </button>

                                            )}

                                            {allocation.status === "SHIPPED" && (

                                                <span className="delivered-text">
                                                    Shipped
                                                </span>

                                            )}

                                            {allocation.status === "CANCELLED" && (

                                                <span className="cancelled-text">
                                                    Cancelled
                                                </span>

                                            )}

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>
        );
    };

    // =========================================================
    // SHIPMENTS PAGE
    // =========================================================

    const renderShipments = () => {

        return (
            <div className="warehouse-page">

                <div className="warehouse-page-header">

                    <div>

                        <h1>Shipments</h1>

                        <p className="warehouse-subtitle">
                            Track and manage warehouse shipments
                        </p>

                    </div>

                </div>

                {loading && (
                    <p className="warehouse-loading">
                        Loading...
                    </p>
                )}

                {error && (
                    <div className="warehouse-error">
                        {error}
                    </div>
                )}

                {!loading && shipments.length === 0 && (
                    <div className="warehouse-empty-state">
                        No shipments found.
                    </div>
                )}

                {shipments.length > 0 && (

                    <div className="warehouse-table-wrapper">

                        <table>

                            <thead>

                                <tr>
                                    <th>ID</th>
                                    <th>Order ID</th>
                                    <th>Tracking</th>
                                    <th>Carrier</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>

                            </thead>

                            <tbody>

                                {shipments.map((shipment) => (

                                    <tr key={shipment.id}>

                                        <td>
                                            {shipment.id}
                                        </td>

                                        <td>
                                            {shipment.orderId}
                                        </td>

                                        <td>
                                            <strong>
                                                {shipment.trackingNumber}
                                            </strong>
                                        </td>

                                        <td>
                                            {shipment.carrier}
                                        </td>

                                        <td>

                                            <span className="status-badge">
                                                {shipment.status}
                                            </span>

                                        </td>

                                        <td>

                                            {shipment.status === "CREATED" && (

                                                <button
                                                    onClick={() =>
                                                        updateShipmentStatus(
                                                            shipment.id,
                                                            "IN_TRANSIT"
                                                        )
                                                    }
                                                >
                                                    In Transit
                                                </button>

                                            )}

                                            {shipment.status === "IN_TRANSIT" && (

                                                <button
                                                    onClick={() =>
                                                        updateShipmentStatus(
                                                            shipment.id,
                                                            "OUT_FOR_DELIVERY"
                                                        )
                                                    }
                                                >
                                                    Out for Delivery
                                                </button>

                                            )}

                                            {shipment.status === "OUT_FOR_DELIVERY" && (

                                                <button
                                                    onClick={() =>
                                                        updateShipmentStatus(
                                                            shipment.id,
                                                            "DELIVERED"
                                                        )
                                                    }
                                                >
                                                    Delivered
                                                </button>

                                            )}

                                            {shipment.status === "DELIVERED" && (

                                                <span className="delivered-text">
                                                    Delivered
                                                </span>

                                            )}

                                            {shipment.status === "CANCELLED" && (

                                                <span className="cancelled-text">
                                                    Cancelled
                                                </span>

                                            )}

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>
        );
    };

    // =========================================================
    // WAREHOUSE MODAL
    // =========================================================

    const renderWarehouseModal = () => {

        if (!showWarehouseForm) {
            return null;
        }

        return (

            <div className="warehouse-modal-overlay">

                <div className="warehouse-modal">

                    <div className="warehouse-modal-header">

                        <div>

                            <h2>
                                {editingWarehouse
                                    ? "Edit Warehouse"
                                    : "Add Warehouse"}
                            </h2>

                            <p>
                                {editingWarehouse
                                    ? "Update warehouse information"
                                    : "Create a new warehouse"}
                            </p>

                        </div>

                        <button
                            type="button"
                            className="warehouse-modal-close"
                            onClick={closeWarehouseForm}
                            disabled={savingWarehouse}
                        >
                            ×
                        </button>

                    </div>

                    <form onSubmit={saveWarehouse}>

                        <div className="warehouse-form-row">

                            <div className="warehouse-form-group">

                                <label>
                                    Warehouse Name
                                </label>

                                <input
                                    type="text"
                                    name="warehouseName"
                                    value={
                                        warehouseForm.warehouseName
                                    }
                                    onChange={
                                        handleWarehouseChange
                                    }
                                    placeholder="Example: Kolkata Warehouse"
                                    required
                                />

                            </div>

                            <div className="warehouse-form-group">

                                <label>
                                    Location
                                </label>

                                <input
                                    type="text"
                                    name="location"
                                    value={
                                        warehouseForm.location
                                    }
                                    onChange={
                                        handleWarehouseChange
                                    }
                                    placeholder="Example: Sector V"
                                    required
                                />

                            </div>

                        </div>

                        <div className="warehouse-form-group">

                            <label>
                                Address
                            </label>

                            <textarea
                                name="address"
                                value={
                                    warehouseForm.address
                                }
                                onChange={
                                    handleWarehouseChange
                                }
                                placeholder="Complete warehouse address"
                                rows="2"
                            />

                        </div>

                        <div className="warehouse-form-row">

                            <div className="warehouse-form-group">

                                <label>
                                    City
                                </label>

                                <input
                                    type="text"
                                    name="city"
                                    value={
                                        warehouseForm.city
                                    }
                                    onChange={
                                        handleWarehouseChange
                                    }
                                    placeholder="Kolkata"
                                    required
                                />

                            </div>

                            <div className="warehouse-form-group">

                                <label>
                                    State
                                </label>

                                <input
                                    type="text"
                                    name="state"
                                    value={
                                        warehouseForm.state
                                    }
                                    onChange={
                                        handleWarehouseChange
                                    }
                                    placeholder="West Bengal"
                                />

                            </div>

                        </div>

                        <div className="warehouse-form-row">

                            <div className="warehouse-form-group">

                                <label>
                                    Postal Code
                                </label>

                                <input
                                    type="text"
                                    name="postalCode"
                                    value={
                                        warehouseForm.postalCode
                                    }
                                    onChange={
                                        handleWarehouseChange
                                    }
                                    placeholder="700091"
                                />

                            </div>

                            <div className="warehouse-form-group">

                                <label>
                                    Contact Number
                                </label>

                                <input
                                    type="text"
                                    name="contactNumber"
                                    value={
                                        warehouseForm.contactNumber
                                    }
                                    onChange={
                                        handleWarehouseChange
                                    }
                                    placeholder="9876543210"
                                />

                            </div>

                        </div>

                        <div className="warehouse-form-group">

                            <label>
                                Manager Name
                            </label>

                            <input
                                type="text"
                                name="managerName"
                                value={
                                    warehouseForm.managerName
                                }
                                onChange={
                                    handleWarehouseChange
                                }
                                placeholder="Warehouse manager"
                            />

                        </div>

                        <label className="warehouse-checkbox-group">

                            <input
                                type="checkbox"
                                name="active"
                                checked={
                                    warehouseForm.active
                                }
                                onChange={
                                    handleWarehouseChange
                                }
                            />

                            <span>
                                Warehouse is active
                            </span>

                        </label>

                        <div className="warehouse-modal-actions">

                            <button
                                type="button"
                                className="warehouse-cancel-button"
                                onClick={closeWarehouseForm}
                                disabled={savingWarehouse}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={savingWarehouse}
                            >
                                {savingWarehouse
                                    ? "Saving..."
                                    : editingWarehouse
                                        ? "Update Warehouse"
                                        : "Create Warehouse"}
                            </button>

                        </div>

                    </form>

                </div>

            </div>
        );
    };

    // =========================================================
    // ALLOCATION MODAL
    // =========================================================

    const renderAllocationModal = () => {

        if (!showAllocationForm) {
            return null;
        }

        const activeWarehouses =
            warehouses.filter(
                (warehouse) => warehouse.active
            );

        return (

            <div className="warehouse-modal-overlay">

                <div className="warehouse-modal">

                    <div className="warehouse-modal-header">

                        <div>

                            <h2>
                                Create Allocation
                            </h2>

                            <p>
                                Assign an order to an active warehouse
                            </p>

                        </div>

                        <button
                            type="button"
                            className="warehouse-modal-close"
                            onClick={closeAllocationForm}
                            disabled={creatingAllocation}
                        >
                            ×
                        </button>

                    </div>

                    <form onSubmit={createAllocation}>

                        <div className="warehouse-form-group">

                            <label>
                                Order ID
                            </label>

                            <input
                                type="number"
                                name="orderId"
                                value={
                                    allocationForm.orderId
                                }
                                onChange={
                                    handleAllocationChange
                                }
                                placeholder="Enter Order ID"
                                required
                            />

                        </div>

                        <div className="warehouse-form-group">

                            <label>
                                Warehouse
                            </label>

                            <select
                                name="warehouseId"
                                value={
                                    allocationForm.warehouseId
                                }
                                onChange={
                                    handleAllocationChange
                                }
                                required
                            >

                                <option value="">
                                    Select Warehouse
                                </option>

                                {activeWarehouses.map(
                                    (warehouse) => (

                                        <option
                                            key={warehouse.id}
                                            value={warehouse.id}
                                        >
                                            {warehouse.warehouseName}
                                            {" - "}
                                            {warehouse.city}
                                        </option>

                                    )
                                )}

                            </select>

                        </div>

                        <div className="warehouse-form-group">

                            <label>
                                Remarks
                            </label>

                            <textarea
                                name="remarks"
                                value={
                                    allocationForm.remarks
                                }
                                onChange={
                                    handleAllocationChange
                                }
                                placeholder="Optional allocation remarks"
                                rows="3"
                            />

                        </div>

                        <div className="warehouse-modal-actions">

                            <button
                                type="button"
                                className="warehouse-cancel-button"
                                onClick={closeAllocationForm}
                                disabled={creatingAllocation}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={creatingAllocation}
                            >
                                {creatingAllocation
                                    ? "Creating..."
                                    : "Create Allocation"}
                            </button>

                        </div>

                    </form>

                </div>

            </div>
        );
    };

    // =========================================================
    // SHIPMENT MODAL
    // =========================================================

    const renderShipmentModal = () => {

        if (!showShipmentForm) {
            return null;
        }

        return (

            <div className="warehouse-modal-overlay">

                <div className="warehouse-modal">

                    <div className="warehouse-modal-header">

                        <div>

                            <h2>
                                Create Shipment
                            </h2>

                            <p>
                                Create shipment for Order #
                                {shipmentForm.orderId}
                            </p>

                        </div>

                        <button
                            type="button"
                            className="warehouse-modal-close"
                            onClick={closeCreateShipment}
                            disabled={creatingShipment}
                        >
                            ×
                        </button>

                    </div>

                    <form onSubmit={createShipment}>

                        <div className="warehouse-form-group">

                            <label>
                                Order ID
                            </label>

                            <input
                                type="number"
                                value={
                                    shipmentForm.orderId
                                }
                                readOnly
                            />

                        </div>

                        <div className="warehouse-form-group">

                            <label>
                                Warehouse ID
                            </label>

                            <input
                                type="number"
                                value={
                                    shipmentForm.warehouseId
                                }
                                readOnly
                            />

                        </div>

                        <div className="warehouse-form-group">

                            <label>
                                Tracking Number
                            </label>

                            <input
                                type="text"
                                name="trackingNumber"
                                value={
                                    shipmentForm.trackingNumber
                                }
                                onChange={
                                    handleShipmentChange
                                }
                                placeholder="Example: TRK-2026-00024"
                                required
                            />

                        </div>

                        <div className="warehouse-form-group">

                            <label>
                                Carrier
                            </label>

                            <input
                                type="text"
                                name="carrier"
                                value={
                                    shipmentForm.carrier
                                }
                                onChange={
                                    handleShipmentChange
                                }
                                placeholder="Example: Delhivery"
                                required
                            />

                        </div>

                        <div className="warehouse-form-group">

                            <label>
                                Remarks
                            </label>

                            <textarea
                                name="remarks"
                                value={
                                    shipmentForm.remarks
                                }
                                onChange={
                                    handleShipmentChange
                                }
                                placeholder="Optional shipment remarks"
                                rows="3"
                            />

                        </div>

                        <div className="warehouse-modal-actions">

                            <button
                                type="button"
                                className="warehouse-cancel-button"
                                onClick={closeCreateShipment}
                                disabled={creatingShipment}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={creatingShipment}
                            >
                                {creatingShipment
                                    ? "Creating..."
                                    : "Create Shipment"}
                            </button>

                        </div>

                    </form>

                </div>

            </div>
        );
    };

    // =========================================================
    // PAGE CONTENT
    // =========================================================

    const renderPage = () => {

        switch (activePage) {

            case "warehouses":
                return renderWarehouses();

            case "allocations":
                return renderAllocations();

            case "shipments":
                return renderShipments();

            default:
                return renderDashboard();
        }
    };

    // =========================================================
    // MAIN UI
    // =========================================================

    return (

        <div className="warehouse-layout">

            <aside className="warehouse-sidebar">

                <div className="warehouse-logo">
                    ShopStack
                </div>

                <div className="warehouse-role">
                    Warehouse Staff
                </div>

                <button
                    className={
                        activePage === "dashboard"
                            ? "active"
                            : ""
                    }
                    onClick={openDashboard}
                >
                    Dashboard
                </button>

                <button
                    className={
                        activePage === "warehouses"
                            ? "active"
                            : ""
                    }
                    onClick={openWarehouses}
                >
                    Warehouses
                </button>

                <button
                    className={
                        activePage === "allocations"
                            ? "active"
                            : ""
                    }
                    onClick={openAllocations}
                >
                    Allocations
                </button>

                <button
                    className={
                        activePage === "shipments"
                            ? "active"
                            : ""
                    }
                    onClick={openShipments}
                >
                    Shipments
                </button>

                <div className="warehouse-sidebar-bottom">

                    <button
                        className="logout-button"
                        onClick={logout}
                    >
                        Logout
                    </button>

                </div>

            </aside>

            <main className="warehouse-main">

                {renderPage()}

            </main>

            {renderWarehouseModal()}

            {renderAllocationModal()}

            {renderShipmentModal()}

        </div>
    );
}

export default WarehouseDashboard;