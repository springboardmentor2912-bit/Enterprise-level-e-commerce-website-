import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Login.css";

function ForgotPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function requestReset(event) {
    event.preventDefault(); setLoading(true); setError(""); setMessage("");
    try {
      const response = await fetch("https://shopstack-backend-gjv6.onrender.com/api/auth/forgot-password", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not create reset token");
      setToken(data.resetToken); setMessage(data.message);
    } catch (err) { setError(err.message || "Server is not running"); }
    finally { setLoading(false); }
  }

  async function changePassword(event) {
    event.preventDefault(); setLoading(true); setError(""); setMessage("");
    try {
      const response = await fetch("https://shopstack-backend-gjv6.onrender.com/api/auth/reset-password", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password })
      });
      const data = await response.text();
      if (!response.ok) throw new Error(data || "Could not change password");
      setMessage("Password changed successfully. You can now log in."); setToken(""); setPassword("");
    } catch (err) { setError(err.message || "Server is not running"); }
    finally { setLoading(false); }
  }

  return <div className="login-container"><div className="login-card">
    <div className="brand"><h1>🛒 ShopStack</h1><p>Enterprise Multi Vendor Platform</p></div>
    <h2>Change Password</h2><p className="subtitle">Request a reset token, then choose a new password.</p>
    {message && <p className="success-message">{message}</p>}{error && <p className="error-message">{error}</p>}
    {token && <div className="token-box"><strong>Your reset token:</strong><code>{token}</code><button type="button" onClick={() => navigator.clipboard?.writeText(token)}>Copy token</button></div>}
    <form onSubmit={requestReset}>
      <label>Email</label><input type="email" required placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} />
      <button type="submit" disabled={loading}>{loading ? "Please wait..." : "Get reset token"}</button>
    </form>
    <div className="reset-divider">Already have a reset token?</div>
    <form onSubmit={changePassword}>
      <label>Reset token</label><input required placeholder="Paste reset token" value={token} onChange={e => setToken(e.target.value)} />
      <label>New password</label><input type="password" required minLength="6" placeholder="At least 6 characters" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit" disabled={loading}>Change password</button>
    </form>
    <button className="text-button" onClick={() => navigate("/")}>Back to login</button>
  </div></div>;
}

export default ForgotPassword;
