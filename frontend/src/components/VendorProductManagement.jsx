import { useEffect, useState } from "react";
import api from "../services/api";
import "./VendorProductManagement.css";

function VendorProductManagement() {
  const [products, setProducts] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const emptyForm = {
    name: "",
    category: "",
    brand: "",
    description: "",
    originalPrice: "",
    discountPercentage: "",
    quantity: "",
    imageUrl: "",
  };

  const [formData, setFormData] = useState(emptyForm);

  // =========================================================
  // GET TOKEN
  // =========================================================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // =========================================================
  // FETCH PRODUCTS
  // =========================================================

  const fetchProducts = async () => {
    const token = getToken();

    if (!token) {
      setError("Please login first.");
      return;
    }

    try {
      const response = await api.get("/vendor/products");

      setProducts(
        Array.isArray(response.data)
          ? response.data
          : []
      );

      setError("");
    } catch (err) {
      console.error("FETCH PRODUCTS ERROR:", err);
      console.error("STATUS:", err.response?.status);
      console.error("BACKEND RESPONSE:", err.response?.data);

      if (err.response?.status === 401) {
        setError(
          "Your session has expired. Please login again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "Access denied. Please login as an approved vendor."
        );
      } else {
        setError("Unable to load your products.");
      }
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      const token = getToken();

      if (!token) {
        if (!cancelled) {
          setError("Please login first.");
          setLoading(false);
        }

        return;
      }

      try {
        const response = await api.get("/vendor/products");

        if (!cancelled) {
          setProducts(
            Array.isArray(response.data)
              ? response.data
              : []
          );

          setError("");
        }
      } catch (err) {
        console.error(
          "INITIAL PRODUCTS FETCH ERROR:",
          err
        );

        console.error(
          "STATUS:",
          err.response?.status
        );

        console.error(
          "BACKEND RESPONSE:",
          err.response?.data
        );

        if (!cancelled) {
          if (err.response?.status === 401) {
            setError(
              "Your session has expired. Please login again."
            );
          } else if (err.response?.status === 403) {
            setError(
              "Access denied. Please login as an approved vendor."
            );
          } else {
            setError(
              "Unable to load your products."
            );
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    const timer = setTimeout(() => {
      loadProducts();
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  // =========================================================
  // HANDLE INPUT
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingProduct(null);
    setShowForm(false);
    setSaving(false);
    setError("");
  };

  // =========================================================
  // OPEN ADD FORM
  // =========================================================

  const openAddProductForm = () => {
    setFormData(emptyForm);
    setEditingProduct(null);
    setMessage("");
    setError("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // CALCULATE SELLING PRICE
  // =========================================================

  const calculateSellingPrice = () => {
    const originalPrice = Number(
      formData.originalPrice
    );

    const discountPercentage = Number(
      formData.discountPercentage
    );

    if (
      Number.isNaN(originalPrice) ||
      originalPrice <= 0
    ) {
      return "";
    }

    if (
      Number.isNaN(discountPercentage) ||
      discountPercentage < 0 ||
      discountPercentage > 100
    ) {
      return "";
    }

    const discountAmount =
      (originalPrice * discountPercentage) / 100;

    const sellingPrice =
      originalPrice - discountAmount;

    return sellingPrice.toFixed(2);
  };

  // =========================================================
  // DISCOUNT AMOUNT
  // =========================================================

  const calculateDiscountAmount = () => {
    const originalPrice = Number(
      formData.originalPrice
    );

    const discountPercentage = Number(
      formData.discountPercentage
    );

    if (
      Number.isNaN(originalPrice) ||
      originalPrice <= 0 ||
      Number.isNaN(discountPercentage) ||
      discountPercentage < 0 ||
      discountPercentage > 100
    ) {
      return "";
    }

    return (
      (originalPrice * discountPercentage) /
      100
    ).toFixed(2);
  };

  // =========================================================
  // VALIDATE FORM
  // =========================================================

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Please enter the product name.");
      return false;
    }

    if (!formData.category.trim()) {
      setError("Please enter the product category.");
      return false;
    }

    if (!formData.brand.trim()) {
      setError("Please enter the product brand.");
      return false;
    }

    if (!formData.description.trim()) {
      setError("Please enter the product description.");
      return false;
    }

    if (
      formData.originalPrice === "" ||
      Number(formData.originalPrice) <= 0 ||
      Number.isNaN(Number(formData.originalPrice))
    ) {
      setError(
        "Please enter a valid original price greater than 0."
      );
      return false;
    }

    if (
      formData.discountPercentage === "" ||
      Number(formData.discountPercentage) < 0 ||
      Number(formData.discountPercentage) > 100 ||
      Number.isNaN(
        Number(formData.discountPercentage)
      )
    ) {
      setError(
        "Please enter a discount percentage between 0 and 100."
      );
      return false;
    }

    if (
      Number(calculateSellingPrice()) <= 0
    ) {
      setError(
        "Discounted selling price must be greater than 0."
      );
      return false;
    }

    if (
      formData.quantity === "" ||
      Number(formData.quantity) < 0 ||
      Number.isNaN(Number(formData.quantity))
    ) {
      setError(
        "Please enter a valid stock quantity."
      );
      return false;
    }

    if (
      !Number.isInteger(Number(formData.quantity))
    ) {
      setError(
        "Stock quantity must be a whole number."
      );
      return false;
    }

    return true;
  };

  // =========================================================
  // CREATE PRODUCT
  // =========================================================

  const handleAddProduct = async (event) => {
    event.preventDefault();

    console.log("===== ADD PRODUCT STARTED =====");

    if (saving) {
      console.log("Already saving...");
      return;
    }

    setMessage("");
    setError("");

    if (!validateForm()) {
      console.log("FORM VALIDATION FAILED");
      return;
    }

    const token = getToken();

    console.log("TOKEN EXISTS:", !!token);
    console.log(
      "API URL:",
      import.meta.env.VITE_API_URL
    );

    if (!token) {
      setError("Please login first.");
      return;
    }

    const productData = {
      name: formData.name.trim(),
      category: formData.category.trim(),
      brand: formData.brand.trim(),
      description: formData.description.trim(),

      originalPrice: Number(
        formData.originalPrice
      ),

      discountPercentage: Number(
        formData.discountPercentage
      ),

      price: Number(
        calculateSellingPrice()
      ),

      quantity: Number(formData.quantity),

      imageUrl: formData.imageUrl.trim(),
    };

    console.log(
      "PRODUCT DATA:",
      productData
    );

    console.log(
      "SENDING POST REQUEST TO:",
      "/vendor/products"
    );

    try {
      setSaving(true);

      const response = await api.post(
        "/vendor/products",
        productData
      );

      console.log(
        "PRODUCT CREATED SUCCESSFULLY:",
        response.data
      );

      setMessage(
        "Product added successfully."
      );

      setFormData(emptyForm);
      setEditingProduct(null);
      setShowForm(false);

      await fetchProducts();

    } catch (err) {
      console.error(
        "===== PRODUCT CREATION ERROR ====="
      );

      console.error(
        "ERROR:",
        err
      );

      console.error(
        "STATUS:",
        err.response?.status
      );

      console.error(
        "BACKEND RESPONSE:",
        err.response?.data
      );

      console.error(
        "REQUEST:",
        err.request
      );

      if (err.response?.status === 401) {
        setError(
          "Your session has expired. Please login again."
        );

      } else if (err.response?.status === 403) {
        setError(
          "Access denied. Please login as an approved vendor."
        );

      } else if (err.response?.status === 400) {

        const backendMessage =
          err.response?.data?.message ||
          err.response?.data?.error;

        setError(
          backendMessage ||
          "Invalid product details. Please check the form."
        );

      } else if (err.response?.status === 500) {

        setError(
          "Server error while adding the product. Check the Spring Boot terminal."
        );

      } else if (err.request) {

        setError(
          "Backend is not responding. Make sure Spring Boot is running."
        );

      } else {

        setError(
          "Unable to add product."
        );
      }

    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // START EDIT
  // =========================================================

  const startEdit = (product) => {
    setEditingProduct(product);

    setFormData({
      name: product.name || "",
      category: product.category || "",
      brand: product.brand || "",
      description: product.description || "",

      originalPrice:
        product.originalPrice !== null &&
        product.originalPrice !== undefined
          ? product.originalPrice
          : product.price || "",

      discountPercentage:
        product.discountPercentage !== null &&
        product.discountPercentage !== undefined
          ? product.discountPercentage
          : 0,

      quantity:
        product.quantity !== null &&
        product.quantity !== undefined
          ? product.quantity
          : "",

      imageUrl: product.imageUrl || "",
    });

    setMessage("");
    setError("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // UPDATE PRODUCT
  // =========================================================

  const handleUpdateProduct = async (event) => {
    event.preventDefault();

    if (saving || !editingProduct) {
      return;
    }

    setMessage("");
    setError("");

    if (!validateForm()) {
      return;
    }

    const token = getToken();

    if (!token) {
      setError("Please login first.");
      return;
    }

    const productData = {
      name: formData.name.trim(),
      category: formData.category.trim(),
      brand: formData.brand.trim(),
      description: formData.description.trim(),

      originalPrice: Number(
        formData.originalPrice
      ),

      discountPercentage: Number(
        formData.discountPercentage
      ),

      price: Number(
        calculateSellingPrice()
      ),

      quantity: Number(formData.quantity),

      imageUrl: formData.imageUrl.trim(),
    };

    try {
      setSaving(true);

      const response = await api.put(
        `/vendor/products/${editingProduct.id}`,
        productData
      );

      console.log(
        "PRODUCT UPDATED:",
        response.data
      );

      setMessage(
        "Product updated successfully."
      );

      setFormData(emptyForm);
      setEditingProduct(null);
      setShowForm(false);

      await fetchProducts();

    } catch (err) {
      console.error(
        "PRODUCT UPDATE ERROR:",
        err
      );

      console.error(
        "STATUS:",
        err.response?.status
      );

      console.error(
        "BACKEND RESPONSE:",
        err.response?.data
      );

      if (err.response?.status === 401) {

        setError(
          "Your session has expired. Please login again."
        );

      } else if (err.response?.status === 403) {

        setError(
          "You are not allowed to update this product."
        );

      } else if (err.response?.status === 400) {

        const backendMessage =
          err.response?.data?.message ||
          err.response?.data?.error;

        setError(
          backendMessage ||
          "Please check all product details."
        );

      } else {

        setError(
          "Unable to update product."
        );
      }

    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE PRODUCT
  // =========================================================

  const deleteProduct = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) {
      return;
    }

    const token = getToken();

    if (!token) {
      setError("Please login first.");
      return;
    }

    try {
      setMessage("");
      setError("");

      await api.delete(
        `/vendor/products/${id}`
      );

      setMessage(
        "Product deleted successfully."
      );

      await fetchProducts();

    } catch (err) {
      console.error(
        "DELETE PRODUCT ERROR:",
        err
      );

      if (err.response?.status === 401) {

        setError(
          "Your session has expired. Please login again."
        );

      } else if (err.response?.status === 403) {

        setError(
          "You are not allowed to delete this product."
        );

      } else {

        setError(
          "Unable to delete product."
        );
      }
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="product-loading">
        Loading your products...
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="vendor-products">

      {/* HEADER */}

      <div className="product-header">

        <div>
          <h2>
            My Products
          </h2>

          <p>
            Add and manage products available in your store.
          </p>
        </div>

        <button
          type="button"
          className="add-product-button"
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              openAddProductForm();
            }
          }}
        >
          {showForm
            ? "✕ Close"
            : "+ Add Product"}
        </button>

      </div>

      {/* SUCCESS MESSAGE */}

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {/* ERROR MESSAGE */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* ADD / EDIT FORM */}

      {showForm && (
        <div className="product-form-card">

          <div className="product-form-header">

            <div>

              <h3>
                {editingProduct
                  ? "Edit Product"
                  : "Add New Product"}
              </h3>

              <p>
                {editingProduct
                  ? "Update your product details below."
                  : "Enter the details of your new product."}
              </p>

            </div>

          </div>

          <form
            onSubmit={
              editingProduct
                ? handleUpdateProduct
                : handleAddProduct
            }
            noValidate
          >

            <div className="form-grid">

              {/* PRODUCT NAME */}

              <div className="form-group">

                <label htmlFor="product-name">
                  Product Name
                </label>

                <input
                  id="product-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  autoComplete="off"
                  required
                />

              </div>

              {/* CATEGORY */}

              <div className="form-group">

                <label htmlFor="product-category">
                  Category
                </label>

                <input
                  id="product-category"
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Example: Electronics"
                  autoComplete="off"
                  required
                />

              </div>

              {/* BRAND */}

              <div className="form-group">

                <label htmlFor="product-brand">
                  Brand
                </label>

                <input
                  id="product-brand"
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="Example: Sony"
                  autoComplete="off"
                  required
                />

              </div>

              {/* ORIGINAL PRICE */}

              <div className="form-group">

                <label htmlFor="product-original-price">
                  Original Price
                </label>

                <input
                  id="product-original-price"
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  placeholder="Enter actual price"
                  min="0.01"
                  step="0.01"
                  required
                />

              </div>

              {/* DISCOUNT */}

              <div className="form-group">

                <label htmlFor="product-discount">
                  Discount (%)
                </label>

                <input
                  id="product-discount"
                  type="number"
                  name="discountPercentage"
                  value={formData.discountPercentage}
                  onChange={handleChange}
                  placeholder="Example: 10"
                  min="0"
                  max="100"
                  step="0.01"
                  required
                />

              </div>

              {/* SELLING PRICE */}

              <div className="form-group">

                <label htmlFor="product-selling-price">
                  Selling Price
                </label>

                <input
                  id="product-selling-price"
                  type="text"
                  value={
                    calculateSellingPrice()
                      ? `₹${Number(
                          calculateSellingPrice()
                        ).toFixed(2)}`
                      : ""
                  }
                  placeholder="Calculated automatically"
                  readOnly
                />

              </div>

              {/* QUANTITY */}

              <div className="form-group">

                <label htmlFor="product-quantity">
                  Stock Quantity
                </label>

                <input
                  id="product-quantity"
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="Enter stock quantity"
                  min="0"
                  step="1"
                  required
                />

              </div>

              {/* IMAGE URL */}

              <div className="form-group">

                <label htmlFor="product-image">
                  Image URL
                </label>

                <input
                  id="product-image"
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="Paste product image URL"
                />

              </div>

            </div>

            {/* DESCRIPTION */}

            <div className="form-group">

              <label htmlFor="product-description">
                Description
              </label>

              <textarea
                id="product-description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your product"
                rows="4"
                required
              />

            </div>

            {/* DISCOUNT PREVIEW */}

            {formData.originalPrice !== "" &&
              formData.discountPercentage !== "" &&
              calculateSellingPrice() && (

                <div
                  style={{
                    marginTop: "15px",
                    padding: "15px",
                    borderRadius: "8px",
                    background: "#f5f7fb",
                  }}
                >

                  <strong>
                    Discount Preview
                  </strong>

                  <div
                    style={{
                      marginTop: "8px",
                    }}
                  >
                    Original Price: ₹
                    {Number(
                      formData.originalPrice
                    ).toFixed(2)}
                  </div>

                  <div>
                    {Number(
                      formData.discountPercentage
                    ).toFixed(2)}
                    % Discount: ₹
                    {calculateDiscountAmount()}
                  </div>

                  <div>
                    Selling Price: ₹
                    {calculateSellingPrice()}
                  </div>

                </div>
              )}

            {/* IMAGE PREVIEW */}

            {formData.imageUrl.trim() && (

              <div className="image-preview">

                <img
                  src={formData.imageUrl}
                  alt="Product preview"
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";
                  }}
                />

              </div>
            )}

            {/* SUBMIT BUTTONS */}

            <div
              className="product-submit-section"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                width: "100%",
                minHeight: "70px",
                padding: "15px 0",
                marginTop: "20px",
                position: "relative",
                zIndex: 1000,
                overflow: "visible",
              }}
            >

              <button
                type="submit"
                className="save-product-button"
                disabled={saving}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "150px",
                  height: "45px",
                  cursor: saving
                    ? "not-allowed"
                    : "pointer",
                  position: "relative",
                  zIndex: 1001,
                }}
              >
                {saving
                  ? editingProduct
                    ? "Updating..."
                    : "Adding Product..."
                  : editingProduct
                  ? "Update Product"
                  : "Add Product"}
              </button>

              <button
                type="button"
                className="cancel-product-button"
                onClick={resetForm}
                disabled={saving}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "120px",
                  height: "45px",
                  cursor: saving
                    ? "not-allowed"
                    : "pointer",
                  position: "relative",
                  zIndex: 1001,
                }}
              >
                Cancel
              </button>

            </div>

          </form>

        </div>
      )}

      {/* PRODUCT LIST */}

      <div className="product-list-card">

        <div className="product-list-header">

          <h3>
            Your Products ({products.length})
          </h3>

        </div>

        {products.length === 0 ? (

          <div className="no-products">

            <div className="no-products-icon">
              📦
            </div>

            <h4>
              No Products Yet
            </h4>

            <p>
              Add your first product to start selling.
            </p>

          </div>

        ) : (

          <div className="product-table-wrapper">

            <table className="product-table">

              <thead>

                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Action</th>
                </tr>

              </thead>

              <tbody>

                {products.map((product) => (

                  <tr key={product.id}>

                    <td>

                      <div className="product-name">

                        {product.imageUrl ? (

                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="product-image"
                            onError={(event) => {
                              event.currentTarget.style.display =
                                "none";
                            }}
                          />

                        ) : (

                          <div className="product-placeholder">
                            📦
                          </div>

                        )}

                        <span>
                          {product.name}
                        </span>

                      </div>

                    </td>

                    <td>
                      {product.category}
                    </td>

                    <td>
                      {product.brand}
                    </td>

                    <td>

                      {product.discountPercentage > 0 && (

                        <div
                          style={{
                            fontSize: "12px",
                            color: "#16a34a",
                            fontWeight: "600",
                          }}
                        >
                          {Number(
                            product.discountPercentage
                          ).toFixed(2)}
                          % OFF
                        </div>

                      )}

                      {product.originalPrice &&
                        Number(
                          product.originalPrice
                        ) >
                          Number(
                            product.price || 0
                          ) && (

                          <div
                            style={{
                              textDecoration:
                                "line-through",
                              color: "#888",
                              fontSize: "12px",
                            }}
                          >
                            ₹
                            {Number(
                              product.originalPrice
                            ).toFixed(2)}
                          </div>

                        )}

                      <div>
                        ₹
                        {Number(
                          product.price || 0
                        ).toFixed(2)}
                      </div>

                    </td>

                    <td>

                      <span
                        className={
                          Number(product.quantity) === 0
                            ? "stock-out"
                            : Number(product.quantity) <= 5
                            ? "stock-low"
                            : "stock-in"
                        }
                      >
                        {product.quantity}
                      </span>

                    </td>

                    <td>

                      <div className="product-actions">

                        <button
                          type="button"
                          className="edit-product-button"
                          onClick={() =>
                            startEdit(product)
                          }
                        >
                          ✏️ Edit
                        </button>

                        <button
                          type="button"
                          className="delete-product-button"
                          onClick={() =>
                            deleteProduct(product.id)
                          }
                        >
                          🗑 Delete
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default VendorProductManagement;