
import { useEffect, useState } from "react";
import "./VendorProductList.css";
import VendorNavbar from "../../components/VendorNavbar";
import api from "../../services/api";

function VendorProductList() {

    const [products, setProducts] = useState([]);

    const fetchProducts = async () => {

        try {

            const vendorId =
                localStorage.getItem("userId");

            if (!vendorId) {
                console.log("Vendor ID not found");
                return;
            }

            const response =
                await api.get(
                    `/products/vendor/${vendorId}`
                );

            console.log(
                "Vendor products:",
                response.data
            );

            setProducts(response.data);

        } catch (error) {

            console.error(
                "Error fetching products:",
                error
            );
        }
    };


    useEffect(() => {

        fetchProducts();

    }, []);


    const updateDiscount = async (
        productId,
        discountPercentage
    ) => {

        try {

            const discount =
                Number(discountPercentage);


            if (
                Number.isNaN(discount) ||
                discount < 0 ||
                discount > 100
            ) {

                alert(
                    "Discount must be between 0% and 100%"
                );

                return;
            }


            await api.put(
                `/products/${productId}/discount`,
                {
                    discountPercentage:
                        discount
                }
            );


            alert(
                "Discount updated successfully"
            );


            await fetchProducts();

        } catch (error) {

            console.error(
                "Discount update error:",
                error
            );

            alert(
                error.response?.data ||
                "Unable to update discount"
            );
        }
    };


    const deleteProduct = async (id) => {

        try {

            await api.delete(
                `/products/${id}`
            );

            alert(
                "Product deleted successfully"
            );

            await fetchProducts();

        } catch (error) {

            console.error(
                "Delete product error:",
                error
            );

            alert(
                "Unable to delete product"
            );
        }
    };


    return (

        <>

            <VendorNavbar />


            <div className="product-list-container">

                <h1>
                    My Products
                </h1>


                <div className="product-grid">

                    {products.length === 0 ? (

                        <p>
                            No products available.
                        </p>

                    ) : (

                        products.map((product) => {

                            const discount =
                                Number(
                                    product.discountPercentage || 0
                                );

                            const originalPrice =
                                Number(
                                    product.price || 0
                                );

                            const discountedPrice =
                                product.discountedPrice !== undefined
                                    ? Number(
                                        product.discountedPrice
                                    )
                                    : originalPrice *
                                      (1 - discount / 100);


                            return (

                                <div
                                    className="product-card"
                                    key={product.id}
                                >

                                    <img
                                        src={
                                            product.imageUrl
                                        }
                                        alt={
                                            product.productName
                                        }
                                    />


                                    <h3>
                                        {product.productName}
                                    </h3>


                                    <p>
                                        Brand:{" "}
                                        {product.brand}
                                    </p>


                                    <p>
                                        Original Price:
                                        ₹
                                        {originalPrice.toLocaleString(
                                            "en-IN"
                                        )}
                                    </p>


                                    <p>
                                        Discount:
                                        {" "}
                                        {discount}%
                                    </p>


                                    <p className="vendor-selling-price">

                                        Selling Price:
                                        {" "}
                                        ₹
                                        {discountedPrice.toLocaleString(
                                            "en-IN",
                                            {
                                                maximumFractionDigits: 2
                                            }
                                        )}

                                    </p>


                                    <p>
                                        Stock:
                                        {" "}
                                        {product.stockQuantity}
                                    </p>


                                    <p>
                                        Status:
                                        {" "}
                                        {product.status}
                                    </p>


                                    <div className="discount-editor">

                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            defaultValue={
                                                discount
                                            }
                                            id={`discount-${product.id}`}
                                        />


                                        <button
                                            type="button"
                                            onClick={() => {

                                                const input =
                                                    document.getElementById(
                                                        `discount-${product.id}`
                                                    );

                                                updateDiscount(
                                                    product.id,
                                                    input.value
                                                );

                                            }}
                                        >
                                            Update Discount
                                        </button>

                                    </div>


                                    <button
                                        onClick={() =>
                                            deleteProduct(
                                                product.id
                                            )
                                        }
                                    >
                                        Delete
                                    </button>

                                </div>

                            );

                        })

                    )}

                </div>

            </div>

        </>

    );
}

export default VendorProductList;

