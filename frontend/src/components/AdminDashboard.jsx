import { useEffect, useState } from "react";
import api from "../services/api";
import "./AdminDashboard.css";

import VendorManagement from "./VendorManagement";
import UserManagement from "./UserManagement";
import AdminProductManagement from "./AdminProductManagement";
import AdminOrderManagement from "./AdminOrderManagement";

function AdminDashboard() {
  const [activePage, setActivePage] = useState("dashboard");

  // =========================================================
  // REPORT DETAIL STATES
  // =========================================================

  const [reportDetail, setReportDetail] = useState(null);
  const [reportDetailTitle, setReportDetailTitle] = useState("");
  const [reportDetailData, setReportDetailData] = useState([]);
  const [reportDetailType, setReportDetailType] = useState("");
  const [loadingReportDetail, setLoadingReportDetail] = useState(false);
  const [reportDetailError, setReportDetailError] = useState("");

  // =========================================================
  // DASHBOARD STATISTICS
  // =========================================================

  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRefunds: 0,
  });

  const [orderReport, setOrderReport] = useState({
    pendingOrders: 0,
    confirmedOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
  });

  const [userReport, setUserReport] = useState({
    customers: 0,
    vendors: 0,
    administrators: 0,
    warehouseStaff: 0,
  });

  const [refundReport, setRefundReport] = useState({
    totalRefunds: 0,
    requestedRefunds: 0,
    approvedRefunds: 0,
    completedRefunds: 0,
    rejectedRefunds: 0,
  });

  const [productReport, setProductReport] = useState({
    totalProducts: 0,
    totalVendors: 0,
  });

  const [commissionReport, setCommissionReport] = useState({
    totalCommission: 0,
    totalVendorAmount: 0,
    totalOrderAmount: 0,
    totalRecords: 0,
  });

  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState("");

  // =========================================================
  // LOAD REPORTS
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    const loadReports = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          if (!cancelled) {
            setStatsError("Please login as Administrator.");
            setLoadingStats(false);
          }

          return;
        }

        // =====================================================
        // DASHBOARD REPORT
        // =====================================================

        const dashboardResponse = await api.get(
          "/admin/reports/dashboard"
        );

        // =====================================================
        // ORDER REPORT
        // =====================================================

        const orderResponse = await api.get(
          "/admin/reports/orders"
        );

        // =====================================================
        // USER REPORT
        // =====================================================

        const userResponse = await api.get(
          "/admin/reports/users"
        );

        // =====================================================
        // PRODUCT REPORT
        // =====================================================

        const productResponse = await api.get(
          "/admin/reports/products"
        );

        // =====================================================
        // REFUND REPORT
        // =====================================================

        const refundResponse = await api.get(
          "/admin/reports/refunds"
        );

        // =====================================================
        // COMMISSION REPORT
        // =====================================================

        const commissionResponse = await api.get(
          "/admin/reports/commissions"
        );

        console.log(
          "Dashboard Report:",
          dashboardResponse.data
        );

        console.log(
          "Order Report:",
          orderResponse.data
        );

        console.log(
          "User Report:",
          userResponse.data
        );

        console.log(
          "Product Report:",
          productResponse.data
        );

        console.log(
          "Refund Report:",
          refundResponse.data
        );

        console.log(
          "Commission Report:",
          commissionResponse.data
        );

        if (!cancelled) {
          // ===================================================
          // DASHBOARD
          // ===================================================

          setStatistics({
            totalUsers:
              (dashboardResponse.data.totalCustomers || 0) +
              (dashboardResponse.data.totalVendors || 0) +
              (dashboardResponse.data.totalAdmins || 0) +
              (dashboardResponse.data.totalWarehouseStaff || 0),

            totalVendors:
              dashboardResponse.data.totalVendors || 0,

            totalProducts:
              dashboardResponse.data.totalProducts || 0,

            totalOrders:
              dashboardResponse.data.totalOrders || 0,

            totalCustomers:
              dashboardResponse.data.totalCustomers || 0,

            totalRefunds:
              dashboardResponse.data.totalRefunds || 0,
          });

          // ===================================================
          // ORDERS
          // ===================================================

          setOrderReport({
            pendingOrders:
              orderResponse.data.pendingOrders || 0,

            confirmedOrders:
              orderResponse.data.confirmedOrders || 0,

            shippedOrders:
              orderResponse.data.shippedOrders || 0,

            deliveredOrders:
              orderResponse.data.deliveredOrders || 0,

            cancelledOrders:
              orderResponse.data.cancelledOrders || 0,
          });

          // ===================================================
          // USERS
          // ===================================================

          setUserReport({
            customers:
              userResponse.data.customers || 0,

            vendors:
              userResponse.data.vendors || 0,

            administrators:
              userResponse.data.administrators || 0,

            warehouseStaff:
              userResponse.data.warehouseStaff || 0,
          });

          // ===================================================
          // PRODUCTS
          // ===================================================

          setProductReport({
            totalProducts:
              productResponse.data.totalProducts || 0,

            totalVendors:
              productResponse.data.totalVendors || 0,
          });

          // ===================================================
          // REFUNDS
          // ===================================================

          setRefundReport({
            totalRefunds:
              refundResponse.data.totalRefunds || 0,

            requestedRefunds:
              refundResponse.data.requestedRefunds || 0,

            approvedRefunds:
              refundResponse.data.approvedRefunds || 0,

            completedRefunds:
              refundResponse.data.completedRefunds || 0,

            rejectedRefunds:
              refundResponse.data.rejectedRefunds || 0,
          });

          // ===================================================
          // COMMISSIONS
          // ===================================================

          const commissions = Array.isArray(
            commissionResponse.data
          )
            ? commissionResponse.data
            : [];

          const totalOrderAmount = commissions.reduce(
            (sum, commission) =>
              sum + Number(commission.orderAmount || 0),
            0
          );

          const totalCommission = commissions.reduce(
            (sum, commission) =>
              sum + Number(commission.commissionAmount || 0),
            0
          );

          const totalVendorAmount = commissions.reduce(
            (sum, commission) =>
              sum + Number(commission.vendorAmount || 0),
            0
          );

          setCommissionReport({
            totalCommission,
            totalVendorAmount,
            totalOrderAmount,
            totalRecords: commissions.length,
          });

          setStatsError("");
          setLoadingStats(false);
        }
      } catch (error) {
        console.error("Admin reports error:", error);

        if (!cancelled) {
          if (error.response?.status === 403) {
            setStatsError(
              "Access denied. Please login as Administrator."
            );
          } else if (error.response?.status === 401) {
            setStatsError(
              "Your session has expired. Please login again."
            );
          } else {
            setStatsError(
              "Unable to load reports and analytics."
            );
          }

          setLoadingStats(false);
        }
      }
    };

    const timer = setTimeout(() => {
      loadReports();
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  // =========================================================
  // OPEN ORDER REPORT DETAIL
  // =========================================================

  const openOrderReportDetail = async (
    title,
    filterType
  ) => {
    setReportDetail(title);
    setReportDetailTitle(title);
    setReportDetailType("orders");
    setReportDetailData([]);
    setReportDetailError("");
    setLoadingReportDetail(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setReportDetailError(
          "Please login as Administrator."
        );
        return;
      }

      const response = await api.get("/admin/orders");

      const orders = Array.isArray(response.data)
        ? response.data
        : [];

      let filteredOrders = orders;

      if (filterType !== "ALL") {
        filteredOrders = orders.filter(
          (order) =>
            order.status?.toUpperCase() === filterType
        );
      }

      setReportDetailData(filteredOrders);
    } catch (error) {
      console.error(
        "Order report detail error:",
        error
      );

      if (error.response?.status === 403) {
        setReportDetailError(
          "Access denied. Please login as Administrator."
        );
      } else if (error.response?.status === 401) {
        setReportDetailError(
          "Your session has expired. Please login again."
        );
      } else {
        setReportDetailError(
          "Unable to load order report details."
        );
      }
    } finally {
      setLoadingReportDetail(false);
    }
  };

  // =========================================================
  // OPEN USER REPORT DETAIL
  // =========================================================

  const openUserReportDetail = async (
    title,
    filterType
  ) => {
    setReportDetail(title);
    setReportDetailTitle(title);
    setReportDetailType("users");
    setReportDetailData([]);
    setReportDetailError("");
    setLoadingReportDetail(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setReportDetailError(
          "Please login as Administrator."
        );
        return;
      }

      const response = await api.get("/admin/users");

      const users = Array.isArray(response.data)
        ? response.data
        : [];

      let filteredUsers = users;

      if (filterType !== "ALL_USERS") {
        filteredUsers = users.filter(
          (user) =>
            user.role?.toUpperCase() === filterType
        );
      }

      setReportDetailData(filteredUsers);
    } catch (error) {
      console.error(
        "User report detail error:",
        error
      );

      if (error.response?.status === 403) {
        setReportDetailError(
          "Access denied. Please login as Administrator."
        );
      } else if (error.response?.status === 401) {
        setReportDetailError(
          "Your session has expired. Please login again."
        );
      } else {
        setReportDetailError(
          "Unable to load user report details."
        );
      }
    } finally {
      setLoadingReportDetail(false);
    }
  };

  // =========================================================
  // OPEN PRODUCT REPORT DETAIL
  // =========================================================

  const openProductReportDetail = async (
    title,
    filterType
  ) => {
    setReportDetail(title);
    setReportDetailTitle(title);
    setReportDetailType("products");
    setReportDetailData([]);
    setReportDetailError("");
    setLoadingReportDetail(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setReportDetailError(
          "Please login as Administrator."
        );
        return;
      }

      const response = await api.get("/admin/products");

      const products = Array.isArray(response.data)
        ? response.data
        : [];

      if (filterType === "ALL_PRODUCTS") {
        setReportDetailData(products);
      } else if (filterType === "VENDORS") {
        const vendorMap = {};

        products.forEach((product) => {
          const vendorEmail =
            product.vendorEmail || "Unknown Vendor";

          if (!vendorMap[vendorEmail]) {
            vendorMap[vendorEmail] = {
              vendorEmail,
              productCount: 0,
              products: [],
            };
          }

          vendorMap[vendorEmail].productCount += 1;

          vendorMap[vendorEmail].products.push(
            product
          );
        });

        setReportDetailData(
          Object.values(vendorMap)
        );
      }
    } catch (error) {
      console.error(
        "Product report detail error:",
        error
      );

      if (error.response?.status === 403) {
        setReportDetailError(
          "Access denied. Please login as Administrator."
        );
      } else if (error.response?.status === 401) {
        setReportDetailError(
          "Your session has expired. Please login again."
        );
      } else {
        setReportDetailError(
          "Unable to load product report details."
        );
      }
    } finally {
      setLoadingReportDetail(false);
    }
  };

  // =========================================================
  // OPEN REFUND REPORT DETAIL
  // =========================================================

  const openRefundReportDetail = async (
    title,
    filterType
  ) => {
    setReportDetail(title);
    setReportDetailTitle(title);
    setReportDetailType("refunds");
    setReportDetailData([]);
    setReportDetailError("");
    setLoadingReportDetail(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setReportDetailError(
          "Please login as Administrator."
        );
        return;
      }

      const response = await api.get("/admin/orders");

      const orders = Array.isArray(response.data)
        ? response.data
        : [];

      let filteredRefunds = orders.filter(
        (order) =>
          order.returnStatus &&
          order.returnStatus !== "N/A"
      );

      if (filterType === "ALL_REFUNDS") {
        filteredRefunds = orders.filter(
          (order) =>
            order.returnStatus &&
            order.returnStatus !== "N/A"
        );
      } else if (
        filterType === "RETURN_REQUESTED"
      ) {
        filteredRefunds = orders.filter(
          (order) =>
            order.returnStatus?.toUpperCase() ===
            "RETURN_REQUESTED"
        );
      } else if (
        filterType === "RETURN_APPROVED"
      ) {
        filteredRefunds = orders.filter(
          (order) =>
            order.returnStatus?.toUpperCase() ===
            "RETURN_APPROVED"
        );
      } else if (filterType === "REFUNDED") {
        filteredRefunds = orders.filter(
          (order) =>
            order.returnStatus?.toUpperCase() ===
            "REFUNDED"
        );
      } else if (
        filterType === "RETURN_REJECTED"
      ) {
        filteredRefunds = orders.filter(
          (order) =>
            order.returnStatus?.toUpperCase() ===
            "RETURN_REJECTED"
        );
      }

      setReportDetailData(filteredRefunds);
    } catch (error) {
      console.error(
        "Refund report detail error:",
        error
      );

      if (error.response?.status === 403) {
        setReportDetailError(
          "Access denied. Please login as Administrator."
        );
      } else if (error.response?.status === 401) {
        setReportDetailError(
          "Your session has expired. Please login again."
        );
      } else {
        setReportDetailError(
          "Unable to load refund report details."
        );
      }
    } finally {
      setLoadingReportDetail(false);
    }
  };

  // =========================================================
  // OPEN COMMISSION REPORT DETAIL
  // =========================================================

  const openCommissionReportDetail = async (
    title,
    filterType
  ) => {
    setReportDetail(title);
    setReportDetailTitle(title);
    setReportDetailType("commissions");
    setReportDetailData([]);
    setReportDetailError("");
    setLoadingReportDetail(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setReportDetailError(
          "Please login as Administrator."
        );
        return;
      }

      const response = await api.get(
        "/admin/reports/commissions"
      );

      const commissions = Array.isArray(
        response.data
      )
        ? response.data
        : [];

      let filteredCommissions = commissions;

      if (filterType === "COMMISSION_RECORDS") {
        filteredCommissions = commissions;
      } else if (
        filterType === "POSITIVE_COMMISSION"
      ) {
        filteredCommissions = commissions.filter(
          (commission) =>
            Number(
              commission.commissionAmount || 0
            ) > 0
        );
      }

      setReportDetailData(filteredCommissions);
    } catch (error) {
      console.error(
        "Commission report detail error:",
        error
      );

      if (error.response?.status === 403) {
        setReportDetailError(
          "Access denied. Please login as Administrator."
        );
      } else if (error.response?.status === 401) {
        setReportDetailError(
          "Your session has expired. Please login again."
        );
      } else {
        setReportDetailError(
          "Unable to load commission report details."
        );
      }
    } finally {
      setLoadingReportDetail(false);
    }
  };

  // =========================================================
  // CLOSE REPORT DETAIL
  // =========================================================

  const closeReportDetail = () => {
    setReportDetail(null);
    setReportDetailTitle("");
    setReportDetailType("");
    setReportDetailData([]);
    setReportDetailError("");
    setLoadingReportDetail(false);
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  // =========================================================
  // REPORT DETAIL RENDER
  // =========================================================

  const renderReportDetail = () => {
    if (loadingReportDetail) {
      return (
        <div className="loading-message">
          Loading report details...
        </div>
      );
    }

    if (reportDetailError) {
      return (
        <div className="error-message">
          {reportDetailError}
        </div>
      );
    }

    if (reportDetailData.length === 0) {
      return (
        <div className="coming-soon">
          <h3>No Records Found</h3>
          <p>
            There are no records available for this
            report.
          </p>
        </div>
      );
    }

    // =======================================================
    // USER TABLE
    // =======================================================

    if (reportDetailType === "users") {
      return (
        <div className="report-detail-table-wrapper">
          <table className="report-detail-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {reportDetailData.map((user) => (
                <tr key={user.id}>
                  <td>#{user.id}</td>

                  <td>
                    <strong>
                      {user.fullName || "Unknown User"}
                    </strong>
                  </td>

                  <td>
                    {user.email || "N/A"}
                  </td>

                  <td>
                    <span className="order-status">
                      {user.role || "N/A"}
                    </span>
                  </td>

                  <td>
                    <span className="order-status">
                      {user.status || "ACTIVE"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // =======================================================
    // ORDER TABLE
    // =======================================================

    if (reportDetailType === "orders") {
      return (
        <div className="report-detail-table-wrapper">
          <table className="report-detail-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Order Date</th>
                <th>Return Status</th>
              </tr>
            </thead>

            <tbody>
              {reportDetailData.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>

                  <td>
                    {order.customerEmail || "N/A"}
                  </td>

                  <td>
                    ₹{order.totalAmount ?? "0.00"}
                  </td>

                  <td>
                    <span
                      className={
                        "order-status " +
                        (
                          order.status
                            ?.toLowerCase()
                            .replace(/_/g, "-") ||
                          "unknown"
                        )
                      }
                    >
                      {order.status || "N/A"}
                    </span>
                  </td>

                  <td>
                    {order.orderDate
                      ? new Date(
                          order.orderDate
                        ).toLocaleString()
                      : "N/A"}
                  </td>

                  <td>
                    {order.returnStatus || "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // =======================================================
    // PRODUCT TABLE
    // =======================================================

    if (reportDetailType === "products") {
      return (
        <div className="report-detail-table-wrapper">
          {reportDetailTitle === "All Products" && (
            <table className="report-detail-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Vendor</th>
                </tr>
              </thead>

              <tbody>
                {reportDetailData.map((product) => (
                  <tr key={product.id}>
                    <td>#{product.id}</td>

                    <td>
                      <strong>
                        {product.name || "N/A"}
                      </strong>
                    </td>

                    <td>
                      {product.category || "N/A"}
                    </td>

                    <td>
                      {product.brand || "N/A"}
                    </td>

                    <td>
                      ₹{product.price ?? "0.00"}
                    </td>

                    <td>
                      {product.quantity ?? 0}
                    </td>

                    <td>
                      {product.vendorEmail || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportDetailTitle ===
            "Products by Vendor" && (
            <table className="report-detail-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Vendor</th>
                  <th>Product Count</th>
                  <th>Products</th>
                </tr>
              </thead>

              <tbody>
                {reportDetailData.map(
                  (vendor, index) => (
                    <tr key={vendor.vendorEmail}>
                      <td>{index + 1}</td>

                      <td>
                        <strong>
                          {vendor.vendorEmail}
                        </strong>
                      </td>

                      <td>
                        {vendor.productCount}
                      </td>

                      <td>
                        {vendor.products
                          ?.map(
                            (product) =>
                              product.name
                          )
                          .join(", ") ||
                          "No products"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          )}
        </div>
      );
    }

    // =======================================================
    // REFUND TABLE
    // =======================================================

    if (reportDetailType === "refunds") {
      return (
        <div className="report-detail-table-wrapper">
          <table className="report-detail-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Order Amount</th>
                <th>Refund Amount</th>
                <th>Return Status</th>
                <th>Return Reason</th>
                <th>Transaction ID</th>
                <th>Requested Date</th>
                <th>Refund Date</th>
              </tr>
            </thead>

            <tbody>
              {reportDetailData.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>

                  <td>
                    {order.customerEmail || "N/A"}
                  </td>

                  <td>
                    ₹{order.totalAmount ?? "0.00"}
                  </td>

                  <td>
                    ₹{order.refundAmount ?? "0.00"}
                  </td>

                  <td>
                    <span
                      className={
                        "order-status " +
                        (
                          order.returnStatus
                            ?.toLowerCase()
                            .replace(/_/g, "-") ||
                          "unknown"
                        )
                      }
                    >
                      {order.returnStatus || "N/A"}
                    </span>
                  </td>

                  <td>
                    {order.returnReason || "N/A"}
                  </td>

                  <td>
                    {order.refundTransactionId ||
                      "N/A"}
                  </td>

                  <td>
                    {order.returnRequestedDate
                      ? new Date(
                          order.returnRequestedDate
                        ).toLocaleString()
                      : "N/A"}
                  </td>

                  <td>
                    {order.refundDate
                      ? new Date(
                          order.refundDate
                        ).toLocaleString()
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // =======================================================
    // COMMISSION TABLE
    // =======================================================

    if (reportDetailType === "commissions") {
      return (
        <div className="report-detail-table-wrapper">
          <table className="report-detail-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Order ID</th>
                <th>Product ID</th>
                <th>Vendor</th>
                <th>Order Amount</th>
                <th>Commission Rate</th>
                <th>Commission</th>
                <th>Vendor Amount</th>
                <th>Created Date</th>
              </tr>
            </thead>

            <tbody>
              {reportDetailData.map(
                (commission) => (
                  <tr key={commission.id}>
                    <td>#{commission.id}</td>

                    <td>
                      #{commission.orderId}
                    </td>

                    <td>
                      #{commission.productId}
                    </td>

                    <td>
                      {commission.vendorEmail ||
                        "N/A"}
                    </td>

                    <td>
                      ₹
                      {Number(
                        commission.orderAmount || 0
                      ).toFixed(2)}
                    </td>

                    <td>
                      {Number(
                        commission.commissionRate || 0
                      ).toFixed(2)}
                      %
                    </td>

                    <td>
                      ₹
                      {Number(
                        commission.commissionAmount ||
                          0
                      ).toFixed(2)}
                    </td>

                    <td>
                      ₹
                      {Number(
                        commission.vendorAmount || 0
                      ).toFixed(2)}
                    </td>

                    <td>
                      {commission.createdAt
                        ? new Date(
                            commission.createdAt
                          ).toLocaleString()
                        : "N/A"}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      );
    }

    return null;
  };

  // =========================================================
  // REPORTS PAGE
  // =========================================================

  const renderReports = () => {
    if (reportDetail) {
      return (
        <section className="dashboard-section">
          <button
            className="back-button"
            onClick={closeReportDetail}
          >
            ← Back to Reports
          </button>

          <h2>
            📊 {reportDetailTitle}
          </h2>

          {renderReportDetail()}
        </section>
      );
    }

    return (
      <>
        {statsError && (
          <div className="error-message">
            {statsError}
          </div>
        )}

        {/* =================================================
            ORDER REPORTS
            ================================================= */}

        <section className="dashboard-section">
          <h2>📈 Order Reports</h2>

          <div className="report-grid">
            <div
              className="report-card clickable-report-card"
              onClick={() =>
                openOrderReportDetail(
                  "All Orders",
                  "ALL"
                )
              }
            >
              <span>Total Orders</span>

              <strong>
                {loadingStats
                  ? "..."
                  : statistics.totalOrders}
              </strong>

              <small>
                Click to view details →
              </small>
            </div>

            <div
              className="report-card clickable-report-card"
              onClick={() =>
                openOrderReportDetail(
                  "Pending Orders",
                  "PENDING"
                )
              }
            >
              <span>Pending Orders</span>

              <strong>
                {loadingStats
                  ? "..."
                  : orderReport.pendingOrders}
              </strong>

              <small>
                Click to view details →
              </small>
            </div>

            <div
              className="report-card clickable-report-card"
              onClick={() =>
                openOrderReportDetail(
                  "Confirmed Orders",
                  "CONFIRMED"
                )
              }
            >
              <span>Confirmed Orders</span>

              <strong>
                {loadingStats
                  ? "..."
                  : orderReport.confirmedOrders}
              </strong>

              <small>
                Click to view details →
              </small>
            </div>

            <div
              className="report-card clickable-report-card"
              onClick={() =>
                openOrderReportDetail(
                  "Shipped Orders",
                  "SHIPPED"
                )
              }
            >
              <span>Shipped Orders</span>

              <strong>
                {loadingStats
                  ? "..."
                  : orderReport.shippedOrders}
              </strong>

              <small>
                Click to view details →
              </small>
            </div>

            <div
              className="report-card clickable-report-card"
              onClick={() =>
                openOrderReportDetail(
                  "Delivered Orders",
                  "DELIVERED"
                )
              }
            >
              <span>Delivered Orders</span>

              <strong>
                {loadingStats
                  ? "..."
                  : orderReport.deliveredOrders}
              </strong>

              <small>
                Click to view details →
              </small>
            </div>

            <div
              className="report-card clickable-report-card"
              onClick={() =>
                openOrderReportDetail(
                  "Cancelled Orders",
                  "CANCELLED"
                )
              }
            >
              <span>Cancelled Orders</span>

              <strong>
                {loadingStats
                  ? "..."
                  : orderReport.cancelledOrders}
              </strong>

              <small>
                Click to view details →
              </small>
            </div>
          </div>
        </section>

        {/* =================================================
            USER REPORTS
            ================================================= */}

        <section className="dashboard-section">
          <h2>👥 User Reports</h2>

          <div className="report-grid">
            <div
              className="report-card clickable-report-card"
              onClick={() =>
                openUserReportDetail(
                  "Customers",
                  "CUSTOMER"
                )
              }
            >
              <span>Customers</span>

              <strong>
                {loadingStats
                  ? "..."
                  : userReport.customers}
              </strong>

              <small>
                Click to view details →
              </small>
            </div>

            <div
              className="report-card clickable-report-card"
              onClick={() =>
                openUserReportDetail(
                  "Vendors",
                  "VENDOR"
                )
              }
            >
              <span>Vendors</span>

              <strong>
                {loadingStats
                  ? "..."
                  : userReport.vendors}
              </strong>

              <small>
                Click to view details →
              </small>
            </div>

            <div
              className="report-card clickable-report-card"
              onClick={() =>
                openUserReportDetail(
                  "Administrators",
                  "ADMINISTRATOR"
                )
              }
            >
              <span>Administrators</span>

              <strong>
                {loadingStats
                  ? "..."
                  : userReport.administrators}
              </strong>

              <small>
                Click to view details →
              </small>
            </div>

            <div
              className="report-card clickable-report-card"
              onClick={() =>
                openUserReportDetail(
                  "Warehouse Staff",
                  "WAREHOUSE_STAFF"
                )
              }
            >
              <span>Warehouse Staff</span>

              <strong>
                {loadingStats
                  ? "..."
                  : userReport.warehouseStaff}
              </strong>

              <small>
                Click to view details →
              </small>
            </div>

            <div
              className="report-card clickable-report-card"
              onClick={() =>
                openUserReportDetail(
                  "All Users",
                  "ALL_USERS"
                )
              }
            >
              <span>Total Users</span>

              <strong>
                {loadingStats
                  ? "..."
                  : statistics.totalUsers}
              </strong>

              <small>
                Click to view details →
              </small>
            </div>
          </div>
        </section>

        {/* =================================================
            PRODUCT REPORTS
            ================================================= */}

        <section className="dashboard-section">
          <h2>📦 Product Reports</h2>

          <div className="report-grid">
            <div
              className="report-card clickable-report-card"
              onClick={() =>
                openProductReportDetail(
                  "All Products",
                  "ALL_PRODUCTS"
                )
              }
            >
              <span>Total Products</span>

              <strong>
                {loadingStats
                  ? "..."
                  : productReport.totalProducts}
              </strong>

              <small>
                Click to view details →
              </small>
            </div>

            <div
              className="report-card clickable-report-card"
              onClick={() =>
                openProductReportDetail(
                  "Products by Vendor",
                  "VENDORS"
                )
              }
            >
              <span>Total Vendors</span>

              <strong>
                {loadingStats
                  ? "..."
                  : productReport.totalVendors}
              </strong>

              <small>
                Click to view details →
              </small>
            </div>
          </div>
        </section>

        {/* =================================================
            REFUND REPORTS
            ================================================= */}

        <section className="dashboard-section">
          <h2>💰 Refund Reports</h2>

          <div className="report-grid">
            <div
              className="report-card clickable-report-card"
              onClick={() =>
                openRefundReportDetail(
                  "All Refunds",
                  "ALL_REFUNDS"
                )
              }
            >
              <span>Total Refunds</span>

              <strong>
                {loadingStats
                  ? "..."
                  : refundReport.totalRefunds}
              </strong>

              <small>
                Click to view details →
              </small>
            </div>

            <div
              className="report-card clickable-report-card"
              onClick={() =>
                openRefundReportDetail(
                  "Requested Refunds",
                  "RETURN_REQUESTED"
                )
              }
            >
              <span>Requested</span>

              <strong>
                {loadingStats
                  ? "..."
                  : refundReport.requestedRefunds}
              </strong>

              <small>
                Click to view details →
              </small>
            </div>

            <div
              className="report-card clickable-report-card"
              onClick={() =>
                openRefundReportDetail(
                  "Approved Refunds",
                  "RETURN_APPROVED"
                )
              }
            >
              <span>Approved</span>

              <strong>
                {loadingStats
                  ? "..."
                  : refundReport.approvedRefunds}
              </strong>

              <small>
                Click to view details →
              </small>
            </div>

            <div
              className="report-card clickable-report-card"
              onClick={() =>
                openRefundReportDetail(
                  "Completed Refunds",
                  "REFUNDED"
                )
              }
            >
              <span>Completed</span>

              <strong>
                {loadingStats
                  ? "..."
                  : refundReport.completedRefunds}
              </strong>

              <small>
                Click to view details →
              </small>
            </div>

            <div
              className="report-card clickable-report-card"
              onClick={() =>
                openRefundReportDetail(
                  "Rejected Refunds",
                  "RETURN_REJECTED"
                )
              }
            >
              <span>Rejected</span>

              <strong>
                {loadingStats
                  ? "..."
                  : refundReport.rejectedRefunds}
              </strong>

              <small>
                Click to view details →
              </small>
            </div>
          </div>
        </section>

        {/* =================================================
            COMMISSION REPORTS
            ================================================= */}

        <section className="dashboard-section">
          <h2>💼 Commission Reports</h2>

          <div className="report-grid">
            <div
              className="report-card clickable-report-card"
              onClick={() =>
                openCommissionReportDetail(
                  "All Commission Records",
                  "COMMISSION_RECORDS"
                )
              }
            >
              <span>Total Order Amount</span>

              <strong>
                {loadingStats
                  ? "..."
                  : `₹${commissionReport.totalOrderAmount.toFixed(
                      2
                    )}`}
              </strong>

              <small>
                Click to view details →
              </small>
            </div>

            <div
              className="report-card clickable-report-card"
              onClick={() =>
                openCommissionReportDetail(
                  "Commission Earned",
                  "POSITIVE_COMMISSION"
                )
              }
            >
              <span>Total Commission</span>

              <strong>
                {loadingStats
                  ? "..."
                  : `₹${commissionReport.totalCommission.toFixed(
                      2
                    )}`}
              </strong>

              <small>
                Click to view details →
              </small>
            </div>

            <div
              className="report-card clickable-report-card"
              onClick={() =>
                openCommissionReportDetail(
                  "Vendor Amounts",
                  "COMMISSION_RECORDS"
                )
              }
            >
              <span>Vendor Amount</span>

              <strong>
                {loadingStats
                  ? "..."
                  : `₹${commissionReport.totalVendorAmount.toFixed(
                      2
                    )}`}
              </strong>

              <small>
                Click to view details →
              </small>
            </div>

            <div
              className="report-card clickable-report-card"
              onClick={() =>
                openCommissionReportDetail(
                  "All Commission Records",
                  "COMMISSION_RECORDS"
                )
              }
            >
              <span>Commission Records</span>

              <strong>
                {loadingStats
                  ? "..."
                  : commissionReport.totalRecords}
              </strong>

              <small>
                Click to view details →
              </small>
            </div>
          </div>
        </section>
      </>
    );
  };

  // =========================================================
  // RENDER CONTENT
  // =========================================================

  const renderContent = () => {
    // =======================================================
    // DASHBOARD
    // =======================================================

    if (activePage === "dashboard") {
      return (
        <>
          {statsError && (
            <div className="error-message">
              {statsError}
            </div>
          )}

          {/* MAIN STATISTICS */}

          <section className="statistics">
            <div className="stat-card">
              <div className="stat-icon">👥</div>

              <div>
                <p>Total Users</p>

                <h2>
                  {loadingStats
                    ? "..."
                    : statistics.totalUsers}
                </h2>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🏪</div>

              <div>
                <p>Total Vendors</p>

                <h2>
                  {loadingStats
                    ? "..."
                    : statistics.totalVendors}
                </h2>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📦</div>

              <div>
                <p>Total Products</p>

                <h2>
                  {loadingStats
                    ? "..."
                    : statistics.totalProducts}
                </h2>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🛍️</div>

              <div>
                <p>Total Orders</p>

                <h2>
                  {loadingStats
                    ? "..."
                    : statistics.totalOrders}
                </h2>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">👤</div>

              <div>
                <p>Customers</p>

                <h2>
                  {loadingStats
                    ? "..."
                    : statistics.totalCustomers}
                </h2>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💰</div>

              <div>
                <p>Total Refunds</p>

                <h2>
                  {loadingStats
                    ? "..."
                    : statistics.totalRefunds}
                </h2>
              </div>
            </div>
          </section>

          {/* ORDER OVERVIEW */}

          <section className="dashboard-section">
            <h2>📦 Order Overview</h2>

            <div className="report-grid">
              <div className="report-card">
                <span>Pending</span>

                <strong>
                  {loadingStats
                    ? "..."
                    : orderReport.pendingOrders}
                </strong>
              </div>

              <div className="report-card">
                <span>Confirmed</span>

                <strong>
                  {loadingStats
                    ? "..."
                    : orderReport.confirmedOrders}
                </strong>
              </div>

              <div className="report-card">
                <span>Shipped</span>

                <strong>
                  {loadingStats
                    ? "..."
                    : orderReport.shippedOrders}
                </strong>
              </div>

              <div className="report-card">
                <span>Delivered</span>

                <strong>
                  {loadingStats
                    ? "..."
                    : orderReport.deliveredOrders}
                </strong>
              </div>

              <div className="report-card">
                <span>Cancelled</span>

                <strong>
                  {loadingStats
                    ? "..."
                    : orderReport.cancelledOrders}
                </strong>
              </div>
            </div>
          </section>

          {/* USER OVERVIEW */}

          <section className="dashboard-section">
            <h2>👥 User Overview</h2>

            <div className="report-grid">
              <div className="report-card">
                <span>Customers</span>

                <strong>
                  {loadingStats
                    ? "..."
                    : userReport.customers}
                </strong>
              </div>

              <div className="report-card">
                <span>Vendors</span>

                <strong>
                  {loadingStats
                    ? "..."
                    : userReport.vendors}
                </strong>
              </div>

              <div className="report-card">
                <span>Administrators</span>

                <strong>
                  {loadingStats
                    ? "..."
                    : userReport.administrators}
                </strong>
              </div>

              <div className="report-card">
                <span>Warehouse Staff</span>

                <strong>
                  {loadingStats
                    ? "..."
                    : userReport.warehouseStaff}
                </strong>
              </div>
            </div>
          </section>
        </>
      );
    }

    // =======================================================
    // VENDORS
    // =======================================================

    if (activePage === "vendors") {
      return (
        <section className="dashboard-section">
          <VendorManagement />
        </section>
      );
    }

    // =======================================================
    // USERS
    // =======================================================

    if (activePage === "users") {
      return (
        <section className="dashboard-section">
          <UserManagement />
        </section>
      );
    }

    // =======================================================
    // PRODUCTS
    // =======================================================

    if (activePage === "products") {
      return (
        <section className="dashboard-section">
          <AdminProductManagement />
        </section>
      );
    }

    // =======================================================
    // ORDERS
    // =======================================================

    if (activePage === "orders") {
      return (
        <section className="dashboard-section">
          <AdminOrderManagement />
        </section>
      );
    }

    // =======================================================
    // REPORTS
    // =======================================================

    if (activePage === "reports") {
      return renderReports();
    }

    // =======================================================
    // SETTINGS
    // =======================================================

    if (activePage === "settings") {
      return (
        <section className="dashboard-section">
          <div className="coming-soon">
            <h2>⚙️ Settings</h2>

            <p>
              Admin settings will be added later.
            </p>
          </div>
        </section>
      );
    }

    return null;
  };

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="admin-dashboard">
      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <aside className="sidebar">
        <div className="sidebar-logo">
          🛒

          <span>ShopStack</span>
        </div>

        <nav className="sidebar-nav">
          {/* Dashboard */}

          <button
            className={
              activePage === "dashboard"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActivePage("dashboard")
            }
          >
            📊

            <span>Dashboard</span>
          </button>

          {/* Vendors */}

          <button
            className={
              activePage === "vendors"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActivePage("vendors")
            }
          >
            🏪

            <span>Vendors</span>
          </button>

          {/* Users */}

          <button
            className={
              activePage === "users"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActivePage("users")
            }
          >
            👥

            <span>Users</span>
          </button>

          {/* Products */}

          <button
            className={
              activePage === "products"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActivePage("products")
            }
          >
            📦

            <span>Products</span>
          </button>

          {/* Orders */}

          <button
            className={
              activePage === "orders"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActivePage("orders")
            }
          >
            🛍️

            <span>Orders</span>
          </button>

          {/* Reports */}

          <button
            className={
              activePage === "reports"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActivePage("reports")
            }
          >
            📈

            <span>Reports</span>
          </button>

          {/* Settings */}

          <button
            className={
              activePage === "settings"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActivePage("settings")
            }
          >
            ⚙️

            <span>Settings</span>
          </button>
        </nav>

        {/* Logout */}

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          🚪

          <span>Logout</span>
        </button>
      </aside>

      {/* =====================================================
          MAIN CONTENT
          ===================================================== */}

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>
              {activePage === "dashboard"
                ? "Admin Dashboard"
                : activePage === "vendors"
                ? "Vendor Management"
                : activePage === "users"
                ? "User Management"
                : activePage === "products"
                ? "Product Management"
                : activePage === "orders"
                ? "Order Management"
                : activePage === "reports"
                ? "Reports & Analytics"
                : "Settings"}
            </h1>

            <p>
              Welcome back, Administrator 👋
            </p>
          </div>

          {/* Admin Profile */}

          <div className="admin-profile">
            <div className="profile-avatar">
              A
            </div>

            <div>
              <strong>Administrator</strong>

              <small>Admin</small>
            </div>
          </div>
        </header>

        {/* Page Content */}

        {renderContent()}
      </main>
    </div>
  );
}

export default AdminDashboard;