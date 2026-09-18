import {
    AppBar,
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Grid,
    Toolbar,
    Typography,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";


function Dashboard() {

    const navigate = useNavigate();

    const { user, logout } = useAuth();


    const email =
        user?.email ||
        localStorage.getItem("email") ||
        "Vendor";


    const role =
        user?.role ||
        localStorage.getItem("role") ||
        "ROLE_VENDOR";


    const handleLogout = () => {

        logout();

        navigate("/login", {
            replace: true,
        });
    };


    return (
        <Box
            sx={{
                minHeight: "100vh",
                backgroundColor: "#f5f7fa",
            }}
        >

            {/* ==========================================
                HEADER
            ========================================== */}

            <AppBar position="static">

                <Toolbar>

                    <Typography
                        variant="h5"
                        sx={{
                            flexGrow: 1,
                            fontWeight: "bold",
                        }}
                    >
                        ShopStack
                    </Typography>


                    <Typography
                        sx={{
                            mr: 3,
                            display: {
                                xs: "none",
                                sm: "block",
                            },
                        }}
                    >
                        {email}
                    </Typography>


                    <Button
                        color="inherit"
                        onClick={handleLogout}
                    >
                        Logout
                    </Button>

                </Toolbar>

            </AppBar>


            {/* ==========================================
                MAIN CONTENT
            ========================================== */}

            <Container
                maxWidth="lg"
                sx={{
                    py: 5,
                }}
            >

                {/* TITLE */}

                <Typography
                    variant="h4"
                    fontWeight="bold"
                    gutterBottom
                >
                    Vendor Dashboard
                </Typography>


                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                        mb: 4,
                    }}
                >
                    Welcome back! Manage your products,
                    inventory and vendor account from here.
                </Typography>


                {/* ==========================================
                    DASHBOARD CARDS
                ========================================== */}

                <Grid
                    container
                    spacing={3}
                >

                    {/* ======================================
                        MY PRODUCTS
                    ====================================== */}

                    <Grid
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
                                    My Products
                                </Typography>


                                <Typography
                                    color="text.secondary"
                                    sx={{
                                        mb: 3,
                                    }}
                                >
                                    View and manage products
                                    added by your store.
                                </Typography>


                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={() =>
                                        navigate(
                                            "/vendor/products"
                                        )
                                    }
                                >
                                    View Products
                                </Button>

                            </CardContent>

                        </Card>

                    </Grid>


                    {/* ======================================
                        ADD PRODUCT
                    ====================================== */}

                    <Grid
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
                                    Add Product
                                </Typography>


                                <Typography
                                    color="text.secondary"
                                    sx={{
                                        mb: 3,
                                    }}
                                >
                                    Add a new product to your
                                    store catalog.
                                </Typography>


                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={() =>
                                        navigate(
                                            "/vendor/products/add"
                                        )
                                    }
                                >
                                    Add Product
                                </Button>

                            </CardContent>

                        </Card>

                    </Grid>


                    {/* ======================================
                        PROFILE
                    ====================================== */}

                    <Grid
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
                                    My Profile
                                </Typography>


                                <Typography
                                    color="text.secondary"
                                    sx={{
                                        mb: 3,
                                    }}
                                >
                                    View your vendor account
                                    information.
                                </Typography>


                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={() =>
                                        navigate(
                                            "/vendor/profile"
                                        )
                                    }
                                >
                                    View Profile
                                </Button>

                            </CardContent>

                        </Card>

                    </Grid>


                    {/* ======================================
                        ORDERS
                    ====================================== */}

                    <Grid
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
                                    Orders
                                </Typography>


                                <Typography
                                    color="text.secondary"
                                    sx={{
                                        mb: 3,
                                    }}
                                >
                                    Manage orders related to
                                    your products.
                                </Typography>


                                <Button
                                    variant="outlined"
                                    fullWidth
                                    disabled
                                >
                                    Coming Soon
                                </Button>

                            </CardContent>

                        </Card>

                    </Grid>

                </Grid>


                {/* ==========================================
                    VENDOR INFORMATION
                ========================================== */}

                <Card
                    sx={{
                        mt: 4,
                    }}
                >

                    <CardContent>

                        <Typography
                            variant="h6"
                            fontWeight="bold"
                            gutterBottom
                        >
                            Vendor Account
                        </Typography>


                        <Typography
                            color="text.secondary"
                        >
                            Email
                        </Typography>


                        <Typography
                            sx={{
                                mb: 2,
                            }}
                        >
                            {email}
                        </Typography>


                        <Typography
                            color="text.secondary"
                        >
                            Role
                        </Typography>


                        <Typography
                            sx={{
                                fontWeight: "bold",
                            }}
                        >
                            {role}
                        </Typography>

                    </CardContent>

                </Card>

            </Container>

        </Box>
    );
}


export default Dashboard;
