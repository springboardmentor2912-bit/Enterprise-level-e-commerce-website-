import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";

function Home() {


    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {

        const fetchProducts = async () => {

            try {

                const token = localStorage.getItem("token");

                console.log("Token:", token);

                const response = await axios.get(
                    `${API_BASE_URL}/api/products`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                console.log("Products received:", response.data);

                setProducts(response.data);

            } catch (error) {

                console.error("Error loading products:", error);

            } finally {

                setLoading(false);

            }

        };

        fetchProducts();

    }, []);

    return (

        <div className="min-h-screen bg-gray-100">

            <Navbar />

            <div className="max-w-7xl mx-auto py-10 px-5">

                <h2 className="text-3xl font-bold mb-8">
                    Latest Products
                </h2>

                {loading ? (

                    <h2 className="text-center text-xl">
                        Loading Products...
                    </h2>

                ) : products.length === 0 ? (

                    <h2 className="text-center text-xl text-gray-500">
                        No Products Available
                    </h2>

                ) : (

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                        {products.map((product) => (

                            <div
                                key={product.id}
                                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition"
                            >

                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="w-full h-56 object-cover"
                                />

                                <div className="p-5">

                                    <h2 className="text-xl font-bold">
                                        {product.name}
                                    </h2>

                                    <p className="text-gray-500 mt-2">
                                        {product.description}
                                    </p>

                                    {product.discount > 0 ? (

                                        <div className="mt-4">

                                            <div className="flex items-center gap-2">

            <span className="text-gray-400 line-through">
                ₹ {product.price}
            </span>

                                                <span className="text-red-600 font-semibold">
                {product.discount}% OFF
            </span>

                                            </div>

                                            <p className="text-green-600 text-2xl font-bold mt-1">
                                                ₹ {product.finalPrice}
                                            </p>

                                        </div>

                                    ) : (

                                        <p className="text-blue-600 text-2xl font-bold mt-4">
                                            ₹ {product.finalPrice ?? product.price}
                                        </p>

                                    )}

                                    <p className="mt-2">
                                        Category :
                                        <span className="font-semibold">
                                            {" "}
                                            {product.category}
                                        </span>
                                    </p>

                                    <p className="mt-1">
                                        Seller :
                                        <span className="font-semibold">
                                            {" "}
                                            {product.vendorName}
                                        </span>
                                    </p>

                                    <button
                                        onClick={() => navigate(`/product/${product.id}`)}
                                        className="mt-5 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
                                    >
                                        View Details
                                    </button>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>

        </div>

    );
}

export default Home;