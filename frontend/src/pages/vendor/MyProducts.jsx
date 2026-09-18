import { useEffect, useState } from "react";

import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Grid,
    Typography,
} from "@mui/material";

import { useNavigate } from "react-router-dom";

import api from "../../api/api";


function MyProducts() {

    const navigate = useNavigate();


    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    const loadProducts = async () => {

        try {

            setLoading(true);

            setError("");


            let vendorId =
                localStorage.getItem("vendorId");


            /*
             * Current test vendor fallback.
             */

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


            console.log(
                "Loading products for vendor:",
                vendorId
            );


            const response =
                await api.get(
                    `/products/vendor/${vendorId}`
                );


            console.log(
                "Vendor products response:",
                response.data
            );


            if (response.data.success) {

                setProducts(
                    response.data.data || []
                );

            } else {

                setError(
                    response.data.message ||
                    "Unable to load products."
                );
            }


        } catch (error) {

            console.error(
                "Failed to load vendor products:",
                error
            );


            setError(
                error.response?.data?.message ||
                "Failed to load products."
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        loadProducts();

    }, []);


    return (

        <Box
            sx={{
                minHeight: "100vh",
                backgroundColor: "#f5f7fa",
                py: 5,
            }}
        >

            <Container maxWidth="lg">

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
                            My Products
                        </Typography>


                        <Typography
                            color="text.secondary"
                        >
                            Products belonging to your store
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


                <Button
                    variant="contained"
                    sx={{
                        mb: 4,
                    }}
                    onClick={() =>
                        navigate(
                            "/vendor/products/add"
                        )
                    }
                >
                    Add New Product
                </Button>


                {loading && (

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            py: 8,
                        }}
                    >

                        <CircularProgress />

                    </Box>
                )}


                {!loading && error && (

                    <Card>

                        <CardContent>

                            <Typography
                                color="error"
                                sx={{
                                    mb: 2,
                                }}
                            >
                                {error}
                            </Typography>


                            <Button
                                variant="contained"
                                onClick={loadProducts}
                            >
                                Try Again
                            </Button>

                        </CardContent>

                    </Card>
                )}


                {!loading &&
                    !error &&
                    products.length === 0 && (

                    <Card>

                        <CardContent>

                            <Typography
                                variant="h6"
                                gutterBottom
                            >
                                No Products Found
                            </Typography>


                            <Typography
                                color="text.secondary"
                            >
                                You have not added any
                                products yet.
                            </Typography>

                        </CardContent>

                    </Card>
                )}


                {!loading &&
                    !error &&
                    products.length > 0 && (

                    <Grid
                        container
                        spacing={3}
                    >

                        {products.map((product) => (

                            <Grid
                                key={product.id}
                                size={{
                                    xs: 12,
                                    sm: 6,
                                    md: 4,
                                }}
                            >

                                <Card
                                    sx={{
                                        height: "100%",
                                    }}
                                >

                                    <CardContent>

                                        <Typography
                                            variant="h6"
                                            fontWeight="bold"
                                            gutterBottom
                                        >
                                            {product.productName}
                                        </Typography>


                                        <Typography
                                            color="text.secondary"
                                            sx={{
                                                mb: 1,
                                            }}
                                        >
                                            Brand:{" "}
                                            {product.brand}
                                        </Typography>


                                        <Typography
                                            sx={{
                                                mb: 1,
                                            }}
                                        >
                                            Price: ₹
                                            {Number(
                                                product.price || 0
                                            ).toFixed(2)}
                                        </Typography>


                                        <Typography
                                            sx={{
                                                mb: 1,
                                            }}
                                        >
                                            Final Price: ₹
                                            {Number(
                                                product.finalPrice || 0
                                            ).toFixed(2)}
                                        </Typography>


                                        <Typography>
                                            Stock:{" "}
                                            {product.stockQuantity}
                                        </Typography>

                                    </CardContent>

                                </Card>

                            </Grid>

                        ))}

                    </Grid>
                )}

            </Container>

        </Box>
    );
}


export default MyProducts;
