import {
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Chip,
    CircularProgress,
    Divider,
    Typography,
} from "@mui/material";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getMyOrders,
    cancelOrder,
    requestReturn,
} from "../../api/orderService";

import { products } from "../../data/products";


function MyOrders() {

    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);


    // ==========================================
    // FETCH MY ORDERS
    // ==========================================

    const fetchOrders = async () => {

        try {

            console.log(
                "===== FETCHING MY ORDERS ====="
            );

            const response =
                await getMyOrders();

            console.log(
                "MY ORDERS RESPONSE:",
                response.data
            );

            setOrders(
                response.data?.data || []
            );

        } catch (error) {

            console.error(
                "MY ORDERS ERROR:",
                error
            );

            console.error(
                "BACKEND RESPONSE:",
                error.response?.data
            );

            alert(
                error.response?.data?.message ||
                "Failed to load orders"
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        fetchOrders();

    }, []);


    // ==========================================
    // PRODUCT IMAGE
    // ==========================================

    const getProductImage = (
        productId,
        productName
    ) => {

        const product =
            products.find(
                (item) =>
                    item.id ===
                    Number(productId)
            );

        if (product?.image) {
            return product.image;
        }

        const name =
            (
                productName || ""
            )
                .toLowerCase()
                .trim();

        if (name.includes("iphone")) {
            return "/products/iphone.jpg";
        }

        if (name.includes("samsung")) {
            return "/products/samsung.jpg";
        }

        if (
            name.includes(
                "wireless headphones"
            )
        ) {
            return "/products/headphones.jpg";
        }

        if (
            name.includes(
                "bluetooth earbuds"
            )
        ) {
            return "/products/earbuds.jpg";
        }

        if (
            name.includes(
                "wired earphones"
            )
        ) {
            return "/products/wired-earphones.jpg";
        }

        if (
            name.includes(
                "bluetooth speaker"
            )
        ) {
            return "/products/speaker.jpg";
        }

        if (
            name.includes(
                "smart watch"
            )
        ) {
            return "/products/smartwatch.jpg";
        }

        if (
            name.includes(
                "fitness band"
            )
        ) {
            return "/products/fitness-band.jpg";
        }

        if (
            name.includes(
                "hp laptop"
            )
        ) {
            return "/products/hp-laptop.jpg";
        }

        if (
            name.includes("macbook")
        ) {
            return "/products/macbook.jpg";
        }

        if (
            name.includes("power bank")
        ) {
            return "/products/powerbank.jpg";
        }

        if (
            name.includes("charger")
        ) {
            return "/products/charger.jpg";
        }

        if (
            name.includes("backpack")
        ) {
            return "/products/backpack.jpg";
        }

        if (
            name.includes("air fryer")
        ) {
            return "/products/air-fryer.jpg";
        }

        if (
            name.includes("kettle")
        ) {
            return "/products/kettle.jpg";
        }

        if (
            name.includes(
                "gaming controller"
            )
        ) {
            return "/products/gaming-controller.jpg";
        }

        if (
            name.includes(
                "gaming mouse"
            )
        ) {
            return "/products/gaming-mouse.jpg";
        }

        return "";
    };


    // ==========================================
    // STATUS COLOR
    // ==========================================

    const getStatusColor = (status) => {

        switch (status) {

            case "PLACED":
                return "info";

            case "CONFIRMED":
                return "primary";

            case "PROCESSING":
                return "secondary";

            case "SHIPPED":
                return "warning";

            case "DELIVERED":
                return "success";

            case "CANCELLED":
                return "error";

            case "RETURNED":
                return "warning";

            case "REFUNDED":
                return "success";

            default:
                return "default";
        }
    };


    // ==========================================
    // CANCEL ORDER
    // ==========================================

    const handleCancelOrder = async (
        orderId
    ) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to cancel this order?"
            );

        if (!confirmed) {
            return;
        }

        try {

            const response =
                await cancelOrder(
                    orderId
                );

            console.log(
                "CANCEL ORDER RESPONSE:",
                response.data
            );

            alert(
                response.data?.message ||
                "Order cancelled successfully"
            );

            await fetchOrders();

        } catch (error) {

            console.error(
                "CANCEL ORDER ERROR:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to cancel order"
            );
        }
    };


    // ==========================================
    // REQUEST RETURN
    // ==========================================

    const handleReturnOrder = async (
        orderId
    ) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to request a return for this order?"
            );

        if (!confirmed) {
            return;
        }

        try {

            const response =
                await requestReturn(
                    orderId
                );

            console.log(
                "RETURN ORDER RESPONSE:",
                response.data
            );

            alert(
                response.data?.message ||
                "Return request submitted successfully"
            );

            await fetchOrders();

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
                "Failed to request return"
            );
        }
    };


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
    // UI
    // ==========================================

    return (
        <Box
            sx={{
                minHeight: "100vh",
                backgroundColor:
                    "#f4f6f8",
                p: {
                    xs: 2,
                    md: 4,
                },
            }}
        >

            {/* PAGE TITLE */}

            <Typography
                variant="h4"
                fontWeight="bold"
                mb={4}
            >
                My Orders
            </Typography>


            {/* NO ORDERS */}

            {orders.length === 0 ? (

                <Card>

                    <CardContent>

                        <Typography
                            variant="h6"
                            mb={2}
                        >
                            You have no orders yet.
                        </Typography>

                        <Button
                            variant="contained"
                            onClick={() =>
                                navigate(
                                    "/products"
                                )
                            }
                        >
                            Start Shopping
                        </Button>

                    </CardContent>

                </Card>

            ) : (

                orders.map((order) => (

                    <Card
                        key={order.id}
                        sx={{
                            mb: 3,
                            borderRadius: 3,
                            overflow: "hidden",
                        }}
                    >

                        <CardContent>

                            {/* ORDER HEADER */}

                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent:
                                        "space-between",
                                    alignItems:
                                        "center",
                                    flexWrap:
                                        "wrap",
                                    gap: 2,
                                }}
                            >

                                <Box>

                                    <Typography
                                        variant="h6"
                                        fontWeight="bold"
                                    >
                                        Order #{order.id}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Ordered on:{" "}
                                        {order.createdAt
                                            ? new Date(
                                                  order.createdAt
                                              ).toLocaleString()
                                            : "N/A"}
                                    </Typography>

                                </Box>


                                <Chip
                                    label={
                                        order.status
                                    }
                                    color={getStatusColor(
                                        order.status
                                    )}
                                    sx={{
                                        fontWeight:
                                            "bold",
                                    }}
                                />

                            </Box>


                            <Divider
                                sx={{
                                    my: 2,
                                }}
                            />


                            {/* ORDER ITEMS */}

                            {(
                                order.items ||
                                []
                            ).map(
                                (
                                    item,
                                    index
                                ) => {

                                    const productId =
                                        item.productId ||
                                        item.product?.id;

                                    const productName =
                                        item.productName ||
                                        item.product?.name ||
                                        item.name ||
                                        "Product";

                                    const image =
                                        getProductImage(
                                            productId,
                                            productName
                                        );

                                    const quantity =
                                        Number(
                                            item.quantity ||
                                            1
                                        );

                                    const itemPrice =
                                        Number(
                                            item.price ??
                                            item.unitPrice ??
                                            item.finalPrice ??
                                            0
                                        );

                                    const subtotal =
                                        Number(
                                            item.subtotal ??
                                            item.totalPrice ??
                                            itemPrice *
                                                quantity
                                        );

                                    return (
                                        <Box
                                            key={
                                                item.id ||
                                                index
                                            }
                                            sx={{
                                                display:
                                                    "flex",
                                                gap: 2,
                                                alignItems:
                                                    "center",
                                                mb: 2,
                                                p: 1,
                                            }}
                                        >

                                            {/* IMAGE */}

                                            {image && (
                                                <CardMedia
                                                    component="img"
                                                    image={
                                                        image
                                                    }
                                                    alt={
                                                        productName
                                                    }
                                                    sx={{
                                                        width: 100,
                                                        height: 100,
                                                        objectFit:
                                                            "cover",
                                                        borderRadius:
                                                            2,
                                                    }}
                                                />
                                            )}


                                            {/* DETAILS */}

                                            <Box
                                                sx={{
                                                    flexGrow: 1,
                                                }}
                                            >

                                                <Typography
                                                    variant="h6"
                                                    fontWeight="bold"
                                                >
                                                    {
                                                        productName
                                                    }
                                                </Typography>

                                                <Typography
                                                    variant="body1"
                                                >
                                                    ₹
                                                    {itemPrice.toLocaleString(
                                                        "en-IN"
                                                    )}{" "}
                                                    ×{" "}
                                                    {quantity}
                                                </Typography>

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    Subtotal: ₹
                                                    {subtotal.toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </Typography>

                                            </Box>

                                        </Box>
                                    );
                                }
                            )}


                            <Divider
                                sx={{
                                    my: 2,
                                }}
                            />


                            {/* ORDER TOTAL */}

                            <Typography
                                variant="h6"
                                fontWeight="bold"
                            >
                                Total: ₹
                                {Number(
                                    order.totalAmount ??
                                    order.total ??
                                    0
                                ).toLocaleString(
                                    "en-IN"
                                )}
                            </Typography>


                            {/* ACTIONS */}

                            <Box
                                sx={{
                                    display: "flex",
                                    gap: 2,
                                    flexWrap:
                                        "wrap",
                                    mt: 3,
                                }}
                            >

                                <Button
                                    variant="outlined"
                                    onClick={() =>
                                        navigate(
                                            `/orders/${order.id}`
                                        )
                                    }
                                >
                                    View Details
                                </Button>


                                {/* CANCEL */}

                                {(
                                    order.status ===
                                        "PLACED" ||
                                    order.status ===
                                        "CONFIRMED"
                                ) && (

                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={() =>
                                            handleCancelOrder(
                                                order.id
                                            )
                                        }
                                    >
                                        Cancel Order
                                    </Button>

                                )}


                                {/* RETURN */}

                                {order.status ===
                                    "DELIVERED" && (

                                    <Button
                                        variant="contained"
                                        color="warning"
                                        onClick={() =>
                                            handleReturnOrder(
                                                order.id
                                            )
                                        }
                                    >
                                        Request Return
                                    </Button>

                                )}


                                {/* REFUNDED */}

                                {order.status ===
                                    "REFUNDED" && (

                                    <Chip
                                        label="Refund Completed"
                                        color="success"
                                    />

                                )}

                            </Box>

                        </CardContent>

                    </Card>

                ))
            )}

        </Box>
    );
}


export default MyOrders;