import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import InputField from "../components/InputField";
import Button from "../components/Button";
import { loginUser } from "../services/authService";
import { getMyAccount } from "../services/accountService";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const response = await loginUser({
        email: formData.email,
        password: formData.password,
      });

      // Handle cases where the response wrapper is nested (Axios data property vs custom payload)
      const data = response.data?.data || response.data;

      // 1. Verify token exists before updating auth state
      if (!data || !data.token) {
        setErrorMessage(data?.message || "Invalid credentials. Please try again.");
        setLoading(false);
        return;
      }

      // 2. Save valid credentials to storage
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      // 2b. Also find out whether this account has a Vendor profile
      // independent of its primary role (multi-role support — a CUSTOMER
      // may have chosen to "Become a Vendor"). Non-fatal if it fails.
      try {
        const account = await getMyAccount();
        localStorage.setItem("isVendor", String(Boolean(account?.isVendor)));
      } catch (accountError) {
        console.error("Failed to load account info:", accountError);
        localStorage.setItem("isVendor", "false");
      }

      // 3. Dispatch storage event so Navbar updates instantly
      window.dispatchEvent(new Event("storage"));

      // 4. Navigate based on role
      if (data.role === "VENDOR") {
  navigate("/vendor-dashboard");
} else if (data.role === "CUSTOMER") {
  navigate("/customer-dashboard");
} else if (data.role === "ADMINISTRATOR") {
  navigate("/admin/dashboard");
} else if (data.role === "WAREHOUSE_STAFF") {
  navigate("/warehouse/dashboard");
} else {
  navigate("/");
}

    } catch (error) {
      console.error("Login error:", error);

      if (error.response) {
        setErrorMessage(error.response.data?.message || "Login Failed. Please check your credentials.");
      } else {
        setErrorMessage("Unable to connect to the server. Please check your network connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back 👋"
      subtitle="Sign in to your account to continue shopping with ShopStack."
    >
      <div className="bg-white/90 backdrop-blur-md border border-stone-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Inline error banner */}
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200/80 text-rose-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2 font-medium">
              <svg className="w-5 h-5 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          <InputField
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />

          <InputField
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />

          {/* Remember me & Forgot password */}
          <div className="flex items-center justify-between text-sm pt-1">
            <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                className="rounded border-stone-300 text-emerald-700 focus:ring-emerald-600 h-4 w-4 transition cursor-pointer"
              />
              <span className="font-medium text-slate-700">Remember me</span>
            </label>

            <Link
              to="/forgot-password"
              className="font-medium text-emerald-700 hover:text-emerald-800 transition"
            >
              Forgot password?
            </Link>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          {/* Registration link footer */}
          <div className="pt-2 text-center border-t border-stone-100">
            <p className="text-sm text-slate-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-emerald-700 hover:text-emerald-800 transition"
              >
                Create an account
              </Link>
            </p>
          </div>

        </form>
      </div>
    </AuthLayout>
  );
}

export default Login;