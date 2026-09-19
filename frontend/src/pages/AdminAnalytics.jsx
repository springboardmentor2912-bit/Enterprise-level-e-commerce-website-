import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

function AdminAnalytics() {

    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const fetchAnalytics = async () => {

            try {

                const token = localStorage.getItem("token");

                const response = await axios.get(
                    `${API_BASE_URL}/api/admin/analytics`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                console.log("ANALYTICS RESPONSE:", response.data);

                setAnalytics(response.data);

            } catch (error) {

                console.error("Analytics Error:", error);

                setError("Unable to load analytics.");

            } finally {

                setLoading(false);

            }
        };

        fetchAnalytics();

    }, []);


    if (loading) {

        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">

                <h2 className="text-2xl font-semibold">
                    Loading Analytics...
                </h2>

            </div>
        );

    }


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

            {/* Header */}

            <div className="bg-blue-700 text-white py-8">

                <div className="max-w-7xl mx-auto px-6">

                    <h1 className="text-4xl font-bold">
                        Marketplace Analytics
                    </h1>

                    <p className="mt-2 text-blue-100">
                        Overview of marketplace performance
                    </p>

                </div>

            </div>


            {/* Main Content */}

            <div className="max-w-7xl mx-auto px-6 py-10">


                {/* Main Statistics */}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">


                    {/* Users */}

                    <div className="bg-white rounded-xl shadow p-6">

                        <p className="text-gray-500">
                            Total Users
                        </p>

                        <h2 className="text-3xl font-bold mt-2">
                            {analytics.totalUsers}
                        </h2>

                    </div>


                    {/* Vendors */}

                    <div className="bg-white rounded-xl shadow p-6">

                        <p className="text-gray-500">
                            Total Vendors
                        </p>

                        <h2 className="text-3xl font-bold text-blue-600 mt-2">
                            {analytics.totalVendors}
                        </h2>

                    </div>


                    {/* Customers */}

                    <div className="bg-white rounded-xl shadow p-6">

                        <p className="text-gray-500">
                            Total Customers
                        </p>

                        <h2 className="text-3xl font-bold text-green-600 mt-2">
                            {analytics.totalCustomers}
                        </h2>

                    </div>


                    {/* Products */}

                    <div className="bg-white rounded-xl shadow p-6">

                        <p className="text-gray-500">
                            Total Products
                        </p>

                        <h2 className="text-3xl font-bold text-purple-600 mt-2">
                            {analytics.totalProducts}
                        </h2>

                    </div>


                    {/* Orders */}

                    <div className="bg-white rounded-xl shadow p-6">

                        <p className="text-gray-500">
                            Total Orders
                        </p>

                        <h2 className="text-3xl font-bold text-orange-600 mt-2">
                            {analytics.totalOrders}
                        </h2>

                    </div>

                </div>


                {/* Sales */}

                <div className="mt-8">

                    <div className="bg-white rounded-xl shadow p-8">

                        <p className="text-gray-500 text-lg">
                            Total Marketplace Sales
                        </p>

                        <h2 className="text-4xl font-bold text-green-600 mt-3">
                            ₹ {Number(analytics.totalSales).toFixed(2)}
                        </h2>

                    </div>

                </div>


                {/* Order Status */}

                <div className="mt-10">

                    <h2 className="text-3xl font-bold mb-6">
                        Order Status Overview
                    </h2>


                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">


                        {/* Placed */}

                        <div className="bg-white rounded-xl shadow p-6">

                            <p className="text-gray-500">
                                Placed
                            </p>

                            <h2 className="text-3xl font-bold mt-2">
                                {analytics.placedOrders}
                            </h2>

                        </div>


                        {/* Confirmed */}

                        <div className="bg-white rounded-xl shadow p-6">

                            <p className="text-gray-500">
                                Confirmed
                            </p>

                            <h2 className="text-3xl font-bold text-blue-600 mt-2">
                                {analytics.confirmedOrders}
                            </h2>

                        </div>


                        {/* Processing */}

                        <div className="bg-white rounded-xl shadow p-6">

                            <p className="text-gray-500">
                                Processing
                            </p>

                            <h2 className="text-3xl font-bold text-yellow-600 mt-2">
                                {analytics.processingOrders}
                            </h2>

                        </div>


                        {/* Shipped */}

                        <div className="bg-white rounded-xl shadow p-6">

                            <p className="text-gray-500">
                                Shipped
                            </p>

                            <h2 className="text-3xl font-bold text-purple-600 mt-2">
                                {analytics.shippedOrders}
                            </h2>

                        </div>


                        {/* Out For Delivery */}

                        <div className="bg-white rounded-xl shadow p-6">

                            <p className="text-gray-500">
                                Out For Delivery
                            </p>

                            <h2 className="text-3xl font-bold text-orange-600 mt-2">
                                {analytics.outForDeliveryOrders}
                            </h2>

                        </div>


                        {/* Delivered */}

                        <div className="bg-white rounded-xl shadow p-6">

                            <p className="text-gray-500">
                                Delivered
                            </p>

                            <h2 className="text-3xl font-bold text-green-600 mt-2">
                                {analytics.deliveredOrders}
                            </h2>

                        </div>


                        {/* Cancelled */}

                        <div className="bg-white rounded-xl shadow p-6">

                            <p className="text-gray-500">
                                Cancelled
                            </p>

                            <h2 className="text-3xl font-bold text-red-600 mt-2">
                                {analytics.cancelledOrders}
                            </h2>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );
}

export default AdminAnalytics;