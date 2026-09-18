import { useEffect, useState } from "react";
import { FaBoxOpen, FaWarehouse } from "react-icons/fa";
import AdminSidebar from "./AdminSidebar";
import "./Admin.css";

const API = "https://shopstack-backend-gjv6.onrender.com/api/admin";

export default function AdminInventory() {
  const [inventory, setInventory] = useState([]);
  const [warehouseStock, setWarehouseStock] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${API}/inventory`, { headers }).then((response) => response.ok ? response.json() : Promise.reject(new Error("Unable to load inventory."))),
      fetch(`${API}/warehouse/stock`, { headers }).then((response) => response.ok ? response.json() : Promise.reject(new Error("Unable to load warehouse allocations."))),
    ]).then(([items, stock]) => {
      setInventory(Array.isArray(items) ? items : []);
      setWarehouseStock(Array.isArray(stock) ? stock : []);
    }).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false));
  }, []);

  return <div className="admin-dashboard-container"><AdminSidebar /><main className="admin-main admin-warehouse-main"><header className="warehouse-heading"><div><span className="orders-eyebrow">INVENTORY MANAGEMENT</span><h1>Inventory details</h1><p>Review every product, vendor, stock level, and warehouse allocation.</p></div><div className="warehouse-heading-icon"><FaBoxOpen /></div></header><section className="warehouse-panel standalone-inventory-panel"><div className="warehouse-toolbar"><div><h2>All inventory</h2><span>{inventory.length} products in the catalog · Click a product for details</span></div><FaWarehouse className="inventory-heading-icon" /></div>{loading ? <div className="orders-empty">Loading inventory...</div> : error ? <div className="orders-empty">{error}</div> : inventory.length === 0 ? <div className="orders-empty"><strong>No inventory found</strong></div> : <div className="warehouse-table-wrap"><table className="admin-table warehouse-table"><thead><tr><th>Product</th><th>Vendor</th><th>Category</th><th>Price</th><th>Stock</th><th>Sold</th></tr></thead><tbody>{inventory.map((item) => <tr key={item.id} className="inventory-clickable-row" onClick={() => setSelectedProduct(item)}><td><strong>{item.name}</strong><small>SKU #{item.id}</small></td><td><strong>{item.vendorName || "Unknown vendor"}</strong><small>{item.vendorEmail || ""}</small></td><td>{item.category || "Uncategorized"}</td><td>Rs {Number(item.price || 0).toLocaleString("en-IN")}</td><td><strong className={Number(item.stock) <= 5 ? "stock-low" : "stock-good"}>{Number(item.stock || 0).toLocaleString("en-IN")}</strong></td><td>{Number(item.soldQuantity || 0).toLocaleString("en-IN")}</td></tr>)}</tbody></table></div>}</section>{selectedProduct && <ProductDetails product={selectedProduct} warehouseStock={warehouseStock} onClose={() => setSelectedProduct(null)} />}</main></div>;
}

function ProductDetails({ product, warehouseStock, onClose }) {
  const allocations = warehouseStock.filter((stock) => stock.productId === product.id);
  return <div className="product-detail-backdrop" onClick={onClose}><section className="product-detail-modal" role="dialog" aria-modal="true" aria-label="Product details" onClick={(event) => event.stopPropagation()}><button type="button" className="product-detail-close" onClick={onClose} aria-label="Close product details">×</button><span className="orders-eyebrow">PRODUCT DETAILS</span><h2>{product.name}</h2><p className="product-detail-sku">SKU #{product.id}</p><div className="product-detail-summary"><div><span>Vendor</span><strong>{product.vendorName || "Unknown vendor"}</strong><small>{product.vendorEmail || ""}</small></div><div><span>Category</span><strong>{product.category || "Uncategorized"}</strong></div><div><span>Stock</span><strong>{product.stock || 0} units</strong></div><div><span>Sold</span><strong>{product.soldQuantity || 0} units</strong></div></div><h3>Allocated warehouses</h3>{allocations.length === 0 ? <div className="product-no-warehouse">No warehouse allocation found.</div> : <div className="product-warehouse-list">{allocations.map((stock) => <div key={`${stock.productId}-${stock.warehouseId}`}><FaWarehouse /><span><strong>{stock.warehouseName}</strong><small>Stock allocated to this warehouse</small></span><b>{stock.availableQuantity} units</b></div>)}</div>}</section></div>;
}
