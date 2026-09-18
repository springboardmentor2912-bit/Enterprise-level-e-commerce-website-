import { useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Chip,
    CircularProgress,
    Grid,
    TextField,
    Typography,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api"}/products`;

function ProductList() {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchText, setSearchText] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    // =========================================================
    // GET AUTH CONFIG
    // =========================================================

    const getAuthConfig = () => {
        const token =
            localStorage.getItem("token") ||
            localStorage.getItem("jwtToken") ||
            localStorage.getItem("accessToken");

        return {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        };
    };

    // =========================================================
    // PRODUCT IMAGE
    // Uses only images already present in public/products
    // =========================================================

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

    // =========================================================
    // LOAD PRODUCTS FROM BACKEND
    // =========================================================

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                console.log(
                    "===== LOADING PRODUCTS FROM BACKEND ====="
                );

                const token =
                    localStorage.getItem("token") ||
                    localStorage.getItem("jwtToken") ||
                    localStorage.getItem("accessToken");

                if (!token) {
                    alert(
                        "Authentication token not found. Please login again."
                    );

                    navigate("/login");
                    return;
                }

                const response = await axios.get(
                    API_URL,
                    getAuthConfig()
                );

                console.log(
                    "PRODUCT API RESPONSE:",
                    response.data
                );

                let backendProducts = [];

                if (Array.isArray(response.data)) {
                    backendProducts = response.data;
                } else if (
                    Array.isArray(response.data?.data)
                ) {
                    backendProducts = response.data.data;
                } else if (
                    Array.isArray(response.data?.products)
                ) {
                    backendProducts = response.data.products;
                }

                console.log(
                    "BACKEND PRODUCTS:",
                    backendProducts
                );

                const formattedProducts =
                    backendProducts.map((product) => {
                        const price =
                            Number(product.price) || 0;

                        const discountPercentage =
                            Number(
                                product.discountPercentage ??
                                product.discount ??
                                0
                            );

                        const calculatedFinalPrice =
                            price -
                            (price *
                                discountPercentage) /
                                100;

                        const finalPrice =
                            product.finalPrice !==
                                undefined &&
                            product.finalPrice !== null
                                ? Number(
                                      product.finalPrice
                                  )
                                : calculatedFinalPrice;

                        const productName =
                            product.name ||
                            product.productName ||
                            "Product";

                        return {
                            ...product,

                            // IMPORTANT:
                            // Keep the REAL backend product ID.
                            id: Number(product.id),

                            name: productName,

                            description:
                                product.description || "",

                            price,

                            discountPercentage,

                            finalPrice,

                            category:
                                product.category ||
                                product.categoryName ||
                                product.category?.name ||
                                "Other",

                            stock: Number(
                                product.stock ??
                                product.stockQuantity ??
                                0
                            ),

                            // Use existing local image.
                            image:
                                getProductImage(
                                    productName
                                ),
                        };
                    });

                console.log(
                    "FORMATTED PRODUCTS:",
                    formattedProducts
                );

                setProducts(formattedProducts);
            } catch (error) {
                console.error(
                    "PRODUCT FETCH ERROR:",
                    error
                );

                console.error(
                    "STATUS:",
                    error.response?.status
                );

                console.error(
                    "BACKEND RESPONSE:",
                    error.response?.data
                );

                if (
                    error.response?.status === 401 ||
                    error.response?.status === 403
                ) {
                    alert(
                        "Session expired or access denied. Please login again."
                    );

                    localStorage.removeItem("token");
                    localStorage.removeItem("jwtToken");
                    localStorage.removeItem(
                        "accessToken"
                    );

                    navigate("/login");

                    return;
                }

                alert(
                    error.response?.data?.message ||
                        "Failed to load products"
                );

                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [navigate]);

    // =========================================================
    // CATEGORIES
    // =========================================================

    const categories = useMemo(() => {
        return [
            "All",
            ...new Set(
                products
                    .map(
                        (product) =>
                            product.category
                    )
                    .filter(Boolean)
            ),
        ];
    }, [products]);

    // =========================================================
    // FILTER PRODUCTS
    // =========================================================

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const search =
                searchText
                    .toLowerCase()
                    .trim();

            const matchesSearch =
                product.name
                    ?.toLowerCase()
                    .includes(search) ||
                product.description
                    ?.toLowerCase()
                    .includes(search) ||
                product.category
                    ?.toLowerCase()
                    .includes(search);

            const matchesCategory =
                selectedCategory === "All" ||
                product.category ===
                    selectedCategory;

            return (
                matchesSearch &&
                matchesCategory
            );
        });
    }, [
        products,
        searchText,
        selectedCategory,
    ]);

    // =========================================================
    // GROUP PRODUCTS BY CATEGORY
    // =========================================================

    const groupedProducts = useMemo(() => {
        return filteredProducts.reduce(
            (groups, product) => {
                const category =
                    product.category ||
                    "Other";

                if (!groups[category]) {
                    groups[category] = [];
                }

                groups[category].push(product);

                return groups;
            },
            {}
        );
    }, [filteredProducts]);

    // =========================================================
    // CATEGORY IMAGE
    // =========================================================

    const getCategoryImage = (category) => {
        const product = products.find(
            (item) =>
                item.category === category
        );

        return product?.image || "";
    };

    // =========================================================
    // PRICING
    // =========================================================

    const getPricing = (product) => {
        const originalPrice =
            Number(product.price) || 0;

        const discountPercentage =
            Number(
                product.discountPercentage ?? 0
            );

        const calculatedFinalPrice =
            originalPrice -
            (originalPrice *
                discountPercentage) /
                100;

        const finalPrice =
            product.finalPrice !==
                undefined &&
            product.finalPrice !== null
                ? Number(product.finalPrice)
                : calculatedFinalPrice;

        return {
            originalPrice,
            discountPercentage,
            finalPrice,
        };
    };

    // =========================================================
    // LOADING
    // =========================================================

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
                <CircularProgress />
            </Box>
        );
    }

    // =========================================================
    // UI
    // =========================================================

    return (
        <Box
            sx={{
                minHeight: "100vh",
                backgroundColor: "#f4f6f8",
                pb: 6,
            }}
        >
            {/* =================================================
                HEADER
            ================================================= */}

            <Box
                sx={{
                    backgroundColor: "#131921",
                    px: {
                        xs: 2,
                        md: 5,
                    },
                    py: 2,
                    position: "sticky",
                    top: 0,
                    zIndex: 1000,
                }}
            >
                <Grid
                    container
                    spacing={2}
                    alignItems="center"
                >
                    <Grid
                        size={{
                            xs: 12,
                            md: 3,
                        }}
                    >
                        <Typography
                            variant="h4"
                            fontWeight="bold"
                            sx={{
                                color: "white",
                                cursor: "pointer",
                            }}
                            onClick={() => {
                                setSelectedCategory(
                                    "All"
                                );

                                setSearchText("");
                            }}
                        >
                            ShopStack
                        </Typography>
                    </Grid>

                    <Grid
                        size={{
                            xs: 12,
                            md: 6,
                        }}
                    >
                        <TextField
                            fullWidth
                            placeholder="Search ShopStack products..."
                            value={searchText}
                            onChange={(event) =>
                                setSearchText(
                                    event.target.value
                                )
                            }
                            sx={{
                                backgroundColor:
                                    "white",
                                borderRadius: 1,
                                "& .MuiOutlinedInput-root":
                                    {
                                        borderRadius: 1,
                                    },
                            }}
                        />
                    </Grid>

                    <Grid
                        size={{
                            xs: 12,
                            md: 3,
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: {
                                    xs: "flex-start",
                                    md: "flex-end",
                                },
                                gap: 1,
                                flexWrap: "wrap",
                            }}
                        >
                            <Button
                                variant="outlined"
                                sx={{
                                    color: "white",
                                    borderColor:
                                        "rgba(255,255,255,0.6)",
                                }}
                                onClick={() =>
                                    navigate(
                                        "/my-orders"
                                    )
                                }
                            >
                                Orders
                            </Button>

                            <Button
                                variant="outlined"
                                sx={{
                                    color: "white",
                                    borderColor:
                                        "rgba(255,255,255,0.6)",
                                }}
                                onClick={() =>
                                    navigate("/cart")
                                }
                            >
                                Cart
                            </Button>

                            <Button
                                variant="outlined"
                                sx={{
                                    color: "white",
                                    borderColor:
                                        "rgba(255,255,255,0.6)",
                                }}
                                onClick={() =>
                                    navigate(
                                        "/profile"
                                    )
                                }
                            >
                                Profile
                            </Button>

                            <Button
                                variant="outlined"
                                sx={{
                                    color: "white",
                                    borderColor:
                                        "rgba(255,255,255,0.6)",
                                }}
                                onClick={() =>
                                    navigate(
                                        "/login"
                                    )
                                }
                            >
                                Login
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            {/* =================================================
                CONTENT
            ================================================= */}

            <Box
                sx={{
                    px: {
                        xs: 2,
                        md: 5,
                    },
                    pt: 4,
                }}
            >
                {/* =================================================
                    CATEGORY SECTION
                ================================================= */}

                <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{ mb: 2 }}
                >
                    Shop by Category
                </Typography>

                <Grid
                    container
                    spacing={2}
                    sx={{ mb: 5 }}
                >
                    {categories
                        .filter(
                            (category) =>
                                category !== "All"
                        )
                        .map((category) => (
                            <Grid
                                key={category}
                                size={{
                                    xs: 6,
                                    sm: 4,
                                    md: 3,
                                    lg: 2,
                                }}
                            >
                                <Card
                                    onClick={() => {
                                        setSelectedCategory(
                                            category
                                        );

                                        setSearchText("");
                                    }}
                                    sx={{
                                        cursor: "pointer",
                                        height: "100%",
                                        borderRadius: 2,
                                        border:
                                            selectedCategory ===
                                            category
                                                ? "3px solid #1976d2"
                                                : "1px solid #ddd",
                                        transition:
                                            "0.2s",
                                        "&:hover": {
                                            transform:
                                                "translateY(-4px)",
                                            boxShadow: 5,
                                        },
                                    }}
                                >
                                    <CardMedia
                                        component="img"
                                        height="120"
                                        image={getCategoryImage(
                                            category
                                        )}
                                        alt={category}
                                        sx={{
                                            objectFit:
                                                "cover",
                                        }}
                                    />

                                    <CardContent
                                        sx={{
                                            textAlign:
                                                "center",
                                            py: 1.5,
                                        }}
                                    >
                                        <Typography fontWeight="bold">
                                            {category}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                </Grid>

                {/* =================================================
                    CATEGORY BUTTONS
                ================================================= */}

                <Box
                    sx={{
                        display: "flex",
                        gap: 1,
                        overflowX: "auto",
                        pb: 2,
                        mb: 3,
                    }}
                >
                    {categories.map(
                        (category) => (
                            <Button
                                key={category}
                                variant={
                                    selectedCategory ===
                                    category
                                        ? "contained"
                                        : "outlined"
                                }
                                onClick={() => {
                                    setSelectedCategory(
                                        category
                                    );

                                    setSearchText("");
                                }}
                                sx={{
                                    minWidth:
                                        "fit-content",
                                    whiteSpace:
                                        "nowrap",
                                }}
                            >
                                {category}
                            </Button>
                        )
                    )}
                </Box>

                {/* =================================================
                    SEARCH TITLE
                ================================================= */}

                {searchText && (
                    <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{ mb: 3 }}
                    >
                        Search results for "
                        {searchText}"
                    </Typography>
                )}

                {/* =================================================
                    NO PRODUCTS
                ================================================= */}

                {filteredProducts.length ===
                    0 && (
                    <Card
                        sx={{
                            p: 5,
                            textAlign: "center",
                        }}
                    >
                        <Typography
                            variant="h5"
                            fontWeight="bold"
                        >
                            No products found
                        </Typography>

                        <Typography
                            color="text.secondary"
                            sx={{ mt: 1 }}
                        >
                            Try searching for
                            another product or
                            category.
                        </Typography>

                        <Button
                            variant="contained"
                            sx={{ mt: 3 }}
                            onClick={() => {
                                setSearchText("");
                                setSelectedCategory(
                                    "All"
                                );
                            }}
                        >
                            View All Products
                        </Button>
                    </Card>
                )}

                {/* =================================================
                    PRODUCT GROUPS
                ================================================= */}

                {Object.entries(
                    groupedProducts
                ).map(
                    ([
                        category,
                        categoryProducts,
                    ]) => (
                        <Box
                            key={category}
                            sx={{ mb: 6 }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "space-between",
                                    mb: 2,
                                }}
                            >
                                <Typography
                                    variant="h5"
                                    fontWeight="bold"
                                >
                                    {category}
                                </Typography>

                                <Button
                                    onClick={() => {
                                        setSelectedCategory(
                                            category
                                        );

                                        setSearchText("");
                                    }}
                                >
                                    See all
                                </Button>
                            </Box>

                            <Grid
                                container
                                spacing={3}
                            >
                                {categoryProducts.map(
                                    (product) => {
                                        const {
                                            originalPrice,
                                            discountPercentage,
                                            finalPrice,
                                        } =
                                            getPricing(
                                                product
                                            );

                                        return (
                                            <Grid
                                                key={
                                                    product.id
                                                }
                                                size={{
                                                    xs: 12,
                                                    sm: 6,
                                                    md: 4,
                                                    lg: 3,
                                                }}
                                            >
                                                <Card
                                                    sx={{
                                                        height: "100%",
                                                        display:
                                                            "flex",
                                                        flexDirection:
                                                            "column",
                                                        borderRadius: 3,
                                                        overflow:
                                                            "hidden",
                                                        boxShadow: 3,
                                                        transition:
                                                            "0.2s",
                                                        "&:hover":
                                                            {
                                                                transform:
                                                                    "translateY(-5px)",
                                                                boxShadow: 6,
                                                            },
                                                    }}
                                                >
                                                    <CardMedia
                                                        component="img"
                                                        height="220"
                                                        image={
                                                            product.image
                                                        }
                                                        alt={
                                                            product.name
                                                        }
                                                        sx={{
                                                            objectFit:
                                                                "cover",
                                                            display:
                                                                "block",
                                                        }}
                                                    />

                                                    <CardContent
                                                        sx={{
                                                            display:
                                                                "flex",
                                                            flexDirection:
                                                                "column",
                                                            flexGrow: 1,
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="caption"
                                                            color="primary"
                                                            fontWeight="bold"
                                                        >
                                                            {
                                                                product.category
                                                            }
                                                        </Typography>

                                                        <Typography
                                                            variant="h6"
                                                            fontWeight="bold"
                                                            sx={{
                                                                mt: 1,
                                                            }}
                                                        >
                                                            {
                                                                product.name
                                                            }
                                                        </Typography>

                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            sx={{
                                                                mt: 1,
                                                                minHeight: 60,
                                                            }}
                                                        >
                                                            {
                                                                product.description
                                                            }
                                                        </Typography>

                                                        {/* PRICE */}

                                                        <Box
                                                            sx={{
                                                                mt: 2,
                                                                mb: 2,
                                                            }}
                                                        >
                                                            {discountPercentage >
                                                            0 ? (
                                                                <>
                                                                    <Typography
                                                                        variant="body2"
                                                                        color="text.secondary"
                                                                        sx={{
                                                                            textDecoration:
                                                                                "line-through",
                                                                        }}
                                                                    >
                                                                        MRP:
                                                                        ₹
                                                                        {originalPrice.toLocaleString(
                                                                            "en-IN"
                                                                        )}
                                                                    </Typography>

                                                                    <Box
                                                                        sx={{
                                                                            display:
                                                                                "flex",
                                                                            alignItems:
                                                                                "center",
                                                                            gap: 1,
                                                                            mt: 0.5,
                                                                            flexWrap:
                                                                                "wrap",
                                                                        }}
                                                                    >
                                                                        <Typography
                                                                            variant="h6"
                                                                            fontWeight="bold"
                                                                        >
                                                                            ₹
                                                                            {finalPrice.toLocaleString(
                                                                                "en-IN"
                                                                            )}
                                                                        </Typography>

                                                                        <Chip
                                                                            label={`${discountPercentage}% OFF`}
                                                                            color="success"
                                                                            size="small"
                                                                        />
                                                                    </Box>
                                                                </>
                                                            ) : (
                                                                <Typography
                                                                    variant="h6"
                                                                    fontWeight="bold"
                                                                >
                                                                    ₹
                                                                    {originalPrice.toLocaleString(
                                                                        "en-IN"
                                                                    )}
                                                                </Typography>
                                                            )}
                                                        </Box>

                                                        {/* STOCK */}

                                                        {product.stock <=
                                                        0 ? (
                                                            <Chip
                                                                label="Out of Stock"
                                                                color="error"
                                                                size="small"
                                                                sx={{
                                                                    mb: 2,
                                                                }}
                                                            />
                                                        ) : (
                                                            <Typography
                                                                variant="body2"
                                                                color="text.secondary"
                                                                sx={{
                                                                    mb: 2,
                                                                }}
                                                            >
                                                                Stock:{" "}
                                                                {
                                                                    product.stock
                                                                }
                                                            </Typography>
                                                        )}

                                                        {/* VIEW PRODUCT */}

                                                        <Button
                                                            variant="contained"
                                                            fullWidth
                                                            disabled={
                                                                product.stock <=
                                                                0
                                                            }
                                                            sx={{
                                                                mt: "auto",
                                                            }}
                                                            onClick={() =>
                                                                navigate(
                                                                    `/products/${product.id}`
                                                                )
                                                            }
                                                        >
                                                            {product.stock <=
                                                            0
                                                                ? "Out of Stock"
                                                                : "View Product"}
                                                        </Button>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        );
                                    }
                                )}
                            </Grid>
                        </Box>
                    )
                )}
            </Box>
        </Box>
    );
}

export default ProductList;