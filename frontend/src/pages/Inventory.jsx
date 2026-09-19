import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { API_BASE_URL } from "../config/api";

function Inventory() {

    const [inventory, setInventory] = useState([]);
    const [summary, setSummary] = useState(null);

    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchInventory();
        fetchSummary();
    }, []);

    const fetchInventory = async () => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/inventory`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setInventory(response.data);

        } catch (error) {
            console.error(error);
        }
    };

    const fetchSummary = async () => {

        try {

            const response = await axios.get(
                `${API_BASE_URL}/api/inventory/summary`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setSummary(response.data);

        } catch (error) {
            console.error(error);
        }
    };

    const updateStock = async (id) => {

        const quantity = prompt("Enter new stock");

        if (quantity === null) return;

        try {

            await axios.put(
                `${API_BASE_URL}/api/inventory/${id}`,
                {
                    quantity: Number(quantity)
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Stock Updated");

            fetchInventory();
            fetchSummary();

        } catch (error) {
            console.error(error);
        }
    };

    const addStock = async (id) => {

        const quantity = prompt("Enter quantity to add");

        if (quantity === null) return;

        try {

            await axios.put(
                `${API_BASE_URL}/api/inventory/${id}/add`,
                {
                    quantity: Number(quantity)
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            alert("Stock Added");

            fetchInventory();
            fetchSummary();

        } catch (error) {
            console.error(error);
        }
    };

    return (

        <div className="min-h-screen bg-gray-100">

            <Navbar />

            <div className="max-w-7xl mx-auto py-10">

                <h1 className="text-4xl font-bold text-blue-600 mb-8">
                    Inventory Management
                </h1>

                {summary && (

                    <div className="grid grid-cols-4 gap-5 mb-10">

                        <div className="bg-white rounded-xl shadow p-6">
                            <h2 className="text-gray-500">Total Products</h2>
                            <p className="text-3xl font-bold">
                                {summary.totalProducts}
                            </p>
                        </div>

                        <div className="bg-green-100 rounded-xl shadow p-6">
                            <h2>In Stock</h2>
                            <p className="text-3xl font-bold">
                                {summary.inStock}
                            </p>
                        </div>

                        <div className="bg-yellow-100 rounded-xl shadow p-6">
                            <h2>Low Stock</h2>
                            <p className="text-3xl font-bold">
                                {summary.lowStock}
                            </p>
                        </div>

                        <div className="bg-red-100 rounded-xl shadow p-6">
                            <h2>Out Of Stock</h2>
                            <p className="text-3xl font-bold">
                                {summary.outOfStock}
                            </p>
                        </div>

                    </div>

                )}

                <table className="w-full bg-white shadow rounded-xl">

                    <thead className="bg-blue-600 text-white">

                    <tr>

                        <th className="p-4">Product</th>
                        <th>Stock</th>
                        <th>Status</th>
                        <th>Actions</th>

                    </tr>

                    </thead>

                    <tbody>

                    {inventory.map(product => (

                        <tr key={product.id} className="text-center border-b">

                            <td className="p-4">{product.name}</td>

                            <td>{product.stock}</td>

                            <td>

                                    <span
                                        className={
                                            product.status === "IN STOCK"
                                                ? "text-green-600 font-bold"
                                                : product.status === "LOW STOCK"
                                                    ? "text-yellow-600 font-bold"
                                                    : "text-red-600 font-bold"
                                        }
                                    >
                                        {product.status}
                                    </span>

                            </td>

                            <td className="space-x-2">

                                <button
                                    onClick={() => addStock(product.id)}
                                    className="bg-green-600 text-white px-3 py-2 rounded"
                                >
                                    Add
                                </button>

                                <button
                                    onClick={() => updateStock(product.id)}
                                    className="bg-blue-600 text-white px-3 py-2 rounded"
                                >
                                    Update
                                </button>

                            </td>

                        </tr>

                    ))}

                    </tbody>

                </table>

            </div>

        </div>

    );
}

export default Inventory;