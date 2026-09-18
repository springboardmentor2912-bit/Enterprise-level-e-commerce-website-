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


            const userId =
                localStorage.getItem("userId");


            console.log(
                "Vendor Profile - User ID:",
                userId
            );


            if (!userId) {

                setError(
                    "User ID was not returned by the login API. Please logout and login again."
                );

                return;
            }


            const response =
                await api.get(
                    `/vendors/${userId}`
                );


            console.log(
                "Vendor Profile Response:",
                response.data
            );


            if (response.data.success) {

                const vendorData =
                    response.data.data;


                setVendor(
                    vendorData
                );


                /*
                 * Save the actual Vendor ID.
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
                                    "Vendor"}
                            </Typography>


                            <Divider
                                sx={{
                                    mb: 3,
                                }}
                            />


                            <Typography
                                color="text.secondary"
                            >
                                Vendor ID
                            </Typography>


                            <Typography
                                sx={{
                                    mb: 3,
                                }}
                            >
                                {vendor.id ||
                                    vendor.vendorId ||
                                    "Not available"}
                            </Typography>


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


                            <Typography
                                color="text.secondary"
                            >
                                Status
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
                                        ? "Pending / Not Approved"
                                        : "Not Available"}
                            </Typography>


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
