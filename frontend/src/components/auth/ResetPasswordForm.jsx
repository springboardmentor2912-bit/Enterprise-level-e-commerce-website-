import { useForm } from "react-hook-form";
import { resetPassword } from "../../api/authApi";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";

export default function ResetPasswordForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Extract token from URL
  const tokenFromUrl = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      token: tokenFromUrl || "", // Pre-fill token from URL
    }
  });

  const password = watch("newPassword");

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const response = await resetPassword(data);

      setMessage(
        response.data.message || "Password reset successful."
      );

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Password reset failed."
      );
    }

    setLoading(false);
  };

  return (
    <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">

      <h1 className="text-3xl font-bold text-center">
        Reset Password
      </h1>

      <p className="text-center text-gray-500 mt-2 mb-8">
        Enter your new password.
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>

        {/* Hidden token field - already in URL */}
        <input
          type="hidden"
          {...register("token", {
            required: "Reset token is missing",
          })}
        />

        {/* Show error if token is missing from URL */}
        {!tokenFromUrl && (
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 mb-4">
            <p className="text-rose-600 text-sm">
              Reset token not found in URL. Please click the link from your email again.
            </p>
          </div>
        )}

        <input
          type="password"
          className="w-full border rounded-lg p-3 mb-4"
          placeholder="New Password"
          {...register("newPassword", {
            required: "New password is required",
            minLength: {
              value: 6,
              message: "Minimum 6 characters",
            },
          })}
        />

        {errors.newPassword && (
          <p className="text-red-500 text-sm mb-3">
            {errors.newPassword.message}
          </p>
        )}

        <input
          type="password"
          className="w-full border rounded-lg p-3"
          placeholder="Confirm Password"
          {...register("confirmPassword", {
            validate: (value) =>
              value === password ||
              "Passwords do not match",
          })}
        />

        {errors.confirmPassword && (
          <p className="text-red-500 text-sm mt-1">
            {errors.confirmPassword.message}
          </p>
        )}

        <button
          disabled={loading || !tokenFromUrl}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading
            ? "Resetting..."
            : "Reset Password"}
        </button>

      </form>

      {message && (
        <p className="text-center mt-5 text-green-600">
          {message}
        </p>
      )}

    </div>
  );
}