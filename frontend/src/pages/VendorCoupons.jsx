import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

function VendorCoupons() {

    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);


    // =========================================================
    // FETCH VENDOR COUPONS
    // =========================================================

    const fetchCoupons = async () => {

        try {

            const token =
                localStorage.getItem("token");

            const response = await axios.get(
                `${API_BASE_URL}/api/coupons/vendor`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            console.log(
                "VENDOR COUPONS:",
                response.data
            );

            setCoupons(response.data);

        } catch (error) {

            console.error(
                "Error loading vendor coupons:",
                error
            );

            alert(
                error.response?.data ||
                "Failed to load coupons"
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        fetchCoupons();

    }, []);


    // =========================================================
    // APPROVE COUPON
    // =========================================================

    const approveCoupon = async (couponId) => {

        try {

            setActionLoading(couponId);

            const token =
                localStorage.getItem("token");

            await axios.put(

                `${API_BASE_URL}/api/coupons/${couponId}/approve`,

                {},

                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }

            );

            alert(
                "Coupon approved successfully"
            );

            await fetchCoupons();

        } catch (error) {

            console.error(
                "Approve error:",
                error
            );

            alert(
                error.response?.data ||
                "Failed to approve coupon"
            );

        } finally {

            setActionLoading(null);

        }
    };


    // =========================================================
    // REJECT COUPON
    // =========================================================

    const rejectCoupon = async (couponId) => {

        try {

            setActionLoading(couponId);

            const token =
                localStorage.getItem("token");

            await axios.put(

                `${API_BASE_URL}/api/coupons/${couponId}/reject`,

                {},

                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }

            );

            alert(
                "Coupon rejected"
            );

            await fetchCoupons();

        } catch (error) {

            console.error(
                "Reject error:",
                error
            );

            alert(
                error.response?.data ||
                "Failed to reject coupon"
            );

        } finally {

            setActionLoading(null);

        }
    };


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (

            <div className="min-h-screen bg-gray-100">

                <div className="bg-blue-700 text-white py-8">

                    <div className="max-w-7xl mx-auto px-6">

                        <h1 className="text-4xl font-bold">
                            Vendor Coupons
                        </h1>

                        <p className="mt-2 text-blue-100">
                            Review and manage coupons assigned to you
                        </p>

                    </div>

                </div>

                <div className="flex justify-center items-center h-80">

                    <p className="text-xl font-semibold">
                        Loading coupons...
                    </p>

                </div>

            </div>

        );
    }


    // =========================================================
    // PAGE
    // =========================================================

    return (

        <div className="min-h-screen bg-gray-100">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="bg-blue-700 text-white py-8">

                <div className="max-w-7xl mx-auto px-6">

                    <h1 className="text-4xl font-bold">
                        Vendor Coupons
                    </h1>

                    <p className="mt-2 text-blue-100">
                        Review and approve coupons created for your products
                    </p>

                </div>

            </div>


            {/* =================================================
                CONTENT
            ================================================= */}

            <div className="max-w-7xl mx-auto px-6 py-10">


                {/* SUMMARY */}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">


                    <div className="bg-white rounded-xl shadow p-6">

                        <p className="text-gray-500">
                            Total Coupons
                        </p>

                        <p className="text-3xl font-bold mt-2">
                            {coupons.length}
                        </p>

                    </div>


                    <div className="bg-white rounded-xl shadow p-6">

                        <p className="text-gray-500">
                            Pending Approval
                        </p>

                        <p className="text-3xl font-bold mt-2 text-yellow-600">

                            {
                                coupons.filter(
                                    coupon =>
                                        coupon.status === "PENDING"
                                ).length
                            }

                        </p>

                    </div>


                    <div className="bg-white rounded-xl shadow p-6">

                        <p className="text-gray-500">
                            Approved
                        </p>

                        <p className="text-3xl font-bold mt-2 text-green-600">

                            {
                                coupons.filter(
                                    coupon =>
                                        coupon.status === "APPROVED"
                                ).length
                            }

                        </p>

                    </div>

                </div>


                {/* =================================================
                    NO COUPONS
                ================================================= */}

                {coupons.length === 0 ? (

                    <div className="bg-white rounded-xl shadow p-10 text-center">

                        <h2 className="text-2xl font-bold">
                            No Coupons Found
                        </h2>

                        <p className="text-gray-500 mt-2">
                            No coupons have been assigned to you yet.
                        </p>

                    </div>

                ) : (


                    /* =================================================
                       COUPON CARDS
                    ================================================= */

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                        {coupons.map(coupon => (

                            <div
                                key={coupon.id}
                                className="bg-white rounded-xl shadow-lg p-6"
                            >


                                {/* HEADER */}

                                <div className="flex justify-between items-start">

                                    <div>

                                        <h2 className="text-2xl font-bold text-blue-600">
                                            {coupon.code}
                                        </h2>

                                        <p className="text-sm text-gray-500">
                                            Coupon #{coupon.id}
                                        </p>

                                    </div>


                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            coupon.status === "APPROVED"

                                                ? "bg-green-100 text-green-700"

                                                : coupon.status === "REJECTED"

                                                    ? "bg-red-100 text-red-700"

                                                    : "bg-yellow-100 text-yellow-700"
                                        }`}
                                    >

                                        {coupon.status}

                                    </span>

                                </div>


                                {/* DISCOUNT */}

                                <div className="mt-6">

                                    <p className="text-sm text-gray-500">
                                        Discount
                                    </p>

                                    <p className="text-3xl font-bold">

                                        {coupon.discountType === "PERCENTAGE"

                                            ? `${coupon.discountValue}%`

                                            : `₹${coupon.discountValue}`

                                        }

                                    </p>

                                </div>


                                {/* DETAILS */}

                                <div className="mt-5 space-y-3">


                                    <div className="flex justify-between">

                                        <span className="text-gray-500">
                                            Minimum Order
                                        </span>

                                        <span className="font-semibold">

                                            {coupon.minimumOrderAmount != null

                                                ? `₹${coupon.minimumOrderAmount}`

                                                : "None"

                                            }

                                        </span>

                                    </div>


                                    <div className="flex justify-between">

                                        <span className="text-gray-500">
                                            Maximum Discount
                                        </span>

                                        <span className="font-semibold">

                                            {coupon.maximumDiscount != null

                                                ? `₹${coupon.maximumDiscount}`

                                                : "None"

                                            }

                                        </span>

                                    </div>


                                    <div className="flex justify-between">

                                        <span className="text-gray-500">
                                            Usage
                                        </span>

                                        <span className="font-semibold">

                                            {coupon.usedCount} / {

                                            coupon.usageLimit != null

                                                ? coupon.usageLimit

                                                : "∞"

                                        }

                                        </span>

                                    </div>


                                    <div className="flex justify-between">

                                        <span className="text-gray-500">
                                            Start
                                        </span>

                                        <span className="font-semibold text-sm">

                                            {new Date(
                                                coupon.startDate
                                            ).toLocaleString()}

                                        </span>

                                    </div>


                                    <div className="flex justify-between">

                                        <span className="text-gray-500">
                                            Expiry
                                        </span>

                                        <span className="font-semibold text-sm">

                                            {new Date(
                                                coupon.expiryDate
                                            ).toLocaleString()}

                                        </span>

                                    </div>

                                </div>


                                {/* =================================================
                                    ACTIONS
                                ================================================= */}

                                {coupon.status === "PENDING" && (

                                    <div className="flex gap-3 mt-6">


                                        <button

                                            onClick={() =>
                                                approveCoupon(
                                                    coupon.id
                                                )
                                            }

                                            disabled={
                                                actionLoading === coupon.id
                                            }

                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50"

                                        >

                                            {actionLoading === coupon.id

                                                ? "Processing..."

                                                : "Approve"

                                            }

                                        </button>


                                        <button

                                            onClick={() =>
                                                rejectCoupon(
                                                    coupon.id
                                                )
                                            }

                                            disabled={
                                                actionLoading === coupon.id
                                            }

                                            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50"

                                        >

                                            Reject

                                        </button>

                                    </div>

                                )}


                                {coupon.status === "APPROVED" && (

                                    <div className="mt-6 bg-green-50 text-green-700 rounded-lg p-3 text-center font-semibold">

                                        ✓ Coupon approved

                                    </div>

                                )}


                                {coupon.status === "REJECTED" && (

                                    <div className="mt-6 bg-red-50 text-red-700 rounded-lg p-3 text-center font-semibold">

                                        Coupon rejected

                                    </div>

                                )}

                            </div>

                        ))}

                    </div>

                )}

            </div>

        </div>

    );
}

export default VendorCoupons;