import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/authService";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);

    try {
      await forgotPassword({ email });

      // Backend always returns the same generic message whether or not
      // the email exists (prevents account enumeration) — so we always
      // show this same confirmation regardless of the actual outcome.
      setSubmitted(true);

    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">

          <div className="text-5xl mb-4">📬</div>

          <h1 className="text-2xl font-bold text-blue-600">
            Check Your Email
          </h1>

          <p className="text-gray-500 mt-3">
            If an account exists for <strong>{email}</strong>, a password
            reset link has been sent. It expires in 30 minutes.
          </p>

          <Link
            to="/login"
            className="inline-block mt-6 text-blue-600 hover:underline font-medium"
          >
            ← Back to Login
          </Link>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        <div className="text-center mb-8">

          <div className="text-5xl mb-4">🔒</div>

          <h1 className="text-3xl font-bold text-blue-600">
            Forgot Password?
          </h1>

          <p className="text-gray-500 mt-3">
            Enter your registered email address and we'll send you a password
            reset link.
          </p>

        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div>

            <label className="block text-sm font-medium mb-2">
              Email Address
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />

          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3 rounded-lg font-semibold transition"
          >
            {submitting ? "Sending..." : "Send Reset Link"}
          </button>

        </form>

        <div className="mt-6 text-center">

          <Link
            to="/login"
            className="text-blue-600 hover:underline font-medium"
          >
            ← Back to Login
          </Link>

        </div>

      </div>

    </div>
  );
}

export default ForgotPassword;
