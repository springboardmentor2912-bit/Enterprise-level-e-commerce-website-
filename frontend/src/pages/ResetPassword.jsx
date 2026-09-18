import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import InputField from "../components/InputField";
import Button from "../components/Button";
import { resetPassword } from "../services/authService";

function ResetPassword() {

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("This reset link is missing or invalid. Please request a new one.");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (formData.newPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    try {
      await resetPassword({
        token,
        newPassword: formData.newPassword,
      });

      setSubmitted(true);

    } catch (error) {
      console.error(error);

      const message =
        (typeof error.response?.data === "string" ? error.response.data : null) ||
        error.response?.data?.message ||
        "Failed to reset password. The link may have expired.";

      alert(message);
    }
  };

  // No token in the URL at all — this page was opened directly, not via
  // the emailed/console-logged reset link.
  if (!token) {
    return (
      <AuthLayout
        title="Invalid Reset Link"
        subtitle="This password reset link is missing or malformed."
      >
        <div className="text-center space-y-4">
          <p className="text-slate-600 text-sm">
            Please request a new password reset link and use it directly
            from your email (or the console log, in dev mode).
          </p>
          <Link
            to="/forgot-password"
            className="inline-block font-semibold text-blue-600 hover:text-blue-700"
          >
            Request a new link
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (submitted) {
    return (
      <AuthLayout
        title="Password Reset ✅"
        subtitle="Your password has been updated successfully."
      >
        <div className="text-center space-y-4">
          <p className="text-slate-600 text-sm">
            You can now log in with your new password.
          </p>
          <Button type="button" onClick={() => navigate("/login")}>
            Go to Login
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset Your Password"
      subtitle="Choose a new password for your ShopStack account."
    >
      <form onSubmit={handleSubmit} className="space-y-5">

        <InputField
          label="New Password"
          type="password"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          placeholder="Enter a new password"
          required
        />

        <InputField
          label="Confirm New Password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm your new password"
          required
        />

        <Button type="submit">
          Reset Password
        </Button>

        <p className="text-center text-sm text-slate-600">
          Remembered your password?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Back to Login
          </Link>
        </p>

      </form>
    </AuthLayout>
  );
}

export default ResetPassword;
