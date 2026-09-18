import { useEffect, useState } from "react";

import {
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Chip,
    Typography,
} from "@mui/material";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import { useCart } from "../../context/CartContext";

import axios from "axios";

const API_URL = "/api/products";


function ProductDetails() {

    const { id } = useParams();

    const navigate = useNavigate();

    const {
        addToCart,
    } = useCart();


    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    // ==========================================
    // PRODUCT IMAGE
    // Uses images from public/products
    // ==========================================

    const getProductImage = (productName) => {
        const name = (productName || "").toLowerCase().trim();

        if (name.includes("iphone")) {
            return "/products/iphone.jpg";
        }

        if (name.includes("samsung")) {
            return "/products/samsung.jpg";
        }

        if (name.includes("wireless headphones")) {
            return "/products/headphones.jpg";
        }

        if (name.includes("bluetooth earbuds")) {
            return "/products/earbuds.jpg";
        }

        if (name.includes("wired earphones")) {
            return "/products/wired-earphones.jpg";
        }

        if (name.includes("bluetooth speaker")) {
            return "/products/speaker.jpg";
        }

        if (name.includes("smart watch")) {
            return "/products/smartwatch.jpg";
        }

        if (name.includes("fitness band")) {
            return "/products/fitness-band.jpg";
        }

        if (name.includes("hp laptop")) {
            return "/products/hp-laptop.jpg";
        }

        if (name.includes("macbook")) {
            return "/products/macbook.jpg";
        }

        if (name.includes("power bank")) {
            return "/products/powerbank.jpg";
        }

        if (name.includes("usb-c charger")) {
            return "/products/charger.jpg";
        }

        if (name.includes("laptop backpack")) {
            return "/products/backpack.jpg";
        }

        if (name.includes("air fryer")) {
            return "/products/air-fryer.jpg";
        }

        if (name.includes("electric kettle")) {
            return "/products/kettle.jpg";
        }

        if (name.includes("gaming controller")) {
            return "/products/gaming-controller.jpg";
        }

        if (name.includes("gaming mouse")) {
            return "/products/gaming-mouse.jpg";
        }

        if (name.includes("testing ring")) {
            return "/products/testing_ring.jpg";
        }

        return "";
    };

    // ==========================================
    // LOAD PRODUCT FROM BACKEND
    // ==========================================

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                setErrorMessage("");

                const token =
                    localStorage.getItem("token") ||
                    localStorage.getItem("jwtToken") ||
                    localStorage.getItem("accessToken");

                if (!token) {
                    navigate("/login");
                    return;
                }

                const response = await axios.get(
                    `${API_URL}/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );

                console.log("PRODUCT DETAILS API RESPONSE:", response.data);

                let backendProduct = null;

                if (response.data?.data) {
                    backendProduct = response.data.data;
                } else if (response.data?.product) {
                    backendProduct = response.data.product;
                } else if (response.data?.id) {
                    backendProduct = response.data;
                }

                if (!backendProduct) {
                    throw new Error("Product not found");
                }

                const productName =
                    backendProduct.name ||
                    backendProduct.productName ||
                    "Product";

                const price =
                    Number(backendProduct.price) || 0;

                const discountPercentage =
                    Number(
                        backendProduct.discountPercentage ??
                        backendProduct.discount ??
                        0
                    );

                const calculatedFinalPrice =
                    price -
                    (price * discountPercentage) / 100;

                const finalPrice =
                    backendProduct.finalPrice !== undefined &&
                    backendProduct.finalPrice !== null
                        ? Number(backendProduct.finalPrice)
                        : calculatedFinalPrice;

                const formattedProduct = {
                    ...backendProduct,
                    id: Number(backendProduct.id),
                    name: productName,
                    description: backendProduct.description || "",
                    price,
                    discountPercentage,
                    finalPrice,
                    category:
                        backendProduct.category?.name ||
                        backendProduct.categoryName ||
                        backendProduct.category ||
                        "Other",
                    stock: Number(
                        backendProduct.stock ??
                        backendProduct.stockQuantity ??
                        0
                    ),
                    image:
                        backendProduct.image ||
                        backendProduct.imageUrl ||
                        getProductImage(productName),
                };

                setProduct(formattedProduct);
            } catch (error) {
                console.error("PRODUCT DETAILS ERROR:", error);
                console.error("STATUS:", error.response?.status);
                console.error("BACKEND RESPONSE:", error.response?.data);

                if (
                    error.response?.status === 401 ||
                    error.response?.status === 403
                ) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("jwtToken");
                    localStorage.removeItem("accessToken");
                    navigate("/login");
                    return;
                }

                setErrorMessage(
                    error.response?.data?.message ||
                    "Product not found"
                );
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id, navigate]);

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Typography>Loading product...</Typography>
            </Box>
        );
    }

    // ==========================================
    // PRODUCT NOT FOUND
    // ==========================================

    if (!product) {

        return (
            <Box sx={{ p: 4 }}>

                <Typography
                    variant="h5"
                    gutterBottom
                >
                    {errorMessage || "Product not found"}
                </Typography>


                <Button
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={() =>
                        navigate("/products")
                    }
                >
                    Back to Products
                </Button>

            </Box>
        );
    }


    // ==========================================
    // PRICING
    // ==========================================

    const originalPrice =
        Number(product.price) || 0;

    const discountPercentage =
        Number(
            product.discountPercentage ?? 0
        );

    const calculatedFinalPrice =
        originalPrice -
        (
            originalPrice *
            discountPercentage
        ) / 100;

    const finalPrice =
        product.finalPrice !== undefined &&
        product.finalPrice !== null
            ? Number(product.finalPrice)
            : calculatedFinalPrice;


    // ==========================================
    // ADD TO CART
    // ==========================================

    const handleAddToCart =
        async () => {

            console.log(
                "===== ADD TO CART CLICKED ====="
            );

            console.log(
                "Product:",
                product
            );


            /*
             * Make sure the cart receives
             * the discounted final price.
             */

            const productForCart = {
                ...product,
                price: finalPrice,
                originalPrice: originalPrice,
                discountPercentage:
                    discountPercentage,
                finalPrice: finalPrice,
            };


            const success =
                await addToCart(
                    productForCart
                );


            if (success) {

                alert(
                    "Product added to cart!"
                );

            }

        };


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

            {/* ==========================================
                BACK BUTTON
            ========================================== */}

            <Button
                variant="outlined"
                sx={{
                    mb: 3,
                }}
                onClick={() =>
                    navigate("/products")
                }
            >
                ← Back to Products
            </Button>


            {/* ==========================================
                PRODUCT CARD
            ========================================== */}

            <Card
                sx={{
                    maxWidth: 1000,
                    mx: "auto",

                    borderRadius: 3,

                    overflow: "hidden",
                }}
            >

                <Box
                    sx={{
                        display: "flex",

                        flexDirection: {
                            xs: "column",
                            md: "row",
                        },
                    }}
                >

                    {/* ==========================================
                        PRODUCT IMAGE
                    ========================================== */}

                    <Box
                        sx={{
                            width: {
                                xs: "100%",
                                md: "50%",
                            },

                            minHeight: 450,

                            display: "flex",

                            alignItems:
                                "center",

                            justifyContent:
                                "center",

                            backgroundColor:
                                "#fff",

                            p: 3,
                        }}
                    >

                        <CardMedia
                            component="img"

                            image={
                                product.image
                            }

                            alt={
                                product.name
                            }

                            sx={{
                                width:
                                    "100%",

                                height:
                                    450,

                                objectFit:
                                    "contain",
                            }}
                        />

                    </Box>


                    {/* ==========================================
                        PRODUCT DETAILS
                    ========================================== */}

                    <CardContent
                        sx={{
                            width: {
                                xs: "100%",
                                md: "50%",
                            },

                            p: {
                                xs: 3,
                                md: 5,
                            },
                        }}
                    >

                        {/* CATEGORY */}

                        <Typography
                            variant="body2"
                            color="primary"
                            fontWeight="bold"
                            mb={1}
                        >
                            {product.category}
                        </Typography>


                        {/* PRODUCT NAME */}

                        <Typography
                            variant="h4"
                            fontWeight="bold"
                            gutterBottom
                        >
                            {product.name}
                        </Typography>


                        {/* DESCRIPTION */}

                        <Typography
                            variant="body1"
                            color="text.secondary"
                            mb={3}
                        >
                            {
                                product.description
                            }
                        </Typography>


                        {/* ==================================
                            PRICE
                        ================================== */}

                        <Box sx={{ mb: 3 }}>

                            {discountPercentage >
                                0 ? (

                                <Box>

                                    {/* ORIGINAL PRICE */}

                                    <Typography
                                        variant="body1"
                                        color="text.secondary"
                                        sx={{
                                            textDecoration:
                                                "line-through",
                                            mb: 0.5,
                                        }}
                                    >
                                        MRP: ₹
                                        {originalPrice.toLocaleString(
                                            "en-IN"
                                        )}
                                    </Typography>


                                    {/* FINAL PRICE */}

                                    <Box
                                        sx={{
                                            display:
                                                "flex",

                                            alignItems:
                                                "center",

                                            gap: 2,

                                            flexWrap:
                                                "wrap",
                                        }}
                                    >

                                        <Typography
                                            variant="h4"
                                            fontWeight="bold"
                                        >
                                            ₹
                                            {finalPrice.toLocaleString(
                                                "en-IN"
                                            )}
                                        </Typography>


                                        {/* DISCOUNT */}

                                        <Chip
                                            label={`${discountPercentage}% OFF`}
                                            color="success"
                                            size="small"
                                        />

                                    </Box>


                                    {/* SAVINGS */}

                                    <Typography
                                        variant="body2"
                                        color="success.main"
                                        fontWeight="bold"
                                        sx={{
                                            mt: 1,
                                        }}
                                    >
                                        You save ₹
                                        {(
                                            originalPrice -
                                            finalPrice
                                        ).toLocaleString(
                                            "en-IN",
                                            {
                                                maximumFractionDigits:
                                                    2,
                                            }
                                        )}
                                    </Typography>

                                </Box>

                            ) : (

                                <Typography
                                    variant="h4"
                                    fontWeight="bold"
                                >
                                    ₹
                                    {originalPrice.toLocaleString(
                                        "en-IN"
                                    )}
                                </Typography>

                            )}

                        </Box>


                        {/* PRODUCT ID */}

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            mb={3}
                        >
                            Product ID:{" "}
                            {product.id}
                        </Typography>


                        {/* ==================================
                            BUTTONS
                        ================================== */}

                        <Box
                            sx={{
                                display:
                                    "flex",

                                gap: 2,

                                flexWrap:
                                    "wrap",
                            }}
                        >

                            <Button
                                variant="contained"
                                size="large"
                                onClick={
                                    handleAddToCart
                                }
                            >
                                Add to Cart
                            </Button>


                            <Button
                                variant="outlined"
                                size="large"
                                onClick={() =>
                                    navigate(
                                        "/cart"
                                    )
                                }
                            >
                                View Cart
                            </Button>

                        </Box>

                    </CardContent>

                </Box>

            </Card>

        </Box>
    );
}


export default ProductDetails;