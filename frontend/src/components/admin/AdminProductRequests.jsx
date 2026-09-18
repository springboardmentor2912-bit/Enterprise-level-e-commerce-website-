import { useEffect, useState } from "react";
import { FaClipboardList } from "react-icons/fa";
import AdminSidebar from "./AdminSidebar";
import "./Admin.css";

const API = "https://shopstack-backend-gjv6.onrender.com/api/admin";

export default function AdminProductRequests() {
  const [requests, setRequests] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [allocations, setAllocations] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [error, setError] = useState("");

  function load() {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    return Promise.all([
      fetch(`${API}/product-requests`, { headers }).then((response) => response.json()),
      fetch(`${API}/warehouses`, { headers }).then((response) => response.json()),
    ]).then(([requestItems, warehouseItems]) => {
      setRequests(Array.isArray(requestItems) ? requestItems : []);
      setWarehouses(Array.isArray(warehouseItems) ? warehouseItems.filter((warehouse) => warehouse.active) : []);
    });
  }

  useEffect(() => { load().catch((requestError) => setError(requestError.message || "Unable to load product requests.")).finally(() => setLoading(false)); }, []);

  async function allocate(item) {
    const values = allocations[item.id] || {};
    const total = Object.values(values).reduce((sum, value) => sum + Number(value || 0), 0);
    if (total !== Number(item.stock)) { setError(`Allocate exactly ${item.stock} units for ${item.name}.`); return; }
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    setSaving(item.id); setError("");
    try {
      const response = await fetch(`${API}/inventory/${item.id}/warehouse`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ allocations: Object.fromEntries(Object.entries(values).map(([id, quantity]) => [id, Number(quantity || 0)])) }) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || "Unable to allocate product.");
      setRequests((items) => items.filter((request) => request.id !== item.id));
    } catch (requestError) { setError(requestError.message); } finally { setSaving(null); }
  }

  return <div className="admin-dashboard-container"><AdminSidebar /><main className="admin-main admin-warehouse-main"><header className="warehouse-heading"><div><span className="orders-eyebrow">INVENTORY WORKFLOW</span><h1>Product requests</h1><p>Review vendor stock requests and assign every unit to a warehouse.</p></div><div className="warehouse-heading-icon"><FaClipboardList /></div></header><section className="warehouse-panel standalone-product-requests"><div className="warehouse-toolbar"><div><h2>Vendor product requests</h2><span>{requests.length} request{requests.length === 1 ? "" : "s"} waiting for allocation</span></div></div>{error && <div className="orders-alert">{error}</div>}{loading ? <div className="orders-empty">Loading product requests...</div> : requests.length === 0 ? <div className="orders-empty"><strong>No pending product requests</strong><span>New vendor submissions will appear here.</span></div> : <div className="warehouse-table-wrap"><table className="admin-table warehouse-table"><thead><tr><th>Product</th><th>Vendor</th><th>Total stock</th><th>Stock by warehouse</th><th>Action</th></tr></thead><tbody>{requests.map((item) => { const current = allocations[item.id] || {}; const total = Object.values(current).reduce((sum, value) => sum + Number(value || 0), 0); return <tr key={item.id}><td><strong>{item.name}</strong><small>SKU #{item.id} · {item.category || "Uncategorized"}</small></td><td><strong>{item.vendorName || "Unknown vendor"}</strong><small>{item.vendorEmail || ""}</small></td><td><strong>{Number(item.stock || 0)} units</strong><small>{item.approvalStatus || "PENDING"}</small></td><td><div className="request-allocation-fields">{warehouses.map((warehouse) => <label key={warehouse.id}>{warehouse.name}<input type="number" min="0" value={current[warehouse.id] || ""} onChange={(event) => setAllocations((all) => ({ ...all, [item.id]: { ...current, [warehouse.id]: event.target.value } }))} /></label>)}<small>Total allocated: {total} / {item.stock}</small></div></td><td><button type="button" className="warehouse-next-btn" onClick={() => allocate(item)} disabled={saving === item.id || total !== Number(item.stock)}>{saving === item.id ? "Saving..." : "Allocate stock"}</button></td></tr>; })}</tbody></table></div>}</section></main></div>;
}
