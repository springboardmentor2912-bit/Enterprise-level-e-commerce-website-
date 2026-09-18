import {
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Divider,
    Grid,
    TextField,
    Typography,
} from "@mui/material";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useCart } from "../../context/CartContext";
import { createOrder } from "../../api/orderService";

function Checkout() {
    const navigate = useNavigate();

    const {
        cartItems,
        clearCart,
    } = useCart();

    // Prevent checkout when the cart is empty.
    // This also protects direct navigation to /checkout.
    useEffect(() => {
        if (cartItems.length === 0) {
            navigate("/cart");
        }
    }, [cartItems.length, navigate]);

    const [address, setAddress] = useState({
        name: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
    });

    const [couponCode, setCouponCode] = useState("");
    const [couponApplied, setCouponApplied] = useState(false);
    const [loading, setLoading] = useState(false);

    // =========================================================
    // HANDLE ADDRESS INPUT
    // =========================================================

    const handleChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setAddress((previousAddress) => ({
            ...previousAddress,
            [name]: value,
        }));
    };

    // =========================================================
    // TOTAL
    // =========================================================

    const total = cartItems.reduce(
        (sum, item) =>
            sum +
            Number(item.price) *
            Number(item.quantity),
        0
    );

    // =========================================================
    // GET TOKEN
    // =========================================================

    const getToken = () => {
        return (
            localStorage.getItem("token") ||
            localStorage.getItem("jwtToken") ||
            localStorage.getItem("accessToken")
        );
    };

    // =========================================================
    // COUPON
    // =========================================================

    const handleApplyCoupon = () => {
        const code = couponCode.trim();

        if (!code) {
            alert("Please enter a coupon code");
            return;
        }

        setCouponCode(code.toUpperCase());
        setCouponApplied(true);

        alert(
            `Coupon ${code.toUpperCase()} added. It will be validated during checkout.`
        );
    };

    const handleRemoveCoupon = () => {
        setCouponCode("");
        setCouponApplied(false);
    };

    // =========================================================
    // CREATE RAZORPAY PAYMENT
    // =========================================================

    const createRazorpayPayment = async (orderId) => {
        const token = getToken();

        if (!token) {
            throw new Error(
                "Authentication token not found. Please login again."
            );
        }

        const response = await fetch(
            "/api/payments",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },

                body: JSON.stringify({
                    orderId: orderId,
                    gateway: "RAZORPAY",
                }),
            }
        );

        const data = await response.json();

        if (!response.ok || !data?.success) {
            throw new Error(
                data?.message ||
                "Failed to create Razorpay payment"
            );
        }

        return data.data;
    };

    // =========================================================
    // VERIFY RAZORPAY PAYMENT
    // =========================================================

    const verifyRazorpayPayment = async ({
        payment,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
    }) => {
        const token = getToken();

        if (!token) {
            throw new Error(
                "Authentication token not found. Please login again."
            );
        }

        const params = new URLSearchParams();

        params.append(
            "paymentOrderId",
            razorpayOrderId
        );

        params.append(
            "paymentReference",
            razorpayPaymentId
        );

        params.append(
            "signature",
            razorpaySignature
        );

        const response = await fetch(
            `/api/payments/${payment.id}/verify?${params.toString()}`,
            {
                method: "POST",

                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            }
        );

        const data = await response.json();

        if (!response.ok || !data?.success) {
            throw new Error(
                data?.message ||
                "Payment verification failed"
            );
        }

        return data.data;
    };

    // =========================================================
    // OPEN RAZORPAY CHECKOUT
    // =========================================================

    const openRazorpayCheckout = ({
        payment,
        order,
        onSuccess,
        onFailure,
    }) => {
        if (!window.Razorpay) {
            onFailure(
                new Error(
                    "Razorpay Checkout failed to load. Please refresh the page and try again."
                )
            );
            return;
        }

        if (!payment?.razorpayKeyId) {
            onFailure(
                new Error(
                    "Razorpay key is missing from the server response."
                )
            );
            return;
        }

        if (!payment?.gatewayOrderId) {
            onFailure(
                new Error(
                    "Razorpay order ID is missing from the server response."
                )
            );
            return;
        }

        const options = {
            key: payment.razorpayKeyId,

            amount: Math.round(
                Number(payment.amount) * 100
            ),

            currency: payment.currency || "INR",

            name: "ShopStack",

            description: `Payment for Order #${order.id}`,

            order_id: payment.gatewayOrderId,

            handler: async function (response) {
                try {
                    console.log(
                        "Razorpay payment successful:",
                        response
                    );

                    const verifiedPayment =
                        await verifyRazorpayPayment({
                            payment,
                            razorpayOrderId:
                                response.razorpay_order_id,
                            razorpayPaymentId:
                                response.razorpay_payment_id,
                            razorpaySignature:
                                response.razorpay_signature,
                        });

                    console.log(
                        "Razorpay payment verified:",
                        verifiedPayment
                    );

                    await onSuccess(
                        verifiedPayment
                    );
                } catch (error) {
                    console.error(
                        "Razorpay verification error:",
                        error
                    );

                    onFailure(error);
                }
            },

            prefill: {
                name: address.name,
                contact: address.phone,
            },

            notes: {
                shopstackOrderId:
                    String(order.id),
            },

            theme: {
                color: "#1976d2",
            },

            modal: {
                ondismiss: function () {
                    console.log(
                        "Razorpay checkout dismissed by customer."
                    );

                    onFailure(
                        new Error(
                            "Payment was cancelled. Your order has not been confirmed."
                        )
                    );
                },
            },
        };

        try {
            const razorpay =
                new window.Razorpay(options);

            razorpay.on(
                "payment.failed",
                function (response) {
                    console.error(
                        "Razorpay payment failed:",
                        response
                    );

                    const description =
                        response?.error?.description ||
                        "Razorpay payment failed. Please try again.";

                    onFailure(
                        new Error(description)
                    );
                }
            );

            razorpay.open();
        } catch (error) {
            console.error(
                "Unable to open Razorpay:",
                error
            );

            onFailure(
                new Error(
                    "Unable to open Razorpay Checkout. Please try again."
                )
            );
        }
    };

    // =========================================================
    // PLACE ORDER
    // =========================================================

    const handlePlaceOrder = async () => {
        if (cartItems.length === 0) {
            alert("Your cart is empty");
            navigate("/cart");
            return;
        }

        if (
            !address.name ||
            !address.phone ||
            !address.address ||
            !address.city ||
            !address.state ||
            !address.pincode
        ) {
            alert(
                "Please fill all delivery details"
            );
            return;
        }

        try {
            setLoading(true);

            // =================================================
            // 1. CREATE SHOPSTACK ORDER
            // =================================================

            const orderData = {
                customerName:
                    address.name,

                phone:
                    address.phone,

                address:
                    address.address,

                city:
                    address.city,

                state:
                    address.state,

                pincode:
                    address.pincode,

                couponCode:
                    couponApplied
                        ? couponCode
                        : null,
            };

            console.log(
                "Creating ShopStack order...",
                orderData
            );

            const orderResponse =
                await createOrder(orderData);

            if (
                !orderResponse.data ||
                !orderResponse.data.success
            ) {
                throw new Error(
                    orderResponse.data?.message ||
                    "Order could not be created"
                );
            }

            const order =
                orderResponse.data.data;

            console.log(
                "Order Created:",
                order
            );

            // =================================================
            // 2. CREATE RAZORPAY PAYMENT
            // =================================================

            console.log(
                "Creating Razorpay payment..."
            );

            const payment =
                await createRazorpayPayment(
                    order.id
                );

            console.log(
                "Razorpay Payment Created:",
                payment
            );

            // Stop the loading state while Razorpay
            // Checkout is open.
            setLoading(false);

            // =================================================
            // 3. OPEN RAZORPAY CHECKOUT
            // =================================================

            console.log(
                "Opening Razorpay Checkout..."
            );

            openRazorpayCheckout({
                payment,
                order,

                // =================================================
                // 4. PAYMENT SUCCESS + VERIFICATION
                // =================================================

                onSuccess: async (
                    verifiedPayment
                ) => {
                    try {
                        setLoading(true);

                        console.log(
                            "Payment Verified:",
                            verifiedPayment
                        );

                        // =================================================
                        // 5. SAVE COMPLETE ORDER
                        // =================================================

                        const completeOrder = {
                            ...order,

                            status: "CONFIRMED",

                            items: cartItems,

                            payment:
                                verifiedPayment,

                            couponCode:
                                couponApplied
                                    ? couponCode
                                    : null,
                        };

                        localStorage.setItem(
                            "latestOrder",
                            JSON.stringify(
                                completeOrder
                            )
                        );

                        // =================================================
                        // 6. CLEAR CART
                        // =================================================

                        clearCart();

                        // =================================================
                        // 7. ORDER SUCCESS
                        // =================================================

                        navigate(
                            "/order-success"
                        );
                    } catch (error) {
                        console.error(
                            "Post-payment processing error:",
                            error
                        );

                        alert(
                            error.message ||
                            "Payment was successful, but we could not complete the order processing."
                        );
                    } finally {
                        setLoading(false);
                    }
                },

                // =================================================
                // PAYMENT FAILURE / CANCEL
                // =================================================

                onFailure: (error) => {
                    console.error(
                        "Razorpay Checkout Error:",
                        error
                    );

                    setLoading(false);

                    alert(
                        error.message ||
                        "Payment failed or was cancelled. Please try again."
                    );
                },
            });
        } catch (error) {
            console.error(
                "Checkout Error:",
                error
            );

            alert(
                error.message ||
                "Payment failed. Please try again."
            );

            setLoading(false);
        }
    };

    // =========================================================
    // UI
    // =========================================================

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
            <Typography
                variant="h4"
                fontWeight="bold"
                mb={3}
            >
                Checkout
            </Typography>

            <Grid
                container
                spacing={3}
            >

                {/* DELIVERY ADDRESS */}

                <Grid
                    size={{
                        xs: 12,
                        md: 7,
                    }}
                >

                    <Card
                        sx={{
                            borderRadius: 3,
                            boxShadow: 3,
                        }}
                    >

                        <CardContent
                            sx={{
                                p: 3,
                            }}
                        >

                            <Typography
                                variant="h5"
                                fontWeight="bold"
                                mb={3}
                            >
                                Delivery Address
                            </Typography>

                            <TextField
                                fullWidth
                                label="Full Name"
                                name="name"
                                value={
                                    address.name
                                }
                                onChange={
                                    handleChange
                                }
                                margin="normal"
                                required
                            />

                            <TextField
                                fullWidth
                                label="Phone Number"
                                name="phone"
                                value={
                                    address.phone
                                }
                                onChange={
                                    handleChange
                                }
                                margin="normal"
                                required
                            />

                            <TextField
                                fullWidth
                                label="Address"
                                name="address"
                                value={
                                    address.address
                                }
                                onChange={
                                    handleChange
                                }
                                margin="normal"
                                multiline
                                rows={3}
                                required
                            />

                            <TextField
                                fullWidth
                                label="City"
                                name="city"
                                value={
                                    address.city
                                }
                                onChange={
                                    handleChange
                                }
                                margin="normal"
                                required
                            />

                            <TextField
                                fullWidth
                                label="State"
                                name="state"
                                value={
                                    address.state
                                }
                                onChange={
                                    handleChange
                                }
                                margin="normal"
                                required
                            />

                            <TextField
                                fullWidth
                                label="Pincode"
                                name="pincode"
                                value={
                                    address.pincode
                                }
                                onChange={
                                    handleChange
                                }
                                margin="normal"
                                required
                            />

                        </CardContent>

                    </Card>

                </Grid>

                {/* ORDER SUMMARY */}

                <Grid
                    size={{
                        xs: 12,
                        md: 5,
                    }}
                >

                    <Card
                        sx={{
                            borderRadius: 3,
                            boxShadow: 3,
                        }}
                    >

                        <CardContent
                            sx={{
                                p: 3,
                            }}
                        >

                            <Typography
                                variant="h5"
                                fontWeight="bold"
                                mb={3}
                            >
                                Order Summary
                            </Typography>

                            {cartItems.map(
                                (item) => (

                                    <Card
                                        key={item.id}
                                        sx={{
                                            mb: 2,
                                            borderRadius: 2,
                                            boxShadow: 1,
                                            overflow: "hidden",
                                        }}
                                    >

                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 2,
                                                p: 2,
                                            }}
                                        >

                                            <Box
                                                sx={{
                                                    width: 120,
                                                    height: 120,
                                                    flexShrink: 0,
                                                    backgroundColor:
                                                        "#ffffff",
                                                    borderRadius: 2,
                                                    border:
                                                        "1px solid #e0e0e0",
                                                    display: "flex",
                                                    alignItems:
                                                        "center",
                                                    justifyContent:
                                                        "center",
                                                    overflow:
                                                        "hidden",
                                                }}
                                            >

                                                <CardMedia
                                                    component="img"
                                                    image={
                                                        item.image
                                                    }
                                                    alt={
                                                        item.name
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

                                            </Box>

                                            <Box
                                                sx={{
                                                    flexGrow: 1,
                                                    minWidth: 0,
                                                }}
                                            >

                                                <Typography
                                                    variant="h6"
                                                    fontWeight="bold"
                                                >
                                                    {item.name}
                                                </Typography>

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    ₹
                                                    {Number(
                                                        item.price
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}

                                                    {" × "}

                                                    {item.quantity}
                                                </Typography>

                                                <Typography
                                                    sx={{
                                                        mt: 1,
                                                    }}
                                                    fontWeight="bold"
                                                >
                                                    ₹
                                                    {(
                                                        Number(
                                                            item.price
                                                        ) *
                                                        Number(
                                                            item.quantity
                                                        )
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </Typography>

                                            </Box>

                                        </Box>

                                    </Card>
                                )
                            )}

                            <Divider
                                sx={{
                                    my: 2,
                                }}
                            />

                            {/* COUPON */}

                            <Typography
                                variant="h6"
                                fontWeight="bold"
                                mb={1}
                            >
                                Coupon Code
                            </Typography>

                            {!couponApplied ? (

                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: 1,
                                        mb: 2,
                                    }}
                                >

                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Enter coupon code"
                                        value={couponCode}
                                        onChange={(event) =>
                                            setCouponCode(
                                                event.target.value.toUpperCase()
                                            )
                                        }
                                    />

                                    <Button
                                        variant="outlined"
                                        onClick={
                                            handleApplyCoupon
                                        }
                                        disabled={
                                            loading
                                        }
                                    >
                                        Apply
                                    </Button>

                                </Box>

                            ) : (

                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        mb: 2,
                                        p: 1.5,
                                        borderRadius: 2,
                                        backgroundColor: "#e8f5e9",
                                    }}
                                >

                                    <Typography
                                        fontWeight="bold"
                                        color="success.main"
                                    >
                                        {couponCode} applied
                                    </Typography>

                                    <Button
                                        size="small"
                                        color="error"
                                        onClick={
                                            handleRemoveCoupon
                                        }
                                        disabled={
                                            loading
                                        }
                                    >
                                        Remove
                                    </Button>

                                </Box>

                            )}

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                mb={2}
                            >
                                Valid coupons will be verified when you place the order.
                            </Typography>

                            {/* TOTAL */}

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
                                        total
                                    ).toLocaleString(
                                        "en-IN"
                                    )}
                                </Typography>

                            </Box>

                            <Button
                                variant="contained"
                                fullWidth
                                size="large"
                                sx={{
                                    mt: 3,
                                    height: 50,
                                }}
                                onClick={
                                    handlePlaceOrder
                                }
                                disabled={
                                    loading
                                }
                            >
                                {loading
                                    ? "Processing Payment..."
                                    : "Pay Now"}
                            </Button>

                            <Button
                                variant="outlined"
                                fullWidth
                                sx={{
                                    mt: 2,
                                    height: 50,
                                }}
                                onClick={() =>
                                    navigate("/cart")
                                }
                                disabled={
                                    loading
                                }
                            >
                                Back to Cart
                            </Button>

                        </CardContent>

                    </Card>

                </Grid>

            </Grid>

        </Box>
    );
}

export default Checkout;