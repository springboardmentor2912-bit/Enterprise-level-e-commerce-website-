import { useEffect, useState } from "react";
import api from "../services/api";
import "./VendorManagement.css";

function VendorManagement() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // FETCH VENDORS
  // Used by Refresh / Try Again / Approve / Reject
  // =========================================================

  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError(
          "Please login as Administrator first."
        );

        setLoading(false);
        return;
      }

      const response = await api.get(
        "/admin/vendors"
      );

      console.log(
        "Vendors received:",
        response.data
      );

      if (Array.isArray(response.data)) {
        setVendors(response.data);
      } else {
        setVendors([]);
      }
    } catch (error) {
      console.error(
        "Vendor loading error:",
        error
      );

      if (error.response?.status === 403) {
        setError(
          "Access denied. Please login as Administrator."
        );
      } else if (
        error.response?.status === 401
      ) {
        setError(
          "Session expired. Please login again."
        );
      } else {
        setError(
          "Unable to load vendors."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    const loadInitialVendors = async () => {
      try {
        const token =
          localStorage.getItem("token");

        if (!token) {
          if (!cancelled) {
            setError(
              "Please login as Administrator first."
            );

            setLoading(false);
          }

          return;
        }

        const response = await api.get(
          "/admin/vendors"
        );

        if (!cancelled) {
          if (Array.isArray(response.data)) {
            setVendors(response.data);
          } else {
            setVendors([]);
          }
        }
      } catch (error) {
        console.error(
          "Initial vendor loading error:",
          error
        );

        if (!cancelled) {
          if (
            error.response?.status === 403
          ) {
            setError(
              "Access denied. Please login as Administrator."
            );
          } else if (
            error.response?.status === 401
          ) {
            setError(
              "Session expired. Please login again."
            );
          } else {
            setError(
              "Unable to load vendors."
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
      loadInitialVendors();
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  // =========================================================
  // APPROVE VENDOR
  // =========================================================

  const approveVendor = async (id) => {
    try {
      const token =
        localStorage.getItem("token");

      if (!token) {
        alert(
          "Please login as Administrator first."
        );

        return;
      }

      await api.put(
        `/admin/vendors/${id}/approve`,
        {}
      );

      alert(
        "Vendor approved successfully."
      );

      await fetchVendors();
    } catch (error) {
      console.error(
        "Approve vendor error:",
        error
      );

      alert(
        "Failed to approve vendor."
      );
    }
  };

  // =========================================================
  // REJECT VENDOR
  // =========================================================

  const rejectVendor = async (id) => {
    try {
      const token =
        localStorage.getItem("token");

      if (!token) {
        alert(
          "Please login as Administrator first."
        );

        return;
      }

      await api.put(
        `/admin/vendors/${id}/reject`,
        {}
      );

      alert(
        "Vendor rejected successfully."
      );

      await fetchVendors();
    } catch (error) {
      console.error(
        "Reject vendor error:",
        error
      );

      alert(
        "Failed to reject vendor."
      );
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="vendor-management">
        <div className="vendor-message">
          Loading vendors...
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="vendor-management">
        <div className="vendor-error">

          <p>
            {error}
          </p>

          <button
            className="refresh-vendor-button"
            onClick={fetchVendors}
          >
            Try Again
          </button>

        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN PAGE
  // =========================================================

  return (
    <div className="vendor-management">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="vendor-header">

        <div>

          <p className="vendor-label">
            ADMIN PANEL
          </p>

          <h2>
            Vendor Management
          </h2>

          <p>
            Manage and monitor all registered vendors.
          </p>

        </div>

        <div className="vendor-count">

          <span>
            {vendors.length}
          </span>

          <small>
            Total Vendors
          </small>

        </div>

      </div>

      {/* =====================================================
          TOOLBAR
      ===================================================== */}

      <div className="vendor-toolbar">

        <h3>
          Registered Vendors
        </h3>

        <button
          className="refresh-vendor-button"
          onClick={fetchVendors}
        >
          ↻ Refresh
        </button>

      </div>

      {/* =====================================================
          NO VENDORS
      ===================================================== */}

      {vendors.length === 0 ? (

        <div className="vendor-message">

          <div className="vendor-empty-icon">
            🏪
          </div>

          <h3>
            No Vendors Found
          </h3>

          <p>
            There are currently no registered vendors.
          </p>

        </div>

      ) : (

        /* =================================================
           VENDOR TABLE
        ================================================= */

        <div className="vendor-table-wrapper">

          <table className="vendor-table">

            <thead>

              <tr>

                <th>
                  ID
                </th>

                <th>
                  Vendor
                </th>

                <th>
                  Email
                </th>

                <th>
                  Role
                </th>

                <th>
                  Status
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {vendors.map((vendor) => (

                <tr key={vendor.id}>

                  {/* ID */}

                  <td>

                    <span className="vendor-id">
                      #{vendor.id}
                    </span>

                  </td>

                  {/* VENDOR */}

                  <td>

                    <div className="vendor-name">

                      <div className="vendor-avatar">

                        {vendor.fullName
                          ? vendor.fullName
                              .charAt(0)
                              .toUpperCase()
                          : "V"}

                      </div>

                      <strong>
                        {vendor.fullName ||
                          "Unknown Vendor"}
                      </strong>

                    </div>

                  </td>

                  {/* EMAIL */}

                  <td>

                    <span className="vendor-email">
                      {vendor.email}
                    </span>

                  </td>

                  {/* ROLE */}

                  <td>

                    <span className="role-badge">
                      {vendor.role}
                    </span>

                  </td>

                  {/* STATUS */}

                  <td>

                    <span
                      className={`status-badge ${
                        vendor.status === "APPROVED"
                          ? "approved"
                          : vendor.status === "REJECTED"
                          ? "rejected"
                          : "pending"
                      }`}
                    >
                      {vendor.status ||
                        "PENDING"}
                    </span>

                  </td>

                  {/* ACTIONS */}

                  <td>

                    <div className="action-buttons">

                      {/* APPROVE */}

                      <button
                        className="approve-button"
                        onClick={() =>
                          approveVendor(
                            vendor.id
                          )
                        }
                        disabled={
                          vendor.status ===
                          "APPROVED"
                        }
                      >
                        ✓ Approve
                      </button>

                      {/* REJECT */}

                      <button
                        className="reject-button"
                        onClick={() =>
                          rejectVendor(
                            vendor.id
                          )
                        }
                        disabled={
                          vendor.status ===
                          "REJECTED"
                        }
                      >
                        ✕ Reject
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
  );
}

export default VendorManagement;