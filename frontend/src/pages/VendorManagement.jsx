import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

function VendorManagement() {

    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        fetchVendors();

    }, []);

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

            setVendors(response.data);

        } catch (err) {

            console.error("Error fetching vendors:", err);

            setError("Unable to load vendors.");

        } finally {

            setLoading(false);
        }
    };


    return (

        <div className="min-h-screen bg-gray-100">

            {/* Header */}

            <div className="bg-blue-700 text-white py-8">

                <div className="max-w-7xl mx-auto px-6">

                    <h1 className="text-4xl font-bold">
                        Vendor Management
                    </h1>

                    <p className="mt-2 text-blue-100">
                        View and monitor marketplace vendors
                    </p>

                </div>

            </div>


            {/* Content */}

            <div className="max-w-7xl mx-auto px-6 py-10">

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">

                    <div className="p-6 border-b">

                        <h2 className="text-2xl font-bold">
                            All Vendors
                        </h2>

                        <p className="text-gray-500 mt-1">
                            Total Vendors: {vendors.length}
                        </p>

                    </div>


                    {loading && (

                        <div className="p-10 text-center">

                            <p className="text-gray-500">
                                Loading vendors...
                            </p>

                        </div>

                    )}


                    {error && (

                        <div className="p-10 text-center">

                            <p className="text-red-500">
                                {error}
                            </p>

                        </div>

                    )}


                    {!loading && !error && vendors.length === 0 && (

                        <div className="p-10 text-center">

                            <p className="text-gray-500">
                                No vendors found.
                            </p>

                        </div>

                    )}


                    {!loading && !error && vendors.length > 0 && (

                        <div className="overflow-x-auto">

                            <table className="w-full">

                                <thead className="bg-gray-50">

                                <tr>

                                    <th className="px-6 py-4 text-left">
                                        ID
                                    </th>

                                    <th className="px-6 py-4 text-left">
                                        Name
                                    </th>

                                    <th className="px-6 py-4 text-left">
                                        Email
                                    </th>

                                    <th className="px-6 py-4 text-left">
                                        Phone
                                    </th>

                                    <th className="px-6 py-4 text-left">
                                        Location
                                    </th>

                                    <th className="px-6 py-4 text-left">
                                        Role
                                    </th>

                                </tr>

                                </thead>


                                <tbody className="divide-y">

                                {vendors.map((vendor) => (

                                    <tr
                                        key={vendor.id}
                                        className="hover:bg-gray-50"
                                    >

                                        <td className="px-6 py-4">
                                            {vendor.id}
                                        </td>

                                        <td className="px-6 py-4 font-semibold">
                                            {vendor.name}
                                        </td>

                                        <td className="px-6 py-4">
                                            {vendor.email}
                                        </td>

                                        <td className="px-6 py-4">
                                            {vendor.phone || "N/A"}
                                        </td>

                                        <td className="px-6 py-4">

                                            {vendor.city
                                                ? `${vendor.city}, ${vendor.state || ""}`
                                                : "N/A"
                                            }

                                        </td>

                                        <td className="px-6 py-4">

                                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                                                    {vendor.role}
                                                </span>

                                        </td>

                                    </tr>

                                ))}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </div>

        </div>

    );
}

export default VendorManagement;