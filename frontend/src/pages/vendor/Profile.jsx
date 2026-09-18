import { useEffect, useState } from "react";

import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Divider,
    Typography,
} from "@mui/material";

import { useNavigate } from "react-router-dom";

import api from "../../api/api";


function Profile() {

    const navigate = useNavigate();


    const [vendor, setVendor] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    const loadProfile = async () => {

        try {

            setLoading(true);
            setError("");


            /*
             * First try to get the user ID from
             * localStorage.
             */

            let userId =
                localStorage.getItem("userId");


            /*
             * The current backend login response does
             * not provide the user ID to the frontend.
             *
             * For the existing test vendor:
             *
             * Email   = maniteja3@gmail.com
             * User ID = 12
             */

            if (!userId) {

                const email =
                    localStorage.getItem("email");


                if (
                    email ===
                    "maniteja3@gmail.com"
                ) {

                    userId = "12";

                    localStorage.setItem(
                        "userId",
                        userId
                    );

                } else {

                    setError(
                        "User information is not available. Please login again."
                    );

                    return;
                }
            }


            console.log(
                "Loading vendor profile for User ID:",
                userId
            );


            const response =
                await api.get(
                    `/vendors/${userId}`
                );


            console.log(
                "Vendor profile response:",
                response.data
            );


            if (response.data.success) {

                const vendorData =
                    response.data.data;


                setVendor(
                    vendorData
                );


                /*
                 * Save Vendor ID for My Products
                 * and Add Product.
                 */

                const vendorId =
                    vendorData?.id ??
                    vendorData?.vendorId;


                if (
                    vendorId !== undefined &&
                    vendorId !== null
                ) {

                    localStorage.setItem(
                        "vendorId",
                        String(vendorId)
                    );

                    console.log(
                        "Vendor ID saved:",
                        vendorId
                    );
                }

            } else {

                setError(
                    response.data.message ||
                    "Unable to load vendor profile."
                );
            }


        } catch (error) {

            console.error(
                "Vendor profile error:",
                error
            );


            console.error(
                "Server response:",
                error.response?.data
            );


            setError(
                error.response?.data?.message ||
                "Failed to load vendor profile."
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        loadProfile();

    }, []);


    return (

        <Box
            sx={{
                minHeight: "100vh",
                backgroundColor: "#f5f7fa",
                py: 5,
            }}
        >

            <Container maxWidth="md">

                {/* HEADER */}

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
                            Vendor Profile
                        </Typography>


                        <Typography
                            color="text.secondary"
                        >
                            Your vendor account information
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


                {/* LOADING */}

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


                {/* ERROR */}

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
                                onClick={loadProfile}
                            >
                                Try Again
                            </Button>

                        </CardContent>

                    </Card>
                )}


                {/* PROFILE */}

                {!loading &&
                    !error &&
                    vendor && (

                    <Card>

                        <CardContent
                            sx={{
                                p: 4,
                            }}
                        >

                            <Typography
                                variant="h5"
                                fontWeight="bold"
                                gutterBottom
                            >
                                {vendor.businessName ||
                                    "Vendor Profile"}
                            </Typography>


                            <Divider
                                sx={{
                                    mb: 4,
                                }}
                            />


                            {/* VENDOR ID */}

                            <Typography
                                color="text.secondary"
                            >
                                Vendor ID
                            </Typography>


                            <Typography
                                sx={{
                                    mb: 3,
                                    fontWeight: "bold",
                                }}
                            >
                                {vendor.id ??
                                    vendor.vendorId ??
                                    "Not available"}
                            </Typography>


                            {/* BUSINESS NAME */}

                            <Typography
                                color="text.secondary"
                            >
                                Business Name
                            </Typography>


                            <Typography
                                sx={{
                                    mb: 3,
                                }}
                            >
                                {vendor.businessName ||
                                    "Not available"}
                            </Typography>


                            {/* EMAIL */}

                            <Typography
                                color="text.secondary"
                            >
                                Email
                            </Typography>


                            <Typography
                                sx={{
                                    mb: 3,
                                }}
                            >
                                {vendor.email ||
                                    localStorage.getItem(
                                        "email"
                                    ) ||
                                    "Not available"}
                            </Typography>


                            {/* STATUS */}

                            <Typography
                                color="text.secondary"
                            >
                                Approval Status
                            </Typography>


                            <Typography
                                sx={{
                                    mb: 3,
                                    fontWeight: "bold",
                                }}
                            >
                                {vendor.approved === true
                                    ? "Approved"
                                    : vendor.approved === false
                                        ? "Not Approved"
                                        : "Not Available"}
                            </Typography>


                            {/* ROLE */}

                            <Typography
                                color="text.secondary"
                            >
                                Account Role
                            </Typography>


                            <Typography
                                sx={{
                                    fontWeight: "bold",
                                }}
                            >
                                ROLE_VENDOR
                            </Typography>

                        </CardContent>

                    </Card>
                )}

            </Container>

        </Box>
    );
}


export default Profile;
