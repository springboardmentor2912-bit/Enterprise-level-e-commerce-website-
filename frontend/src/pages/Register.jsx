import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import InputField from "../components/InputField";
import Button from "../components/Button";
import { registerUser } from "../services/authService";
import { getMyAccount } from "../services/accountService";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "CUSTOMER",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleSelect = (selectedRole) => {
    setFormData({
      ...formData,
      role: selectedRole,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const response = await registerUser({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      // Backend now returns the same shape login does: { token, role, message }.
      const data = response.data;

      if (!data?.token) {
        // Shouldn't happen now that the backend returns 409 on failure
        // (which throws and lands in the catch block below), but guard
        // against it anyway rather than silently "succeeding" with no token.
        setErrorMessage(data?.message || "Registration failed!");
        return;
      }

      // 1. Save real credentials so the navbar reflects being logged in.
      localStorage.setItem("token", data.token);
      const assignedRole = data.role || formData.role;
      localStorage.setItem("role", assignedRole);

      // 1b. Also record whether this account has a Vendor profile
      // (a fresh VENDOR registration always will; CUSTOMER won't yet).
      try {
        const account = await getMyAccount();
        localStorage.setItem("isVendor", String(Boolean(account?.isVendor)));
      } catch (accountError) {
        console.error("Failed to load account info:", accountError);
        localStorage.setItem("isVendor", String(assignedRole === "VENDOR"));
      }

      // 2. Manually dispatch a "storage" event — localStorage.setItem does
      // NOT fire the native storage event in the same tab (only in other
      // tabs), so without this the navbar in this tab would stay stale
      // until the next full page load.
      window.dispatchEvent(new Event("storage"));

      // 3. Direct navigation to dashboard based on role
      if (assignedRole === "VENDOR") {
        navigate("/vendor-dashboard");
      } else {
        navigate("/customer-dashboard");
      }

    } catch (error) {
      console.error("Registration error:", error);

      if (error.response) {
        const msg = typeof error.response.data === "string"
          ? error.response.data
          : error.response.data?.message || "Registration failed!";
        setErrorMessage(msg);
      } else {
        setErrorMessage("Unable to connect to the server. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Account 🚀"
      subtitle="Join ShopStack today as a Customer or Vendor."
    >
      <div className="bg-white/90 backdrop-blur-md border border-stone-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Inline error message banner */}
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200/80 text-rose-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2 font-medium">
              <svg className="w-5 h-5 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          <InputField
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
           
            required
          />

          <InputField
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            
              required
            />

            <InputField
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
             
              required
            />
          </div>

          {/* Styled Segment Selector for Role */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              I want to register as
            </label>
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-stone-100 rounded-xl border border-stone-200">
              <button
                type="button"
                onClick={() => handleRoleSelect("CUSTOMER")}
                className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                  formData.role === "CUSTOMER"
                    ? "bg-white text-slate-900 shadow-xs border border-stone-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                🛍️ Customer
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect("VENDOR")}
                className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                  formData.role === "VENDOR"
                    ? "bg-white text-slate-900 shadow-xs border border-stone-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                🏪 Vendor
              </button>
            </div>
          </div>

          <div className="pt-2">
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </div>

          {/* Footer Navigation Link */}
          <div className="pt-3 text-center border-t border-stone-100">
            <p className="text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-emerald-700 hover:text-emerald-800 transition"
              >
                Sign In
              </Link>
            </p>
          </div>

        </form>
      </div>
    </AuthLayout>
  );
}

export default Register;