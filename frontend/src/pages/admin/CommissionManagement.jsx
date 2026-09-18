import {
    Box,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Typography,
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
    getCommissionReport,
} from "../../api/commissionService";


function CommissionManagement() {

    const [commissions, setCommissions] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // =========================
    // LOAD COMMISSION REPORT
    // =========================

    useEffect(() => {

        const loadCommissionReport =
            async () => {

                try {

                    const response =
                        await getCommissionReport();

                    console.log(
                        "COMMISSION RESPONSE:",
                        response.data
                    );

                    setCommissions(
                        response.data.data || []
                    );

                } catch (error) {

                    console.error(
                        "Commission error:",
                        error
                    );

                    setError(
                        "Failed to load commission report."
                    );

                } finally {

                    setLoading(false);
                }
            };

        loadCommissionReport();

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
    // TOTALS
    // =========================

    const totalSales =
        commissions.reduce(
            (sum, vendor) =>
                sum +
                Number(vendor.totalSales || 0),
            0
        );

    const totalCommission =
        commissions.reduce(
            (sum, vendor) =>
                sum +
                Number(vendor.commission || 0),
            0
        );

    const totalVendorEarnings =
        commissions.reduce(
            (sum, vendor) =>
                sum +
                Number(
                    vendor.vendorEarnings || 0
                ),
            0
        );


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
                Commission Management
            </Typography>

            <Typography
                color="text.secondary"
                mb={4}
            >
                Monitor vendor sales and marketplace commission
            </Typography>


            {/* =========================
                SUMMARY
            ========================= */}

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(3, 1fr)",
                    },
                    gap: 3,
                    mb: 4,
                }}
            >

                <SummaryCard
                    title="Total Vendor Sales"
                    value={totalSales}
                />

                <SummaryCard
                    title="Total Commission"
                    value={totalCommission}
                />

                <SummaryCard
                    title="Total Vendor Earnings"
                    value={totalVendorEarnings}
                />

            </Box>


            {/* =========================
                COMMISSION TABLE
            ========================= */}

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
                                    Vendor ID
                                </strong>
                            </TableCell>

                            <TableCell>
                                <strong>
                                    Business Name
                                </strong>
                            </TableCell>

                            <TableCell>
                                <strong>
                                    Total Sales
                                </strong>
                            </TableCell>

                            <TableCell>
                                <strong>
                                    Commission (10%)
                                </strong>
                            </TableCell>

                            <TableCell>
                                <strong>
                                    Vendor Earnings
                                </strong>
                            </TableCell>

                        </TableRow>

                    </TableHead>


                    <TableBody>

                        {commissions.length === 0 ? (

                            <TableRow>

                                <TableCell
                                    colSpan={5}
                                    align="center"
                                >

                                    <Typography
                                        color="text.secondary"
                                        sx={{
                                            py: 4,
                                        }}
                                    >
                                        No commission data found.
                                    </Typography>

                                </TableCell>

                            </TableRow>

                        ) : (

                            commissions.map(
                                (vendor) => (

                                    <TableRow
                                        key={
                                            vendor.vendorId
                                        }
                                        hover
                                    >

                                        <TableCell>
                                            {vendor.vendorId}
                                        </TableCell>

                                        <TableCell>
                                            {
                                                vendor.businessName
                                            }
                                        </TableCell>

                                        <TableCell>
                                            ₹
                                            {Number(
                                                vendor.totalSales
                                            ).toLocaleString(
                                                "en-IN",
                                                {
                                                    minimumFractionDigits: 2,
                                                }
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            ₹
                                            {Number(
                                                vendor.commission
                                            ).toLocaleString(
                                                "en-IN",
                                                {
                                                    minimumFractionDigits: 2,
                                                }
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            ₹
                                            {Number(
                                                vendor.vendorEarnings
                                            ).toLocaleString(
                                                "en-IN",
                                                {
                                                    minimumFractionDigits: 2,
                                                }
                                            )}
                                        </TableCell>

                                    </TableRow>

                                )
                            )

                        )}

                    </TableBody>

                </Table>

            </TableContainer>

        </Box>
    );
}


// =========================
// SUMMARY CARD
// =========================

function SummaryCard({
    title,
    value,
}) {

    return (
        <Card
            sx={{
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
                    ₹
                    {Number(
                        value
                    ).toLocaleString(
                        "en-IN",
                        {
                            minimumFractionDigits: 2,
                        }
                    )}
                </Typography>

            </CardContent>

        </Card>
    );
}


export default CommissionManagement;
