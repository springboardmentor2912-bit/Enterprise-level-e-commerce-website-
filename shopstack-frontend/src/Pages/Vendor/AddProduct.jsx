
import { useState } from "react";
import "./AddProduct.css";
import VendorNavbar from "../../components/VendorNavbar";
import api from "../../services/api";

function AddProduct() {

    const [product, setProduct] = useState({
        productName: "",
        category: "",
        brand: "",
        description: "",
        price: "",
        discountPercentage: "0",
        stockQuantity: ""
    });

    const [image, setImage] = useState(null);


    const handleChange = (e) => {

        setProduct({
            ...product,
            [e.target.name]: e.target.value
        });

    };


    const uploadImage = async () => {

        const formData = new FormData();

        formData.append("file", image);

        const response = await api.post(
            "/images/upload",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }
        );

        return response.data;
    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            let uploadedImageUrl = "";

            if (image) {
                uploadedImageUrl =
                    await uploadImage();
            }


            const vendorId =
                localStorage.getItem("userId");


            const discount =
                Number(
                    product.discountPercentage || 0
                );


            if (discount < 0 || discount > 100) {

                alert(
                    "Discount must be between 0% and 100%"
                );

                return;
            }


            const productData = {

                ...product,

                price:
                    Number(product.price),

                discountPercentage:
                    discount,

                stockQuantity:
                    Number(product.stockQuantity),

                imageUrl:
                    uploadedImageUrl,

                vendor: {
                    id: Number(vendorId)
                }
            };


            await api.post(
                "/products/add",
                productData
            );


            alert(
                "Product Submitted Successfully"
            );


            setProduct({
                productName: "",
                category: "",
                brand: "",
                description: "",
                price: "",
                discountPercentage: "0",
                stockQuantity: ""
            });


            setImage(null);

        } catch (error) {

            console.error(
                "Add product error:",
                error
            );

            console.error(
                "Backend response:",
                error.response?.data
            );

            alert(
                error.response?.data ||
                "Unable to submit product"
            );
        }
    };


    const discountedPrice =
        product.price
            ? Number(product.price) *
              (1 -
                  Number(
                      product.discountPercentage || 0
                  ) / 100)
            : 0;


    return (

        <>

            <VendorNavbar />

            <div className="add-product-container">

                <h1>
                    Add New Product
                </h1>


                <form onSubmit={handleSubmit}>

                    <input
                        type="text"
                        name="productName"
                        placeholder="Product Name"
                        value={product.productName}
                        onChange={handleChange}
                        required
                    />


                    <input
                        type="text"
                        name="brand"
                        placeholder="Brand"
                        value={product.brand}
                        onChange={handleChange}
                        required
                    />


                    <select
                        name="category"
                        value={product.category}
                        onChange={handleChange}
                        required
                    >

                        <option value="">
                            Select Category
                        </option>

                        <option>
                            Electronics
                        </option>

                        <option>
                            Furniture
                        </option>

                        <option>
                            Fashion
                        </option>

                        <option>
                            Books
                        </option>

                        <option>
                            Sports
                        </option>

                        <option>
                            Groceries
                        </option>

                    </select>


                    <textarea
                        name="description"
                        placeholder="Description"
                        value={product.description}
                        onChange={handleChange}
                        required
                    />


                    <input
                        type="number"
                        name="price"
                        placeholder="Original Price"
                        value={product.price}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        required
                    />


                    <input
                        type="number"
                        name="discountPercentage"
                        placeholder="Discount (%)"
                        value={product.discountPercentage}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        step="0.01"
                    />


                    <input
                        type="number"
                        name="stockQuantity"
                        placeholder="Stock Quantity"
                        value={product.stockQuantity}
                        onChange={handleChange}
                        min="0"
                        required
                    />


                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                            setImage(
                                e.target.files[0]
                            )
                        }
                    />


                    {product.price && (
                        <div className="discount-preview">

                            <span>
                                Selling Price
                            </span>

                            <strong>
                                ₹
                                {discountedPrice.toLocaleString(
                                    "en-IN",
                                    {
                                        maximumFractionDigits: 2
                                    }
                                )}
                            </strong>

                        </div>
                    )}


                    <button type="submit">
                        Submit Product
                    </button>

                </form>

            </div>

        </>

    );
}

export default AddProduct;

