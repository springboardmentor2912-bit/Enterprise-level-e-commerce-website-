import { useState } from "react";

import {
    Box,
    Button,
    Card,
    CardContent,
    IconButton,
    Link,
    TextField,
    Typography,
} from "@mui/material";

import {
    Link as RouterLink,
    useLocation,
    useNavigate,
} from "react-router-dom";

import { loginUser } from "../../api/authService";
import { useAuth } from "../../context/AuthContext";

function LoginForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const [loginData, setLoginData] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);

    // Show / hide password
    const [showPassword, setShowPassword] = useState(false);

    const from =
        location.state?.from ||
        sessionStorage.getItem("redirectAfterLogin") ||
        null;

    const handleChange = (event) => {
        const { name, value } = event.target;

        setLoginData((previousData) => ({
            ...previousData,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!loginData.email || !loginData.password) {
            alert("Please enter email and password");
            return;
        }

        try {
            setLoading(true);

            const response = await loginUser(loginData);

            console.log(
                "LOGIN API RESPONSE:",
                response.data
            );

            if (!response.data.success) {
                alert(
                    response.data.message ||
                    "Login failed"
                );
                return;
            }

            const userData = response.data.data;

            console.log(
                "LOGIN USER DATA:",
                userData
            );

            /* ==========================================
               SAVE AUTHENTICATION
            ========================================== */

            login(userData);

            if (userData.token) {
                localStorage.setItem(
                    "token",
                    userData.token
                );
            }

            if (userData.role) {
                localStorage.setItem(
                    "role",
                    userData.role
                );
            }

            if (userData.email) {
                localStorage.setItem(
                    "email",
                    userData.email
                );
            }

            /* ==========================================
               SAVE USER ID
            ========================================== */

            const userId =
                userData.userId ??
                userData.id ??
                userData.user?.id ??
                userData.user?.userId;

            console.log(
                "Detected User ID:",
                userId
            );

            if (
                userId !== undefined &&
                userId !== null
            ) {
                localStorage.setItem(
                    "userId",
                    String(userId)
                );
            } else {
                console.warn(
                    "No user ID was returned by the login API."
                );
            }

            /* ==========================================
               CLEAR OLD VENDOR ID
            ========================================== */

            localStorage.removeItem("vendorId");

            /* ==========================================
               REDIRECT
            ========================================== */

            if (from) {
                sessionStorage.removeItem(
                    "redirectAfterLogin"
                );

                navigate(from, {
                    replace: true,
                });

                return;
            }

            /* ==========================================
               ROLE BASED NAVIGATION
            ========================================== */

            if (
                userData.role ===
                "ROLE_ADMIN"
            ) {
                navigate(
                    "/admin/dashboard",
                    {
                        replace: true,
                    }
                );
            } else if (
                userData.role ===
                "ROLE_VENDOR"
            ) {
                navigate(
                    "/vendor/dashboard",
                    {
                        replace: true,
                    }
                );
            } else {
                navigate(
                    "/products",
                    {
                        replace: true,
                    }
                );
            }
        } catch (error) {
            console.error(
                "LOGIN ERROR:",
                error
            );

            console.error(
                "SERVER RESPONSE:",
                error.response?.data
            );

            alert(
                error.response?.data?.message ||
                "Login failed. Please check your email and password."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#f4f6f8",
            }}
        >
            <Card
                sx={{
                    width: 500,
                    maxWidth: "90%",
                    p: 4,
                    borderRadius: 3,
                    boxShadow: 6,
                }}
            >
                <CardContent>

                    {/* ==========================================
                        TITLE
                    ========================================== */}

                    <Typography
                        variant="h4"
                        align="center"
                        fontWeight="bold"
                        gutterBottom
                    >
                        ShopStack
                    </Typography>

                    <Typography
                        variant="body1"
                        align="center"
                        color="text.secondary"
                        mb={4}
                    >
                        Welcome Back
                    </Typography>

                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                    >

                        {/* ==========================================
                            EMAIL
                        ========================================== */}

                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={loginData.email}
                            onChange={handleChange}
                            margin="normal"
                            required
                            autoComplete="email"
                        />

                        {/* ==========================================
                            PASSWORD
                        ========================================== */}

                        <Box
                            sx={{
                                position: "relative",
                                width: "100%",
                                mt: 2,
                            }}
                        >
                            <TextField
                                fullWidth
                                label="Password"
                                name="password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                value={loginData.password}
                                onChange={handleChange}
                                required
                                autoComplete="current-password"
                                sx={{
                                    "& .MuiInputBase-input": {
                                        paddingRight: "55px",
                                    },
                                }}
                            />

                            {/* ==================================
                                EYE BUTTON
                            ================================== */}

                            <IconButton
                                type="button"
                                onClick={() =>
                                    setShowPassword(
                                        (previous) =>
                                            !previous
                                    )
                                }
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                                sx={{
                                    position: "absolute",
                                    right: "8px",
                                    top: "50%",
                                    transform:
                                        "translateY(-50%)",
                                    zIndex: 10,
                                    width: "42px",
                                    height: "42px",
                                    padding: "8px",
                                    color: "#333333",
                                    backgroundColor:
                                        "transparent",

                                    "&:hover": {
                                        backgroundColor:
                                            "rgba(0, 0, 0, 0.08)",
                                    },
                                }}
                            >
                                {showPassword ? (
                                    /* =========================
                                       EYE OFF
                                    ========================= */

                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        width="24"
                                        height="24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M3 3l18 18" />
                                        <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                                        <path d="M9.88 4.24A9.77 9.77 0 0 1 12 4c5 0 9.27 3.11 11 8a18.5 18.5 0 0 1-3.16 5.19" />
                                        <path d="M6.61 6.61A18.5 18.5 0 0 0 1 12c1.73 4.89 6 8 11 8a9.77 9.77 0 0 0 4.24-.93" />
                                    </svg>
                                ) : (
                                    /* =========================
                                       EYE
                                    ========================= */

                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        width="24"
                                        height="24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="3"
                                        />
                                    </svg>
                                )}
                            </IconButton>
                        </Box>

                        {/* ==========================================
                            LOGIN BUTTON
                        ========================================== */}

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={loading}
                            sx={{
                                mt: 3,
                                height: 45,
                            }}
                        >
                            {loading
                                ? "Logging in..."
                                : "Login"}
                        </Button>
                    </Box>

                    {/* ==========================================
                        REGISTER
                    ========================================== */}

                    <Typography
                        align="center"
                        mt={3}
                    >
                        Don't have an account?{" "}

                        <Link
                            component={RouterLink}
                            to="/register"
                        >
                            Register
                        </Link>
                    </Typography>

                </CardContent>
            </Card>
        </Box>
    );
}

export default LoginForm;