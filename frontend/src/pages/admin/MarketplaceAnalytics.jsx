import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    CircularProgress,
    Alert,
    LinearProgress,
} from "@mui/material";

import { useEffect, useState } from "react";

import {
    getAdminDashboard,
} from "../../api/adminDashboardService";


function MarketplaceAnalytics() {

    const [dashboard, setDashboard] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // =========================
    // LOAD ANALYTICS
    // =========================

    useEffect(() => {

        const loadAnalytics = async () => {

            try {

                const response =
                    await getAdminDashboard();

                console.log(
                    "MARKETPLACE ANALYTICS:",
                    response.data
                );

                setDashboard(
                    response.data.data
                );

            } catch (error) {

                console.error(
                    "Analytics error:",
                    error
                );

                setError(
                    "Failed to load marketplace analytics."
                );

            } finally {

                setLoading(false);

            }
        };

        loadAnalytics();

    }, []);


    // =========================
    // LOADING
    // =========================

    if (loading) {

        return (
            <Box
                sx={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <CircularProgress />
            </Box>
        );
    }


    // =========================
    // ERROR
    // =========================

    if (error) {

        return (
            <Box sx={{ p: 4 }}>

                <Alert severity="error">
                    {error}
                </Alert>

            </Box>
        );
    }


    // =========================
    // ORDER TOTAL
    // =========================

    const totalOrders =
        dashboard.totalOrders || 0;


    // =========================
    // ORDER STATUS DATA
    // =========================

    const orderStatuses = [

        {
            name: "Placed",
            value: dashboard.placedOrders,
        },

        {
            name: "Confirmed",
            value: dashboard.confirmedOrders,
        },

        {
            name: "Shipped",
            value: dashboard.shippedOrders,
        },

        {
            name: "Delivered",
            value: dashboard.deliveredOrders,
        },

        {
            name: "Cancelled",
            value: dashboard.cancelledOrders,
        },

        {
            name: "Returned",
            value: dashboard.returnedOrders,
        },

        {
            name: "Refunded",
            value: dashboard.refundedOrders,
        },

    ];


    // =========================
    // ANALYTICS PAGE
    // =========================

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

            {/* =========================
                TITLE
            ========================= */}

            <Typography
                variant="h4"
                fontWeight="bold"
                mb={1}
            >
                Marketplace Analytics
            </Typography>

            <Typography
                color="text.secondary"
                mb={4}
            >
                Overview of ShopStack marketplace performance
            </Typography>


            {/* =========================
                KEY METRICS
            ========================= */}

            <Grid
                container
                spacing={3}
            >

                <AnalyticsCard
                    title="Total Sales"
                    value={`₹${Number(
                        dashboard.totalSales
                    ).toLocaleString("en-IN")}`}
                />

                <AnalyticsCard
                    title="Total Orders"
                    value={dashboard.totalOrders}
                />

                <AnalyticsCard
                    title="Total Products"
                    value={dashboard.totalProducts}
                />

                <AnalyticsCard
                    title="Total Users"
                    value={dashboard.totalUsers}
                />

                <AnalyticsCard
                    title="Customers"
                    value={dashboard.totalCustomers}
                />

                <AnalyticsCard
                    title="Vendors"
                    value={dashboard.totalVendors}
                />

                <AnalyticsCard
                    title="Approved Vendors"
                    value={dashboard.approvedVendors}
                />

            </Grid>


            {/* =========================
                ORDER ANALYTICS
            ========================= */}

            <Typography
                variant="h5"
                fontWeight="bold"
                mt={5}
                mb={3}
            >
                Order Analytics
            </Typography>


            <Card
                sx={{
                    borderRadius: 3,
                    mb: 4,
                }}
            >

                <CardContent>

                    {orderStatuses.map(
                        (status) => {

                            const percentage =
                                totalOrders > 0
                                    ? (
                                        status.value /
                                        totalOrders
                                    ) * 100
                                    : 0;

                            return (
                                <Box
                                    key={status.name}
                                    sx={{
                                        mb: 3,
                                    }}
                                >

                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent:
                                                "space-between",
                                            mb: 1,
                                        }}
                                    >

                                        <Typography
                                            fontWeight="medium"
                                        >
                                            {status.name}
                                        </Typography>

                                        <Typography
                                            color="text.secondary"
                                        >
                                            {status.value}
                                        </Typography>

                                    </Box>

                                    <LinearProgress
                                        variant="determinate"
                                        value={
                                            Math.min(
                                                percentage,
                                                100
                                            )
                                        }
                                        sx={{
                                            height: 10,
                                            borderRadius: 5,
                                        }}
                                    />

                                </Box>
                            );
                        }
                    )}

                </CardContent>

            </Card>


            {/* =========================
                MARKETPLACE OVERVIEW
            ========================= */}

            <Typography
                variant="h5"
                fontWeight="bold"
                mb={3}
            >
                Marketplace Overview
            </Typography>


            <Grid
                container
                spacing={3}
            >

                <AnalyticsCard
                    title="Customers per Vendor"
                    value={
                        dashboard.totalVendors > 0
                            ? (
                                dashboard.totalCustomers /
                                dashboard.totalVendors
                            ).toFixed(1)
                            : "0"
                    }
                />

                <AnalyticsCard
                    title="Average Order Value"
                    value={
                        dashboard.totalOrders > 0
                            ? `₹${(
                                dashboard.totalSales /
                                dashboard.totalOrders
                            ).toLocaleString(
                                "en-IN",
                                {
                                    maximumFractionDigits: 2,
                                }
                            )}`
                            : "₹0"
                    }
                />

                <AnalyticsCard
                    title="Vendor Approval Rate"
                    value={
                        dashboard.totalVendors > 0
                            ? `${(
                                (
                                    dashboard.approvedVendors /
                                    dashboard.totalVendors
                                ) * 100
                            ).toFixed(1)}%`
                            : "0%"
                    }
                />

            </Grid>

        </Box>
    );
}


// =========================
// ANALYTICS CARD
// =========================

function AnalyticsCard({
    title,
    value,
}) {

    return (
        <Grid
            size={{
                xs: 12,
                sm: 6,
                md: 3,
            }}
        >

            <Card
                sx={{
                    height: "100%",
                    borderRadius: 3,
                }}
            >

                <CardContent>

                    <Typography
                        color="text.secondary"
                        variant="body2"
                        mb={1}
                    >
                        {title}
                    </Typography>

                    <Typography
                        variant="h5"
                        fontWeight="bold"
                    >
                        {value}
                    </Typography>

                </CardContent>

            </Card>

        </Grid>
    );
}


export default MarketplaceAnalytics;
