import { useState } from "react";
import api from "../services/api";
import "./Auth.css";

function Auth({ onLoginSuccess }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register fields
  const [name, setName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [role, setRole] = useState("CUSTOMER");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/auth/login", {
        email: loginEmail,
        password: loginPassword,
      });

      localStorage.setItem("token", response.data.token);

      onLoginSuccess();
    } catch (error) {
      console.error("Login failed:", error);

      if (error.response) {
        alert(
          error.response.data?.message ||
            "Invalid email or password"
        );
      } else {
        alert("Cannot connect to backend");
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await api.post("/auth/register", {
        fullName: name,
        email: registerEmail,
        password: registerPassword,
        role: role,
      });

      alert("Registration successful! Please login.");

      // Pre-fill login email and switch back to login mode
      setLoginEmail(registerEmail);
      setIsRegisterMode(false);
    } catch (error) {
      console.error("Registration failed:", error);

      if (error.response) {
        alert(
          error.response.data?.message ||
            "Registration failed"
        );
      } else {
        alert("Cannot connect to backend");
      }
    }
  };

  return (
    <div
      className={`auth-container ${
        isRegisterMode ? "register-mode" : ""
      }`}
    >
      {/* LOGIN FORM */}
      <div className="form-container login-form">
        <div className="form-content">
          <div className="brand">ShopStack</div>

          <h1>Welcome back</h1>

          <p className="subtitle">
            Log in to your account to continue.
          </p>

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label htmlFor="login-email">Email</label>

              <input
                id="login-email"
                type="email"
                placeholder="Enter your email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="login-password">Password</label>

              <div className="password-wrapper">
                <input
                  id="login-password"
                  type={
                    showLoginPassword ? "text" : "password"
                  }
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) =>
                    setLoginPassword(e.target.value)
                  }
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowLoginPassword(
                      !showLoginPassword
                    )
                  }
                  aria-label={
                    showLoginPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showLoginPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button type="submit" className="main-button">
              Log In
            </button>
          </form>

          <p className="switch-text">
            Don't have an account?

            <button
              type="button"
              className="switch-button"
              onClick={() => setIsRegisterMode(true)}
            >
              Sign up
            </button>
          </p>
        </div>
      </div>

      {/* REGISTER FORM */}
      <div className="form-container register-form">
        <div className="form-content">
          <div className="brand">ShopStack</div>

          <h1>Create account</h1>

          <p className="subtitle">
            Sign up to get started with ShopStack.
          </p>

          <form onSubmit={handleRegister}>
            <div className="input-group">
              <label htmlFor="register-name">
                Full name
              </label>

              <input
                id="register-name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="register-email">
                Email
              </label>

              <input
                id="register-email"
                type="email"
                placeholder="Enter your email"
                value={registerEmail}
                onChange={(e) =>
                  setRegisterEmail(e.target.value)
                }
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="register-password">
                Password
              </label>

              <div className="password-wrapper">
                <input
                  id="register-password"
                  type={
                    showRegisterPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Create a password"
                  value={registerPassword}
                  onChange={(e) =>
                    setRegisterPassword(e.target.value)
                  }
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowRegisterPassword(
                      !showRegisterPassword
                    )
                  }
                  aria-label={
                    showRegisterPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showRegisterPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="register-role">
                Role
              </label>

              <select
                id="register-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="CUSTOMER">
                  Customer
                </option>

                <option value="VENDOR">
                  Vendor
                </option>

                <option value="WAREHOUSE_STAFF">
                  Warehouse Staff
                </option>
              </select>
            </div>

            <button type="submit" className="main-button">
              Sign Up
            </button>
          </form>

          <p className="switch-text">
            Already have an account?

            <button
              type="button"
              className="switch-button"
              onClick={() => setIsRegisterMode(false)}
            >
              Log in
            </button>
          </p>
        </div>
      </div>

      {/* SLIDER PANEL */}
      <div className="slider-panel">
        <div className="slider-content">
          <div className="slider-icon">🛍️</div>

          {isRegisterMode ? (
            <>
              <h2>Already with us?</h2>

              <p>
                Log in to pick up right where you
                left off.
              </p>

              <button
                className="outline-button"
                onClick={() => setIsRegisterMode(false)}
              >
                Log In
              </button>
            </>
          ) : (
            <>
              <h2>New here?</h2>

              <p>
                Create an account and start shopping
                with ShopStack today.
              </p>

              <button
                className="outline-button"
                onClick={() => setIsRegisterMode(true)}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Auth;