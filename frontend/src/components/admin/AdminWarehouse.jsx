import { useEffect, useMemo, useState } from "react";
import { FaBoxOpen, FaCheckCircle, FaClipboardCheck, FaExclamationTriangle, FaMapMarkerAlt, FaShippingFast, FaTimes, FaWarehouse, FaUndoAlt } from "react-icons/fa";
import AdminSidebar from "./AdminSidebar";
import "./Admin.css";

const API = "https://shopstack-backend-gjv6.onrender.com/api/admin";
const defaultWarehouses = ["Bengaluru Central", "Mumbai West", "Delhi North"];
const steps = [["ORDER_CONFIRMED", "Order confirmed"], ["AVAILABILITY_CHECK", "Check availability"], ["WAREHOUSE_SELECTED", "Select warehouse"], ["STOCK_ALLOCATED", "Allocate stock"], ["PICKING", "Pick product"], ["PACKED", "Pack product"], ["SHIPMENT_PREPARED", "Prepare shipment"], ["READY_FOR_SHIPMENT", "Ready for shipment"], ["SHIPPED", "Shipped"], ["OUT_FOR_DELIVERY", "Out for delivery"], ["DELIVERED", "Delivered"]];
const formatStatus = (value) => String(value || "ORDER_CONFIRMED").replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
const normalizeWarehouseStatus = (value) => value === "STOCK_MOVEMENT_TRACKED" ? "PACKED" : (value || "ORDER_CONFIRMED");
const currency = (value) => `Rs ${Number(value || 0).toLocaleString("en-IN")}`;
function broadcastOrderStatus(order, status) { const cached = JSON.parse(localStorage.getItem("shopstack-order-statuses") || "{}"); cached[order.orderReference || order.id] = status; localStorage.setItem("shopstack-order-statuses", JSON.stringify(cached)); window.dispatchEvent(new Event("orderStatusUpdated")); }

