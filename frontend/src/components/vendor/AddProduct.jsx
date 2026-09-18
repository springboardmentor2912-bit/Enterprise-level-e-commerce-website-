import { useState } from "react";
import Sidebar from "../dashboard/Sidebar";
import "./VendorProducts.css";

const emptyProduct = { name: "", description: "", price: "", discountPercentage: "", stock: "", category: "", imageUrl: "" };
function normalizeImageUrl(value) {
    const raw = String(value || "").trim();
    const markdownMatch = raw.match(/^\[[^\]]*\]\((https?:\/\/[^)]+)\)$/i);
    const cleaned = (markdownMatch ? markdownMatch[1] : raw).replace(/\/\/this\/?$/i, "");
    if (/^https?:\/\/images\.unsplash\.com\//i.test(cleaned) && !cleaned.includes("?")) {
        return `${cleaned}?auto=format&fit=crop&w=900&q=80`;
    }
    return cleaned;
}

function AddProduct() {
    const [product, setProduct] = useState(emptyProduct);
    const [message, setMessage] = useState("");
    const [saving, setSaving] = useState(false);
    const [imagePreviewError, setImagePreviewError] = useState(false);
    function handleChange(event) {
        setProduct(current => ({ ...current, [event.target.name]: event.target.value }));
        if (event.target.name === "imageUrl") setImagePreviewError(false);
        setMessage("");
    }

    async function addProduct(event) {
        event.preventDefault();
        setSaving(true);
        setMessage("");
        try {
            const response = await fetch("https://shopstack-backend-gjv6.onrender.com/api/vendor/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ ...product, imageUrl: normalizeImageUrl(product.imageUrl), price: Number(product.price), discountPercentage: Number(product.discountPercentage || 0), stock: Number(product.stock || 0) })
            });
            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({}));
                throw new Error(errorBody.message || "Unable to add product. Please check the details.");
            }
            setMessage("Product added successfully.");
            setProduct(emptyProduct);
        } catch (error) {
            setMessage(error.message || "Unable to connect to the backend.");
        } finally {
            setSaving(false);
        }
    }

    const imageUrl = normalizeImageUrl(product.imageUrl);

    return <div className="vendor-add-layout">
        <Sidebar />
        <main className="add-product-page">
            <div className="add-product-heading">
                <p className="eyebrow">Inventory management</p>
                <h1>Add New Product</h1>
                <p>Create a polished product listing for your ShopStack store.</p>
            </div>
            <div className="add-product-workspace">
                <form className="professional-product-form" onSubmit={addProduct}>
                    <div className="form-section-title"><span>01</span><div><h2>Product information</h2><p>Give customers the details they need.</p></div></div>
                    <label>Product name<input name="name" value={product.name} onChange={handleChange} required /></label>
                    <label className="wide-field">Description<textarea name="description" value={product.description} onChange={handleChange} rows="5" required /></label>
                    <div className="form-section-title section-break"><span>02</span><div><h2>Pricing and inventory</h2><p>Set the price, discount, and stock quantity.</p></div></div>
                    <label>Original price (₹)<input name="price" type="number" min="0" step="0.01" value={product.price} onChange={handleChange} required /></label>
                    <label>Discount percentage (%)<input name="discountPercentage" type="number" min="0" max="100" step="0.01" value={product.discountPercentage} onChange={handleChange} placeholder="0" /></label>
                    <label>Stock quantity<input name="stock" type="number" min="0" value={product.stock} onChange={handleChange} required /></label>
                    <label>Category<input name="category" value={product.category} onChange={handleChange} required /></label>
                    <label>Image URL<input name="imageUrl" type="url" value={product.imageUrl} onChange={handleChange} /></label>
                    <button className="publish-product-btn" type="submit" disabled={saving}>{saving ? "Publishing..." : "Publish product"}</button>
                    {message && <p className={`add-product-message ${message.includes("successfully") ? "success" : "failure"}`}>{message}</p>}
                </form>
                <aside className="product-preview-panel">
                    <p className="eyebrow">Live preview</p>
                    <div className="preview-image">{imageUrl && !imagePreviewError ? <img src={imageUrl} alt="Product preview" onLoad={() => setImagePreviewError(false)} onError={() => setImagePreviewError(true)} /> : imageUrl ? <span className="preview-image-error">Image link cannot be loaded.<small>Use a direct image URL ending in .jpg, .png, or .webp.</small></span> : <span>Product image</span>}</div>
                    <span className="preview-category">{product.category || "Category"}</span>
                    <h2>{product.name || "Your product name"}</h2>
                    <p>{product.description || "Your product description will appear here."}</p>
                    <div className="preview-footer"><strong>₹{(Number(product.price || 0) * (1 - Number(product.discountPercentage || 0) / 100)).toLocaleString()}</strong>{Number(product.discountPercentage || 0) > 0 && <del>₹{Number(product.price || 0).toLocaleString()}</del>}<span>{product.stock || 0} units in stock</span></div>
                </aside>
            </div>
        </main>
    </div>;
}

export default AddProduct;
