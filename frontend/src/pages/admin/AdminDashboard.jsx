import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
} from "@mui/material";

import PeopleIcon from "@mui/icons-material/People";
import StoreIcon from "@mui/icons-material/Store";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";

import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "/api";

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalUsers: 0,
    customers: 0,
    vendors: 0,
    approvedVendors: 0,
    products: 0,
    totalOrders: 0,
    totalSales: 0,
    confirmedOrders: 0,
    cancelledOrders: 0,
    refundedOrders: 0,
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_URL}/admin/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data?.data;

      if (data) {
        setStats({
          totalUsers: data.totalUsers ?? 0,
          customers: data.customers ?? 0,
          vendors: data.vendors ?? 0,
          approvedVendors: data.approvedVendors ?? 0,
          products: data.products ?? 0,
          totalOrders: data.totalOrders ?? 0,
          totalSales: data.totalSales ?? 0,
          confirmedOrders: data.confirmedOrders ?? 0,
          cancelledOrders: data.cancelledOrders ?? 0,
          refundedOrders: data.refundedOrders ?? 0,
        });
      }
    } catch (error) {
      console.error(
        "Failed to load dashboard statistics:",
        error
      );
    }
  };

  const managementCards = [
    {
      title: "Vendor Management",
      description:
        "Manage vendors, approvals and vendor details.",
      icon: <StoreIcon fontSize="large" />,
      path: "/admin/vendors",
    },
    {
      title: "Marketplace Analytics",
      description:
        "View marketplace sales, users and order analytics.",
      icon: <AssessmentIcon fontSize="large" />,
      path: "/admin/analytics",
    },
    {
      title: "Order Monitoring",
      description:
        "Monitor customer orders and their current status.",
      icon: <ShoppingCartIcon fontSize="large" />,
      path: "/admin/orders",
    },
    {
      title: "Commission Management",
      description:
        "View vendor sales, commission and earnings.",
      icon: <AttachMoneyIcon fontSize="large" />,
      path: "/admin/commissions",
    },
    {
      title: "Business Reports",
      description:
        "View business statistics and performance reports.",
      icon: <AssessmentIcon fontSize="large" />,
      path: "/admin/reports",
    },
    {
      title: "System Monitoring",
      description:
        "Check application, database and API status.",
      icon: <SettingsIcon fontSize="large" />,
      path: "/admin/system",
    },
    {
      title: "Warehouse Management",
      description:
        "Create warehouses and manage warehouse status.",
      icon: <WarehouseIcon fontSize="large" />,
      path: "/admin/warehouses",
    },
    {
      title: "Refund Management",
      description:
        "View and process customer refunds.",
      icon: <CurrencyRupeeIcon fontSize="large" />,
      path: "/admin/refunds",
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* =========================
          HEADER
      ========================= */}

      <Typography
        variant="h4"
        fontWeight="bold"
        sx={{ mb: 3 }}
      >
        Admin Dashboard
      </Typography>

      {/* =========================
          STATISTICS
      ========================= */}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <PeopleIcon
                fontSize="large"
                sx={{ mb: 1 }}
              />

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Total Users
              </Typography>

              <Typography variant="h5" fontWeight="bold">
                {stats.totalUsers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <PeopleIcon
                fontSize="large"
                sx={{ mb: 1 }}
              />

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Customers
              </Typography>

              <Typography variant="h5" fontWeight="bold">
                {stats.customers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <StoreIcon
                fontSize="large"
                sx={{ mb: 1 }}
              />

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Vendors
              </Typography>

              <Typography variant="h5" fontWeight="bold">
                {stats.vendors}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <InventoryIcon
                fontSize="large"
                sx={{ mb: 1 }}
              />

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Products
              </Typography>

              <Typography variant="h5" fontWeight="bold">
                {stats.products}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <ShoppingCartIcon
                fontSize="large"
                sx={{ mb: 1 }}
              />

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Total Orders
              </Typography>

              <Typography variant="h5" fontWeight="bold">
                {stats.totalOrders}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <AttachMoneyIcon
                fontSize="large"
                sx={{ mb: 1 }}
              />

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Total Sales
              </Typography>

              <Typography variant="h5" fontWeight="bold">
                ₹{Number(stats.totalSales).toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <LocalShippingIcon
                fontSize="large"
                sx={{ mb: 1 }}
              />

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Confirmed Orders
              </Typography>

              <Typography variant="h5" fontWeight="bold">
                {stats.confirmedOrders}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <ShoppingCartIcon
                fontSize="large"
                sx={{ mb: 1 }}
              />

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Refunded Orders
              </Typography>

              <Typography variant="h5" fontWeight="bold">
                {stats.refundedOrders}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* =========================
          ADMIN MANAGEMENT
      ========================= */}

      <Typography
        variant="h5"
        fontWeight="bold"
        sx={{ mb: 2 }}
      >
        Admin Management
      </Typography>

      <Grid container spacing={3}>
        {managementCards.map((card) => (
          <Grid
            key={card.title}
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
                <Box sx={{ mb: 1 }}>
                  {card.icon}
                </Box>

                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ mb: 1 }}
                >
                  {card.title}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {card.description}
                </Typography>

                <Button
                  variant="contained"
                  onClick={() => navigate(card.path)}
                >
                  Open
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default AdminDashboard;