import {
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    CircularProgress,
    Divider,
    Typography,
} from "@mui/material";

import { useEffect, useState } from "react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    getOrderById,
    cancelOrder,
    requestReturn,
} from "../../api/orderService";

import { products } from "../../data/products";


function OrderDetails() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [order, setOrder] = useState(null);

    const [loading, setLoading] =
        useState(true);

    const [actionLoading, setActionLoading] =
        useState(false);


    // ==========================================
    // FETCH ORDER
    // ==========================================

    const fetchOrder = async () => {

        try {

            console.log(
                "===== FETCHING ORDER DETAILS ====="
            );

            console.log(
                "Order ID:",
                id
            );

            const response =
                await getOrderById(id);

            console.log(
                "ORDER DETAILS RESPONSE:",
                response.data
            );

            if (
                response.data &&
                response.data.success
            ) {

                setOrder(
                    response.data.data
                );

            } else {

                alert(
                    response.data?.message ||
                    "Failed to load order"
                );
            }

        } catch (error) {

            console.error(
                "ORDER DETAILS ERROR:",
                error
            );

            console.error(
                "BACKEND RESPONSE:",
                error.response?.data
            );

            alert(
                error.response?.data?.message ||
                "Failed to load order details"
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        fetchOrder();

    }, [id]);


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (
            <Box
                sx={{
                    minHeight: "70vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >

                <CircularProgress />

            </Box>
        );

    }


    // ==========================================
    // ORDER NOT FOUND
    // ==========================================

    if (!order) {

        return (
            <Box
                sx={{
                    minHeight: "70vh",
                    p: 4,
                }}
            >

                <Typography
                    variant="h5"
                    fontWeight="bold"
                >
                    Order not found
                </Typography>

                <Button
                    variant="contained"
                    sx={{ mt: 3 }}
                    onClick={() =>
                        navigate("/my-orders")
                    }
                >
                    Back to My Orders
                </Button>

            </Box>
        );

    }


    // ==========================================
    // PRODUCT IMAGE
    // ==========================================

    const getProductImage = (
        productId
    ) => {

        const product =
            products.find(
                (item) =>
                    item.id ===
                    Number(productId)
            );

        return product?.image || "";

    };


    // ==========================================
    // STATUS COLOR
    // ==========================================

    const getStatusColor = () => {

        switch (order.status) {

            case "DELIVERED":
                return "success.main";

            case "CANCELLED":
                return "error.main";

            case "RETURNED":
                return "warning.main";

            case "REFUNDED":
                return "info.main";

            case "SHIPPED":
                return "primary.main";

            case "PROCESSING":
                return "primary.main";

            case "CONFIRMED":
                return "primary.main";

            default:
                return "primary.main";
        }

    };


    // ==========================================
    // ORDER TRACKING
    // ==========================================

    const trackingStatuses = [
        "PLACED",
        "CONFIRMED",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
    ];

    const getStatusIndex = () => {

        return trackingStatuses.indexOf(
            order.status
        );

    };

    const currentStatusIndex =
        getStatusIndex();


    // ==========================================
    // CANCEL ORDER
    // ==========================================

    const handleCancelOrder = async () => {

        const confirmed =
            window.confirm(
                "Are you sure you want to cancel this order?"
            );

        if (!confirmed) {
            return;
        }

        try {

            setActionLoading(true);

            console.log(
                "===== CANCELLING ORDER ====="
            );

            const response =
                await cancelOrder(id);

            console.log(
                "CANCEL ORDER RESPONSE:",
                response.data
            );

            if (
                response.data &&
                response.data.success
            ) {

                alert(
                    "Order cancelled successfully."
                );

                setOrder(
                    response.data.data
                );

            } else {

                alert(
                    response.data?.message ||
                    "Failed to cancel order"
                );

            }

        } catch (error) {

            console.error(
                "CANCEL ORDER ERROR:",
                error
            );

            console.error(
                "BACKEND RESPONSE:",
                error.response?.data
            );

            alert(
                error.response?.data?.message ||
                "Failed to cancel order"
            );

        } finally {

            setActionLoading(false);

        }
    };


    // ==========================================
    // RETURN ORDER
    // ==========================================

    const handleReturnOrder = async () => {

        const confirmed =
            window.confirm(
                "Are you sure you want to return this order?"
            );

        if (!confirmed) {
            return;
        }

        try {

            setActionLoading(true);

            console.log(
                "===== REQUESTING ORDER RETURN ====="
            );

            const response =
                await requestReturn(id);

            console.log(
                "RETURN ORDER RESPONSE:",
                response.data
            );

            if (
                response.data &&
                response.data.success
            ) {

                alert(
                    "Return requested successfully."
                );

                setOrder(
                    response.data.data
                );

            } else {

                alert(
                    response.data?.message ||
                    "Failed to return order"
                );

            }

        } catch (error) {

            console.error(
                "RETURN ORDER ERROR:",
                error
            );

            console.error(
                "BACKEND RESPONSE:",
                error.response?.data
            );

            alert(
                error.response?.data?.message ||
                "Failed to return order"
            );

        } finally {

            setActionLoading(false);

        }
    };


    return (

        <Box
            sx={{
                minHeight: "100vh",
                backgroundColor: "#f4f6f8",
                p: {
                    xs: 2,
                    md: 4,
                },
            }}
        >

            {/* ==================================
                BACK BUTTON
            ================================== */}

            <Button
                variant="outlined"
                sx={{
                    mb: 3,
                }}
                onClick={() =>
                    navigate("/my-orders")
                }
            >
                ← Back to My Orders
            </Button>


            {/* ==================================
                PAGE TITLE
            ================================== */}

            <Typography
                variant="h4"
                fontWeight="bold"
                mb={3}
            >
                Order Details
            </Typography>


            {/* ==================================
                ORDER SUMMARY
            ================================== */}

            <Card
                sx={{
                    maxWidth: 1000,
                    mx: "auto",
                    mb: 3,
                    borderRadius: 3,
                    boxShadow: 3,
                }}
            >

                <CardContent
                    sx={{
                        p: 4,
                    }}
                >

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 2,
                        }}
                    >

                        <Box>

                            <Typography
                                variant="h5"
                                fontWeight="bold"
                            >
                                Order #{order.id}
                            </Typography>

                            <Typography
                                color="text.secondary"
                                sx={{
                                    mt: 1,
                                }}
                            >
                                Ordered on:{" "}
                                {order.createdAt
                                    ? new Date(
                                        order.createdAt
                                    ).toLocaleString()
                                    : "N/A"}
                            </Typography>

                        </Box>


                        <Typography
                            variant="h6"
                            fontWeight="bold"
                            sx={{
                                color:
                                    getStatusColor(),
                            }}
                        >
                            {order.status}
                        </Typography>

                    </Box>

                </CardContent>

            </Card>


            {/* ==================================
                ORDER TRACKING
            ================================== */}

            {order.status !== "CANCELLED" && (

                <Card
                    sx={{
                        maxWidth: 1000,
                        mx: "auto",
                        mb: 3,
                        borderRadius: 3,
                        boxShadow: 3,
                    }}
                >

                    <CardContent
                        sx={{
                            p: 4,
                        }}
                    >

                        <Typography
                            variant="h6"
                            fontWeight="bold"
                            mb={4}
                        >
                            Order Tracking
                        </Typography>


                        <Box
                            sx={{
                                display: "flex",
                                justifyContent:
                                    "space-between",
                                alignItems:
                                    "flex-start",
                                position:
                                    "relative",
                            }}
                        >

                            {trackingStatuses.map(
                                (status, index) => {

                                    const completed =
                                        currentStatusIndex >=
                                        index;

                                    const current =
                                        order.status ===
                                        status;

                                    return (

                                        <Box
                                            key={status}
                                            sx={{
                                                flex: 1,
                                                textAlign:
                                                    "center",
                                                position:
                                                    "relative",
                                            }}
                                        >

                                            {/* CONNECTING LINE */}

                                            {index <
                                                trackingStatuses.length -
                                                1 && (

                                                <Box
                                                    sx={{
                                                        position:
                                                            "absolute",
                                                        top: 12,
                                                        left: "50%",
                                                        width: "100%",
                                                        height: 3,
                                                        backgroundColor:
                                                            currentStatusIndex >
                                                            index
                                                                ? "success.main"
                                                                : "#ddd",
                                                        zIndex: 0,
                                                    }}
                                                />

                                            )}


                                            {/* STATUS CIRCLE */}

                                            <Box
                                                sx={{
                                                    width: 26,
                                                    height: 26,
                                                    borderRadius:
                                                        "50%",
                                                    margin:
                                                        "0 auto",
                                                    display:
                                                        "flex",
                                                    justifyContent:
                                                        "center",
                                                    alignItems:
                                                        "center",
                                                    backgroundColor:
                                                        completed
                                                            ? "success.main"
                                                            : "#ddd",
                                                    color:
                                                        "#fff",
                                                    fontWeight:
                                                        "bold",
                                                    position:
                                                        "relative",
                                                    zIndex: 1,
                                                }}
                                            >
                                                {completed
                                                    ? "✓"
                                                    : ""}
                                            </Box>


                                            {/* STATUS NAME */}

                                            <Typography
                                                variant="body2"
                                                fontWeight={
                                                    current
                                                        ? "bold"
                                                        : "normal"
                                                }
                                                sx={{
                                                    mt: 1,
                                                }}
                                            >
                                                {status}
                                            </Typography>

                                        </Box>

                                    );

                                }
                            )}

                        </Box>


                        {/* RETURN / REFUND STATUS */}

                        {(order.status ===
                            "RETURNED" ||
                            order.status ===
                            "REFUNDED") && (

                            <Box
                                sx={{
                                    mt: 4,
                                    pt: 3,
                                    borderTop:
                                        "1px solid #ddd",
                                }}
                            >

                                <Typography
                                    fontWeight="bold"
                                    mb={2}
                                >
                                    Return & Refund
                                </Typography>

                                <Typography
                                    color="text.secondary"
                                >
                                    ✓ Returned
                                </Typography>

                                <Typography
                                    color={
                                        order.status ===
                                        "REFUNDED"
                                            ? "success.main"
                                            : "text.secondary"
                                    }
                                    sx={{
                                        mt: 1,
                                    }}
                                >
                                    {order.status ===
                                    "REFUNDED"
                                        ? "✓ Refunded"
                                        : "○ Refund Pending"}
                                </Typography>

                            </Box>

                        )}

                    </CardContent>

                </Card>

            )}


            {/* ==================================
                CANCELLED STATUS
            ================================== */}

            {order.status === "CANCELLED" && (

                <Card
                    sx={{
                        maxWidth: 1000,
                        mx: "auto",
                        mb: 3,
                        borderRadius: 3,
                        boxShadow: 3,
                    }}
                >

                    <CardContent
                        sx={{
                            p: 4,
                        }}
                    >

                        <Typography
                            variant="h6"
                            fontWeight="bold"
                            color="error.main"
                        >
                            Order Cancelled
                        </Typography>

                        <Typography
                            color="text.secondary"
                            sx={{
                                mt: 1,
                            }}
                        >
                            This order has been cancelled.
                        </Typography>

                    </CardContent>

                </Card>

            )}


            {/* ==================================
                CUSTOMER + ADDRESS
            ================================== */}

            <Card
                sx={{
                    maxWidth: 1000,
                    mx: "auto",
                    mb: 3,
                    borderRadius: 3,
                    boxShadow: 3,
                }}
            >

                <CardContent
                    sx={{
                        p: 4,
                    }}
                >

                    <Typography
                        variant="h6"
                        fontWeight="bold"
                        mb={2}
                    >
                        Delivery Information
                    </Typography>

                    <Typography>
                        <strong>
                            Customer:
                        </strong>{" "}
                        {order.customerName}
                    </Typography>

                    <Typography
                        sx={{
                            mt: 1,
                        }}
                    >
                        <strong>
                            Email:
                        </strong>{" "}
                        {order.customerEmail}
                    </Typography>

                    <Typography
                        sx={{
                            mt: 1,
                        }}
                    >
                        <strong>
                            Phone:
                        </strong>{" "}
                        {order.phone}
                    </Typography>

                    <Divider
                        sx={{
                            my: 2,
                        }}
                    />

                    <Typography
                        fontWeight="bold"
                    >
                        Delivery Address
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{
                            mt: 1,
                        }}
                    >
                        {order.address}
                    </Typography>

                    <Typography
                        color="text.secondary"
                    >
                        {order.city},{" "}
                        {order.state}
                    </Typography>

                    <Typography
                        color="text.secondary"
                    >
                        PIN: {order.pincode}
                    </Typography>

                </CardContent>

            </Card>


            {/* ==================================
                ORDER ITEMS
            ================================== */}

            <Card
                sx={{
                    maxWidth: 1000,
                    mx: "auto",
                    mb: 3,
                    borderRadius: 3,
                    boxShadow: 3,
                }}
            >

                <CardContent
                    sx={{
                        p: 4,
                    }}
                >

                    <Typography
                        variant="h6"
                        fontWeight="bold"
                        mb={3}
                    >
                        Ordered Products
                    </Typography>


                    {order.items?.map(
                        (item, index) => (

                            <Box
                                key={
                                    item.productId ||
                                    index
                                }
                            >

                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 3,
                                        flexDirection: {
                                            xs: "column",
                                            sm: "row",
                                        },
                                        py: 2,
                                    }}
                                >

                                    {/* PRODUCT IMAGE */}

                                    <Box
                                        sx={{
                                            width: {
                                                xs: "100%",
                                                sm: 180,
                                            },
                                            height: 160,
                                            display: "flex",
                                            justifyContent:
                                                "center",
                                            alignItems:
                                                "center",
                                            backgroundColor:
                                                "#fff",
                                            borderRadius: 2,
                                            overflow: "hidden",
                                            flexShrink: 0,
                                        }}
                                    >

                                        <CardMedia
                                            component="img"
                                            image={
                                                getProductImage(
                                                    item.productId
                                                )
                                            }
                                            alt={
                                                item.productName
                                            }
                                            sx={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit:
                                                    "contain",
                                            }}
                                        />

                                    </Box>


                                    {/* PRODUCT INFO */}

                                    <Box
                                        sx={{
                                            flexGrow: 1,
                                            width: "100%",
                                        }}
                                    >

                                        <Typography
                                            variant="h6"
                                            fontWeight="bold"
                                        >
                                            {
                                                item.productName
                                            }
                                        </Typography>

                                        <Typography
                                            color="text.secondary"
                                            sx={{
                                                mt: 1,
                                            }}
                                        >
                                            ₹
                                            {Number(
                                                item.price
                                            ).toLocaleString(
                                                "en-IN"
                                            )}{" "}
                                            ×{" "}
                                            {item.quantity}
                                        </Typography>

                                        <Typography
                                            sx={{
                                                mt: 1,
                                            }}
                                            fontWeight="bold"
                                        >
                                            Subtotal: ₹
                                            {Number(
                                                item.subtotal ??
                                                (
                                                    Number(
                                                        item.price
                                                    ) *
                                                    Number(
                                                        item.quantity
                                                    )
                                                )
                                            ).toLocaleString(
                                                "en-IN"
                                            )}
                                        </Typography>

                                    </Box>

                                </Box>


                                {index <
                                    order.items.length -
                                    1 && (

                                    <Divider />

                                )}

                            </Box>

                        )
                    )}

                </CardContent>

            </Card>


            {/* ==================================
                TOTAL
            ================================== */}

            <Card
                sx={{
                    maxWidth: 1000,
                    mx: "auto",
                    mb: 3,
                    borderRadius: 3,
                    boxShadow: 3,
                }}
            >

                <CardContent
                    sx={{
                        p: 4,
                    }}
                >

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent:
                                "space-between",
                            alignItems:
                                "center",
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
                                0
                            ).toLocaleString(
                                "en-IN"
                            )}
                        </Typography>

                    </Box>

                </CardContent>

            </Card>


            {/* ==================================
                ACTIONS
            ================================== */}

            <Box
                sx={{
                    maxWidth: 1000,
                    mx: "auto",
                    display: "flex",
                    gap: 2,
                    flexWrap: "wrap",
                }}
            >

                {(
                    order.status ===
                        "PLACED" ||
                    order.status ===
                        "CONFIRMED"
                ) && (

                    <Button
                        variant="outlined"
                        color="error"
                        disabled={
                            actionLoading
                        }
                        onClick={
                            handleCancelOrder
                        }
                    >
                        {actionLoading
                            ? "Cancelling..."
                            : "Cancel Order"}
                    </Button>

                )}


                {order.status ===
                    "DELIVERED" && (

                    <Button
                        variant="outlined"
                        color="warning"
                        disabled={
                            actionLoading
                        }
                        onClick={
                            handleReturnOrder
                        }
                    >
                        {actionLoading
                            ? "Processing..."
                            : "Return Order"}
                    </Button>

                )}


                <Button
                    variant="contained"
                    onClick={() =>
                        navigate(
                            "/products"
                        )
                    }
                >
                    Continue Shopping
                </Button>

            </Box>

        </Box>
    );
}


export default OrderDetails;
