import { useState } from "react";

import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    TextField,
    Typography,
} from "@mui/material";

import { useNavigate } from "react-router-dom";

import api from "../../api/api";


function AddProduct() {

    const navigate = useNavigate();


    const [formData, setFormData] = useState({
        productName: "",
        brand: "",
        description: "",
        price: "",
        discountPercentage: "0",
        stockQuantity: "",
        categoryId: "",
    });


    const [loading, setLoading] = useState(false);

    const [message, setMessage] = useState("");

    const [error, setError] = useState("");


    const handleChange = (event) => {

        const {
            name,
            value,
        } = event.target;


        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }));
    };


    const handleSubmit = async (event) => {

        event.preventDefault();

        setMessage("");

        setError("");


        /*
         * Current vendor:
         *
         * User ID   = 12
         * Vendor ID = 2
         *
         * Use the stored vendor ID when available.
         * If it isn't available yet, use the current
         * logged-in vendor's known vendor ID.
         */

        let vendorId =
            localStorage.getItem("vendorId");


        if (!vendorId) {

            const email =
                localStorage.getItem("email");


            if (
                email ===
                "maniteja3@gmail.com"
            ) {

                vendorId = "2";

                localStorage.setItem(
                    "vendorId",
                    vendorId
                );

            } else {

                setError(
                    "Vendor information is not available. Please login again."
                );

                return;
            }
        }


        if (!formData.categoryId) {

            setError(
                "Please enter a category ID."
            );

            return;
        }


        if (!formData.price) {

            setError(
                "Please enter the product price."
            );

            return;
        }


        if (!formData.stockQuantity) {

            setError(
                "Please enter the stock quantity."
            );

            return;
        }


        try {

            setLoading(true);


            const productRequest = {

                productName:
                    formData.productName,

                brand:
                    formData.brand,

                description:
                    formData.description,

                price:
                    Number(formData.price),

                discountPercentage:
                    Number(
                        formData.discountPercentage
                    ),

                stockQuantity:
                    Number(
                        formData.stockQuantity
                    ),

                categoryId:
                    Number(
                        formData.categoryId
                    ),

                vendorId:
                    Number(vendorId),
            };


            console.log(
                "Creating vendor product:",
                productRequest
            );


            const response =
                await api.post(
                    "/products",
                    productRequest
                );


            console.log(
                "Create product response:",
                response.data
            );


            if (response.data.success) {

                setMessage(
                    "Product created successfully. It is now pending admin approval."
                );


                setFormData({
                    productName: "",
                    brand: "",
                    description: "",
                    price: "",
                    discountPercentage: "0",
                    stockQuantity: "",
                    categoryId: "",
                });

            } else {

                setError(
                    response.data.message ||
                    "Product creation failed."
                );
            }


        } catch (error) {

            console.error(
                "Create product error:",
                error
            );


            console.error(
                "Server response:",
                error.response?.data
            );


            setError(
                error.response?.data?.message ||
                "Failed to create product."
            );

        } finally {

            setLoading(false);
        }
    };


    return (

        <Box
            sx={{
                minHeight: "100vh",
                backgroundColor: "#f5f7fa",
                py: 5,
            }}
        >

            <Container maxWidth="md">

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 4,
                    }}
                >

                    <Box>

                        <Typography
                            variant="h4"
                            fontWeight="bold"
                        >
                            Add Product
                        </Typography>


                        <Typography
                            color="text.secondary"
                        >
                            Add a new product to your store
                        </Typography>

                    </Box>


                    <Button
                        variant="outlined"
                        onClick={() =>
                            navigate(
                                "/vendor/dashboard"
                            )
                        }
                    >
                        Dashboard
                    </Button>

                </Box>


                <Card>

                    <CardContent
                        sx={{
                            p: 4,
                        }}
                    >

                        <Box
                            component="form"
                            onSubmit={handleSubmit}
                        >

                            <TextField
                                fullWidth
                                required
                                label="Product Name"
                                name="productName"
                                value={
                                    formData.productName
                                }
                                onChange={
                                    handleChange
                                }
                                margin="normal"
                            />


                            <TextField
                                fullWidth
                                required
                                label="Brand"
                                name="brand"
                                value={
                                    formData.brand
                                }
                                onChange={
                                    handleChange
                                }
                                margin="normal"
                            />


                            <TextField
                                fullWidth
                                required
                                multiline
                                rows={4}
                                label="Description"
                                name="description"
                                value={
                                    formData.description
                                }
                                onChange={
                                    handleChange
                                }
                                margin="normal"
                            />


                            <TextField
                                fullWidth
                                required
                                type="number"
                                label="Price"
                                name="price"
                                value={
                                    formData.price
                                }
                                onChange={
                                    handleChange
                                }
                                margin="normal"
                                inputProps={{
                                    min: 0,
                                    step: "0.01",
                                }}
                            />


                            <TextField
                                fullWidth
                                type="number"
                                label="Discount Percentage"
                                name="discountPercentage"
                                value={
                                    formData.discountPercentage
                                }
                                onChange={
                                    handleChange
                                }
                                margin="normal"
                                inputProps={{
                                    min: 0,
                                    max: 100,
                                    step: "0.01",
                                }}
                            />


                            <TextField
                                fullWidth
                                required
                                type="number"
                                label="Stock Quantity"
                                name="stockQuantity"
                                value={
                                    formData.stockQuantity
                                }
                                onChange={
                                    handleChange
                                }
                                margin="normal"
                                inputProps={{
                                    min: 0,
                                }}
                            />


                            <TextField
                                fullWidth
                                required
                                type="number"
                                label="Category ID"
                                name="categoryId"
                                value={
                                    formData.categoryId
                                }
                                onChange={
                                    handleChange
                                }
                                margin="normal"
                                inputProps={{
                                    min: 1,
                                }}
                                helperText="For the existing Electronics category, use 1."
                            />


                            {message && (

                                <Typography
                                    color="success.main"
                                    sx={{
                                        mt: 3,
                                    }}
                                >
                                    {message}
                                </Typography>
                            )}


                            {error && (

                                <Typography
                                    color="error"
                                    sx={{
                                        mt: 3,
                                    }}
                                >
                                    {error}
                                </Typography>
                            )}


                            <Box
                                sx={{
                                    display: "flex",
                                    gap: 2,
                                    mt: 4,
                                }}
                            >

                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Creating..."
                                        : "Create Product"}
                                </Button>


                                <Button
                                    variant="outlined"
                                    onClick={() =>
                                        navigate(
                                            "/vendor/products"
                                        )
                                    }
                                >
                                    My Products
                                </Button>

                            </Box>

                        </Box>

                    </CardContent>

                </Card>

            </Container>

        </Box>
    );
}


export default AddProduct;
