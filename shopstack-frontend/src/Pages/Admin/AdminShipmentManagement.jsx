
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import AdminLayout from "./AdminLayout";
import "./AdminShipmentManagement.css";

function AdminShipmentManagement() {

    const [shipments, setShipments] = useState([]);
    const [allocations, setAllocations] = useState([]);

    const [loading, setLoading] = useState(true);
    const [creatingShipment, setCreatingShipment] = useState(null);

    const [courierNames, setCourierNames] = useState({});

    const navigate = useNavigate();


    // =========================================================
    // LOAD SHIPMENTS + WAREHOUSE ALLOCATIONS
    // =========================================================

    const loadData = async () => {

        try {

            setLoading(true);

            const [shipmentResponse, allocationResponse] =
                await Promise.all([
                    api.get("/shipping"),
                    api.get("/warehouse/allocations")
                ]);

            console.log("SHIPMENTS:", shipmentResponse.data);
            console.log("WAREHOUSE ALLOCATIONS:", allocationResponse.data);

            setShipments(
                Array.isArray(shipmentResponse.data)
                    ? shipmentResponse.data
                    : []
            );

            setAllocations(
                Array.isArray(allocationResponse.data)
                    ? allocationResponse.data
                    : []
            );

        } catch (error) {

            console.log("SHIPMENT MANAGEMENT ERROR:", error);

            setShipments([]);
            setAllocations([]);

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        loadData();

    }, []);


    // =========================================================
    // COURIER INPUT
    // =========================================================

    const handleCourierChange = (orderId, value) => {

        setCourierNames(prev => ({
            ...prev,
            [orderId]: value
        }));

    };


    // =========================================================
    // CREATE SHIPMENT
    // =========================================================

    const createShipment = async (orderId) => {

        const courierName =
            courierNames[orderId]?.trim();

        if (!courierName) {

            alert("Please enter courier name.");

            return;
        }


        try {

            setCreatingShipment(orderId);

            const response = await api.post(
                "/shipping/create",
                null,
                {
                    params: {
                        orderId: orderId,
                        courierName: courierName
                    }
                }
            );

            console.log(
                "SHIPMENT CREATED:",
                response.data
            );

            alert(
                `Shipment created successfully for Order #${orderId}`
            );

            setCourierNames(prev => ({
                ...prev,
                [orderId]: ""
            }));

            await loadData();

        } catch (error) {

            console.log(
                "CREATE SHIPMENT ERROR:",
                error
            );

            alert(
                error.response?.data?.message ||
                error.response?.data ||
                "Unable to create shipment"
            );

        } finally {

            setCreatingShipment(null);

        }
    };


    // =========================================================
    // UPDATE SHIPMENT STATUS
    // =========================================================

    const updateStatus = async (
        shipmentId,
        status
    ) => {

        try {

            await api.put(
                `/shipping/${shipmentId}/status`,
                null,
                {
                    params: {
                        status: status
                    }
                }
            );

            await loadData();

        } catch (error) {

            console.log(
                "UPDATE SHIPMENT STATUS ERROR:",
                error
            );

            alert(
                error.response?.data?.message ||
                error.response?.data ||
                "Unable to update shipment status"
            );
        }
    };


    // =========================================================
    // STATUS CLASS
    // =========================================================

    const getStatusClass = status => {

        if (!status) {
            return "shipment-status";
        }

        return `shipment-status ${String(status).toLowerCase()}`;
    };


    // =========================================================
    // GET ORDER FROM ALLOCATION
    // =========================================================

    const getOrder = allocation => {

        return allocation.order || {};

    };


    // =========================================================
    // CHECK WHETHER SHIPMENT ALREADY EXISTS
    // =========================================================

    const hasShipment = orderId => {

        return shipments.some(
            shipment =>
                Number(shipment.orderId) === Number(orderId)
        );

    };


    // =========================================================
    // GET PACKED ORDERS
    // =========================================================

    const packedAllocations =
        allocations.filter(
            allocation =>
                String(allocation.status || "")
                    .toUpperCase() === "PACKED"
        );


    // =========================================================
    // PAGE
    // =========================================================

    return (

        <AdminLayout>

            <div className="admin-shipment-page">


                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="admin-shipment-header">

                    <div>

                        <h1>
                            Shipment Management
                        </h1>

                        <p>
                            Create shipments for packed orders
                            and monitor delivery progress
                        </p>

                    </div>

                    <div className="admin-shipment-count">
                        {shipments.length} Shipments
                    </div>

                </div>


                {/* =================================================
                    PACKED ORDERS
                ================================================= */}

                <div className="shipment-section">

                    <div className="shipment-section-header">

                        <div>

                            <h2>
                                Ready for Shipment
                            </h2>

                            <p>
                                Orders packed by warehouse staff
                            </p>

                        </div>

                        <span className="shipment-ready-count">
                            {packedAllocations.length} Ready
                        </span>

                    </div>


                    <div className="packed-orders-card">


                        {loading && (

                            <div className="admin-shipment-empty">
                                Loading warehouse orders...
                            </div>

                        )}


                        {!loading &&
                            packedAllocations.length === 0 && (

                                <div className="admin-shipment-empty">

                                    No packed orders are ready
                                    for shipment.

                                </div>

                            )}


                        {!loading &&
                            packedAllocations.map(
                                allocation => {

                                    const order =
                                        getOrder(allocation);

                                    const orderId =
                                        order.id ||
                                        allocation.order?.id;

                                    const alreadyCreated =
                                        hasShipment(orderId);

                                    return (

                                        <div
                                            className="packed-order-row"
                                            key={allocation.id}
                                        >

                                            {/* ORDER */}

                                            <div>

                                                <span className="shipment-label">
                                                    ORDER
                                                </span>

                                                <strong>
                                                    #{orderId}
                                                </strong>

                                            </div>


                                            {/* CUSTOMER */}

                                            <div>

                                                <span className="shipment-label">
                                                    CUSTOMER
                                                </span>

                                                <strong>
                                                    #{order.customerId}
                                                </strong>

                                            </div>


                                            {/* AMOUNT */}

                                            <div>

                                                <span className="shipment-label">
                                                    AMOUNT
                                                </span>

                                                <strong>
                                                    ₹
                                                    {Number(
                                                        order.totalAmount || 0
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </strong>

                                            </div>


                                            {/* WAREHOUSE */}

                                            <div>

                                                <span className="shipment-label">
                                                    WAREHOUSE
                                                </span>

                                                <strong>

                                                    {allocation.warehouse?.warehouseName ||
                                                        allocation.warehouse?.name ||
                                                        "Warehouse"}

                                                </strong>

                                            </div>


                                            {/* STATUS */}

                                            <div>

                                                <span className="shipment-label">
                                                    STATUS
                                                </span>

                                                <span className="packed-status">
                                                    PACKED
                                                </span>

                                            </div>


                                            {/* COURIER */}

                                            {!alreadyCreated && (

                                                <div className="courier-create-area">

                                                    <input
                                                        type="text"
                                                        placeholder="Courier name"
                                                        value={
                                                            courierNames[
                                                                orderId
                                                            ] || ""
                                                        }
                                                        onChange={e =>
                                                            handleCourierChange(
                                                                orderId,
                                                                e.target.value
                                                            )
                                                        }
                                                    />

                                                    <button
                                                        className="create-shipment-button"
                                                        disabled={
                                                            creatingShipment ===
                                                            orderId
                                                        }
                                                        onClick={() =>
                                                            createShipment(
                                                                orderId
                                                            )
                                                        }
                                                    >

                                                        {creatingShipment ===
                                                        orderId
                                                            ? "Creating..."
                                                            : "Create Shipment"}

                                                    </button>

                                                </div>

                                            )}


                                            {alreadyCreated && (

                                                <span className="shipment-created-label">
                                                    Shipment Created
                                                </span>

                                            )}

                                        </div>

                                    );

                                }
                            )}

                    </div>

                </div>


                {/* =================================================
                    SHIPMENTS
                ================================================= */}

                <div className="shipment-section">

                    <div className="shipment-section-header">

                        <div>

                            <h2>
                                Shipments
                            </h2>

                            <p>
                                Track all created shipments
                            </p>

                        </div>

                        <span className="shipment-ready-count">
                            {shipments.length} Shipments
                        </span>

                    </div>


                    <div className="admin-shipment-card">


                        <div className="admin-shipment-table-header">

                            <span>
                                Shipment
                            </span>

                            <span>
                                Order
                            </span>

                            <span>
                                Courier
                            </span>

                            <span>
                                Tracking
                            </span>

                            <span>
                                Status
                            </span>

                            <span>
                                Action
                            </span>

                        </div>


                        {loading && (

                            <div className="admin-shipment-empty">
                                Loading shipments...
                            </div>

                        )}


                        {!loading &&
                            shipments.map(
                                shipment => (

                                    <div
                                        className="admin-shipment-row"
                                        key={shipment.id}
                                    >


                                        {/* SHIPMENT */}

                                        <div className="shipment-main">

                                            <strong>
                                                #{shipment.id}
                                            </strong>

                                            <small>
                                                Shipment ID
                                            </small>

                                        </div>


                                        {/* ORDER */}

                                        <div>

                                            <strong>
                                                #{shipment.orderId}
                                            </strong>

                                        </div>


                                        {/* COURIER */}

                                        <span>
                                            {shipment.courierName ||
                                                "Not assigned"}
                                        </span>


                                        {/* TRACKING */}

                                        <span className="tracking-number">

                                            {shipment.trackingNumber ||
                                                "Not generated"}

                                        </span>


                                        {/* STATUS */}

                                        <span
                                            className={
                                                getStatusClass(
                                                    shipment.status
                                                )
                                            }
                                        >

                                            {shipment.status ||
                                                "CREATED"}

                                        </span>


                                        {/* ACTIONS */}

                                        <div className="shipment-actions">


                                            <button
                                                className="shipment-view-button"
                                                onClick={() =>
                                                    navigate(
                                                        `/admin/shipments/${shipment.id}`
                                                    )
                                                }
                                            >
                                                View
                                            </button>


                                            {shipment.status ===
                                                "CREATED" && (

                                                <button
                                                    className="shipment-action-button"
                                                    onClick={() =>
                                                        updateStatus(
                                                            shipment.id,
                                                            "PICKED_UP"
                                                        )
                                                    }
                                                >
                                                    Pick Up
                                                </button>

                                            )}


                                            {shipment.status ===
                                                "PICKED_UP" && (

                                                <button
                                                    className="shipment-action-button"
                                                    onClick={() =>
                                                        updateStatus(
                                                            shipment.id,
                                                            "IN_TRANSIT"
                                                        )
                                                    }
                                                >
                                                    In Transit
                                                </button>

                                            )}


                                            {shipment.status ===
                                                "IN_TRANSIT" && (

                                                <button
                                                    className="shipment-action-button"
                                                    onClick={() =>
                                                        updateStatus(
                                                            shipment.id,
                                                            "OUT_FOR_DELIVERY"
                                                        )
                                                    }
                                                >
                                                    Out for Delivery
                                                </button>

                                            )}


                                            {shipment.status ===
                                                "OUT_FOR_DELIVERY" && (

                                                <button
                                                    className="shipment-action-button delivered"
                                                    onClick={() =>
                                                        updateStatus(
                                                            shipment.id,
                                                            "DELIVERED"
                                                        )
                                                    }
                                                >
                                                    Delivered
                                                </button>

                                            )}

                                        </div>

                                    </div>

                                )
                            )}


                        {!loading &&
                            shipments.length === 0 && (

                                <div className="admin-shipment-empty">

                                    No shipments found.

                                </div>

                            )}

                    </div>

                </div>

            </div>

        </AdminLayout>
    );
}

export default AdminShipmentManagement;

