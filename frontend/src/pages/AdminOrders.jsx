import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

function AdminOrders() {

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    useEffect(() => {

        const fetchOrders = async () => {

            try {

                const token = localStorage.getItem("token");

                const response = await axios.get(
                    `${API_BASE_URL}/api/admin/orders`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                console.log("ADMIN ORDERS:", response.data);

                setOrders(response.data);

            } catch (error) {

                console.error("Error loading admin orders:", error);

                setError(
                    error.response?.data ||
                    "Unable to load orders."
                );

            } finally {

                setLoading(false);

            }

        };

        fetchOrders();

    }, []);


    // ------------------------------------------
    // LOADING
    // ------------------------------------------

    if (loading) {

        return (

            <div className="min-h-screen bg-gray-100 flex items-center justify-center">

                <h2 className="text-2xl font-semibold">
                    Loading Orders...
                </h2>

            </div>

        );

    }


    // ------------------------------------------
    // ERROR
    // ------------------------------------------

    if (error) {

        return (

            <div className="min-h-screen bg-gray-100 flex items-center justify-center">

                <div className="bg-white shadow-lg rounded-xl p-8">

                    <h2 className="text-2xl font-bold text-red-600">
                        {error}
                    </h2>

                </div>

            </div>

        );

    }


    return (

        <div className="min-h-screen bg-gray-100">


            {/* HEADER */}

            <div className="bg-blue-700 text-white py-8">

                <div className="max-w-7xl mx-auto px-6">

                    <h1 className="text-4xl font-bold">
                        Order Monitoring
                    </h1>

                    <p className="mt-2 text-blue-100">
                        Monitor all marketplace orders
                    </p>

                </div>

            </div>


            {/* CONTENT */}

            <div className="max-w-7xl mx-auto px-6 py-10">


                {/* SUMMARY */}

                <div className="bg-white rounded-xl shadow p-6 mb-8">

                    <p className="text-gray-500">
                        Total Orders
                    </p>

                    <h2 className="text-3xl font-bold text-blue-600 mt-2">
                        {orders.length}
                    </h2>

                </div>


                {/* NO ORDERS */}

                {orders.length === 0 ? (

                    <div className="bg-white rounded-xl shadow p-10 text-center">

                        <h2 className="text-2xl font-bold">
                            No Orders Found
                        </h2>

                        <p className="text-gray-500 mt-2">
                            There are currently no marketplace orders.
                        </p>

                    </div>

                ) : (

                    /* TABLE */

                    <div className="bg-white rounded-xl shadow overflow-hidden">

                        <div className="overflow-x-auto">

                            <table className="w-full">

                                <thead className="bg-gray-100">

                                <tr>

                                    <th className="px-6 py-4 text-left">
                                        Order ID
                                    </th>

                                    <th className="px-6 py-4 text-left">
                                        Customer
                                    </th>

                                    <th className="px-6 py-4 text-left">
                                        Email
                                    </th>

                                    <th className="px-6 py-4 text-left">
                                        Date
                                    </th>

                                    <th className="px-6 py-4 text-left">
                                        Amount
                                    </th>

                                    <th className="px-6 py-4 text-left">
                                        Status
                                    </th>

                                </tr>

                                </thead>


                                <tbody>

                                {orders.map((order) => (

                                    <tr
                                        key={order.orderId}
                                        className="border-t hover:bg-gray-50"
                                    >

                                        {/* ORDER ID */}

                                        <td className="px-6 py-4 font-semibold">

                                            #{order.orderId}

                                        </td>


                                        {/* CUSTOMER */}

                                        <td className="px-6 py-4">

                                            {order.customerName}

                                        </td>


                                        {/* EMAIL */}

                                        <td className="px-6 py-4 text-gray-600">

                                            {order.customerEmail}

                                        </td>


                                        {/* DATE */}

                                        <td className="px-6 py-4 text-gray-600">

                                            {new Date(
                                                order.orderDate
                                            ).toLocaleString()}

                                        </td>


                                        {/* AMOUNT */}

                                        <td className="px-6 py-4 font-semibold">

                                            ₹ {Number(
                                            order.totalAmount
                                        ).toFixed(2)}

                                        </td>


                                        {/* STATUS */}

                                        <td className="px-6 py-4">

                                                <span
                                                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                        order.status === "DELIVERED"
                                                            ? "bg-green-100 text-green-700"
                                                            : order.status === "CANCELLED"
                                                                ? "bg-red-100 text-red-700"
                                                                : order.status === "PROCESSING"
                                                                    ? "bg-yellow-100 text-yellow-700"
                                                                    : "bg-blue-100 text-blue-700"
                                                    }`}
                                                >

                                                    {order.status}

                                                </span>

                                        </td>

                                    </tr>

                                ))}

                                </tbody>

                            </table>

                        </div>

                    </div>

                )}

            </div>

        </div>

    );

}

export default AdminOrders;