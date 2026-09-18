import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
} from "@mui/material";

import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import RefreshIcon from "@mui/icons-material/Refresh";
import axios from "axios";

const API_URL = "/api";

function RefundManagement() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openDialog, setOpenDialog] = useState(false);

  const [orderId, setOrderId] = useState("");
  const [reason, setReason] = useState("");

  const token = localStorage.getItem("token");

  const getHeaders = () => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  });

  const fetchRefunds = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/admin/refunds`,
        {
          headers: getHeaders(),
        }
      );

      setRefunds(response.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch refunds:", error);

      alert(
        error.response?.data?.message ||
          "Failed to load refunds"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  const handleProcessRefund = async () => {
    if (!orderId || !reason.trim()) {
      alert("Please enter Order ID and refund reason.");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/admin/refunds/orders/${orderId}`,
        {
          reason: reason.trim(),
        },
        {
          headers: getHeaders(),
        }
      );

      alert("Refund processed successfully.");

      setOrderId("");
      setReason("");
      setOpenDialog(false);

      fetchRefunds();
    } catch (error) {
      console.error(
        "Failed to process refund:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to process refund"
      );
    }
  };

  return (
    <Box sx={{ p: 3 }}>

      {/* =========================
          HEADER
      ========================= */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <CurrencyRupeeIcon fontSize="large" />
            Refund Management
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            View and process customer refunds.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchRefunds}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            onClick={() => setOpenDialog(true)}
          >
            Process Refund
          </Button>
        </Box>
      </Box>

      {/* =========================
          REFUND LIST
      ========================= */}

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 5,
          }}
        >
          <CircularProgress />
        </Box>
      ) : refunds.length === 0 ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary">
              No refunds found.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {refunds.map((refund) => (
            <Grid
              key={refund.id}
              size={{ xs: 12, sm: 6, md: 4 }}
            >
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  boxShadow: 2,
                }}
              >
                <CardContent>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                    >
                      Refund #{refund.id}
                    </Typography>

                    <Chip
                      label={refund.status || "UNKNOWN"}
                      color={
                        refund.status === "REFUNDED"
                          ? "success"
                          : "default"
                      }
                      size="small"
                    />
                  </Box>

                  <Typography
                    variant="body2"
                    sx={{ mb: 1 }}
                  >
                    <strong>Order ID:</strong>{" "}
                    {refund.orderId}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{ mb: 1 }}
                  >
                    <strong>Refund Amount:</strong>{" "}
                    ₹
                    {Number(
                      refund.refundAmount || 0
                    ).toFixed(2)}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{ mb: 1 }}
                  >
                    <strong>Reason:</strong>{" "}
                    {refund.reason}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    <strong>Refunded At:</strong>{" "}
                    {refund.refundedAt
                      ? new Date(
                          refund.refundedAt
                        ).toLocaleString()
                      : "N/A"}
                  </Typography>

                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* =========================
          PROCESS REFUND DIALOG
      ========================= */}

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Process Refund
        </DialogTitle>

        <DialogContent>

          <TextField
            fullWidth
            margin="normal"
            label="Order ID"
            type="number"
            value={orderId}
            onChange={(event) =>
              setOrderId(event.target.value)
            }
          />

          <TextField
            fullWidth
            margin="normal"
            label="Refund Reason"
            multiline
            rows={3}
            value={reason}
            onChange={(event) =>
              setReason(event.target.value)
            }
          />

        </DialogContent>

        <DialogActions>

          <Button
            onClick={() => {
              setOpenDialog(false);
              setOrderId("");
              setReason("");
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleProcessRefund}
          >
            Process Refund
          </Button>

        </DialogActions>
      </Dialog>

    </Box>
  );
}

export default RefundManagement;