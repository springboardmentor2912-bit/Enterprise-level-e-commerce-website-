
import { useEffect, useState } from "react";
import api from "../../services/api";
import AdminLayout from "./AdminLayout";
import "./AdminWarehouseManagement.css";

function AdminWarehouseManagement() {

    const [warehouses, setWarehouses] = useState([]);
    const [orders, setOrders] = useState([]);
    const [allocations, setAllocations] = useState([]);

    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const [warehouseForm, setWarehouseForm] = useState({
        warehouseName: "",
        location: "",
        capacity: ""
    });

    // =====================================================
    // LOAD DATA
    // =====================================================

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {

        try {

            setLoading(true);

            const [
                warehouseResponse,
                orderResponse,
                allocationResponse
            ] = await Promise.all([

                api.get("/warehouse"),

                api.get("/admin/orders"),

                api.get("/warehouse/allocations")
            ]);

            console.log("WAREHOUSES:", warehouseResponse.data);
            console.log("ORDERS:", orderResponse.data);
            console.log("ALLOCATIONS:", allocationResponse.data);

            setWarehouses(
                Array.isArray(warehouseResponse.data)
                    ? warehouseResponse.data
                    : []
            );

            setOrders(
                Array.isArray(orderResponse.data)
                    ? orderResponse.data
                    : []
            );

            setAllocations(
                Array.isArray(allocationResponse.data)
                    ? allocationResponse.data
                    : []
            );

        } catch (error) {

            console.error(
                "WAREHOUSE MANAGEMENT ERROR:",
                error
            );

        } finally {

            setLoading(false);
        }
    };


    // =====================================================
    // FORM INPUT
    // =====================================================

    const handleInputChange = (e) => {

        setWarehouseForm({
            ...warehouseForm,
            [e.target.name]: e.target.value
        });
    };


    // =====================================================
    // CREATE WAREHOUSE
    // =====================================================

    const createWarehouse = async (e) => {

        e.preventDefault();

        try {

            const warehouseData = {

                warehouseName:
                    warehouseForm.warehouseName,

                location:
                    warehouseForm.location,

                capacity:
                    Number(warehouseForm.capacity),

                currentStock: 0
            };

            console.log(
                "CREATING WAREHOUSE:",
                warehouseData
            );

            await api.post(
                "/warehouse",
                warehouseData
            );

            alert(
                "Warehouse created successfully."
            );

            setWarehouseForm({
                warehouseName: "",
                location: "",
                capacity: ""
            });

            setShowForm(false);

            await loadData();

        } catch (error) {

            console.error(
                "CREATE WAREHOUSE ERROR:",
                error
            );

            alert(
                error.response?.data ||
                "Unable to create warehouse."
            );
        }
    };


    // =====================================================
    // FIND ALLOCATION FOR ORDER
    // =====================================================

    const getAllocation = (orderId) => {

        return allocations.find(
            allocation =>
                allocation.order?.id === orderId ||
                allocation.orderId === orderId
        );
    };


    // =====================================================
    // ALLOCATE ORDER
    // =====================================================

    const allocateOrder = async (
        orderId,
        warehouseId
    ) => {

        if (!warehouseId) {
            return;
        }

        try {

            console.log(
                "ALLOCATING ORDER:",
                orderId,
                "WAREHOUSE:",
                warehouseId
            );

            await api.post(
                "/warehouse/allocate",
                null,
                {
                    params: {
                        orderId: orderId,
                        warehouseId: warehouseId
                    }
                }
            );

            alert(
                "Order allocated to warehouse."
            );

            await loadData();

        } catch (error) {

            console.error(
                "WAREHOUSE ALLOCATION ERROR:",
                error
            );

            alert(
                error.response?.data ||
                "Unable to allocate order."
            );
        }
    };


    // =====================================================
    // UPDATE WAREHOUSE STATUS
    // =====================================================

    const updateWarehouseStatus = async (
        allocationId,
        status
    ) => {

        try {

            console.log(
                "UPDATING ALLOCATION:",
                allocationId,
                status
            );

            await api.put(
                `/warehouse/allocations/${allocationId}/status`,
                null,
                {
                    params: {
                        status: status
                    }
                }
            );

            alert(
                `Order marked as ${status}.`
            );

            await loadData();

        } catch (error) {

            console.error(
                "WAREHOUSE STATUS ERROR:",
                error
            );

            alert(
                error.response?.data ||
                "Unable to update warehouse status."
            );
        }
    };


    // =====================================================
    // GET WAREHOUSE STATUS
    // =====================================================

    const getWarehouseStatus = (order) => {

        const allocation =
            getAllocation(order.id);

        if (!allocation) {
            return "NOT_ALLOCATED";
        }

        return (
            allocation.status ||
            "ALLOCATED"
        ).toUpperCase();
    };


    // =====================================================
    // GET WAREHOUSE NAME
    // =====================================================

    const getWarehouseName = (order) => {

        const allocation =
            getAllocation(order.id);

        if (!allocation) {
            return "Not Assigned";
        }

        return (
            allocation.warehouse?.warehouseName ||
            allocation.warehouseName ||
            "Assigned"
        );
    };


    // =====================================================
    // ORDERS FOR WAREHOUSE
    // =====================================================

    const warehouseOrders =
        orders.filter(order =>
            [
                "CONFIRMED",
                "PROCESSING",
                "SHIPPED"
            ].includes(
                String(order.status || "").toUpperCase()
            )
        );


    // =====================================================
    // STATISTICS
    // =====================================================

    const totalWarehouses =
        warehouses.length;

    const totalOrders =
        warehouseOrders.length;

    const pendingOrders =
        warehouseOrders.filter(order =>
            getWarehouseStatus(order) ===
            "NOT_ALLOCATED"
        ).length;

    const packedOrders =
        warehouseOrders.filter(order =>
            getWarehouseStatus(order) ===
            "PACKED"
        ).length;


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <AdminLayout>

                <div className="warehouse-loading">
                    Loading warehouse management...
                </div>

            </AdminLayout>
        );
    }


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <AdminLayout>

            <div className="admin-warehouse-page">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="admin-warehouse-header">

                    <div>

                        <h1>
                            Warehouse Management
                        </h1>

                        <p>
                            Manage warehouses and prepare
                            confirmed orders for shipment
                        </p>

                    </div>

                    <button
                        className="create-warehouse-button"
                        onClick={() =>
                            setShowForm(!showForm)
                        }
                    >
                        + Add Warehouse
                    </button>

                </div>


                {/* =================================================
                    CREATE WAREHOUSE FORM
                ================================================= */}

                {showForm && (

                    <div className="warehouse-form-card">

                        <h2>
                            Add New Warehouse
                        </h2>

                        <form
                            onSubmit={
                                createWarehouse
                            }
                        >

                            <div className="warehouse-form-grid">

                                <div>

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
                                            handleInputChange
                                        }
                                        placeholder="Enter warehouse name"
                                        required
                                    />

                                </div>


                                <div>

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
                                            handleInputChange
                                        }
                                        placeholder="Enter location"
                                        required
                                    />

                                </div>


                                <div>

                                    <label>
                                        Capacity
                                    </label>

                                    <input
                                        type="number"
                                        name="capacity"
                                        value={
                                            warehouseForm.capacity
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        placeholder="Enter capacity"
                                        min="1"
                                        required
                                    />

                                </div>

                            </div>


                            <div className="warehouse-form-actions">

                                <button
                                    type="submit"
                                    className="save-warehouse-button"
                                >
                                    Create Warehouse
                                </button>

                                <button
                                    type="button"
                                    className="cancel-warehouse-button"
                                    onClick={() =>
                                        setShowForm(false)
                                    }
                                >
                                    Cancel
                                </button>

                            </div>

                        </form>

                    </div>

                )}


                {/* =================================================
                    STATISTICS
                ================================================= */}

                <div className="warehouse-statistics">

                    <div className="warehouse-stat-card">

                        <h3>
                            Total Warehouses
                        </h3>

                        <p>
                            {totalWarehouses}
                        </p>

                    </div>


                    <div className="warehouse-stat-card">

                        <h3>
                            Total Orders
                        </h3>

                        <p>
                            {totalOrders}
                        </p>

                    </div>


                    <div className="warehouse-stat-card">

                        <h3>
                            Pending Orders
                        </h3>

                        <p>
                            {pendingOrders}
                        </p>

                    </div>


                    <div className="warehouse-stat-card">

                        <h3>
                            Packed Orders
                        </h3>

                        <p>
                            {packedOrders}
                        </p>

                    </div>

                </div>


                {/* =================================================
                    WAREHOUSES
                ================================================= */}

                <div className="warehouse-section">

                    <div className="warehouse-section-header">

                        <div>

                            <h2>
                                Warehouses
                            </h2>

                            <p>
                                Available fulfillment locations
                            </p>

                        </div>

                    </div>


                    {warehouses.length === 0 ? (

                        <div className="warehouse-empty">
                            No warehouses found.
                        </div>

                    ) : (

                        <div className="warehouse-cards">

                            {warehouses.map(
                                warehouse => (

                                    <div
                                        className="warehouse-card"
                                        key={
                                            warehouse.id
                                        }
                                    >

                                        <div className="warehouse-card-top">

                                            <div>

                                                <h3>
                                                    {
                                                        warehouse.warehouseName
                                                    }
                                                </h3>

                                                <p>
                                                    {
                                                        warehouse.location ||
                                                        "Location not provided"
                                                    }
                                                </p>

                                            </div>

                                            <span className="warehouse-active">
                                                ACTIVE
                                            </span>

                                        </div>


                                        <div className="warehouse-card-info">

                                            <div>

                                                <span>
                                                    Capacity
                                                </span>

                                                <strong>
                                                    {
                                                        warehouse.capacity ??
                                                        "N/A"
                                                    }
                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    Current Stock
                                                </span>

                                                <strong>
                                                    {
                                                        warehouse.currentStock ??
                                                        0
                                                    }
                                                </strong>

                                            </div>


                                            <div>

                                                <span>
                                                    ID
                                                </span>

                                                <strong>
                                                    #{warehouse.id}
                                                </strong>

                                            </div>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </div>


                {/* =================================================
                    WAREHOUSE ORDERS
                ================================================= */}

                <div className="warehouse-section">

                    <div className="warehouse-section-header">

                        <div>

                            <h2>
                                Warehouse Orders
                            </h2>

                            <p>
                                Allocate, pick and pack confirmed orders
                            </p>

                        </div>

                        <span className="warehouse-order-count">
                            {warehouseOrders.length} Orders
                        </span>

                    </div>


                    <div className="warehouse-orders-card">

                        <div className="warehouse-orders-header">

                            <span>
                                Order
                            </span>

                            <span>
                                Customer
                            </span>

                            <span>
                                Amount
                            </span>

                            <span>
                                Warehouse
                            </span>

                            <span>
                                Status
                            </span>

                            <span>
                                Action
                            </span>

                        </div>


                        {warehouseOrders.map(order => {

                            const allocation =
                                getAllocation(
                                    order.id
                                );

                            const warehouseStatus =
                                getWarehouseStatus(
                                    order
                                );

                            return (

                                <div
                                    className="warehouse-order-row"
                                    key={order.id}
                                >

                                    <strong>
                                        #{order.id}
                                    </strong>


                                    <span>
                                        Customer #
                                        {order.customerId}
                                    </span>


                                    <span>
                                        ₹
                                        {Number(
                                            order.totalAmount
                                        ).toLocaleString(
                                            "en-IN"
                                        )}
                                    </span>


                                    {/* WAREHOUSE */}

                                    <div className="warehouse-assignment">

                                        <select
                                            value={
                                                allocation?.warehouse?.id ||
                                                allocation?.warehouseId ||
                                                ""
                                            }
                                            disabled={
                                                warehouseStatus !==
                                                "NOT_ALLOCATED"
                                            }
                                            onChange={e =>
                                                allocateOrder(
                                                    order.id,
                                                    e.target.value
                                                )
                                            }
                                        >

                                            <option value="">
                                                Select Warehouse
                                            </option>

                                            {warehouses.map(
                                                warehouse => (

                                                    <option
                                                        key={
                                                            warehouse.id
                                                        }
                                                        value={
                                                            warehouse.id
                                                        }
                                                    >
                                                        {
                                                            warehouse.warehouseName
                                                        }
                                                    </option>

                                                )
                                            )}

                                        </select>

                                        <small>
                                            {getWarehouseName(
                                                order
                                            )}
                                        </small>

                                    </div>


                                    {/* STATUS */}

                                    <span
                                        className={
                                            `warehouse-order-status ${
                                                warehouseStatus
                                                    .toLowerCase()
                                                    .replaceAll(
                                                        "_",
                                                        "-"
                                                    )
                                            }`
                                        }
                                    >
                                        {
                                            warehouseStatus
                                        }
                                    </span>


                                    {/* ACTIONS */}

                                    <div className="warehouse-actions">

                                        {!allocation && (

                                            <span className="ready-label">
                                                Allocate Warehouse
                                            </span>

                                        )}


                                        {warehouseStatus ===
                                            "ALLOCATED" && (

                                            <button
                                                className="pick-button"
                                                onClick={() =>
                                                    updateWarehouseStatus(
                                                        allocation.id,
                                                        "PICKED"
                                                    )
                                                }
                                            >
                                                Pick
                                            </button>

                                        )}


                                        {warehouseStatus ===
                                            "PICKED" && (

                                            <button
                                                className="pack-button"
                                                onClick={() =>
                                                    updateWarehouseStatus(
                                                        allocation.id,
                                                        "PACKED"
                                                    )
                                                }
                                            >
                                                Pack
                                            </button>

                                        )}


                                        {warehouseStatus ===
                                            "PACKED" && (

                                            <span className="ready-label">
                                                Ready for Shipment
                                            </span>

                                        )}

                                    </div>

                                </div>

                            );

                        })}


                        {warehouseOrders.length === 0 && (

                            <div className="warehouse-empty">

                                No confirmed orders available
                                for warehouse processing.

                            </div>

                        )}

                    </div>

                </div>

            </div>

        </AdminLayout>
    );
}

export default AdminWarehouseManagement;

