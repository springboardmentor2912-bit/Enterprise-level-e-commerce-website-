import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function VendorDashboard() {
    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            {/* Header */}
            <div className="bg-blue-600 text-white py-6 sm:py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold break-words">
                        Vendor Dashboard
                    </h1>
                </div>
            </div>

            {/* Dashboard */}
            <div className="max-w-7xl mx-auto py-8 sm:py-10 lg:py-12 px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 lg:mb-10">
                    Welcome Vendor 👋
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">

                    {/* ADD PRODUCT */}
                    <Link to="/add-product" className="h-full">
                        <div className="h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-200 p-5 sm:p-6 lg:p-8 cursor-pointer hover:-translate-y-1">
                            <h2 className="text-2xl sm:text-3xl font-bold text-blue-600 break-words">
                                Add Product
                            </h2>

                            <p className="text-gray-500 mt-3 sm:mt-4 text-sm sm:text-base leading-relaxed">
                                Add a new product to your store.
                            </p>
                        </div>
                    </Link>

                    {/* MY PRODUCTS */}
                    <Link to="/my-products" className="h-full">
                        <div className="h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-200 p-5 sm:p-6 lg:p-8 cursor-pointer hover:-translate-y-1">
                            <h2 className="text-2xl sm:text-3xl font-bold text-green-600 break-words">
                                My Products
                            </h2>

                            <p className="text-gray-500 mt-3 sm:mt-4 text-sm sm:text-base leading-relaxed">
                                View and manage your products.
                            </p>
                        </div>
                    </Link>

                    {/* MY ORDERS */}
                    <Link to="/vendor/orders" className="h-full">
                        <div className="h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-200 p-5 sm:p-6 lg:p-8 cursor-pointer hover:-translate-y-1">
                            <h2 className="text-2xl sm:text-3xl font-bold text-orange-600 break-words">
                                Customer Orders
                            </h2>

                            <p className="text-gray-500 mt-3 sm:mt-4 text-sm sm:text-base leading-relaxed">
                                View orders containing your products
                                and update their status.
                            </p>
                        </div>
                    </Link>

                    {/* COUPONS */}
                    <Link to="/vendor/coupons" className="h-full">
                        <div className="h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-200 p-5 sm:p-6 lg:p-8 cursor-pointer hover:-translate-y-1">
                            <h2 className="text-2xl sm:text-3xl font-bold text-indigo-600 break-words">
                                Coupons
                            </h2>

                            <p className="text-gray-500 mt-3 sm:mt-4 text-sm sm:text-base leading-relaxed">
                                Review and manage your coupons.
                            </p>
                        </div>
                    </Link>

                    {/* NOTIFICATIONS */}
                    <Link to="/notifications" className="h-full">
                        <div className="h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-200 p-5 sm:p-6 lg:p-8 cursor-pointer hover:-translate-y-1">
                            <h2 className="text-2xl sm:text-3xl font-bold text-red-600 break-words">
                                Notifications
                            </h2>

                            <p className="text-gray-500 mt-3 sm:mt-4 text-sm sm:text-base leading-relaxed">
                                View new order notifications and
                                important updates.
                            </p>
                        </div>
                    </Link>

                    {/* PROFILE */}
                    <Link to="/profile" className="h-full">
                        <div className="h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-200 p-5 sm:p-6 lg:p-8 cursor-pointer hover:-translate-y-1">
                            <h2 className="text-2xl sm:text-3xl font-bold text-purple-600 break-words">
                                My Profile
                            </h2>

                            <p className="text-gray-500 mt-3 sm:mt-4 text-sm sm:text-base leading-relaxed">
                                Update your profile information.
                            </p>
                        </div>
                    </Link>

                    {/* INVENTORY */}
                    <Link to="/inventory" className="h-full">
                        <div className="h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-200 p-5 sm:p-6 lg:p-8 cursor-pointer hover:-translate-y-1">
                            <h2 className="text-2xl sm:text-3xl font-bold text-pink-600 break-words">
                                Inventory Management
                            </h2>

                            <p className="text-gray-500 mt-3 sm:mt-4 text-sm sm:text-base leading-relaxed">
                                Monitor and manage your product stock.
                            </p>
                        </div>
                    </Link>

                </div>
            </div>
        </div>
    );
}

export default VendorDashboard;