export default function AdminWarehouse() {
  const isStaff = (sessionStorage.getItem("role") || "").toUpperCase().replace(/^ROLE_/, "") === "STAFF";

  useEffect(() => {
    document.body.classList.toggle("warehouse-admin-view", !isStaff);
    document.body.classList.toggle("warehouse-staff-view", isStaff);
    return () => {
      document.body.classList.remove("warehouse-admin-view", "warehouse-staff-view");
    };
  }, [isStaff]);

  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [warehouseList, setWarehouseList] = useState([]);
  const [warehouseStock, setWarehouseStock] = useState([]);
  const [productRequests, setProductRequests] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ACTIVE");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedDeliveredOrderId, setSelectedDeliveredOrderId] = useState(null);
  const [selectedAllocationOrderId, setSelectedAllocationOrderId] = useState(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
  const [allocationQuantities, setAllocationQuantities] = useState({});
  const [productAllocations, setProductAllocations] = useState({});
  const [selectedProductRequestId, setSelectedProductRequestId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    function openAllocationDetails(event) {
      const row = event.target.closest?.(".warehouse-admin-order-allocation tbody tr");
      if (!row || event.target.closest("button, select, input")) return;
      const rows = Array.from(row.parentElement.querySelectorAll("tr"));
      const recentOrders = orders
        .filter((order) => ["ORDER_CONFIRMED", "AVAILABILITY_CHECK", "WAREHOUSE_SELECTED", "STOCK_ALLOCATED"].includes(normalizeWarehouseStatus(order.warehouseStatus)))
        .sort((a, b) => new Date(b.placedAt || 0) - new Date(a.placedAt || 0) || Number(b.id) - Number(a.id))
        .slice(0, 5);
      const order = recentOrders[rows.indexOf(row)];
      if (order) setSelectedAllocationOrderId(order.id);
    }
    document.addEventListener("click", openAllocationDetails);
    return () => document.removeEventListener("click", openAllocationDetails);
  }, [orders]);

  useEffect(() => {
    function closeDeliveredModal(event) {
      if (event.target.closest?.(".delivered-modal-close") || event.target.classList.contains("delivered-modal-backdrop")) {
        setSelectedOrderId(null);
      }
    }
    document.addEventListener("click", closeDeliveredModal, true);
    return () => document.removeEventListener("click", closeDeliveredModal, true);
  }, []);

  useEffect(() => {
    if (!isStaff) return;
    const timeline = document.querySelector(".warehouse-staff-view .warehouse-modal-timeline");
    if (!timeline) return;
    const visibleSteps = Array.from(timeline.querySelectorAll(".warehouse-timeline-step")).slice(4);
    visibleSteps.forEach((step, index) => {
      const dot = step.querySelector(".warehouse-timeline-dot");
      if (dot) dot.textContent = String(index + 1);
    });
    const currentIndex = visibleSteps.findIndex((step) => step.classList.contains("current"));
    const counter = document.querySelector(".warehouse-staff-view .warehouse-detail-heading b");
    if (counter) counter.textContent = `${Math.max(1, currentIndex + 1)} of ${visibleSteps.length}`;
  }, [isStaff, selectedOrderId, orders]);

  function load() {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    const headers = { headers: { Authorization: `Bearer ${token}` } };
    return Promise.all([
      fetch(`${API}/warehouse/orders`, headers).then((res) => res.json()),
      fetch(`${API}/inventory`, headers).then((res) => res.json()),
      fetch(`${API}/warehouses`, headers).then((res) => res.json()),
      fetch(`${API}/warehouse/stock`, headers).then((res) => res.json()),
      fetch(`${API}/product-requests`, headers).then((res) => res.json()),
      fetch(`${API}/refunds`, headers).then((res) => res.json()),
    ]).then(([warehouseOrders, products, warehouseRecords, stockRecords, requests, returns]) => {
      setOrders(Array.isArray(warehouseOrders) ? warehouseOrders : []);
      setInventory(Array.isArray(products) ? products : []);
      setWarehouseList(Array.isArray(warehouseRecords) ? warehouseRecords : []);
      setWarehouseStock(Array.isArray(stockRecords) ? stockRecords : []);
      setProductRequests(Array.isArray(requests) ? requests : []);
      setReturnRequests(Array.isArray(returns) ? returns : []);
    });
  }

  useEffect(() => {
    const refresh = () => load().catch((requestError) => setError(requestError.message || "Unable to load warehouse operations.")).finally(() => setLoading(false));
    refresh();
    const refreshTimer = setInterval(refresh, 10000);
    return () => clearInterval(refreshTimer);
  }, []);

  useEffect(() => {
    const requestPanel = Array.from(document.querySelectorAll("section.warehouse-inventory-panel"))
      .find((panel) => panel.querySelector("h2")?.textContent === "Vendor product requests");
    requestPanel?.classList.add("vendor-product-requests-panel");
    if (requestPanel) requestPanel.id = "product-requests";
    if (requestPanel && window.location.hash === "#product-requests") {
      window.setTimeout(() => requestPanel.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
    }
    return () => requestPanel?.classList.remove("vendor-product-requests-panel");
  }, [productRequests]);

  useEffect(() => {
    function openRequest(event) {
      const section = event.target.closest(".warehouse-inventory-panel");
      const heading = section?.querySelector("h2")?.textContent;
      const row = event.target.closest("tbody tr");
      if (heading === "Vendor product requests" && row) {
        const requestIndex = Array.from(section.querySelectorAll("tbody tr")).indexOf(row);
        const request = productRequests[requestIndex];
        if (request) setSelectedProductRequestId(request.id);
      }
    }
    document.addEventListener("click", openRequest);
    return () => document.removeEventListener("click", openRequest);
  }, [productRequests]);

  const stockByProduct = useMemo(() => new Map(inventory.map((item) => [item.id, item])), [inventory]);
  const selectedOrder = orders.find((order) => order.id === selectedOrderId) || null;
  const selectedDeliveredOrder = orders.find((order) => order.id === selectedDeliveredOrderId) || null;
  const selectedAllocationOrder = orders.find((order) => order.id === selectedAllocationOrderId) || null;
  const selectedProduct = selectedOrder ? stockByProduct.get(selectedOrder.productId) : null;
  const selectedWarehouse = warehouseList.find((warehouse) => warehouse.id === selectedWarehouseId) || null;
  const warehouseOverview = useMemo(() => warehouseList.map((warehouse) => {
    const stock = warehouseStock.filter((item) => item.warehouseId === warehouse.id);
    const assignedOrders = orders.filter((order) => order.warehouseName === warehouse.name && !["DELIVERED", "REFUNDED", "CANCELLED"].includes(order.orderStatus));
    return {
      warehouse,
      stock,
      assignedOrders,
      totalUnits: stock.reduce((sum, item) => sum + Number(item.availableQuantity || 0), 0),
      lowStock: stock.filter((item) => Number(item.availableQuantity || 0) <= 5).length,
    };
  }), [warehouseList, warehouseStock, orders]);
  const selectedWarehouseOverview = selectedWarehouse ? warehouseOverview.find((item) => item.warehouse.id === selectedWarehouse.id) : null;
  const metrics = useMemo(() => ({
    active: orders.filter((order) => !["DELIVERED", "REFUNDED", "CANCELLED"].includes(order.orderStatus)).length,
    ready: orders.filter((order) => order.warehouseStatus === "READY_FOR_SHIPMENT" && order.orderStatus === "PROCESSING").length,
    units: orders.filter((order) => !["DELIVERED", "REFUNDED", "CANCELLED"].includes(order.orderStatus)).reduce((sum, order) => sum + Number(order.quantity || 0), 0),
    low: inventory.filter((item) => {
      const locations = warehouseStock.filter((stock) => stock.productId === item.id);
      return locations.length ? locations.some((stock) => Number(stock.availableQuantity) <= 5) : Number(item.stock) <= 5;
    }).length,
  }), [orders, inventory, warehouseStock]);
  const visibleOrders = useMemo(() => orders.filter((order) => {
    const status = normalizeWarehouseStatus(order.warehouseStatus);
    if (isStaff && (status === "DELIVERED" || !["STOCK_ALLOCATED", "PICKING", "PACKED", "SHIPMENT_PREPARED", "READY_FOR_SHIPMENT"].includes(status))) return false;
    const product = stockByProduct.get(order.productId);
    const matchesFilter = filter === "ALL" || (filter === "ACTIVE" ? !["DELIVERED", "REFUNDED", "CANCELLED"].includes(order.orderStatus) : status === filter);
    const searchText = `${order.id} ${order.orderReference || ""} ${order.productName || ""} ${order.customerName || ""}`.toLowerCase();
    return matchesFilter && searchText.includes(query.toLowerCase()) && product;
  }), [orders, filter, query, stockByProduct]);

  async function updateWarehouse(order, status, warehouseName = order.warehouseName, allocatedQuantity = allocationQuantities[order.id] ?? order.quantity) {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    setSavingId(order.id); setError("");
    try {
      const request = { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ status, warehouseName, allocatedQuantity: Number(allocatedQuantity) }) };
      let response = await fetch(`${API}/warehouse/orders/${order.id}`, request);
      let body = await response.json().catch(() => ({}));
      // Older backend processes still require the removed movement step. Complete it internally, then persist Prepare shipment.
      if (!response.ok && status === "SHIPMENT_PREPARED" && body.message === "Complete the warehouse steps in order.") {
        const legacyRequest = { ...request, body: JSON.stringify({ status: "STOCK_MOVEMENT_TRACKED", warehouseName, allocatedQuantity: Number(allocatedQuantity) }) };
        const legacyResponse = await fetch(`${API}/warehouse/orders/${order.id}`, legacyRequest);
        if (legacyResponse.ok) {
          response = await fetch(`${API}/warehouse/orders/${order.id}`, request);
          body = await response.json().catch(() => ({}));
        }
      }
      if (!response.ok) throw new Error(body.message || "Unable to update fulfillment step.");
      setOrders((items) => items.map((item) => item.id === order.id ? body : item));
    } catch (requestError) { setError(requestError.message); window.alert(requestError.message); } finally { setSavingId(null); }
  }

  async function markShipped(order) {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    setSavingId(order.id); setError("");
    try {
      const response = await fetch(`${API}/warehouse/orders/${order.id}/handoff`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ status: "SHIPPED" }) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || `Unable to mark shipped (${response.status}). Restart the backend if this endpoint is unavailable.`);
      broadcastOrderStatus(order, "SHIPPED");
      setOrders((items) => items.map((item) => item.id === order.id ? { ...item, ...body, orderStatus: "SHIPPED" } : item));
    } catch (requestError) { setError(requestError.message); } finally { setSavingId(null); }
  }

  async function updateDeliveryStatus(order, status) {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    setSavingId(order.id); setError("");
    try {
      const response = await fetch(`${API}/warehouse/orders/${order.id}/delivery-status`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ status }) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || "Unable to update delivery status.");
      broadcastOrderStatus(order, status);
      setOrders((items) => items.map((item) => item.id === order.id ? { ...item, ...body, orderStatus: status } : item));
    } catch (requestError) { setError(requestError.message); } finally { setSavingId(null); }
  }

  async function allocateProduct(item) {
    const allocations = productAllocations[item.id] || {};
    if (Object.values(allocations).every((quantity) => !Number(quantity))) return;
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    setSavingId(`product-${item.id}`); setError("");
    try {
      const response = await fetch(`${API}/inventory/${item.id}/warehouse`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ allocations: Object.fromEntries(Object.entries(allocations).map(([warehouseId, quantity]) => [warehouseId, Number(quantity || 0)])) }) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || "Unable to allocate product.");
      setProductRequests((items) => items.filter((request) => request.id !== item.id));
      await load();
      return true;
    } catch (requestError) { setError(requestError.message); return false; } finally { setSavingId(null); }
  }

  function warehouseChoices(order) { const active = warehouseList.filter((warehouse) => warehouse.active); const choices = active.length ? active : defaultWarehouses.map((name) => ({ name })); return choices.filter((warehouse) => warehouseStock.length === 0 || warehouseStock.some((stock) => stock.productId === order.productId && stock.warehouseName === warehouse.name && stock.availableQuantity >= order.quantity)); }
  function currentProductStock(order) {
    const warehouseTotal = warehouseStock
      .filter((stock) => stock.productId === order.productId)
      .reduce((sum, stock) => sum + Number(stock.availableQuantity || 0), 0);
    return warehouseStock.length ? warehouseTotal : Number(stockByProduct.get(order.productId)?.stock || 0);
  }
  function deliveryStep(order) { if (order.warehouseStatus !== "READY_FOR_SHIPMENT") return null; if (order.orderStatus === "PROCESSING") return ["SHIPPED", "Mark shipped"]; if (order.orderStatus === "SHIPPED") return ["OUT_FOR_DELIVERY", "Mark out for delivery"]; if (order.orderStatus === "OUT_FOR_DELIVERY") return ["DELIVERED", "Mark delivered"]; return null; }
  function workflowStatus(order) { return order.warehouseStatus === "READY_FOR_SHIPMENT" && ["SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(order.orderStatus) ? order.orderStatus : normalizeWarehouseStatus(order.warehouseStatus); }
  function deliveryJourney(order) { const current = order.orderStatus === "PROCESSING" ? "SHIPPED" : order.orderStatus; return ["SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].map((status, index) => <span className={status === current ? "current" : ""} key={status}>{status === "OUT_FOR_DELIVERY" ? "Out for delivery" : status === "SHIPPED" ? "Shipped" : "Delivered"}{index < 2 && <i />}</span>); }
  function nextStep(order) { if (["DELIVERED", "REFUNDED", "CANCELLED"].includes(order.orderStatus)) return ["ORDER_CLOSED", "Order closed"]; const delivery = deliveryStep(order); if (delivery) return delivery; const index = Math.max(0, steps.findIndex(([key]) => key === normalizeWarehouseStatus(order.warehouseStatus))); return steps[index + 1] || null; }
  function nextAction(order, inModal = false) {
    const status = normalizeWarehouseStatus(order.warehouseStatus);

    if (["DELIVERED", "REFUNDED", "CANCELLED"].includes(order.orderStatus)) {
      return (
        <span className="warehouse-complete">
          <FaCheckCircle /> Order closed
        </span>
      );
    }

    if (!isStaff) {
      if (status === "ORDER_CONFIRMED") {
        return (
          <button
            className={`warehouse-next-btn ${inModal ? "warehouse-modal-next" : ""}`}
            type="button"
            onClick={() => updateWarehouse(order, "AVAILABILITY_CHECK")}
            disabled={savingId === order.id}
          >
            {savingId === order.id ? "Checking..." : "Check availability"}
          </button>
        );
      }

      if (status === "AVAILABILITY_CHECK") {
        const choices = warehouseChoices(order);

        if (!choices.length) {
          return (
            <span className="warehouse-row-hint">
              No warehouse has enough stock
            </span>
          );
        }

        return (
          <select
            value={order.warehouseName || ""}
            onChange={(event) => {
              event.stopPropagation();
              if (event.target.value) {
                updateWarehouse(
                  order,
                  "WAREHOUSE_SELECTED",
                  event.target.value
                );
              }
            }}
            onClick={(event) => event.stopPropagation()}
            disabled={savingId === order.id}
          >
            <option value="">Select warehouse</option>
            {choices.map((warehouse) => (
              <option
                key={warehouse.id || warehouse.name}
                value={warehouse.name}
              >
                {warehouse.name}
              </option>
            ))}
          </select>
        );
      }

      if (status === "WAREHOUSE_SELECTED") {
        const maxQuantity = Number(order.quantity || 0);
        const quantity =
          allocationQuantities[order.id] ?? maxQuantity;

        return (
          <div className="warehouse-action-stack">
            <input
              type="number"
              min="1"
              max={maxQuantity}
              value={quantity}
              onChange={(event) =>
                setAllocationQuantities((items) => ({
                  ...items,
                  [order.id]: event.target.value,
                }))
              }
              onClick={(event) => event.stopPropagation()}
              disabled={savingId === order.id}
            />

            <button
              className={`warehouse-next-btn ${inModal ? "warehouse-modal-next" : ""}`}
              type="button"
              onClick={() => {
                const allocatedQuantity = Number(
                  allocationQuantities[order.id] ?? order.quantity
                );

                if (
                  allocatedQuantity < 1 ||
                  allocatedQuantity > maxQuantity
                ) {
                  window.alert(
                    `Allocated quantity must be between 1 and ${maxQuantity}.`
                  );
                  return;
                }

                updateWarehouse(
                  order,
                  "STOCK_ALLOCATED",
                  order.warehouseName,
                  allocatedQuantity
                );
              }}
              disabled={savingId === order.id}
            >
              {savingId === order.id ? "Allocating..." : "Allocate stock"}
            </button>
          </div>
        );
      }
    }

    if (isStaff) {
      const staffActions = {
        STOCK_ALLOCATED: ["PICKING", "Pick product"],
        PICKING: ["PACKED", "Pack product"],
        PACKED: ["SHIPMENT_PREPARED", "Prepare shipment"],
        SHIPMENT_PREPARED: ["READY_FOR_SHIPMENT", "Ready for shipment"],
      };

      const action = staffActions[status];

      if (action) {
        return (
          <button
            className={`warehouse-next-btn ${inModal ? "warehouse-modal-next" : ""}`}
            type="button"
            onClick={() => updateWarehouse(order, action[0])}
            disabled={savingId === order.id}
          >
            {savingId === order.id ? "Saving..." : action[1]}
          </button>
        );
      }
    }

    if (
      status === "READY_FOR_SHIPMENT" &&
      order.orderStatus === "PROCESSING"
    ) {
      return (
        <button
          className={`warehouse-ship-btn ${inModal ? "warehouse-modal-next" : ""}`}
          type="button"
          onClick={() => markShipped(order)}
          disabled={savingId === order.id}
        >
          {savingId === order.id ? "Saving..." : "Mark shipped"}
        </button>
      );
    }

    const delivery = deliveryStep(order);

    if (delivery) {
      return (
        <>
          <button
            className={`warehouse-next-btn ${inModal ? "warehouse-modal-next" : ""}`}
            type="button"
            onClick={() => updateDeliveryStatus(order, delivery[0])}
            disabled={savingId === order.id}
          >
            {savingId === order.id ? "Saving..." : delivery[1]}
          </button>

          {inModal && (
            <div className="warehouse-delivery-preview is-live">
              <span>DELIVERY JOURNEY</span>
              <strong>
                Current status:{" "}
                {order.orderStatus === "SHIPPED"
                  ? "Shipped"
                  : "Out for delivery"}
              </strong>
              <p className="warehouse-delivery-active">
                {deliveryJourney(order)}
              </p>
            </div>
          )}
        </>
      );
    }

    if (
      !isStaff &&
      [
        "STOCK_ALLOCATED",
        "PICKING",
        "PACKED",
        "SHIPMENT_PREPARED",
        "READY_FOR_SHIPMENT",
      ].includes(status)
    ) {
      return (
        <span className="warehouse-complete warehouse-staff-assigned">
          <FaCheckCircle />
          {status === "STOCK_ALLOCATED"
            ? "Assigned"
            : "Warehouse staff processing"}
        </span>
      );
    }

    const next = nextStep(order);

    if (!next) {
      return (
        <span className="warehouse-complete">
          <FaCheckCircle /> With carrier
        </span>
      );
    }

    return (
      <span className="warehouse-row-hint">
        {next[1]}
      </span>
    );
  }

  function renderAdminOrderAllocation() {
    if (isStaff) return null;
    const recentOrders = orders
      .filter((order) => ["ORDER_CONFIRMED", "AVAILABILITY_CHECK", "WAREHOUSE_SELECTED", "STOCK_ALLOCATED"].includes(normalizeWarehouseStatus(order.warehouseStatus)))
      .sort((a, b) => new Date(b.placedAt || 0) - new Date(a.placedAt || 0) || Number(b.id) - Number(a.id))
      .slice(0, 5);
    return <section className="warehouse-panel warehouse-admin-order-allocation"><div className="warehouse-toolbar"><div><h2>Recent order warehouse allocation</h2><span>Latest {recentOrders.length} order{recentOrders.length === 1 ? "" : "s"} · click a product to view its allocation</span></div></div>{recentOrders.length === 0 ? <div className="orders-empty"><strong>No recent orders waiting for allocation</strong><span>New purchases will appear here.</span></div> : <div className="warehouse-table-wrap"><table className="admin-table orders-table"><thead><tr><th>Order</th><th>Product</th><th>Customer</th><th>Purchased</th><th>Allocated warehouse</th><th>Warehouse action</th></tr></thead><tbody>{recentOrders.map((order) => <tr key={`admin-allocation-${order.id}`}><td><strong>#{String(order.id).padStart(5, "0")}</strong><small>{order.orderReference || "No reference"}</small></td><td><button type="button" className="warehouse-product-link" onClick={() => setSelectedAllocationOrderId(order.id)}><strong>{order.productName || "Product"}</strong><small>Qty {order.quantity || 0}</small></button></td><td><strong>{order.customerName || "Guest customer"}</strong><small>{order.customerEmail || ""}</small></td><td>{order.placedAt ? new Date(order.placedAt).toLocaleString("en-IN") : "Date unavailable"}</td><td><strong className={order.warehouseName ? "warehouse-assigned" : "warehouse-unassigned"}>{order.warehouseName || "Not assigned"}</strong></td><td onClick={(event) => event.stopPropagation()}>{nextAction(order)}</td></tr>)}</tbody></table></div>}</section>;
  }

  function renderDeliveredOrders() {
    if (!isStaff) return null;
    const deliveredOrders = orders.filter((order) => order.orderStatus === "DELIVERED");
    return <section className="warehouse-panel delivered-orders-panel"><div className="warehouse-toolbar"><div><span className="orders-eyebrow">COMPLETED FULFILLMENT</span><h2>Delivered orders</h2><span>Past deliveries completed by the warehouse team</span></div><strong className="delivered-orders-count">{deliveredOrders.length}</strong></div>{deliveredOrders.length === 0 ? <div className="orders-empty"><strong>No delivered orders yet</strong><span>Completed deliveries will appear here.</span></div> : <div className="delivered-orders-grid">{deliveredOrders.map((order) => <button type="button" className="delivered-order-card" key={`delivered-${order.id}`} onClick={() => setSelectedDeliveredOrderId(order.id)}><span className="delivered-order-check"><FaCheckCircle /></span><span className="delivered-order-card-main"><strong>Order #{String(order.id).padStart(5, "0")}</strong><b>{order.productName || "Product"}</b><small>{order.customerName || "Guest customer"} · Qty {order.quantity || 0}</small></span><span className="delivered-order-card-meta"><strong>{order.warehouseName || "Warehouse"}</strong><small>{order.placedAt ? new Date(order.placedAt).toLocaleDateString("en-IN") : "Date unavailable"}</small><em>View details →</em></span></button>)}</div>}</section>;
  }

  async function updateReturnStatus(orderReference, status) {
    setSavingId(`return-${orderReference}`);
    try {
      const response = await fetch(`${API}/refunds/${encodeURIComponent(orderReference)}/warehouse-status`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionStorage.getItem("token") || localStorage.getItem("token")}` }, body: JSON.stringify({ status }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Unable to update returned product.");
      setReturnRequests((items) => items.map((item) => item.orderReference === orderReference ? { ...item, refundStatus: result.refundStatus, orderStatus: status === "VALID" ? "REFUNDED" : status === "RECEIVED" ? "RETURN_RECEIVED" : status === "INSPECTED" ? "RETURN_INSPECTED" : status === "INVALID" ? "RETURN_REJECTED" : status } : item));
    } catch (requestError) { setError(requestError.message); } finally { setSavingId(null); }
  }

  function renderReturnRequests() {
    if (!isStaff) return null;
    const activeReturns = returnRequests.filter((item) => ["ACCEPTED", "RECEIVED", "INSPECTED", "REJECTED", "RETURN_SHIPPED", "RETURN_DELIVERED"].includes(item.refundStatus));
    return <section className="warehouse-panel warehouse-return-panel"><div className="warehouse-toolbar"><div><span className="orders-eyebrow">RETURNS PROCESS</span><h2>Returned products</h2> <span></span></div><FaUndoAlt /></div>{activeReturns.length === 0 ? <div className="orders-empty"><strong>No returned products waiting</strong><span>Admin-approved returns will appear here.</span></div> : <div className="warehouse-return-list">{activeReturns.map((item) => <article key={`return-${item.id}`}><div><strong>Order #{String(item.id).padStart(5, "0")}</strong><b>{item.productName || "Product"}</b><small>{item.customerName || "Customer"} · Qty {item.quantity || 0}</small></div><span className={`return-stage return-stage-${String(item.refundStatus).toLowerCase()}`}>{item.refundStatus === "ACCEPTED" ? "Return accepted" : item.refundStatus === "RECEIVED" ? "Product received" : item.refundStatus === "INSPECTED" ? "Inspection complete" : item.refundStatus === "REJECTED" ? "Refund rejected" : item.refundStatus === "RETURN_SHIPPED" ? "Sent to customer" : "Delivered to customer"}</span><div>{item.refundStatus === "ACCEPTED" ? <button type="button" onClick={() => updateReturnStatus(item.orderReference, "RECEIVED")} disabled={savingId === `return-${item.orderReference}`}>Mark received</button> : item.refundStatus === "RECEIVED" ? <button type="button" onClick={() => updateReturnStatus(item.orderReference, "INSPECTED")} disabled={savingId === `return-${item.orderReference}`}>Inspect product</button> : item.refundStatus === "INSPECTED" ? <><button type="button" onClick={() => updateReturnStatus(item.orderReference, "VALID")} disabled={savingId === `return-${item.orderReference}`}>Approve refund</button><button type="button" className="return-reject-btn" onClick={() => updateReturnStatus(item.orderReference, "INVALID")} disabled={savingId === `return-${item.orderReference}`}>Reject return</button></> : item.refundStatus === "REJECTED" ? <button type="button" onClick={() => updateReturnStatus(item.orderReference, "RETURN_SHIPPED")} disabled={savingId === `return-${item.orderReference}`}>Send product back</button> : item.refundStatus === "RETURN_SHIPPED" ? <button type="button" onClick={() => updateReturnStatus(item.orderReference, "RETURN_DELIVERED")} disabled={savingId === `return-${item.orderReference}`}>Mark returned to customer</button> : <span className="return-complete-label">Return completed</span>}</div></article>)}</div>}</section>;
  }

  function renderReturnedStock() {
    const returned = returnRequests.filter((item) => item.refundStatus === "REFUNDED");
    return <section className="warehouse-panel returned-stock-panel"><div className="warehouse-toolbar"><div><span className="orders-eyebrow">SEPARATE INVENTORY</span><h2>Returned stock</h2><span>Products returned by customers and kept outside sellable inventory.</span></div><FaUndoAlt /></div>{returned.length === 0 ? <div className="orders-empty"><strong>No returned stock yet</strong><span>Validated returns will appear here with their reason.</span></div> : <div className="returned-stock-list">{returned.map((item) => <article key={`returned-stock-${item.id}`}><div><strong>{item.productName || "Product"}</strong><small>Order #{String(item.id).padStart(5, "0")} · Qty {item.quantity || 0}</small></div><div><span>Reason for return</span><strong>{item.refundReason || "Not provided"}</strong><small>{item.refundDetails || "No additional details"}</small></div><div><span>Returned quantity</span><b>{item.quantity || 0} units</b></div><em>Not for sale</em></article>)}</div>}</section>;
  }

  function renderDeliveredModal(orderOverride = selectedDeliveredOrder) {
    if (!orderOverride) return null;
    const order = orderOverride;
    return <div className="delivered-modal-backdrop" onClick={() => setSelectedDeliveredOrderId(null)}><section className="delivered-modal" role="dialog" aria-modal="true" aria-label="Delivered order details" onClick={(event) => event.stopPropagation()}><button type="button" className="delivered-modal-close" onClick={() => setSelectedDeliveredOrderId(null)} aria-label="Close delivered order details"><FaTimes /></button><span className="orders-eyebrow">DELIVERY COMPLETED</span><div className="delivered-modal-title"><div><h2>Order #{String(order.id).padStart(5, "0")}</h2><p>{order.orderReference || "No reference"} · {order.placedAt ? new Date(order.placedAt).toLocaleString("en-IN") : "Date unavailable"}</p></div><strong><FaCheckCircle /> Delivered</strong></div><div className="delivered-modal-grid"><div><span>Product</span><strong>{order.productName || "Product"}</strong></div><div><span>Quantity</span><strong>{order.quantity || 0} units</strong></div><div><span>Warehouse</span><strong>{order.warehouseName || "Not assigned"}</strong></div><div><span>Customer</span><strong>{order.customerName || "Guest customer"}</strong><small>{order.customerEmail || ""}</small></div><div className="delivered-modal-wide"><span>Delivery address</span><strong>{order.deliveryAddress || "No address provided"}</strong></div></div><div className="delivered-complete-banner"><FaCheckCircle /><div><strong>Delivery completed successfully</strong><span>This order has completed the warehouse and delivery journey.</span></div></div></section></div>;
  }

  function renderOrderModal() {
    if (!selectedOrder && selectedAllocationOrder) {
      const order = selectedAllocationOrder;
      const stock = warehouseStock.filter((item) => item.productId === order.productId);
      const allocatedStock = stock.filter((item) => item.warehouseName === order.warehouseName);
      return <div className="allocation-order-backdrop" onClick={() => setSelectedAllocationOrderId(null)}><section className="allocation-order-modal" role="dialog" aria-modal="true" aria-label="Order warehouse allocation details" onClick={(event) => event.stopPropagation()}><button type="button" className="product-detail-close" onClick={() => setSelectedAllocationOrderId(null)} aria-label="Close allocation details">×</button><span className="orders-eyebrow">ORDER ALLOCATION DETAILS</span><h2>Order #{String(order.id).padStart(5, "0")}</h2><p className="product-detail-sku">{order.orderReference || "No reference"} · {order.placedAt ? new Date(order.placedAt).toLocaleString("en-IN") : "Date unavailable"}</p><div className="product-detail-summary"><div><span>Product</span><strong>{order.productName || "Product"}</strong></div><div><span>Quantity purchased</span><strong>{order.quantity || 0} units</strong></div><div><span>Customer</span><strong>{order.customerName || "Guest customer"}</strong><small>{order.customerEmail || ""}</small></div><div><span>Current status</span><strong>{formatStatus(order.warehouseStatus || "ORDER_CONFIRMED")}</strong></div></div><h3>Allocated warehouse</h3>{order.warehouseName ? <div className="product-warehouse-list">{(allocatedStock.length ? allocatedStock : [{ warehouseName: order.warehouseName, availableQuantity: null, warehouseId: "assigned" }]).map((item) => <div key={`${item.productId || order.productId}-${item.warehouseId}`}><FaWarehouse /><span><strong>{item.warehouseName}</strong><small>Warehouse assigned to this order</small></span><b>{item.availableQuantity === null ? "Assigned" : `${item.availableQuantity} units stock`}</b></div>)}</div> : <div className="product-no-warehouse">No warehouse has been allocated to this order yet.</div>}</section></div>;
    }
    if (selectedOrder?.orderStatus === "DELIVERED") return renderDeliveredModal(selectedOrder);
    if (!selectedOrder) return <>{renderAdminOrderAllocation()}{renderReturnRequests()}{renderDeliveredOrders()}{!isStaff && renderProductAllocation()}{!isStaff && renderProductAllocationModal()}{renderDeliveredModal()}</>;
    const status = workflowStatus(selectedOrder);
    // A saved status means that step is complete; highlight the next step.
    const currentIndex = Math.min(steps.length - 1, Math.max(0, steps.findIndex(([key]) => key === status)) + (status === "ORDER_CONFIRMED" ? 0 : 1));
    const available = selectedProduct && Number(selectedProduct.stock || 0) >= Number(selectedOrder.quantity || 0);
    return <div className="warehouse-modal-backdrop" onClick={() => setSelectedOrderId(null)}><section className="warehouse-order-modal" role="dialog" aria-modal="true" aria-label="Fulfillment order details" onClick={(event) => event.stopPropagation()}><button className="warehouse-modal-close" type="button" onClick={() => setSelectedOrderId(null)} aria-label="Close order details"><FaTimes /></button><div className="warehouse-modal-kicker">FULFILLMENT ORDER</div><div className="warehouse-modal-title"><div><h2>Order #{String(selectedOrder.id).padStart(5, "0")}</h2><p>{selectedOrder.orderReference || "No reference"} <span>·</span> {selectedOrder.placedAt ? new Date(selectedOrder.placedAt).toLocaleString("en-IN") : "Date unavailable"}</p></div><span className="warehouse-modal-status">{formatStatus(status)}</span></div><div className="warehouse-modal-layout"><div className="warehouse-modal-main"><section className="warehouse-detail-section"><div className="warehouse-detail-heading"><div><span>WORKFLOW</span><h3>Fulfillment progress</h3></div><b>{currentIndex + 1} of {steps.length}</b></div><div className="warehouse-modal-timeline">{steps.map(([key, label], index) => <div className={`warehouse-timeline-step ${index < currentIndex ? "done" : ""} ${index === currentIndex ? "current" : ""}`} key={key}><span className="warehouse-timeline-dot">{index < currentIndex ? <FaCheckCircle /> : index + 1}</span><div><strong>{label}</strong><small>{index < currentIndex ? "Completed" : index === currentIndex ? "Current step" : "Pending"}</small></div>{index < steps.length - 1 && <i />}</div>)}</div></section><section className="warehouse-detail-section"><div className="warehouse-detail-heading"><div><span>ORDER ITEMS</span><h3>Product to fulfill</h3></div></div><div className="warehouse-product-summary"><div className="warehouse-product-icon"><FaBoxOpen /></div><div><strong>{selectedOrder.productName || "Product"}</strong><small>SKU #{selectedOrder.productId || "-"}</small></div><b>Qty {selectedOrder.quantity || 0}</b></div><div className={`warehouse-stock-callout ${available ? "is-available" : "is-low"}`}><FaCheckCircle /><div><strong>{available ? "Inventory check passed" : "Review inventory level"}</strong><span>{Number(selectedProduct?.stock || 0).toLocaleString("en-IN")} units remaining in catalog stock · order quantity {selectedOrder.quantity || 0}</span></div></div></section></div><aside className="warehouse-modal-side"><section className="warehouse-detail-section warehouse-next-panel"><span className="warehouse-section-label">NEXT ACTION</span><h3>{nextStep(selectedOrder)?.[1] || "Shipment handoff"}</h3><p>Complete this step to keep the order moving through the warehouse.</p>{nextAction(selectedOrder, true)}</section><section className="warehouse-detail-section"><span className="warehouse-section-label">WAREHOUSE</span><div className="warehouse-side-value"><FaWarehouse /><div><strong>{selectedOrder.warehouseName || "Not assigned"}</strong><span>{selectedOrder.warehouseName ? "Assigned fulfillment location" : "Choose a location before allocation"}</span></div></div></section><section className="warehouse-detail-section"><span className="warehouse-section-label">CUSTOMER & DELIVERY</span><div className="warehouse-info-list"><div><strong>{selectedOrder.customerName || "Guest customer"}</strong><span>{selectedOrder.customerEmail || "No email"}</span><span>{selectedOrder.customerPhone || "No phone"}</span></div><div className="warehouse-address"><FaMapMarkerAlt /><span>{selectedOrder.deliveryAddress || "No delivery address provided"}</span></div></div></section><section className="warehouse-detail-section warehouse-order-value"><span className="warehouse-section-label">ORDER VALUE</span><strong>{currency(selectedOrder.customerTotalAmount || selectedOrder.totalAmount)}</strong><span>{selectedOrder.paymentMethod || "Payment method unavailable"} · {selectedOrder.deliveryMethod || "Standard delivery"}</span></section></aside></div></section></div>;
  }

  function renderProductAllocation() {
    return <section className="warehouse-panel warehouse-inventory-panel"><div className="warehouse-toolbar"><div><h2>Vendor product requests</h2><span>{productRequests.length} product{productRequests.length === 1 ? "" : "s"} waiting for warehouse allocation · total must equal product stock</span></div></div>{productRequests.length === 0 ? <div className="orders-empty"><strong>No pending product requests</strong><span>New vendor submissions will appear here for review.</span></div> : <div className="warehouse-table-wrap"><table className="admin-table warehouse-table"><thead><tr><th>Product</th><th>Vendor</th><th>Stock</th><th>Quantity by warehouse</th><th>Admin action</th></tr></thead><tbody>{productRequests.map((item) => { const assigned = warehouseStock.filter((stock) => stock.productId === item.id); const current = productAllocations[item.id] || Object.fromEntries(assigned.map((stock) => [stock.warehouseId, stock.availableQuantity])); const enteredTotal = Object.values(current).reduce((sum, quantity) => sum + Number(quantity || 0), 0); return <tr key={`allocation-${item.id}`}><td><strong>{item.name}</strong><small>SKU #{item.id}</small></td><td><strong>{item.vendorName}</strong><small>{item.vendorEmail}</small></td><td>{Number(item.stock || 0).toLocaleString("en-IN")} units</td><td><div className="warehouse-allocation-action">{warehouseList.filter((warehouse) => warehouse.active).map((warehouse) => <label key={warehouse.id}>{warehouse.name}<input type="number" min="0" value={current[warehouse.id] ?? 0} onChange={(event) => setProductAllocations((all) => ({ ...all, [item.id]: { ...current, [warehouse.id]: event.target.value } }))} /></label>)}<small>Total: {enteredTotal} / {item.stock}</small></div></td><td><button className="warehouse-next-btn" type="button" onClick={() => allocateProduct(item)} disabled={enteredTotal !== Number(item.stock) || savingId === `product-${item.id}`}>{savingId === `product-${item.id}` ? "Saving..." : "Allocate and approve"}</button></td></tr>; })}</tbody></table></div>}</section>;
  }

  function renderProductAllocationModal() {
    const item = productRequests.find((request) => request.id === selectedProductRequestId);
    if (!item) return null;
    const assigned = warehouseStock.filter((stock) => stock.productId === item.id);
    const current = productAllocations[item.id] || Object.fromEntries(assigned.map((stock) => [stock.warehouseId, stock.availableQuantity]));
    const total = Object.values(current).reduce((sum, quantity) => sum + Number(quantity || 0), 0);
    return <div className="warehouse-modal-backdrop" onClick={() => setSelectedProductRequestId(null)}><section className="warehouse-order-modal product-allocation-modal" role="dialog" aria-modal="true" aria-label={`Allocate ${item.name}`} onClick={(event) => event.stopPropagation()}><button className="warehouse-modal-close" type="button" onClick={() => setSelectedProductRequestId(null)} aria-label="Close allocation dialog"><FaTimes /></button><div className="warehouse-modal-title"><div><span className="warehouse-modal-kicker">VENDOR PRODUCT REQUEST</span><h2>{item.name}</h2><p>{item.vendorName} · {item.vendorEmail} · SKU #{item.id}</p></div><span className="warehouse-modal-status">Pending allocation</span></div><div className="product-allocation-modal-body"><div className="product-allocation-total"><span>Total stock to allocate</span><strong>{item.stock} units</strong><b className={total === Number(item.stock) ? "allocation-total-valid" : "allocation-total-invalid"}>{total} / {item.stock} allocated</b></div><div className="product-allocation-fields">{warehouseList.filter((warehouse) => warehouse.active).map((warehouse) => <label key={warehouse.id}>{warehouse.name}<input type="number" min="0" value={current[warehouse.id] ?? 0} onChange={(event) => setProductAllocations((all) => ({ ...all, [item.id]: { ...current, [warehouse.id]: event.target.value } }))} /></label>)}</div><button className="warehouse-next-btn product-allocation-submit" type="button" onClick={async () => { if (await allocateProduct(item)) setSelectedProductRequestId(null); }} disabled={total !== Number(item.stock) || savingId === `product-${item.id}`}>{savingId === `product-${item.id}` ? "Saving..." : "Allocate quantities and approve"}</button></div></section></div>;
  }

  return <div className="admin-dashboard-container"><AdminSidebar /><main className="admin-main admin-warehouse-main"><header className="warehouse-heading"><div><span className="orders-eyebrow">FULFILLMENT OPERATIONS</span><h1>Warehouse</h1><p>Process confirmed orders from availability check through shipment handoff.</p></div><div className="warehouse-heading-icon"><FaWarehouse /></div></header><section className="warehouse-metrics"><div><span><FaClipboardCheck /></span><strong>{metrics.active}</strong><small>Orders in queue</small></div><div><span><FaShippingFast /></span><strong>{metrics.ready}</strong><small>Ready for shipment</small></div><div><span><FaBoxOpen /></span><strong>{metrics.units.toLocaleString("en-IN")}</strong><small>Units to fulfill</small></div><div><span><FaExclamationTriangle /></span><strong>{metrics.low}</strong><small>Low stock items</small></div></section><section className="warehouse-locations"><div className="warehouse-section-header"><div><span className="orders-eyebrow">INVENTORY LOCATIONS</span><h2>Warehouse availability</h2></div><span></span></div><div className="warehouse-location-grid">{warehouseOverview.map(({ warehouse, stock, assignedOrders, totalUnits, lowStock }) => <button className="warehouse-location-card" type="button" key={warehouse.id} onClick={() => setSelectedWarehouseId(warehouse.id)}><span className="warehouse-location-icon"><FaWarehouse /></span><span className="warehouse-location-copy"><strong>{warehouse.name}</strong><small>{warehouse.code} · {warehouse.address || "Location details unavailable"}</small></span><span className="warehouse-location-stats"><b>{totalUnits.toLocaleString("en-IN")}</b><small>available units</small><b>{stock.length}</b><small>products stocked</small></span><span className={lowStock ? "warehouse-location-warning" : "warehouse-location-good"}>{lowStock ? `${lowStock} low stock` : "Stock healthy"}</span><span className="warehouse-location-orders">{assignedOrders.length} active orders <span>View details →</span></span></button>)}</div></section><section className="warehouse-panel warehouse-fulfillment-panel"><div className="warehouse-toolbar"><div><h2>Fulfillment queue</h2><span>{visibleOrders.length} orders · Click any order for full details</span></div><div className="warehouse-controls"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search orders..." aria-label="Search fulfillment orders" /><select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter fulfillment orders"><option value="ACTIVE">Active queue</option><option value="ALL">All orders</option>{steps.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div></div>{error && <div className="orders-alert">{error}</div>}{loading && <div className="orders-empty"><div className="orders-spinner" />Loading fulfillment queue...</div>}{!loading && !error && visibleOrders.length === 0 && <div className="orders-empty"><strong>No orders in this view</strong><span>New confirmed orders will appear here.</span></div>}{!loading && visibleOrders.length > 0 && <div className="warehouse-table-wrap"><table className="admin-table orders-table warehouse-fulfillment-table"><thead><tr><th>Order</th><th>Product</th><th>Customer</th><th>Availability</th><th>Warehouse</th><th>Fulfillment progress</th><th>Next action</th></tr></thead><tbody>{visibleOrders.map((order) => { const product = stockByProduct.get(order.productId); const status = order.warehouseStatus || "ORDER_CONFIRMED"; const index = Math.max(0, steps.findIndex(([key]) => key === status)); const available = Number(product?.stock || 0) >= Number(order.quantity || 0); return <tr key={order.id} className="warehouse-order-row" onClick={() => setSelectedOrderId(order.id)}><td><strong className="order-id">#{String(order.id).padStart(5, "0")}</strong><small>{order.orderReference || "No reference"}</small></td><td><strong>{order.productName || "Product"}</strong><small>Qty {order.quantity || 0}</small></td><td><strong>{order.customerName || "Guest customer"}</strong><small>{order.customerEmail}</small></td><td><span className={`warehouse-availability ${available ? "available" : "unavailable"}`}><FaCheckCircle /> {available ? `${product.stock} available` : "Insufficient stock"}</span></td><td>{order.warehouseName || <span className="warehouse-unassigned">Not selected</span>}</td><td><div className="warehouse-progress"><div><span>{formatStatus(status)}</span><b>{index + 1}/{steps.length}</b></div><progress max={steps.length - 1} value={index} /></div></td><td onClick={(event) => event.stopPropagation()}>{status === "READY_FOR_SHIPMENT" && order.orderStatus === "PROCESSING" ? <button className="warehouse-ship-btn" type="button" onClick={() => markShipped(order)} disabled={savingId === order.id}>{savingId === order.id ? "Saving..." : "Mark shipped"}</button> : ["SHIPPED", "OUT_FOR_DELIVERY"].includes(order.orderStatus) ? <span className="warehouse-complete"><FaShippingFast /> With carrier</span> : ["DELIVERED", "REFUNDED", "CANCELLED"].includes(order.orderStatus) ? <span className="warehouse-complete"><FaCheckCircle /> Complete</span> : <span className="warehouse-row-hint">View details</span>}</td></tr>; })}</tbody></table></div>}</section><section className="warehouse-panel warehouse-inventory-panel"><div className="warehouse-toolbar"><div><h2>Inventory snapshot</h2><span>Stock available for allocation</span></div></div><div className="warehouse-table-wrap"><table className="admin-table warehouse-table"><thead><tr><th>Product</th><th>Vendor</th><th>Category</th><th>Price</th><th>Units available</th><th>Sold</th></tr></thead><tbody>{inventory.map((item) => <tr key={item.id}><td><strong>{item.name}</strong><small>SKU #{item.id}</small></td><td><strong>{item.vendorName}</strong><small>{item.vendorEmail}</small></td><td>{item.category || "Uncategorized"}</td><td><strong>{currency(item.price)}</strong></td><td><strong className={Number(item.stock) <= 5 ? "stock-low" : "stock-good"}>{Number(item.stock).toLocaleString("en-IN")}</strong></td><td>{Number(item.soldQuantity || 0).toLocaleString("en-IN")}</td></tr>)}</tbody></table></div></section>{selectedWarehouse && <div className="warehouse-analytics-backdrop" onClick={() => setSelectedWarehouseId(null)}><section className="warehouse-analytics-modal" role="dialog" aria-modal="true" aria-label={`${selectedWarehouse.name} stock details`} onClick={(event) => event.stopPropagation()}><button className="warehouse-modal-close" type="button" onClick={() => setSelectedWarehouseId(null)} aria-label="Close warehouse details"><FaTimes /></button><div className="warehouse-analytics-header"><div><span className="orders-eyebrow">WAREHOUSE ANALYTICS</span><h2>{selectedWarehouse.name}</h2><p>{selectedWarehouse.code} · {selectedWarehouse.address || "Location details unavailable"}</p></div><span className="warehouse-analytics-active">{selectedWarehouse.active ? "Active location" : "Inactive location"}</span></div><div className="warehouse-analytics-metrics"><div><strong>{selectedWarehouseOverview?.totalUnits.toLocaleString("en-IN") || 0}</strong><span>Available units</span></div><div><strong>{selectedWarehouseOverview?.stock.length || 0}</strong><span>Products stocked</span></div><div><strong>{selectedWarehouseOverview?.lowStock || 0}</strong><span>Low stock items</span></div><div><strong>{selectedWarehouseOverview?.assignedOrders.length || 0}</strong><span>Active orders</span></div></div><div className="warehouse-analytics-table"><div className="warehouse-analytics-title"><h3>Product availability</h3><span>Current units available in this warehouse</span></div>{selectedWarehouseOverview?.stock.length ? <table className="admin-table warehouse-table"><thead><tr><th>Product</th><th>Available</th><th>Stock health</th></tr></thead><tbody>{selectedWarehouseOverview.stock.sort((a, b) => a.productName.localeCompare(b.productName)).map((item) => <tr key={`${item.productId}-${item.warehouseId}`}><td><strong>{item.productName}</strong><small>SKU #{item.productId}</small></td><td><strong className={item.availableQuantity <= 5 ? "stock-low" : "stock-good"}>{Number(item.availableQuantity).toLocaleString("en-IN")} units</strong></td><td><span className={item.availableQuantity <= 5 ? "warehouse-availability unavailable" : "warehouse-availability available"}>{item.availableQuantity <= 5 ? "Low stock" : "Available"}</span></td></tr>)}</tbody></table> : <div className="orders-empty"><strong>No stock records</strong><span>Products added by vendors will be distributed here.</span></div>}</div></section></div>}{renderOrderModal()}</main></div>;
}
