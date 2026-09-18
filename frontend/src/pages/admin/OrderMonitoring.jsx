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
    Chip,
    Button,
} from "@mui/material";

import { useEffect, useState } from "react";

import {
    getAllAdminOrders,
} from "../../api/adminOrderService";


function OrderMonitoring() {

    const [orders, setOrders] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // =========================
    // LOAD ORDERS
    // =========================

    useEffect(() => {

        const loadOrders = async () => {

            try {

                const response =
                    await getAllAdminOrders();

                console.log(
                    "ADMIN ORDERS RESPONSE:",
                    response.data
                );

                setOrders(
                    response.data.data || []
                );

            } catch (error) {

                console.error(
                    "Admin orders error:",
                    error
                );

                setError(
                    "Failed to load orders."
                );

            } finally {

                setLoading(false);

            }
        };

        loadOrders();

    }, []);


    // =========================
    // STATUS COLOR
    // =========================

    const getStatusColor =
        (status) => {

            switch (status) {

                case "PLACED":
                    return "warning";

                case "CONFIRMED":
                    return "info";

                case "PROCESSING":
                    return "info";

                case "SHIPPED":
                    return "primary";

                case "DELIVERED":
                    return "success";

                case "CANCELLED":
                    return "error";

                case "RETURNED":
                    return "warning";

                case "REFUNDED":
                    return "secondary";

                default:
                    return "default";
            }
        };


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
    // ORDER MONITORING
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
                Order Monitoring
            </Typography>

            <Typography
                color="text.secondary"
                mb={4}
            >
                Monitor all marketplace orders and their current status
            </Typography>


            {/* =========================
                TOTAL ORDERS
            ========================= */}

            <Card
                sx={{
                    mb: 3,
                    borderRadius: 3,
                }}
            >

                <CardContent>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        Total Orders
                    </Typography>

                    <Typography
                        variant="h4"
                        fontWeight="bold"
                    >
                        {orders.length}
                    </Typography>

                </CardContent>

            </Card>


            {/* =========================
                ORDERS TABLE
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
                                    Order ID
                                </strong>
                            </TableCell>

                            <TableCell>
                                <strong>
                                    Customer
                                </strong>
                            </TableCell>

                            <TableCell>
                                <strong>
                                    Email
                                </strong>
                            </TableCell>

                            <TableCell>
                                <strong>
                                    Amount
                                </strong>
                            </TableCell>

                            <TableCell>
                                <strong>
                                    Date
                                </strong>
                            </TableCell>

                            <TableCell>
                                <strong>
                                    Status
                                </strong>
                            </TableCell>

                        </TableRow>

                    </TableHead>


                    <TableBody>

                        {orders.length === 0 ? (

                            <TableRow>

                                <TableCell
                                    colSpan={6}
                                    align="center"
                                >

                                    <Typography
                                        color="text.secondary"
                                        sx={{ py: 4 }}
                                    >
                                        No orders found.
                                    </Typography>

                                </TableCell>

                            </TableRow>

                        ) : (

                            orders.map((order) => (

                                <TableRow
                                    key={order.id}
                                    hover
                                >

                                    {/* ORDER ID */}

                                    <TableCell>
                                        #{order.id}
                                    </TableCell>


                                    {/* CUSTOMER */}

                                    <TableCell>
                                        {order.customerName}
                                    </TableCell>


                                    {/* EMAIL */}

                                    <TableCell>
                                        {order.customerEmail}
                                    </TableCell>


                                    {/* AMOUNT */}

                                    <TableCell>
                                        ₹
                                        {Number(
                                            order.totalAmount
                                        ).toLocaleString(
                                            "en-IN"
                                        )}
                                    </TableCell>


                                    {/* DATE */}

                                    <TableCell>

                                        {new Date(
                                            order.createdAt
                                        ).toLocaleDateString(
                                            "en-IN"
                                        )}

                                    </TableCell>


                                    {/* STATUS */}

                                    <TableCell>

                                        <Chip
                                            label={
                                                order.status
                                            }
                                            color={
                                                getStatusColor(
                                                    order.status
                                                )
                                            }
                                            size="small"
                                        />

                                    </TableCell>

                                </TableRow>

                            ))

                        )}

                    </TableBody>

                </Table>

            </TableContainer>

        </Box>
    );
}


export default OrderMonitoring;
