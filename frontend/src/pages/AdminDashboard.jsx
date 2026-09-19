import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { getErrorMessage } from "../utils/errorHandler";
import { API_BASE_URL } from "../config/api";

function AdminDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            if (!token) {
                setError("Your session has expired. Please login again.");
                return;
            }

            const response = await axios.get(
                `${API_BASE_URL}/api/admin/dashboard`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.data) {
                setError(
                    "Dashboard data is currently unavailable. Please try again."
                );
                return;
            }

            setDashboard(response.data);
        } catch (err) {
            setDashboard(null);

            setError(
                getErrorMessage(
                    err,
                    "Unable to load the admin dashboard. Please try again."
                )
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
                <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 text-center w-full max-w-md">
                    <div className="animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-48 mx-auto" />
                        <div className="h-4 bg-gray-200 rounded w-64 mx-auto mt-4" />
                    </div>

                    <p className="text-gray-600 mt-5">
                        Loading Admin Dashboard...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
                <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 text-center w-full max-w-lg">
                    <div className="text-red-500 text-4xl font-bold mb-4">
                        !
                    </div>

                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                        Unable to load dashboard
                    </h2>

                    <p className="text-red-600 mt-3 break-words">
                        {error}
                    </p>

                    <button
                        onClick={fetchDashboard}
                        className="mt-6 bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!dashboard) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
                <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 text-center w-full max-w-lg">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                        Dashboard unavailable
                    </h2>

                    <p className="text-gray-500 mt-3">
                        Dashboard information could not be loaded.
                    </p>

                    <button
                        onClick={fetchDashboard}
                        className="mt-6 bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">

            {/* Header */}
            <div className="bg-blue-700 text-white py-6 sm:py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                        Admin Dashboard
                    </h1>

                    <p className="mt-2 text-blue-100 text-sm sm:text-base">
                        Welcome, Administrator
                    </p>
                </div>
            </div>

            {/* Dashboard Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-10">

                {/* Analytics */}
                <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6">
                    Marketplace Overview
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">

                    {/* Users */}
                    <div className="bg-white rounded-xl shadow p-5 sm:p-6">
                        <p className="text-gray-500 text-sm sm:text-base">
                            Total Users
                        </p>

                        <h2 className="text-2xl sm:text-3xl font-bold mt-2 text-blue-600 break-words">
                            {dashboard.totalUsers ?? 0}
                        </h2>
                    </div>

                    {/* Vendors */}
                    <div className="bg-white rounded-xl shadow p-5 sm:p-6">
                        <p className="text-gray-500 text-sm sm:text-base">
                            Total Vendors
                        </p>

                        <h2 className="text-2xl sm:text-3xl font-bold mt-2 text-green-600 break-words">
                            {dashboard.totalVendors ?? 0}
                        </h2>
                    </div>

                    {/* Products */}
                    <div className="bg-white rounded-xl shadow p-5 sm:p-6">
                        <p className="text-gray-500 text-sm sm:text-base">
                            Total Products
                        </p>

                        <h2 className="text-2xl sm:text-3xl font-bold mt-2 text-purple-600 break-words">
                            {dashboard.totalProducts ?? 0}
                        </h2>
                    </div>

                    {/* Orders */}
                    <div className="bg-white rounded-xl shadow p-5 sm:p-6">
                        <p className="text-gray-500 text-sm sm:text-base">
                            Total Orders
                        </p>

                        <h2 className="text-2xl sm:text-3xl font-bold mt-2 text-orange-600 break-words">
                            {dashboard.totalOrders ?? 0}
                        </h2>
                    </div>

                    {/* Sales */}
                    <div className="bg-white rounded-xl shadow p-5 sm:p-6">
                        <p className="text-gray-500 text-sm sm:text-base">
                            Total Sales
                        </p>

                        <h2 className="text-2xl sm:text-3xl font-bold mt-2 text-red-600 break-words">
                            ₹{dashboard.totalSales ?? 0}
                        </h2>
                    </div>

                </div>

                {/* Management */}
                <h2 className="text-xl sm:text-2xl font-bold mt-10 sm:mt-12 mb-5 sm:mb-6">
                    Management
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">

                    {/* Vendors */}
                    <Link to="/admin/vendors" className="block">
                        <div className="h-full bg-white rounded-xl shadow p-5 sm:p-6 hover:shadow-xl hover:-translate-y-1 transition cursor-pointer">
                            <h2 className="text-lg sm:text-xl font-bold">
                                Vendors
                            </h2>

                            <p className="text-gray-500 mt-2 text-sm sm:text-base">
                                Manage marketplace vendors
                            </p>
                        </div>
                    </Link>

                    {/* Analytics */}
                    <Link to="/admin/analytics" className="block">
                        <div className="h-full bg-white rounded-xl shadow p-5 sm:p-6 hover:shadow-xl hover:-translate-y-1 transition cursor-pointer">
                            <h2 className="text-lg sm:text-xl font-bold">
                                Analytics
                            </h2>

                            <p className="text-gray-500 mt-2 text-sm sm:text-base">
                                View marketplace statistics
                            </p>
                        </div>
                    </Link>

                    {/* Orders */}
                    <Link to="/admin/orders" className="block">
                        <div className="h-full bg-white rounded-xl shadow p-5 sm:p-6 hover:shadow-xl hover:-translate-y-1 transition cursor-pointer">
                            <h2 className="text-lg sm:text-xl font-bold">
                                Orders
                            </h2>

                            <p className="text-gray-500 mt-2 text-sm sm:text-base">
                                Monitor all orders
                            </p>
                        </div>
                    </Link>

                    {/* Commissions */}
                    <Link to="/admin/commissions" className="block">
                        <div className="h-full bg-white rounded-xl shadow p-5 sm:p-6 hover:shadow-xl hover:-translate-y-1 transition cursor-pointer">
                            <h2 className="text-lg sm:text-xl font-bold">
                                Commissions
                            </h2>

                            <p className="text-gray-500 mt-2 text-sm sm:text-base">
                                View vendor commissions and payouts
                            </p>
                        </div>
                    </Link>

                    {/* Returns */}
                    <Link to="/admin/returns" className="block">
                        <div className="h-full bg-white rounded-xl shadow p-5 sm:p-6 hover:shadow-xl hover:-translate-y-1 transition cursor-pointer">
                            <h2 className="text-lg sm:text-xl font-bold">
                                Returns & Refunds
                            </h2>

                            <p className="text-gray-500 mt-2 text-sm sm:text-base">
                                Review returns, inspections and refunds
                            </p>
                        </div>
                    </Link>

                    {/* Coupons */}
                    <Link to="/admin/coupons" className="block">
                        <div className="h-full bg-white rounded-xl shadow p-5 sm:p-6 hover:shadow-xl hover:-translate-y-1 transition cursor-pointer">
                            <h2 className="text-lg sm:text-xl font-bold">
                                Coupons & Promotions
                            </h2>

                            <p className="text-gray-500 mt-2 text-sm sm:text-base">
                                Create and manage coupons and offers
                            </p>
                        </div>
                    </Link>

                    {/* Warehouse Management */}
                    <Link to="/admin/warehouses" className="block">
                        <div className="h-full bg-white rounded-xl shadow p-5 sm:p-6 hover:shadow-xl hover:-translate-y-1 transition cursor-pointer">
                            <h2 className="text-lg sm:text-xl font-bold">
                                Warehouse Management
                            </h2>

                            <p className="text-gray-500 mt-2 text-sm sm:text-base">
                                Manage warehouses and warehouse inventory
                            </p>
                        </div>
                    </Link>

                    {/* Warehouse Analytics */}
                    <Link to="/admin/warehouse-analytics" className="block">
                        <div className="h-full bg-white rounded-xl shadow p-5 sm:p-6 hover:shadow-xl hover:-translate-y-1 transition cursor-pointer">
                            <h2 className="text-lg sm:text-xl font-bold">
                                Warehouse Analytics
                            </h2>

                            <p className="text-gray-500 mt-2 text-sm sm:text-base">
                                Monitor warehouse allocation and operations
                            </p>
                        </div>
                    </Link>

                    {/* Reports */}
                    <div className="h-full bg-white rounded-xl shadow p-5 sm:p-6 hover:shadow-xl transition cursor-pointer">
                        <h2 className="text-lg sm:text-xl font-bold">
                            Reports
                        </h2>

                        <p className="text-gray-500 mt-2 text-sm sm:text-base">
                            Generate business reports
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;