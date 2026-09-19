import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function OrderSuccess() {

    return (

        <div className="min-h-screen bg-gray-100">

            <Navbar />

            <div className="flex justify-center items-center px-5 py-20">

                <div className="bg-white rounded-2xl shadow-xl p-10 max-w-lg w-full text-center">

                    {/* SUCCESS ICON */}

                    <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">

                        <span className="text-5xl text-green-600">
                            ✓
                        </span>

                    </div>


                    {/* TITLE */}

                    <h1 className="text-4xl font-bold text-green-600">
                        Order Placed Successfully!
                    </h1>


                    {/* MESSAGE */}

                    <p className="text-gray-600 text-lg mt-5">
                        Thank you for shopping with ShopStack.
                    </p>

                    <p className="text-gray-500 mt-2">
                        Your order has been placed successfully
                        and is now being processed.
                    </p>


                    {/* BUTTONS */}

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">

                        <Link
                            to="/my-orders"
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
                        >
                            View My Orders
                        </Link>


                        <Link
                            to="/home"
                            className="border border-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100"
                        >
                            Continue Shopping
                        </Link>

                    </div>

                </div>

            </div>

        </div>

    );
}

export default OrderSuccess;