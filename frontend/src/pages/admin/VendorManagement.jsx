import {
    Box,
    Button,
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
} from "@mui/material";

import { useEffect, useState } from "react";

import {
    getAllVendors,
    getVendorById,
} from "../../api/vendorService";


function VendorManagement() {

    const [vendors, setVendors] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    // =========================
    // SELECTED VENDOR
    // =========================

    const [selectedVendor, setSelectedVendor] =
        useState(null);

    const [detailsLoading, setDetailsLoading] =
        useState(false);

    const [detailsError, setDetailsError] =
        useState("");


    // =========================
    // LOAD VENDORS
    // =========================

    useEffect(() => {

        const loadVendors = async () => {

            try {

                const response =
                    await getAllVendors();

                console.log(
                    "VENDORS RESPONSE:",
                    response.data
                );

                setVendors(
                    response.data.data || []
                );

            } catch (error) {

                console.error(
                    "Vendor loading error:",
                    error
                );

                setError(
                    "Failed to load vendors."
                );

            } finally {

                setLoading(false);

            }
        };

        loadVendors();

    }, []);


    // =========================
    // VIEW VENDOR DETAILS
    // =========================

    const handleViewDetails =
        async (vendorId) => {

            try {

                setDetailsLoading(true);
                setDetailsError("");

                const response =
                    await getVendorById(vendorId);

                console.log(
                    "VENDOR DETAILS:",
                    response.data
                );

                setSelectedVendor(
                    response.data.data
                );

            } catch (error) {

                console.error(
                    "Vendor details error:",
                    error
                );

                setDetailsError(
                    "Failed to load vendor details."
                );

            } finally {

                setDetailsLoading(false);

            }
        };


    // =========================
    // CLOSE DETAILS
    // =========================

    const handleCloseDetails = () => {

        setSelectedVendor(null);
        setDetailsError("");

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
    // VENDOR MANAGEMENT
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
                PAGE TITLE
            ========================= */}

            <Typography
                variant="h4"
                fontWeight="bold"
                mb={1}
            >
                Vendor Management
            </Typography>

            <Typography
                color="text.secondary"
                mb={4}
            >
                View and monitor marketplace vendors
            </Typography>


            {/* =========================
                VENDOR COUNT
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
                        Total Vendors
                    </Typography>

                    <Typography
                        variant="h4"
                        fontWeight="bold"
                    >
                        {vendors.length}
                    </Typography>

                </CardContent>

            </Card>


            {/* =========================
                VENDOR TABLE
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
                                    Business Name
                                </strong>
                            </TableCell>

                            <TableCell>
                                <strong>
                                    Vendor Name
                                </strong>
                            </TableCell>

                            <TableCell>
                                <strong>
                                    Email
                                </strong>
                            </TableCell>

                            <TableCell>
                                <strong>
                                    Phone
                                </strong>
                            </TableCell>

                            <TableCell>
                                <strong>
                                    GST Number
                                </strong>
                            </TableCell>

                            <TableCell>
                                <strong>
                                    Status
                                </strong>
                            </TableCell>

                            <TableCell>
                                <strong>
                                    Action
                                </strong>
                            </TableCell>

                        </TableRow>

                    </TableHead>


                    <TableBody>

                        {vendors.length === 0 ? (

                            <TableRow>

                                <TableCell
                                    colSpan={7}
                                    align="center"
                                >

                                    <Typography
                                        color="text.secondary"
                                        sx={{ py: 4 }}
                                    >
                                        No vendors found.
                                    </Typography>

                                </TableCell>

                            </TableRow>

                        ) : (

                            vendors.map((vendor) => (

                                <TableRow
                                    key={vendor.id}
                                    hover
                                >

                                    <TableCell>
                                        {vendor.businessName}
                                    </TableCell>

                                    <TableCell>
                                        {vendor.firstName}{" "}
                                        {vendor.lastName}
                                    </TableCell>

                                    <TableCell>
                                        {vendor.businessEmail}
                                    </TableCell>

                                    <TableCell>
                                        {vendor.businessPhone}
                                    </TableCell>

                                    <TableCell>
                                        {vendor.gstNumber}
                                    </TableCell>

                                    <TableCell>

                                        <Chip
                                            label={
                                                vendor.approved
                                                    ? "APPROVED"
                                                    : "PENDING"
                                            }
                                            color={
                                                vendor.approved
                                                    ? "success"
                                                    : "warning"
                                            }
                                            size="small"
                                        />

                                    </TableCell>

                                    <TableCell>

                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() =>
                                                handleViewDetails(
                                                    vendor.id
                                                )
                                            }
                                        >
                                            View Details
                                        </Button>

                                    </TableCell>

                                </TableRow>

                            ))

                        )}

                    </TableBody>

                </Table>

            </TableContainer>


            {/* =========================
                VENDOR DETAILS DIALOG
            ========================= */}

            <Dialog
                open={
                    detailsLoading ||
                    selectedVendor !== null ||
                    detailsError !== ""
                }
                onClose={handleCloseDetails}
                fullWidth
                maxWidth="sm"
            >

                <DialogTitle>
                    Vendor Details
                </DialogTitle>

                <DialogContent>

                    {detailsLoading && (

                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                py: 4,
                            }}
                        >
                            <CircularProgress />
                        </Box>

                    )}


                    {detailsError && (

                        <Alert severity="error">
                            {detailsError}
                        </Alert>

                    )}


                    {selectedVendor && !detailsLoading && (

                        <Box>

                            {/* BUSINESS INFORMATION */}

                            <Typography
                                variant="h6"
                                fontWeight="bold"
                                mb={2}
                            >
                                Business Information
                            </Typography>

                            <Typography>
                                <strong>
                                    Business Name:
                                </strong>{" "}
                                {selectedVendor.businessName}
                            </Typography>

                            <Typography>
                                <strong>
                                    Business Email:
                                </strong>{" "}
                                {selectedVendor.businessEmail}
                            </Typography>

                            <Typography>
                                <strong>
                                    Business Phone:
                                </strong>{" "}
                                {selectedVendor.businessPhone}
                            </Typography>

                            <Typography>
                                <strong>
                                    GST Number:
                                </strong>{" "}
                                {selectedVendor.gstNumber}
                            </Typography>

                            <Typography>
                                <strong>
                                    Business Address:
                                </strong>{" "}
                                {selectedVendor.businessAddress}
                            </Typography>


                            <Divider sx={{ my: 3 }} />


                            {/* USER INFORMATION */}

                            <Typography
                                variant="h6"
                                fontWeight="bold"
                                mb={2}
                            >
                                Vendor Information
                            </Typography>

                            <Typography>
                                <strong>
                                    Name:
                                </strong>{" "}
                                {selectedVendor.firstName}{" "}
                                {selectedVendor.lastName}
                            </Typography>

                            <Typography>
                                <strong>
                                    Email:
                                </strong>{" "}
                                {selectedVendor.email}
                            </Typography>

                            <Typography>
                                <strong>
                                    Phone:
                                </strong>{" "}
                                {selectedVendor.phoneNumber}
                            </Typography>


                            <Divider sx={{ my: 3 }} />


                            {/* STATUS */}

                            <Typography
                                variant="h6"
                                fontWeight="bold"
                                mb={2}
                            >
                                Vendor Status
                            </Typography>

                            <Chip
                                label={
                                    selectedVendor.approved
                                        ? "APPROVED"
                                        : "PENDING"
                                }
                                color={
                                    selectedVendor.approved
                                        ? "success"
                                        : "warning"
                                }
                            />

                        </Box>

                    )}

                </DialogContent>

                <DialogActions>

                    <Button
                        onClick={
                            handleCloseDetails
                        }
                    >
                        Close
                    </Button>

                </DialogActions>

            </Dialog>

        </Box>
    );
}


export default VendorManagement;
