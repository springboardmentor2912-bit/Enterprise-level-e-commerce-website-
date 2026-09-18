import { useEffect, useState } from "react";
import api from "../services/api";

function AdminProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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
      return "The requested product was not found.";
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
  // FETCH PRODUCTS
  // Used by Refresh, Try Again and Delete
  // =========================================================

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Please login as Administrator.");
        return;
      }

      const response = await api.get("/admin/products");

      if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error(
        "Admin product loading error:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Unable to load products."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD PRODUCTS WHEN PAGE OPENS
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      try {
        const token = getToken();

        if (!token) {
          if (!cancelled) {
            setError(
              "Please login as Administrator."
            );
            setLoading(false);
          }

          return;
        }

        const response = await api.get(
          "/admin/products"
        );

        if (!cancelled) {
          if (Array.isArray(response.data)) {
            setProducts(response.data);
          } else {
            setProducts([]);
          }

          setError("");
          setLoading(false);
        }
      } catch (err) {
        console.error(
          "Admin product loading error:",
          err
        );

        if (!cancelled) {
          setError(
            getErrorMessage(
              err,
              "Unable to load products."
            )
          );

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
  // DELETE PRODUCT
  // =========================================================

  const deleteProduct = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const token = getToken();

      if (!token) {
        setError("Please login as Administrator.");
        return;
      }

      await api.delete(
        `/admin/products/${id}`
      );

      setMessage(
        "Product deleted successfully."
      );

      await fetchProducts();
    } catch (err) {
      console.error(
        "Admin product delete error:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Unable to delete product."
        )
      );
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="admin-product-management">
        <h2>
          📦 Product Management
        </h2>

        <p>
          Loading products...
        </p>
      </div>
    );
  }

  // =========================================================
  // ERROR WITH NO PRODUCTS
  // =========================================================

  if (
    error &&
    products.length === 0
  ) {
    return (
      <div className="admin-product-management">
        <h2>
          📦 Product Management
        </h2>

        <p>
          {error}
        </p>

        <button
          onClick={fetchProducts}
        >
          Try Again
        </button>
      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="admin-product-management">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="admin-product-header">
        <div>
          <h2>
            📦 Product Management
          </h2>

          <p>
            Manage and monitor all products on ShopStack.
          </p>
        </div>

        <button
          onClick={fetchProducts}
          disabled={loading}
        >
          ↻ Refresh
        </button>
      </div>

      {/* =====================================================
          SUCCESS MESSAGE
      ===================================================== */}

      {message && (
        <div className="success-message">
          {message}
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
          PRODUCTS
      ===================================================== */}

      <div className="admin-product-card">

        <h3>
          All Products ({products.length})
        </h3>

        {products.length === 0 ? (
          <div className="empty-products">
            <h4>
              No Products Found
            </h4>

            <p>
              There are currently no products available.
            </p>
          </div>
        ) : (
          <div className="admin-product-table-wrapper">

            <table className="admin-product-table">

              <thead>
                <tr>
                  <th>ID</th>

                  <th>
                    Product
                  </th>

                  <th>
                    Category
                  </th>

                  <th>
                    Brand
                  </th>

                  <th>
                    Price
                  </th>

                  <th>
                    Stock
                  </th>

                  <th>
                    Vendor
                  </th>

                  <th>
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                  >

                    <td>
                      #{product.id}
                    </td>

                    <td>
                      <div className="admin-product-name">

                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={
                              product.name ||
                              "Product"
                            }
                            className="admin-product-image"
                          />
                        ) : (
                          <div className="admin-product-placeholder">
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
                      ₹{product.price}
                    </td>

                    <td>
                      {product.quantity}
                    </td>

                    <td>
                      {product.vendorEmail}
                    </td>

                    <td>
                      <button
                        onClick={() =>
                          deleteProduct(
                            product.id
                          )
                        }
                        className="delete-product-button"
                      >
                        🗑 Delete
                      </button>
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

export default AdminProductManagement;