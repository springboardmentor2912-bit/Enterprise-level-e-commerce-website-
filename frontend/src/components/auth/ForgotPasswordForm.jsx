import { useForm } from "react-hook-form";
import { forgotPassword } from "../../api/authApi";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const response = await forgotPassword(data.email);
      setMessage(response.data.message || "Password reset link sent successfully.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to process request.");
    }

    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-[#f7f5f1] font-['Manrope',sans-serif]">
      {/* Scoped UI animations */}
      <style>{`
        @keyframes fp-fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fp-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes fp-ping-soft { 0% { transform: scale(1); opacity: .7; } 70%, 100% { transform: scale(2.4); opacity: 0; } }
        @keyframes fp-spin { to { transform: rotate(360deg); } }
        .fp-fade-up { animation: fp-fade-up .6s cubic-bezier(.22, 1, .36, 1) both; }
        .fp-float { animation: fp-float 6s ease-in-out infinite; }
        .fp-spin { animation: fp-spin 0.9s linear infinite; }
      `}</style>

      {/* ================= LEFT — BRAND PANEL ================= */}
      <aside className="relative hidden lg:flex lg:w-[46%] xl:w-1/2 flex-col justify-between overflow-hidden bg-[#06231f] p-12 xl:p-16 text-white">
        {/* Decorative layers */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/20 blur-[120px]" />
          <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] translate-x-1/3 translate-y-1/3 rounded-full bg-amber-400/10 blur-[100px]" />
          <div
            className="absolute inset-0 opacity-35"
            style={{
              backgroundImage: "radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1px)",
              backgroundSize: "26px 26px",
            }}
          />
          <div className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />
          <div className="absolute left-1/2 top-1/2 h-[780px] w-[780px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />
        </div>

        {/* Logo */}
        <div className="fp-fade-up relative z-10 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-950/50">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
          </span>
          <span className="font-['Fraunces',serif] text-2xl font-semibold tracking-tight">
            ShopStack
          </span>
        </div>

        {/* Headline */}
        <div className="relative z-10 max-w-lg">
          <p className="fp-fade-up mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-200/90">
            <span className="relative flex h-2 w-2">
              <span
                className="absolute inline-flex h-full w-full rounded-full bg-emerald-400"
                style={{ animation: "fp-ping-soft 2s cubic-bezier(0, 0, .2, 1) infinite" }}
              />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Account recovery
          </p>

          <h2
            className="fp-fade-up font-['Fraunces',serif] text-4xl font-semibold leading-[1.12] tracking-tight xl:text-[2.9rem]"
            style={{ animationDelay: "80ms" }}
          >
            We'll get you{" "}
            <span className="italic text-amber-300">back in.</span>
          </h2>

          <p
            className="fp-fade-up mt-5 text-[15px] leading-relaxed text-emerald-100/70"
            style={{ animationDelay: "160ms" }}
          >
            Enter your registered email and we'll send you a secure, one-time
            reset link. It's fast, private, and expires in 15 minutes.
          </p>

          {/* Security features */}
          <div
            className="fp-fade-up mt-10 space-y-3"
            style={{ animationDelay: "240ms" }}
          >
            <div className="fp-float flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-sm">
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-300/20">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-semibold text-white">
                  Links expire in 15 minutes
                </p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-emerald-100/60">
                  A tight window keeps your account safe from hijacking.
                </p>
              </div>
            </div>

            <div
              className="fp-float flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-sm"
              style={{ animationDelay: "1.2s" }}
            >
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-amber-400/15 text-amber-300 ring-1 ring-amber-300/20">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-semibold text-white">
                  Encrypted delivery
                </p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-emerald-100/60">
                  Tokens are signed and transmitted over TLS 1.3 only.
                </p>
              </div>
            </div>

            <div
              className="fp-float flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-sm"
              style={{ animationDelay: "2.4s" }}
            >
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-sky-400/15 text-sky-300 ring-1 ring-sky-300/20">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-semibold text-white">
                  We never see your password
                </p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-emerald-100/60">
                  Passwords are salted and hashed — no plaintext ever stored.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Help strip */}
        <div
          className="fp-fade-up relative z-10 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm"
          style={{ animationDelay: "320ms" }}
        >
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-400/15 text-amber-300 ring-1 ring-amber-300/20">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-semibold text-white">
                Need human help?
              </p>
              <p className="mt-0.5 text-[13px] text-emerald-100/60">
                Our support team replies in under 2 hours, 24/7.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= RIGHT — FORM ================= */}
      <main className="relative flex flex-1 flex-col items-center justify-center px-5 py-10 sm:px-8">
        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute right-[-10%] top-[-15%] h-[420px] w-[420px] rounded-full bg-emerald-200/40 blur-[110px]" />
          <div className="absolute bottom-[-18%] left-[-8%] h-[380px] w-[380px] rounded-full bg-amber-200/40 blur-[110px]" />
        </div>

        {/* Mobile-only brand */}
        <div className="fp-fade-up relative z-10 mb-8 flex items-center gap-2.5 lg:hidden">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-md shadow-emerald-900/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
          </span>
          <span className="font-['Fraunces',serif] text-xl font-semibold tracking-tight text-stone-900">
            ShopStack
          </span>
        </div>

        <div className="fp-fade-up relative z-10 w-full max-w-md" style={{ animationDelay: "100ms" }}>
          <div className="rounded-2xl border border-stone-200/80 bg-white p-7 shadow-[0_24px_60px_-24px_rgba(6,35,31,0.28)] sm:p-9">
            {/* Card header */}
            <div className="mb-8 text-center">
              <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/15">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </span>

              <h1 className="font-['Fraunces',serif] text-[1.9rem] font-semibold tracking-tight text-stone-900">
                Forgot Password
              </h1>
              <p className="mt-1.5 text-sm text-stone-500">
                Enter your registered email.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* ---------- EMAIL ---------- */}
              <div>
                <label htmlFor="email" className="mb-1.5 block text-[13px] font-semibold text-stone-700 text-left">
                  Email address
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400 transition-colors peer-focus:text-emerald-600">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </span>

                  <input
                    id="email"
                    type="email"
                    placeholder="Email Address"
                    {...register("email", {
                      required: "Email is required",
                    })}
                    className="peer w-full rounded-xl border border-stone-200 bg-stone-50/60 py-3 pl-11 pr-4 text-[15px] text-stone-900 placeholder-stone-400 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
                  />
                </div>

                {errors.email && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-[13px] font-medium text-rose-600">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* ---------- SUBMIT ---------- */}
              <button
                type="submit"
                disabled={loading}
                className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-emerald-800/25 transition-all duration-200 hover:bg-emerald-900 hover:shadow-xl hover:shadow-emerald-900/25 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:shadow-none disabled:hover:bg-stone-300"
              >
                {loading ? (
                  <>
                    <svg
                      className="fp-spin h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* ---------- MESSAGE ---------- */}
            {message && (
              <div className="mt-5 rounded-xl border border-emerald-600/20 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                <div className="flex items-start gap-2.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="mt-0.5 h-4 w-4 shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-[13px] leading-relaxed">
                    {message}
                  </span>
                </div>
              </div>
            )}

            {/* ---------- BACK TO LOGIN ---------- */}
            <div className="mt-8 text-center">
              <div className="mb-5 h-px w-full bg-stone-200" />
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-emerald-700 transition hover:text-emerald-900 hover:underline"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Back to Login
              </Link>
            </div>
          </div>

          {/* Security footer */}
          <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-stone-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            Reset links are signed, encrypted, and expire in 15 minutes
          </p>
        </div>
      </main>
    </div>
  );
}