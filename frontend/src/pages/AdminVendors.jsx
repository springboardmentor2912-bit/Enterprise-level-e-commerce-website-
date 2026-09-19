import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

function AdminVendors() {

    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);


    // ==========================================
    // FETCH VENDORS
    // ==========================================

    const fetchVendors = async () => {

        try {

            const token = localStorage.getItem("token");

            const response = await axios.get(
                `${API_BASE_URL}/api/admin/vendors`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log("Admin Vendors:", response.data);

            setVendors(response.data);

        } catch (error) {

            console.error(
                "Error loading vendors:",
                error
            );

            alert(
                error.response?.data ||
                "Failed to load vendors"
            );

        } finally {

            setLoading(false);

        }
    };


    // ==========================================
    // LOAD VENDORS
    // ==========================================

    useEffect(() => {

        fetchVendors();

    }, []);


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div className="min-h-screen bg-gray-100">

                <div className="bg-blue-700 text-white py-8">

                    <div className="max-w-7xl mx-auto px-6">

                        <h1 className="text-4xl font-bold">
                            Vendor Management
                        </h1>

                        <p className="mt-2 text-blue-100">
                            Monitor marketplace vendors
                        </p>

                    </div>

                </div>


                <div className="flex justify-center items-center h-80">

                    <p className="text-xl font-semibold">
                        Loading vendors...
                    </p>

                </div>

            </div>

        );

    }


    // ==========================================
    // MAIN UI
    // ==========================================

    return (

        <div className="min-h-screen bg-gray-100">


            {/* ======================================
                HEADER
            ====================================== */}

            <div className="bg-blue-700 text-white py-8">

                <div className="max-w-7xl mx-auto px-6">

                    <h1 className="text-4xl font-bold">
                        Vendor Management
                    </h1>

                    <p className="mt-2 text-blue-100">
                        Monitor marketplace vendors
                    </p>

                </div>

            </div>


            {/* ======================================
                CONTENT
            ====================================== */}

            <div className="max-w-7xl mx-auto px-6 py-10">


                {/* ==================================
                    VENDOR SUMMARY
                ================================== */}

                <div className="mb-8">

                    <h2 className="text-3xl font-bold">
                        Vendors
                    </h2>

                    <p className="text-gray-500 mt-1">
                        Total Vendors: {vendors.length}
                    </p>

                </div>


                {/* ==================================
                    NO VENDORS
                ================================== */}

                {vendors.length === 0 ? (

                    <div className="bg-white rounded-xl shadow p-10 text-center">

                        <h2 className="text-2xl font-bold">
                            No Vendors Found
                        </h2>

                        <p className="text-gray-500 mt-2">
                            There are currently no registered vendors.
                        </p>

                    </div>

                ) : (


                    /* ==================================
                       VENDOR CARDS
                    ================================== */

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                        {vendors.map((vendor) => (

                            <div
                                key={vendor.vendorId}
                                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
                            >


                                {/* ==============================
                                    VENDOR HEADER
                                ============================== */}

                                <div className="flex justify-between items-start">

                                    <div>

                                        <h3 className="text-xl font-bold">
                                            {vendor.name}
                                        </h3>

                                        <p className="text-sm text-gray-500">
                                            Vendor #{vendor.vendorId}
                                        </p>

                                    </div>

                                </div>


                                {/* ==============================
                                    CONTACT DETAILS
                                ============================== */}

                                <div className="mt-6 space-y-4">


                                    {/* EMAIL */}

                                    <div>

                                        <p className="text-sm text-gray-500">
                                            Email
                                        </p>

                                        <p className="font-medium break-all">
                                            {vendor.email}
                                        </p>

                                    </div>


                                    {/* PHONE */}

                                    <div>

                                        <p className="text-sm text-gray-500">
                                            Phone
                                        </p>

                                        <p className="font-medium">

                                            {vendor.phone
                                                ? vendor.phone
                                                : "Not provided"
                                            }

                                        </p>

                                    </div>


                                    {/* LOCATION */}

                                    <div>

                                        <p className="text-sm text-gray-500">
                                            Location
                                        </p>

                                        <p className="font-medium">

                                            {vendor.city || "-"}
                                            {vendor.city && vendor.state
                                                ? ", "
                                                : ""
                                            }
                                            {vendor.state || "-"}

                                        </p>

                                    </div>


                                    {/* PRODUCTS */}

                                    <div>

                                        <p className="text-sm text-gray-500">
                                            Products
                                        </p>

                                        <p className="text-2xl font-bold text-blue-600">
                                            {vendor.productCount}
                                        </p>

                                    </div>

                                </div>


                                {/* ==============================
                                    ADDRESS
                                ============================== */}

                                <div className="border-t mt-6 pt-4">

                                    <p className="text-sm text-gray-500">
                                        Address
                                    </p>

                                    <p className="text-gray-700 mt-1">

                                        {vendor.address
                                            ? vendor.address
                                            : "Not provided"
                                        }

                                    </p>


                                    {/* PINCODE */}

                                    {vendor.pincode && (

                                        <p className="text-gray-500 text-sm mt-2">

                                            PIN: {vendor.pincode}

                                        </p>

                                    )}

                                </div>


                            </div>

                        ))}

                    </div>

                )}

            </div>

        </div>

    );

}

export default AdminVendors;