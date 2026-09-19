
import { useEffect, useState } from "react";
import api from "../../services/api";
import AdminLayout from "./AdminLayout";
import "./AdminShipping.css";

function AdminShipping() {

    const [shipments, setShipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    const statuses = [
        "CREATED",
        "PICKED_UP",
        "IN_TRANSIT",
        "OUT_FOR_DELIVERY",
        "DELIVERED"
    ];

    useEffect(() => {
        loadShipments();
    }, []);

    const loadShipments = async () => {
        try {
            const response = await api.get("/shipping");

            console.log("SHIPMENTS:", response.data);

            setShipments(response.data);
        } catch (error) {
            console.log("SHIPPING ERROR:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (shipmentId, status) => {

        try {

            setUpdatingId(shipmentId);

            const response = await api.put(
                `/shipping/${shipmentId}/status`,
                null,
                {
                    params: {
                        status: status
                    }
                }
            );

            setShipments((previous) =>
                previous.map((shipment) =>
                    shipment.id === shipmentId
                        ? response.data
                        : shipment
                )
            );

        } catch (error) {

            console.log("STATUS UPDATE ERROR:", error);

            alert(
                error.response?.data?.message ||
                "Unable to update shipment status"
            );

        } finally {

            setUpdatingId(null);
        }
    };

    const getStatusClass = (status) => {

        if (!status) return "status-created";

        switch (status) {

            case "CREATED":
                return "status-created";

            case "PICKED_UP":
                return "status-picked";

            case "IN_TRANSIT":
                return "status-transit";

            case "OUT_FOR_DELIVERY":
                return "status-out";

            case "DELIVERED":
                return "status-delivered";

            default:
                return "status-created";
        }
    };

    return (

        <AdminLayout>

            <div className="admin-shipping-page">

                <div className="admin-shipping-header">

                    <div>
                        <h1>Shipping & Tracking</h1>

                        <p>
                            Manage shipments and monitor delivery progress
                        </p>
                    </div>

                    <div className="admin-shipping-count">
                        {shipments.length} Shipments
                    </div>

                </div>


                <div className="admin-shipping-card">

                    <div className="admin-shipping-table-header">

                        <span>Shipment</span>
                        <span>Order</span>
                        <span>Courier</span>
                        <span>Tracking</span>
                        <span>Status</span>
                        <span>Update</span>

                    </div>


                    {loading ? (

                        <div className="admin-shipping-empty">
                            Loading shipments...
                        </div>

                    ) : shipments.length === 0 ? (

                        <div className="admin-shipping-empty">
                            No shipments found.
                        </div>

                    ) : (

                        shipments.map((shipment) => (

                            <div
                                className="admin-shipping-row"
                                key={shipment.id}
                            >

                                <div className="shipment-id">

                                    <strong>
                                        #{shipment.id}
                                    </strong>

                                    <small>
                                        Shipment
                                    </small>

                                </div>


                                <span>
                                    Order #{shipment.orderId}
                                </span>


                                <span>
                                    {shipment.courierName || "N/A"}
                                </span>


                                <span className="tracking-number">
                                    {shipment.trackingNumber || "Not assigned"}
                                </span>


                                <span
                                    className={`shipment-status ${getStatusClass(
                                        shipment.status
                                    )}`}
                                >
                                    {shipment.status || "CREATED"}
                                </span>


                                <select
                                    value={shipment.status || "CREATED"}
                                    disabled={updatingId === shipment.id}
                                    onChange={(e) =>
                                        updateStatus(
                                            shipment.id,
                                            e.target.value
                                        )
                                    }
                                    className="shipment-status-select"
                                >

                                    {statuses.map((status) => (

                                        <option
                                            key={status}
                                            value={status}
                                        >
                                            {status.replaceAll("_", " ")}
                                        </option>

                                    ))}

                                </select>

                            </div>

                        ))

                    )}

                </div>

            </div>

        </AdminLayout>
    );
}

export default AdminShipping;

