import {
    Box,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Typography,
    Chip,
    Grid,
} from "@mui/material";

import {
    CheckCircle,
    Error,
    Storage,
    Api,
    Computer,
} from "@mui/icons-material";

import { useEffect, useState } from "react";

import {
    getSystemStatus,
} from "../../api/systemMonitoringService";


function SystemMonitoring() {

    const [systemStatus, setSystemStatus] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // =========================
    // LOAD SYSTEM STATUS
    // =========================

    useEffect(() => {

        const loadSystemStatus = async () => {

            try {

                const response =
                    await getSystemStatus();

                console.log(
                    "SYSTEM STATUS RESPONSE:",
                    response.data
                );

                setSystemStatus(
                    response.data.data
                );

            } catch (error) {

                console.error(
                    "System monitoring error:",
                    error
                );

                setError(
                    "Failed to load system status."
                );

            } finally {

                setLoading(false);
            }
        };

        loadSystemStatus();

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
    // STATUS CARD
    // =========================

    const StatusCard = ({
        title,
        status,
        icon,
    }) => {

        const isOnline =
            status === "ONLINE" ||
            status === "RUNNING";

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

                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                mb: 2,
                            }}
                        >

                            {icon}

                            <Typography
                                variant="h6"
                                fontWeight="bold"
                            >
                                {title}
                            </Typography>

                        </Box>


                        <Chip
                            icon={
                                isOnline
                                    ? <CheckCircle />
                                    : <Error />
                            }
                            label={status}
                            color={
                                isOnline
                                    ? "success"
                                    : "error"
                            }
                        />

                    </CardContent>

                </Card>

            </Grid>
        );
    };


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
                System Monitoring
            </Typography>

            <Typography
                color="text.secondary"
                mb={4}
            >
                Monitor ShopStack application and service status
            </Typography>


            {/* =========================
                STATUS CARDS
            ========================= */}

            <Grid
                container
                spacing={3}
            >

                <StatusCard
                    title="Application"
                    status={
                        systemStatus.applicationStatus
                    }
                    icon={
                        <Computer />
                    }
                />

                <StatusCard
                    title="Database"
                    status={
                        systemStatus.databaseStatus
                    }
                    icon={
                        <Storage />
                    }
                />

                <StatusCard
                    title="API"
                    status={
                        systemStatus.apiStatus
                    }
                    icon={
                        <Api />
                    }
                />

                <StatusCard
                    title="Environment"
                    status={
                        systemStatus.environment
                    }
                    icon={
                        <Computer />
                    }
                />

            </Grid>


            {/* =========================
                SYSTEM SUMMARY
            ========================= */}

            <Card
                sx={{
                    mt: 4,
                    borderRadius: 3,
                }}
            >

                <CardContent>

                    <Typography
                        variant="h6"
                        fontWeight="bold"
                        mb={2}
                    >
                        System Status Summary
                    </Typography>

                    <Typography
                        color="text.secondary"
                    >
                        ShopStack backend is currently
                        running and connected to the
                        PostgreSQL database.
                    </Typography>

                </CardContent>

            </Card>

        </Box>
    );
}


export default SystemMonitoring;
