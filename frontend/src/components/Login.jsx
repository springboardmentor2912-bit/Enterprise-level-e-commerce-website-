import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { getApiErrorMessage } from "../utils/apiError";

function getSavedLogins() {
  try {
    const value = JSON.parse(localStorage.getItem("shopstack_saved_logins") || "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch {
    localStorage.removeItem("shopstack_saved_logins");
    return {};
  }
}

function Login() {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginType, setLoginType] = useState("CUSTOMER");

  function loadSavedEmail(type) {
    const saved = getSavedLogins();
    const savedEmail = saved?.[type]?.email || "";
    setEmail(savedEmail);
    setRememberMe(Boolean(savedEmail));
  }

  useEffect(() => {
    localStorage.removeItem("shopstack_saved_login");
    loadSavedEmail(loginType);
  }, []);

  useEffect(() => {
    if (!isRegistering) loadSavedEmail(loginType);
  }, [loginType, isRegistering]);

  function selectLoginType(type) {
    setLoginType(type);
    setIsRegistering(false);
  }

  function toggleRegistration() {
    setIsRegistering((value) => !value);
    setUsername("");
    setConfirmPassword("");
  }

  function saveSession(data, accountEmail) {
    const normalizedRole = String(data.role || "").trim().toUpperCase().replace(/^ROLE_/, "");
    localStorage.setItem("token", data.token || "");
    localStorage.setItem("username", data.username || "");
    localStorage.setItem("email", accountEmail || "");
    localStorage.setItem("role", normalizedRole);
    sessionStorage.setItem("token", data.token || "");
    sessionStorage.setItem("username", data.username || "");
    sessionStorage.setItem("email", accountEmail || "");
    sessionStorage.setItem("role", normalizedRole);
    return normalizedRole;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isRegistering && password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const endpoint = isRegistering ? "register" : "login";
      const body = isRegistering ? { username, email, password, role: loginType } : { email, password };
      const response = await fetch(`https://shopstack-backend-gjv6.onrender.com/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || await getApiErrorMessage(response, isRegistering ? "Unable to create vendor account" : "Invalid email or password."));

      const normalizedRole = saveSession(data, email);
      if (isRegistering) {
        if (normalizedRole === "CUSTOMER") navigate("/customer-dashboard");
        else if (normalizedRole === "VENDOR") navigate("/vendor-dashboard");
        else navigate("/");
        return;
      }

      const savedLogins = getSavedLogins();
      if (rememberMe) savedLogins[loginType] = { email };
      else delete savedLogins[loginType];
      localStorage.setItem("shopstack_saved_logins", JSON.stringify(savedLogins));

      if (loginType === "VENDOR" && normalizedRole === "VENDOR") navigate("/vendor-dashboard");
      else if (loginType === "CUSTOMER" && normalizedRole === "CUSTOMER") navigate("/customer-dashboard");
      else if (loginType === "ADMIN" && normalizedRole === "ADMIN") navigate("/admin");
      else if (loginType === "STAFF" && normalizedRole === "STAFF") navigate("/staff/warehouse");
      else alert("You are not registered as " + loginType);
    } catch (error) {
      alert(error.message || "Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  }

  return <div className="login-container"><div className="login-card">
    <div className="brand"><h1>ShopStack</h1><p>Enterprise Multi Vendor Platform</p></div>
    <h2>{isRegistering ? `Create ${loginType === "CUSTOMER" ? "Customer" : "Vendor"} Account` : "Welcome Back"}</h2>
    <p className="subtitle">{isRegistering ? (loginType === "CUSTOMER" ? "Shop products from ShopStack vendors" : "Start selling on ShopStack") : "Login as Customer, Vendor, Admin, or Warehouse Staff"}</p>

    {!isRegistering && <>
      <label className="remember-option"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} /> Remember my email</label>
      <div className="role-buttons"><button type="button" className={loginType === "CUSTOMER" ? "active-role" : ""} onClick={() => selectLoginType("CUSTOMER")}>Customer</button><button type="button" className={loginType === "VENDOR" ? "active-role" : ""} onClick={() => selectLoginType("VENDOR")}>Vendor</button><button type="button" className={loginType === "ADMIN" ? "active-role" : ""} onClick={() => selectLoginType("ADMIN")}>Admin</button><button type="button" className={loginType === "STAFF" ? "active-role" : ""} onClick={() => selectLoginType("STAFF")}>Staff</button></div>
    </>}

    <form onSubmit={handleSubmit}>
      {isRegistering && <><label>{loginType === "CUSTOMER" ? "Customer name" : "Vendor name"}</label><input type="text" placeholder="Enter your name" value={username} onChange={(event) => setUsername(event.target.value)} required /></>}
      <label>Email</label><input type="email" placeholder="Enter your email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
      <label>Password</label><div className="password-box"><input type={showPassword ? "text" : "password"} placeholder="Enter your password" autoComplete={isRegistering ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} required minLength="6" /><button type="button" className="toggle" onClick={() => setShowPassword((value) => !value)}>{showPassword ? "Hide" : "Show"}</button></div>
      {isRegistering && <><label>Confirm password</label><input type="password" placeholder="Confirm your password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength="6" /></>}
      <button type="submit" className="login-btn" disabled={loading}>{loading ? (isRegistering ? "Creating account..." : "Signing in...") : (isRegistering ? `Create ${loginType.toLowerCase()} account` : "Sign in")}</button>
    </form>

    {!isRegistering && <button className="text-button" onClick={() => navigate("/forgot-password")}>Forgot password?</button>}
    {(loginType === "CUSTOMER" || loginType === "VENDOR") && (
      <button className="auth-switch" onClick={toggleRegistration}>{isRegistering ? `Already have a ${loginType.toLowerCase()} account? Sign in` : `New ${loginType.toLowerCase()}? Register here`}</button>
    )}
    <p className="footer-text">© 2026 ShopStack</p>
  </div></div>;
}

export default Login;
