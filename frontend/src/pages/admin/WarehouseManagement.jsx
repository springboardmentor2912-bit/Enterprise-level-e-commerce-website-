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

import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import axios from "axios";

const API_URL = "/api";

function WarehouseManagement() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);

  const [form, setForm] = useState({
    warehouseName: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const token = localStorage.getItem("token");

  const getHeaders = () => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  });

  const fetchWarehouses = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/admin/warehouses`,
        {
          headers: getHeaders(),
        }
      );

      setWarehouses(response.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch warehouses:", error);

      alert(
        error.response?.data?.message ||
          "Failed to load warehouses"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleCreateWarehouse = async () => {
    if (
      !form.warehouseName ||
      !form.address ||
      !form.city ||
      !form.state ||
      !form.pincode
    ) {
      alert("Please fill all warehouse details.");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/admin/warehouses`,
        {
          warehouseName: form.warehouseName,
          address: form.address,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
        },
        {
          headers: getHeaders(),
        }
      );

      alert("Warehouse created successfully.");

      setForm({
        warehouseName: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
      });

      setOpenDialog(false);

      fetchWarehouses();
    } catch (error) {
      console.error(
        "Failed to create warehouse:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to create warehouse"
      );
    }
  };

  const updateWarehouseStatus = async (id, active) => {
    try {
      await axios.put(
        `${API_URL}/admin/warehouses/${id}/status?active=${active}`,
        {},
        {
          headers: getHeaders(),
        }
      );

      alert(
        active
          ? "Warehouse activated successfully."
          : "Warehouse deactivated successfully."
      );

      fetchWarehouses();
    } catch (error) {
      console.error(
        "Failed to update warehouse status:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to update warehouse status"
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
            <WarehouseIcon fontSize="large" />
            Warehouse Management
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Manage warehouses and their active status.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddBusinessIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add Warehouse
        </Button>
      </Box>

      {/* =========================
          WAREHOUSE LIST
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
      ) : warehouses.length === 0 ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary">
              No warehouses found.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {warehouses.map((warehouse) => (
            <Grid
              key={warehouse.id}
              size={{ xs: 12, md: 6, lg: 4 }}
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
                      alignItems: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                    >
                      {warehouse.warehouseName}
                    </Typography>

                    <Chip
                      label={
                        warehouse.active
                          ? "ACTIVE"
                          : "INACTIVE"
                      }
                      color={
                        warehouse.active
                          ? "success"
                          : "default"
                      }
                      size="small"
                    />
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    <strong>Warehouse ID:</strong>{" "}
                    {warehouse.id}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{ mb: 0.5 }}
                  >
                    <strong>Address:</strong>{" "}
                    {warehouse.address}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{ mb: 0.5 }}
                  >
                    <strong>City:</strong>{" "}
                    {warehouse.city}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{ mb: 0.5 }}
                  >
                    <strong>State:</strong>{" "}
                    {warehouse.state}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{ mb: 2 }}
                  >
                    <strong>Pincode:</strong>{" "}
                    {warehouse.pincode}
                  </Typography>

                  <Button
                    fullWidth
                    variant={
                      warehouse.active
                        ? "outlined"
                        : "contained"
                    }
                    color={
                      warehouse.active
                        ? "error"
                        : "success"
                    }
                    onClick={() =>
                      updateWarehouseStatus(
                        warehouse.id,
                        !warehouse.active
                      )
                    }
                  >
                    {warehouse.active
                      ? "Deactivate"
                      : "Activate"}
                  </Button>

                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* =========================
          CREATE WAREHOUSE DIALOG
      ========================= */}

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Add New Warehouse
        </DialogTitle>

        <DialogContent>

          <TextField
            fullWidth
            margin="normal"
            label="Warehouse Name"
            name="warehouseName"
            value={form.warehouseName}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Address"
            name="address"
            value={form.address}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            margin="normal"
            label="City"
            name="city"
            value={form.city}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            margin="normal"
            label="State"
            name="state"
            value={form.state}
            onChange={handleChange}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Pincode"
            name="pincode"
            value={form.pincode}
            onChange={handleChange}
          />

        </DialogContent>

        <DialogActions>

          <Button
            onClick={() => setOpenDialog(false)}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleCreateWarehouse}
          >
            Create Warehouse
          </Button>

        </DialogActions>
      </Dialog>

    </Box>
  );
}

export default WarehouseManagement;