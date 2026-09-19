import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import AdminLayout from "./AdminLayout";
import "./AdminShipmentDetails.css";

function AdminShipmentDetails() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [shipment, setShipment] = useState(null);

    const [loading, setLoading] = useState(true);


    useEffect(() => {

        const loadShipment = async () => {

            try {

                const response = await api.get("/shipping");

                const foundShipment =
                    response.data.find(
                        item => String(item.id) === String(id)
                    );

                setShipment(foundShipment);

            } catch (error) {

                console.log(
                    "SHIPMENT DETAILS ERROR:",
                    error
                );

            } finally {

                setLoading(false);

            }
        };

        loadShipment();

    }, [id]);


    const updateStatus = async (status) => {

        try {

            const response = await api.put(
                `/shipping/${id}/status`,
                null,
                {
                    params: {
                        status: status
                    }
                }
            );

            setShipment(response.data);

        } catch (error) {

            console.log(
                "SHIPMENT STATUS ERROR:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Unable to update shipment"
            );
        }
    };


    if (loading) {

        return (

            <AdminLayout>

                <div className="shipment-details-loading">
                    Loading shipment details...
                </div>

            </AdminLayout>
        );
    }


    if (!shipment) {

        return (

            <AdminLayout>

                <div className="shipment-details-loading">

                    Shipment not found.

                    <br />

                    <button
                        onClick={() =>
                            navigate("/admin/shipments")
                        }
                    >
                        Back to Shipments
                    </button>

                </div>

            </AdminLayout>
        );
    }


    return (

        <AdminLayout>

            <div className="admin-shipment-details-page">

                <div className="shipment-details-header">

                    <div>

                        <h1>Shipment Details</h1>

                        <p>
                            Monitor shipment and delivery progress
                        </p>

                    </div>

                    <button
                        className="shipment-back-button"
                        onClick={() =>
                            navigate("/admin/shipments")
                        }
                    >
                        Back to Shipments
                    </button>

                </div>


                <div className="shipment-details-card">

                    <div className="shipment-details-title">

                        <div>

                            <h2>
                                Shipment #{shipment.id}
                            </h2>

                            <p>
                                Order #{shipment.orderId}
                            </p>

                        </div>

                        <span className="shipment-detail-status">

                            {shipment.status}

                        </span>

                    </div>


                    <div className="shipment-information">

                        <div className="shipment-info-item">

                            <label>Shipment ID</label>

                            <p>
                                #{shipment.id}
                            </p>

                        </div>


                        <div className="shipment-info-item">

                            <label>Order ID</label>

                            <p>
                                #{shipment.orderId}
                            </p>

                        </div>


                        <div className="shipment-info-item">

                            <label>Courier</label>

                            <p>
                                {shipment.courierName || "Not assigned"}
                            </p>

                        </div>


                        <div className="shipment-info-item">

                            <label>Tracking Number</label>

                            <p>
                                {shipment.trackingNumber ||
                                    "Not generated"}
                            </p>

                        </div>


                        <div className="shipment-info-item">

                            <label>Created At</label>

                            <p>
                                {shipment.createdAt
                                    ? new Date(
                                        shipment.createdAt
                                    ).toLocaleString()
                                    : "N/A"}
                            </p>

                        </div>


                        <div className="shipment-info-item">

                            <label>Updated At</label>

                            <p>
                                {shipment.updatedAt
                                    ? new Date(
                                        shipment.updatedAt
                                    ).toLocaleString()
                                    : "N/A"}
                            </p>

                        </div>

                    </div>

                </div>


                <div className="shipment-details-card">

                    <h2>Update Shipment Status</h2>

                    <p className="shipment-description">

                        Update the shipment as it moves through
                        the delivery process.

                    </p>


                    <div className="shipment-status-actions">

                        <button
                            onClick={() =>
                                updateStatus("CREATED")
                            }
                        >
                            Created
                        </button>

                        <button
                            onClick={() =>
                                updateStatus("PICKED_UP")
                            }
                        >
                            Picked Up
                        </button>

                        <button
                            onClick={() =>
                                updateStatus("IN_TRANSIT")
                            }
                        >
                            In Transit
                        </button>

                        <button
                            onClick={() =>
                                updateStatus("OUT_FOR_DELIVERY")
                            }
                        >
                            Out for Delivery
                        </button>

                        <button
                            className="delivered-button"
                            onClick={() =>
                                updateStatus("DELIVERED")
                            }
                        >
                            Delivered
                        </button>

                    </div>

                </div>


                <div className="shipment-details-card">

                    <h2>Tracking Progress</h2>

                    <div className="shipment-timeline">

                        <div className="timeline-item completed">

                            <div className="timeline-dot"></div>

                            <div>
                                <strong>Shipment Created</strong>
                                <p>
                                    Shipment has been created for the order.
                                </p>
                            </div>

                        </div>


                        <div className={
                            `timeline-item ${
                                ["PICKED_UP",
                                    "IN_TRANSIT",
                                    "OUT_FOR_DELIVERY",
                                    "DELIVERED"]
                                    .includes(shipment.status)
                                    ? "completed"
                                    : ""
                            }`
                        }>

                            <div className="timeline-dot"></div>

                            <div>
                                <strong>Picked Up</strong>
                                <p>
                                    Courier has collected the package.
                                </p>
                            </div>

                        </div>


                        <div className={
                            `timeline-item ${
                                ["IN_TRANSIT",
                                    "OUT_FOR_DELIVERY",
                                    "DELIVERED"]
                                    .includes(shipment.status)
                                    ? "completed"
                                    : ""
                            }`
                        }>

                            <div className="timeline-dot"></div>

                            <div>
                                <strong>In Transit</strong>
                                <p>
                                    Package is moving toward the destination.
                                </p>
                            </div>

                        </div>


                        <div className={
                            `timeline-item ${
                                ["OUT_FOR_DELIVERY",
                                    "DELIVERED"]
                                    .includes(shipment.status)
                                    ? "completed"
                                    : ""
                            }`
                        }>

                            <div className="timeline-dot"></div>

                            <div>
                                <strong>Out for Delivery</strong>
                                <p>
                                    Package is with the delivery agent.
                                </p>
                            </div>

                        </div>


                        <div className={
                            `timeline-item ${
                                shipment.status === "DELIVERED"
                                    ? "completed"
                                    : ""
                            }`
                        }>

                            <div className="timeline-dot"></div>

                            <div>
                                <strong>Delivered</strong>
                                <p>
                                    Package delivered successfully.
                                </p>
                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </AdminLayout>
    );
}

export default AdminShipmentDetails;