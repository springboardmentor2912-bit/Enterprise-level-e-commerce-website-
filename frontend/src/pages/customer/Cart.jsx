import {
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Container,
    Divider,
    IconButton,
    Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useCart } from "../../context/CartContext";


function Cart() {

    const navigate = useNavigate();


    const {
        cartItems,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        loadCart,
    } = useCart();


    // ==========================================
    // LOAD LATEST CART FROM BACKEND
    // ==========================================

    useEffect(() => {

        console.log(
            "===== CART PAGE OPENED ====="
        );

        loadCart();

    }, []);


    // ==========================================
    // CALCULATE TOTAL
    // ==========================================

    const displayTotal =
        cartItems.reduce(
            (sum, item) =>
                sum +
                Number(item.price) *
                Number(item.quantity),
            0
        );


    // ==========================================
    // EMPTY CART
    // ==========================================

    if (cartItems.length === 0) {

        return (
            <Container
                sx={{
                    mt: 5,
                    mb: 5,
                }}
            >

                <Typography
                    variant="h4"
                    fontWeight="bold"
                    gutterBottom
                >
                    Shopping Cart
                </Typography>


                <Typography
                    variant="h6"
                    color="text.secondary"
                >
                    Your cart is empty.
                </Typography>


                <Button
                    variant="contained"
                    sx={{ mt: 3 }}
                    onClick={() =>
                        navigate("/products")
                    }
                >
                    Continue Shopping
                </Button>

            </Container>
        );
    }


    // ==========================================
    // CART PAGE
    // ==========================================

    return (
        <Container
            maxWidth="lg"
            sx={{
                mt: 5,
                mb: 5,
            }}
        >

            {/* ==================================
                CART TITLE
            ================================== */}

            <Typography
                variant="h4"
                fontWeight="bold"
                gutterBottom
            >
                Shopping Cart
            </Typography>


            {/* ==================================
                CART ITEMS
            ================================== */}

            {cartItems.map((item) => (

                <Card
                    key={item.id}
                    sx={{
                        mb: 2,
                        borderRadius: 3,
                        overflow: "hidden",
                        boxShadow: 3,
                    }}
                >

                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: {
                                xs: "column",
                                sm: "row",
                            },
                        }}
                    >

                        {/* ==============================
                            PRODUCT IMAGE
                        ============================== */}

                        <Box
                            sx={{
                                width: {
                                    xs: "100%",
                                    sm: 220,
                                },

                                minWidth: {
                                    sm: 220,
                                },

                                height: {
                                    xs: 250,
                                    sm: 220,
                                },

                                backgroundColor: "#ffffff",

                                display: "flex",

                                justifyContent:
                                    "center",

                                alignItems:
                                    "center",

                                p: 2,
                            }}
                        >

                            <CardMedia
                                component="img"
                                image={item.image}
                                alt={item.name}
                                sx={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain",
                                }}
                            />

                        </Box>


                        {/* ==============================
                            PRODUCT DETAILS
                        ============================== */}

                        <CardContent
                            sx={{
                                flexGrow: 1,
                                p: 3,
                            }}
                        >

                            <Typography
                                variant="h5"
                                fontWeight="bold"
                            >
                                {item.name}
                            </Typography>


                            <Typography
                                sx={{ mt: 1 }}
                            >
                                Price: ₹
                                {Number(
                                    item.price
                                ).toLocaleString(
                                    "en-IN"
                                )}
                            </Typography>


                            {/* ==========================
                                QUANTITY
                            ========================== */}

                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems:
                                        "center",
                                    mt: 2,
                                    gap: 1,
                                }}
                            >

                                <Typography>
                                    Quantity:
                                </Typography>


                                <IconButton
                                    size="small"
                                    onClick={() =>
                                        decreaseQuantity(
                                            item.id
                                        )
                                    }
                                >
                                    <RemoveIcon />
                                </IconButton>


                                <Typography
                                    fontWeight="bold"
                                    sx={{
                                        minWidth: 25,
                                        textAlign:
                                            "center",
                                    }}
                                >
                                    {item.quantity}
                                </Typography>


                                <IconButton
                                    size="small"
                                    onClick={() =>
                                        increaseQuantity(
                                            item.id
                                        )
                                    }
                                >
                                    <AddIcon />
                                </IconButton>

                            </Box>


                            {/* ==========================
                                SUBTOTAL
                            ========================== */}

                            <Typography
                                sx={{ mt: 2 }}
                                fontWeight="bold"
                            >
                                Subtotal: ₹
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


                            {/* ==========================
                                REMOVE
                            ========================== */}

                            <Button
                                color="error"
                                sx={{ mt: 2 }}
                                onClick={() =>
                                    removeFromCart(
                                        item.id
                                    )
                                }
                            >
                                Remove
                            </Button>

                        </CardContent>

                    </Box>

                </Card>

            ))}


            {/* ==================================
                TOTAL
            ================================== */}

            <Divider sx={{ my: 3 }} />


            <Typography
                variant="h5"
                fontWeight="bold"
            >
                Total: ₹
                {Number(
                    displayTotal
                ).toLocaleString(
                    "en-IN"
                )}
            </Typography>


            {/* ==================================
                CART ACTIONS
            ================================== */}

            <Box
                sx={{
                    display: "flex",
                    gap: 2,
                    mt: 3,
                    flexWrap: "wrap",
                }}
            >

                <Button
                    variant="contained"
                    onClick={() =>
                        navigate("/checkout")
                    }
                >
                    Proceed to Checkout
                </Button>


                <Button
                    variant="outlined"
                    color="error"
                    onClick={clearCart}
                >
                    Clear Cart
                </Button>


                <Button
                    variant="outlined"
                    onClick={() =>
                        navigate("/products")
                    }
                >
                    Continue Shopping
                </Button>

            </Box>

        </Container>
    );
}


export default Cart;
