import { useEffect, useState } from "react";
import api from "../../services/api";
import AdminLayout from "./AdminLayout";
import "./AdminOrderMonitoring.css";

function AdminOrderMonitoring() {

    const [orders, setOrders] = useState([]);

    useEffect(() => {

        const loadOrders = async () => {

            try {

                const response = await api.get("/admin/orders");

                console.log("ADMIN ORDERS:", response.data);

                setOrders(response.data);

            } catch (error) {

                console.log("ADMIN ORDERS ERROR:", error);

            }
        };

        loadOrders();

    }, []);

    return (

        <AdminLayout>

            <div className="admin-orders-page">

                <div className="admin-orders-header">

                    <div>
                        <h1>Order Monitoring</h1>

                        <p>
                            Monitor all marketplace orders and their current status
                        </p>
                    </div>

                    <div className="admin-order-count">
                        {orders.length} Orders
                    </div>

                </div>


                <div className="admin-orders-card">

                    <div className="admin-orders-table-header">

                        <span>Order ID</span>
                        <span>Customer</span>
                        <span>Order Date</span>
                        <span>Amount</span>
                        <span>Payment</span>
                        <span>Status</span>

                    </div>


                    {orders.map((order) => (

                        <div
                            className="admin-order-row"
                            key={order.id}
                        >

                            <strong>
                                #{order.id}
                            </strong>

                            <span>
                                Customer #{order.customerId}
                            </span>

                            <span>
                                {order.orderDate
                                    ? new Date(order.orderDate).toLocaleDateString()
                                    : "N/A"}
                            </span>

                            <span>
                                ₹{order.totalAmount}
                            </span>

                            <span className="admin-payment-status">
                                {order.paymentStatus || "N/A"}
                            </span>

                            <span className="admin-order-status">
                                {order.status || "N/A"}
                            </span>

                        </div>

                    ))}


                    {orders.length === 0 && (

                        <div className="admin-orders-empty">
                            No orders found.
                        </div>

                    )}

                </div>

            </div>

        </AdminLayout>
    );
}

export default AdminOrderMonitoring;