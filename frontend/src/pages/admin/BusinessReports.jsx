import {
    Box,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Typography,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from "@mui/material";

import { useEffect, useState } from "react";

import {
    getBusinessReport,
} from "../../api/businessReportService";


function BusinessReports() {

    const [report, setReport] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // =========================
    // LOAD BUSINESS REPORT
    // =========================

    useEffect(() => {

        const loadReport = async () => {

            try {

                const response =
                    await getBusinessReport();

                console.log(
                    "BUSINESS REPORT RESPONSE:",
                    response.data
                );

                setReport(
                    response.data.data
                );

            } catch (error) {

                console.error(
                    "Business report error:",
                    error
                );

                setError(
                    "Failed to load business report."
                );

            } finally {

                setLoading(false);
            }
        };

        loadReport();

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
    // PAGE
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
                Business Reports
            </Typography>

            <Typography
                color="text.secondary"
                mb={4}
            >
                Overview of ShopStack business performance
            </Typography>


            {/* =========================
                MARKETPLACE SUMMARY
            ========================= */}

            <Typography
                variant="h5"
                fontWeight="bold"
                mb={3}
            >
                Marketplace Summary
            </Typography>

            <Grid
                container
                spacing={3}
            >

                <ReportCard
                    title="Total Users"
                    value={report.totalUsers}
                />

                <ReportCard
                    title="Customers"
                    value={report.totalCustomers}
                />

                <ReportCard
                    title="Vendors"
                    value={report.totalVendors}
                />

                <ReportCard
                    title="Approved Vendors"
                    value={report.approvedVendors}
                />

                <ReportCard
                    title="Products"
                    value={report.totalProducts}
                />

                <ReportCard
                    title="Total Orders"
                    value={report.totalOrders}
                />

                <ReportCard
                    title="Total Sales"
                    value={`₹${Number(
                        report.totalSales
                    ).toLocaleString("en-IN")}`}
                />

                <ReportCard
                    title="Total Commission"
                    value={`₹${Number(
                        report.totalCommission
                    ).toLocaleString("en-IN")}`}
                />

                <ReportCard
                    title="Vendor Earnings"
                    value={`₹${Number(
                        report.vendorEarnings
                    ).toLocaleString("en-IN")}`}
                />

            </Grid>


            {/* =========================
                ORDER REPORT
            ========================= */}

            <Typography
                variant="h5"
                fontWeight="bold"
                mt={5}
                mb={3}
            >
                Order Report
            </Typography>

            <TableContainer
                component={Paper}
                sx={{
                    borderRadius: 3,
                }}
            >

                <Table>

                    <TableHead>

                        <TableRow>

                            <TableCell>
                                <strong>
                                    Order Status
                                </strong>
                            </TableCell>

                            <TableCell align="right">
                                <strong>
                                    Number of Orders
                                </strong>
                            </TableCell>

                        </TableRow>

                    </TableHead>


                    <TableBody>

                        <ReportRow
                            label="Placed"
                            value={report.placedOrders}
                        />

                        <ReportRow
                            label="Confirmed"
                            value={report.confirmedOrders}
                        />

                        <ReportRow
                            label="Shipped"
                            value={report.shippedOrders}
                        />

                        <ReportRow
                            label="Delivered"
                            value={report.deliveredOrders}
                        />

                        <ReportRow
                            label="Cancelled"
                            value={report.cancelledOrders}
                        />

                        <ReportRow
                            label="Returned"
                            value={report.returnedOrders}
                        />

                        <ReportRow
                            label="Refunded"
                            value={report.refundedOrders}
                        />

                    </TableBody>

                </Table>

            </TableContainer>

        </Box>
    );
}


// =========================
// REPORT CARD
// =========================

function ReportCard({
    title,
    value,
}) {

    return (
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
                    borderRadius: 3,
                }}
            >

                <CardContent>

                    <Typography
                        variant="body2"
                        color="text.secondary"
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


// =========================
// REPORT ROW
// =========================

function ReportRow({
    label,
    value,
}) {

    return (
        <TableRow hover>

            <TableCell>
                {label}
            </TableCell>

            <TableCell align="right">
                {value}
            </TableCell>

        </TableRow>
    );
}


export default BusinessReports;
