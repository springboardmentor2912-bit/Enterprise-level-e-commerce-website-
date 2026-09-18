import {
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Divider,
    Typography,
} from "@mui/material";

import { useNavigate } from "react-router-dom";

import { products } from "../../data/products";


function OrderSuccess() {

    const navigate = useNavigate();


    // ==========================================
    // GET LATEST ORDER
    // ==========================================

    const orderData =
        localStorage.getItem("latestOrder");

    const order = orderData
        ? JSON.parse(orderData)
        : null;


    // ==========================================
    // ORDER NOT FOUND
    // ==========================================

    if (!order) {

        return (
            <Box
                sx={{
                    minHeight: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#f4f6f8",
                    p: 3,
                }}
            >

                <Card
                    sx={{
                        width: 500,
                        maxWidth: "100%",
                        textAlign: "center",
                        p: 4,
                    }}
                >

                    <CardContent>

                        <Typography
                            variant="h5"
                            fontWeight="bold"
                            mb={3}
                        >
                            Order details not found
                        </Typography>


                        <Button
                            variant="contained"
                            fullWidth
                            onClick={() =>
                                navigate("/products")
                            }
                        >
                            Continue Shopping
                        </Button>

                    </CardContent>

                </Card>

            </Box>
        );
    }


    return (

        <Box
            sx={{
                minHeight: "100vh",
                backgroundColor: "#f4f6f8",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 3,
            }}
        >

            <Card
                sx={{
                    width: 650,
                    maxWidth: "100%",
                    borderRadius: 3,
                    boxShadow: 4,
                }}
            >

                <CardContent
                    sx={{
                        p: {
                            xs: 3,
                            md: 5,
                        },
                    }}
                >

                    {/* ==================================
                        SUCCESS ICON
                    ================================== */}

                    <Typography
                        variant="h2"
                        textAlign="center"
                        mb={2}
                    >
                        🎉
                    </Typography>


                    {/* ==================================
                        SUCCESS MESSAGE
                    ================================== */}

                    <Typography
                        variant="h4"
                        fontWeight="bold"
                        color="success.main"
                        textAlign="center"
                        mb={2}
                    >
                        Order Placed Successfully!
                    </Typography>


                    {/* ==================================
                        ORDER ID
                    ================================== */}

                    <Typography
                        variant="body1"
                        textAlign="center"
                        mb={4}
                    >
                        Order ID:{" "}
                        <strong>
                            #{order.id || order.orderId}
                        </strong>
                    </Typography>


                    {/* ==================================
                        ORDERED PRODUCTS
                    ================================== */}

                    {order.items &&
                        order.items.length > 0 && (

                            <Box>

                                <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                    mb={2}
                                >
                                    Ordered Products
                                </Typography>


                                {order.items.map(
                                    (item, index) => {

                                        // Get product ID
                                        const productId =
                                            item.productId ??
                                            item.id;

                                        // Find product from local products data
                                        const product =
                                            products.find(
                                                (product) =>
                                                    product.id ===
                                                    Number(
                                                        productId
                                                    )
                                            );

                                        // Use local product image
                                        // first, then saved image
                                        const productImage =
                                            product?.image ||
                                            item.image;


                                        const productName =
                                            product?.name ||
                                            item.productName ||
                                            item.name;


                                        return (

                                            <Box
                                                key={
                                                    productId ||
                                                    index
                                                }
                                                sx={{
                                                    display: "flex",
                                                    alignItems:
                                                        "center",
                                                    gap: 3,
                                                    p: 2,
                                                    mb: 2,
                                                    border:
                                                        "1px solid #e0e0e0",
                                                    borderRadius: 2,
                                                    backgroundColor:
                                                        "#ffffff",
                                                }}
                                            >

                                                {/* ==================================
                                                    PRODUCT IMAGE
                                                ================================== */}

                                                <Box
                                                    sx={{
                                                        width: 130,
                                                        height: 130,
                                                        flexShrink: 0,
                                                        borderRadius: 2,
                                                        overflow:
                                                            "hidden",
                                                        border:
                                                            "1px solid #ddd",
                                                        backgroundColor:
                                                            "#ffffff",
                                                        display: "flex",
                                                        alignItems:
                                                            "center",
                                                        justifyContent:
                                                            "center",
                                                    }}
                                                >

                                                    {productImage ? (

                                                        <CardMedia
                                                            component="img"
                                                            image={
                                                                productImage
                                                            }
                                                            alt={
                                                                productName
                                                            }
                                                            sx={{
                                                                width:
                                                                    "100%",
                                                                height:
                                                                    "100%",
                                                                objectFit:
                                                                    "contain",
                                                            }}
                                                        />

                                                    ) : (

                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                        >
                                                            Image not
                                                            available
                                                        </Typography>

                                                    )}

                                                </Box>


                                                {/* ==================================
                                                    PRODUCT NAME
                                                ================================== */}

                                                <Typography
                                                    variant="h6"
                                                    fontWeight="bold"
                                                >
                                                    {productName}
                                                </Typography>

                                            </Box>

                                        );
                                    }
                                )}

                            </Box>

                        )}


                    <Divider
                        sx={{
                            my: 3,
                        }}
                    />


                    {/* ==================================
                        TOTAL
                    ================================== */}

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent:
                                "space-between",
                            alignItems: "center",
                            mb: 3,
                        }}
                    >

                        <Typography
                            variant="h5"
                            fontWeight="bold"
                        >
                            Total
                        </Typography>


                        <Typography
                            variant="h5"
                            fontWeight="bold"
                        >
                            ₹
                            {Number(
                                order.totalAmount ??
                                order.total ??
                                0
                            ).toLocaleString(
                                "en-IN"
                            )}
                        </Typography>

                    </Box>


                    {/* ==================================
                        CONTINUE SHOPPING
                    ================================== */}

                    <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={() =>
                            navigate("/products")
                        }
                    >
                        Continue Shopping
                    </Button>


                    {/* ==================================
                        HOME
                    ================================== */}

                    <Button
                        variant="outlined"
                        fullWidth
                        size="large"
                        sx={{
                            mt: 2,
                        }}
                        onClick={() =>
                            navigate("/home")
                        }
                    >
                        Go to Home
                    </Button>

                </CardContent>

            </Card>

        </Box>
    );
}

export default OrderSuccess;
