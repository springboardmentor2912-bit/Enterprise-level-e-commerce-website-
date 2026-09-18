import { useEffect, useState } from "react";
import api from "../services/api";

import "./AdminOrderManagement.css";

function AdminOrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [refundLoading, setRefundLoading] = useState(null);

  // =========================================================
  // GET TOKEN
  // =========================================================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // =========================================================
  // ERROR MESSAGE
  // =========================================================

  const getErrorMessage = (err, defaultMessage) => {
    if (!err?.response) {
      return "Unable to connect to the server. Please check that the backend is running.";
    }

    if (err.response.status === 401) {
      return "Your session has expired. Please login again.";
    }

    if (err.response.status === 403) {
      return "Access denied. Please login as Administrator.";
    }

    if (err.response.status === 404) {
      return "The requested order or operation was not found.";
    }

    if (err.response.status >= 500) {
      return "Server error. Please try again.";
    }

    return (
      err.response?.data?.message ||
      err.response?.data?.error ||
      defaultMessage
    );
  };

  // =========================================================
  // FETCH ORDERS
  // =========================================================

  const fetchOrders = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = getToken();

      if (!token) {
        setError("Please login as Administrator.");
        return;
      }

      const response = await api.get("/admin/orders");

      if (Array.isArray(response.data)) {
        setOrders(response.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Admin orders loading error:", err);

      setError(
        getErrorMessage(
          err,
          "Unable to load orders."
        )
      );
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    const loadInitialOrders = async () => {
      try {
        const token = getToken();

        if (!token) {
          if (!cancelled) {
            setError("Please login as Administrator.");
            setLoading(false);
          }

          return;
        }

        const response = await api.get("/admin/orders");

        if (!cancelled) {
          if (Array.isArray(response.data)) {
            setOrders(response.data);
          } else {
            setOrders([]);
          }

          setError("");
        }
      } catch (err) {
        console.error(
          "Initial admin orders loading error:",
          err
        );

        if (!cancelled) {
          setError(
            getErrorMessage(
              err,
              "Unable to load orders."
            )
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    const timer = setTimeout(() => {
      loadInitialOrders();
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  // =========================================================
  // UPDATE ORDER STATUS
  // =========================================================

  const updateOrderStatus = async (orderId, status) => {
    try {
      setUpdatingOrder(orderId);
      setError("");
      setSuccess("");

      const token = getToken();

      if (!token) {
        setError("Please login as Administrator.");
        return;
      }

      await api.put(
        `/admin/orders/${orderId}/status`,
        {
          status: status,
        }
      );

      await fetchOrders();

      setSuccess(
        `Order #${orderId} status updated to ${status}.`
      );
    } catch (err) {
      console.error(
        "Order status update error:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Unable to update order status."
        )
      );
    } finally {
      setUpdatingOrder(null);
    }
  };

  // =========================================================
  // APPROVE RETURN
  // =========================================================

  const approveReturn = async (orderId) => {
    try {
      setRefundLoading(orderId);
      setError("");
      setSuccess("");

      const token = getToken();

      if (!token) {
        setError("Please login as Administrator.");
        return;
      }

      await api.put(
        `/admin/orders/${orderId}/return/approve`,
        {}
      );

      await fetchOrders();

      setSuccess(
        `Return request for Order #${orderId} approved successfully.`
      );
    } catch (err) {
      console.error(
        "Approve return error:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Unable to approve return."
        )
      );
    } finally {
      setRefundLoading(null);
    }
  };

  // =========================================================
  // REJECT RETURN
  // =========================================================

  const rejectReturn = async (orderId) => {
    try {
      setRefundLoading(orderId);
      setError("");
      setSuccess("");

      const token = getToken();

      if (!token) {
        setError("Please login as Administrator.");
        return;
      }

      await api.put(
        `/admin/orders/${orderId}/return/reject`,
        {}
      );

      await fetchOrders();

      setSuccess(
        `Return request for Order #${orderId} rejected.`
      );
    } catch (err) {
      console.error(
        "Reject return error:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Unable to reject return."
        )
      );
    } finally {
      setRefundLoading(null);
    }
  };

  // =========================================================
  // PROCESS REFUND
  // =========================================================

  const processRefund = async (orderId) => {
    try {
      setRefundLoading(orderId);
      setError("");
      setSuccess("");

      const token = getToken();

      if (!token) {
        setError("Please login as Administrator.");
        return;
      }

      await api.put(
        `/admin/orders/${orderId}/refund`,
        {}
      );

      await fetchOrders();

      setSuccess(
        `Refund for Order #${orderId} processed successfully.`
      );
    } catch (err) {
      console.error(
        "Process refund error:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Unable to process refund."
        )
      );
    } finally {
      setRefundLoading(null);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="admin-orders">
        <div className="admin-orders-header">
          <div>
            <h2>🛍️ Order Management</h2>

            <p>
              View and manage all customer orders.
            </p>
          </div>
        </div>

        <p>Loading orders...</p>
      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="admin-orders">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="admin-orders-header">
        <div>
          <h2>🛍️ Order Management</h2>

          <p>
            View and manage all customer orders.
          </p>
        </div>

        <button
          onClick={() => fetchOrders(true)}
          disabled={refreshing}
        >
          {refreshing
            ? "↻ Refreshing..."
            : "↻ Refresh"}
        </button>
      </div>

      {/* =====================================================
          SUCCESS MESSAGE
      ===================================================== */}

      {success && (
        <div className="admin-success-message">
          ✅ {success}
        </div>
      )}

      {/* =====================================================
          ERROR MESSAGE
      ===================================================== */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* =====================================================
          ORDERS HEADER
      ===================================================== */}

      <div className="admin-orders-list-header">
        <div>
          <h3>Orders</h3>

          <span>
            {orders.length} total orders
          </span>
        </div>
      </div>

      {/* =====================================================
          NO ORDERS
      ===================================================== */}

      {orders.length === 0 ? (
        <div className="no-orders">
          <div>🛍️</div>

          <h3>No Orders Found</h3>

          <p>
            There are currently no customer orders.
          </p>
        </div>
      ) : (
        <div className="admin-orders-container">

          {orders.map((order) => (
            <div
              className="admin-order-card"
              key={order.id}
            >

              {/* =================================================
                  ORDER HEADER
              ================================================= */}

              <div className="admin-order-header">
                <div>
                  <h3>
                    Order #{order.id}
                  </h3>

                  <p>
                    Customer:{" "}
                    {order.customerEmail}
                  </p>

                  <p>
                    Date:{" "}
                    {order.orderDate
                      ? new Date(
                          order.orderDate
                        ).toLocaleString()
                      : "N/A"}
                  </p>
                </div>

                {/* STATUS */}

                <div className="admin-order-status">
                  <strong>
                    {order.status || "UNKNOWN"}
                  </strong>
                </div>
              </div>

              {/* =================================================
                  PRODUCTS
              ================================================= */}

              <div className="admin-order-items">
                <h4>Products</h4>

                {order.items &&
                order.items.length > 0 ? (
                  order.items.map((item) => (
                    <div
                      className="admin-order-item"
                      key={item.id}
                    >
                      <div>
                        <strong>
                          {item.productName ||
                            "Product"}
                        </strong>

                        <p>
                          Quantity:{" "}
                          {item.quantity}
                        </p>

                        <p>
                          Price: ₹
                          {item.price}
                        </p>

                        <p>
                          Vendor:{" "}
                          {item.vendorEmail ||
                            "N/A"}
                        </p>
                      </div>

                      <div>
                        <strong>
                          ₹{item.subtotal}
                        </strong>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="admin-order-item">
                    <div>
                      <strong>
                        No product details
                        available
                      </strong>
                    </div>
                  </div>
                )}
              </div>

              {/* =================================================
                  ORDER FOOTER
              ================================================= */}

              <div className="admin-order-footer">

                {/* TOTAL */}

                <div>
                  <strong>
                    Total Amount:
                  </strong>

                  <span>
                    ₹{order.totalAmount}
                  </span>
                </div>

                {/* STATUS UPDATE */}

                <div className="admin-order-actions">
                  <label>
                    Update Status:
                  </label>

                  <select
                    value={order.status || ""}
                    disabled={
                      updatingOrder ===
                        order.id ||
                      refreshing
                    }
                    onChange={(event) =>
                      updateOrderStatus(
                        order.id,
                        event.target.value
                      )
                    }
                  >
                    <option value="PENDING">
                      PENDING
                    </option>

                    <option value="CONFIRMED">
                      CONFIRMED
                    </option>

                    <option value="SHIPPED">
                      SHIPPED
                    </option>

                    <option value="DELIVERED">
                      DELIVERED
                    </option>

                    <option value="CANCELLED">
                      CANCELLED
                    </option>
                  </select>

                  {updatingOrder ===
                    order.id && (
                    <span>
                      Updating...
                    </span>
                  )}
                </div>
              </div>

              {/* =================================================
                  RETURN & REFUND
              ================================================= */}

              <div className="admin-return-section">
                <h4>
                  🔄 Return & Refund
                </h4>

                {/* =================================================
                    NO RETURN
                ================================================= */}

                {(!order.returnStatus ||
                  order.returnStatus ===
                    "NONE") && (
                  <div className="admin-return-empty">
                    <p>
                      <strong>
                        Return Status:
                      </strong>{" "}
                      No return requested
                    </p>

                    <p>
                      This order currently has
                      no active return request.
                    </p>
                  </div>
                )}

                {/* =================================================
                    RETURN REQUESTED
                ================================================= */}

                {order.returnStatus ===
                  "RETURN_REQUESTED" && (
                  <div>
                    <p>
                      <strong>
                        Return Status:
                      </strong>{" "}
                      RETURN REQUESTED
                    </p>

                    {order.returnReason && (
                      <p>
                        <strong>
                          Return Reason:
                        </strong>{" "}
                        {order.returnReason}
                      </p>
                    )}

                    {order.returnRequestedDate && (
                      <p>
                        <strong>
                          Requested:
                        </strong>{" "}
                        {new Date(
                          order.returnRequestedDate
                        ).toLocaleString()}
                      </p>
                    )}

                    <div className="admin-refund-actions">
                      <p>
                        Customer has requested a
                        return. Please review the
                        request.
                      </p>

                      <button
                        onClick={() =>
                          approveReturn(
                            order.id
                          )
                        }
                        disabled={
                          refundLoading ===
                            order.id ||
                          updatingOrder ===
                            order.id
                        }
                      >
                        {refundLoading ===
                        order.id
                          ? "Processing..."
                          : "✅ Approve Return"}
                      </button>

                      <button
                        onClick={() =>
                          rejectReturn(
                            order.id
                          )
                        }
                        disabled={
                          refundLoading ===
                            order.id ||
                          updatingOrder ===
                            order.id
                        }
                      >
                        {refundLoading ===
                        order.id
                          ? "Processing..."
                          : "❌ Reject Return"}
                      </button>
                    </div>
                  </div>
                )}

                {/* =================================================
                    RETURN APPROVED
                ================================================= */}

                {order.returnStatus ===
                  "RETURN_APPROVED" && (
                  <div>
                    <p>
                      <strong>
                        Return Status:
                      </strong>{" "}
                      RETURN APPROVED
                    </p>

                    {order.returnReason && (
                      <p>
                        <strong>
                          Return Reason:
                        </strong>{" "}
                        {order.returnReason}
                      </p>
                    )}

                    {order.refundAmount !=
                      null && (
                      <p>
                        <strong>
                          Refund Amount:
                        </strong>{" "}
                        ₹{order.refundAmount}
                      </p>
                    )}

                    <div className="admin-refund-actions">
                      <p>
                        ✅ Return approved.
                        Refund is ready to
                        process.
                      </p>

                      <button
                        onClick={() =>
                          processRefund(
                            order.id
                          )
                        }
                        disabled={
                          refundLoading ===
                            order.id ||
                          updatingOrder ===
                            order.id
                        }
                      >
                        {refundLoading ===
                        order.id
                          ? "Processing..."
                          : "💰 Process Refund"}
                      </button>
                    </div>
                  </div>
                )}

                {/* =================================================
                    REFUNDED
                ================================================= */}

                {order.returnStatus ===
                  "REFUNDED" && (
                  <div className="admin-refund-completed">
                    <p>
                      <strong>
                        Return Status:
                      </strong>{" "}
                      REFUNDED
                    </p>

                    <p>
                      ✅ Refund completed
                      successfully.
                    </p>

                    {order.refundAmount !=
                      null && (
                      <p>
                        <strong>
                          Refund Amount:
                        </strong>{" "}
                        ₹{order.refundAmount}
                      </p>
                    )}

                    {order.refundTransactionId && (
                      <p>
                        <strong>
                          Transaction ID:
                        </strong>{" "}
                        {
                          order.refundTransactionId
                        }
                      </p>
                    )}

                    {order.refundDate && (
                      <p>
                        <strong>
                          Refund Date:
                        </strong>{" "}
                        {new Date(
                          order.refundDate
                        ).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                {/* =================================================
                    RETURN REJECTED
                ================================================= */}

                {order.returnStatus ===
                  "RETURN_REJECTED" && (
                  <div className="admin-refund-rejected">
                    <p>
                      <strong>
                        Return Status:
                      </strong>{" "}
                      RETURN REJECTED
                    </p>

                    {order.returnReason && (
                      <p>
                        <strong>
                          Return Reason:
                        </strong>{" "}
                        {order.returnReason}
                      </p>
                    )}

                    <p>
                      ❌ Return request rejected.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminOrderManagement;