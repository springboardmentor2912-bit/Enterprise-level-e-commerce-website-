import { useEffect, useState } from "react";
import api from "../services/api";

import "./UserManagement.css";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // GET TOKEN
  // =========================================================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // =========================================================
  // ERROR MESSAGE
  // =========================================================

  const getErrorMessage = (err) => {
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
      return "Users could not be found.";
    }

    if (err.response.status >= 500) {
      return "Server error. Please try again.";
    }

    return (
      err.response?.data?.message ||
      err.response?.data?.error ||
      "Unable to load users. Make sure the backend is running."
    );
  };

  // =========================================================
  // FETCH USERS
  // Used by Refresh / Try Again button
  // =========================================================

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError(
          "Please login as Administrator first."
        );
        return;
      }

      const response = await api.get(
        "/admin/users"
      );

      console.log(
        "Users received:",
        response.data
      );

      if (Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error(
        "User loading error:",
        err
      );

      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    const loadInitialUsers = async () => {
      try {
        const token = getToken();

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
          "/admin/users"
        );

        if (!cancelled) {
          if (Array.isArray(response.data)) {
            setUsers(response.data);
          } else {
            setUsers([]);
          }

          setError("");
        }
      } catch (err) {
        console.error(
          "Initial user loading error:",
          err
        );

        if (!cancelled) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    // Delay initial request to avoid
    // React cascading-render warning.
    const timer = setTimeout(() => {
      loadInitialUsers();
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="user-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>

          <p>
            Loading users...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="user-management">
        <div className="error-container">

          <div className="error-icon">
            ⚠️
          </div>

          <h2>
            Unable to Load Users
          </h2>

          <p>
            {error}
          </p>

          <button
            className="retry-button"
            onClick={fetchUsers}
          >
            Try Again
          </button>

        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="user-management">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="user-header">

        <div>
          <p className="page-label">
            ADMIN PANEL
          </p>

          <h1>
            User Management
          </h1>

          <p className="page-subtitle">
            Manage and monitor registered customers.
          </p>
        </div>

        {/* CUSTOMER COUNT */}

        <div className="user-count">

          <span className="count-number">
            {users.length}
          </span>

          <span className="count-label">
            Customers
          </span>

        </div>

      </div>

      {/* =====================================================
          USER CARD
      ===================================================== */}

      <div className="user-card">

        {/* TABLE HEADER */}

        <div className="table-header">

          <div>

            <h2>
              Registered Customers
            </h2>

            <p>
              Customers registered on ShopStack
            </p>

          </div>

          <button
            className="refresh-button"
            onClick={fetchUsers}
            disabled={loading}
          >
            ↻ Refresh
          </button>

        </div>

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {users.length === 0 ? (
          <div className="empty-state">

            <div className="empty-icon">
              👥
            </div>

            <h3>
              No Customers Found
            </h3>

            <p>
              There are currently no registered customers.
            </p>

          </div>
        ) : (

          /* =================================================
             USERS TABLE
          ================================================= */

          <div className="table-wrapper">

            <table>

              <thead>
                <tr>

                  <th>
                    ID
                  </th>

                  <th>
                    Customer
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

                </tr>
              </thead>

              <tbody>

                {users.map((user) => (
                  <tr key={user.id}>

                    {/* ID */}

                    <td>
                      <span className="user-id">
                        #{user.id}
                      </span>
                    </td>

                    {/* CUSTOMER */}

                    <td>
                      <div className="customer-info">

                        <div className="avatar">
                          {user.fullName
                            ? user.fullName
                                .charAt(0)
                                .toUpperCase()
                            : "U"}
                        </div>

                        <span>
                          {user.fullName ||
                            "Unknown User"}
                        </span>

                      </div>
                    </td>

                    {/* EMAIL */}

                    <td>
                      <span className="email">
                        {user.email}
                      </span>
                    </td>

                    {/* ROLE */}

                    <td>
                      <span className="role-badge">
                        {user.role}
                      </span>
                    </td>

                    {/* STATUS */}

                    <td>
                      <span className="status-badge active">
                        {user.status ||
                          "ACTIVE"}
                      </span>
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

export default UserManagement;