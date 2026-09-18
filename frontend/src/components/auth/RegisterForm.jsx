import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { register as registerUser } from "../../api/authApi";

export default function RegisterForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password");

  const onSubmit = async (data) => {
    try {
      await registerUser(data);
      alert("Registration Successful");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Registration Failed");
    }
  };

  return (
    <div className="relative flex w-full overflow-hidden bg-[#f7f5f1] font-['Manrope',sans-serif]">
      {/* Scoped UI animations */}
      <style>{`
        @keyframes rf-fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes rf-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes rf-ping-soft { 0% { transform: scale(1); opacity: .7; } 70%, 100% { transform: scale(2.4); opacity: 0; } }
        .rf-fade-up { animation: rf-fade-up .6s cubic-bezier(.22, 1, .36, 1) both; }
        .rf-float { animation: rf-float 6s ease-in-out infinite; }
      `}</style>

      {/* ================= LEFT — BRAND PANEL ================= */}
      <aside className="relative hidden lg:flex lg:w-[46%] xl:w-1/2 flex-col justify-between overflow-hidden bg-[#06231f] p-12 xl:p-16 text-white">
        {/* Decorative layers */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-amber-400/15 blur-[120px]" />
          <div className="absolute bottom-0 left-0 h-[28rem] w-[28rem] -translate-x-1/3 translate-y-1/3 rounded-full bg-emerald-500/15 blur-[100px]" />
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
        <div className="rf-fade-up relative z-10 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-950/50">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
          </span>
          <span className="font-['Fraunces',serif] text-2xl font-semibold tracking-tight">
            ShopStack
          </span>
        </div>

        {/* Headline + welcome */}
        <div className="relative z-10 max-w-lg">
          <p className="rf-fade-up mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-200/90">
            <span className="relative flex h-2 w-2">
              <span
                className="absolute inline-flex h-full w-full rounded-full bg-amber-300"
                style={{ animation: "rf-ping-soft 2s cubic-bezier(0, 0, .2, 1) infinite" }}
              />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-300" />
            </span>
            Start selling today
          </p>

          <h2
            className="rf-fade-up font-['Fraunces',serif] text-4xl font-semibold leading-[1.12] tracking-tight xl:text-[2.9rem]"
            style={{ animationDelay: "80ms" }}
          >
            Your store.{" "}
            <span className="italic text-emerald-300">Your rules.</span>
          </h2>

          <p
            className="rf-fade-up mt-5 text-[15px] leading-relaxed text-emerald-100/70"
            style={{ animationDelay: "160ms" }}
          >
            Join thousands of merchants building commerce on their own terms.
            Launch in minutes, scale without limits.
          </p>

          {/* Benefit cards */}
          <div
            className="rf-fade-up mt-10 grid grid-cols-3 gap-3"
            style={{ animationDelay: "240ms" }}
          >
            <div className="rf-float rounded-xl border border-white/10 bg-white/[0.06] p-4 shadow-xl shadow-black/20 backdrop-blur-sm">
              <div className="mb-2 grid h-9 w-9 place-items-center rounded-lg bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-300/20">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <p className="text-lg font-bold tabular-nums">60s</p>
              <p className="text-[11px] uppercase tracking-wider text-emerald-200/70">
                Launch time
              </p>
            </div>

            <div
              className="rf-float rounded-xl border border-white/10 bg-white/[0.06] p-4 shadow-xl shadow-black/20 backdrop-blur-sm"
              style={{ animationDelay: "1.2s" }}
            >
              <div className="mb-2 grid h-9 w-9 place-items-center rounded-lg bg-amber-400/15 text-amber-300 ring-1 ring-amber-300/20">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-lg font-bold tabular-nums">0%</p>
              <p className="text-[11px] uppercase tracking-wider text-emerald-200/70">
                First $1k
              </p>
            </div>

            <div
              className="rf-float rounded-xl border border-white/10 bg-white/[0.06] p-4 shadow-xl shadow-black/20 backdrop-blur-sm"
              style={{ animationDelay: "2.4s" }}
            >
              <div className="mb-2 grid h-9 w-9 place-items-center rounded-lg bg-sky-400/15 text-sky-300 ring-1 ring-sky-300/20">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                </svg>
              </div>
              <p className="text-lg font-bold tabular-nums">24/7</p>
              <p className="text-[11px] uppercase tracking-wider text-emerald-200/70">
                Support
              </p>
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div
          className="rf-fade-up relative z-10 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm"
          style={{ animationDelay: "320ms" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <span className="h-8 w-8 rounded-full bg-amber-400 ring-2 ring-[#0b2b26]" />
              <span className="h-8 w-8 rounded-full bg-emerald-400 ring-2 ring-[#0b2b26]" />
              <span className="h-8 w-8 rounded-full bg-sky-400 ring-2 ring-[#0b2b26]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Join 10,000+ merchants</p>
              <div className="mt-0.5 flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-amber-300">
                    <path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" />
                  </svg>
                ))}
                <span className="ml-1.5 text-xs text-emerald-100/60">4.9/5 avg rating</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= RIGHT — FORM ================= */}
      <main className="relative flex flex-1 flex-col items-center justify-center px-4 py-6 sm:px-8 sm:py-10">
        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute right-[-10%] top-[-15%] h-[420px] w-[420px] rounded-full bg-emerald-200/40 blur-[110px]" />
          <div className="absolute bottom-[-18%] left-[-8%] h-[380px] w-[380px] rounded-full bg-amber-200/40 blur-[110px]" />
        </div>

        {/* Mobile-only brand */}
        <div className="rf-fade-up relative z-10 mb-6 flex items-center gap-2.5 lg:hidden">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-md shadow-emerald-900/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
          </span>
          <span className="font-['Fraunces',serif] text-xl font-semibold tracking-tight text-stone-900">
            ShopStack
          </span>
        </div>

        <div className="rf-fade-up relative z-10 w-full max-w-md" style={{ animationDelay: "100ms" }}>
          <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-[0_24px_60px_-24px_rgba(6,35,31,0.28)] sm:p-9">
            {/* Card header */}
            <div className="mb-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-700 ring-1 ring-amber-600/15">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                New merchant
              </span>

              <h1 className="mt-3 font-['Fraunces',serif] text-2xl font-semibold tracking-tight text-stone-900 sm:text-[1.9rem]">
                Join ShopStack
              </h1>
              <p className="mt-1 text-sm text-stone-500">
                Create your account in under 60 seconds
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* ---------- FULL NAME ---------- */}
              <div>
                <label htmlFor="name" className="mb-1.5 block text-[13px] font-semibold text-stone-700">
                  Full Name
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400 transition-colors peer-focus:text-emerald-600">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </span>

                  <input
                    id="name"
                    placeholder="John Doe"
                    {...register("name", {
                      required: "Name is required",
                    })}
                    className="peer w-full rounded-xl border border-stone-200 bg-stone-50/60 py-2.5 pl-11 pr-4 text-[15px] text-stone-900 placeholder-stone-400 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 sm:py-3"
                  />
                </div>

                {errors.name && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-[13px] font-medium text-rose-600">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* ---------- EMAIL ---------- */}
              <div>
                <label htmlFor="email" className="mb-1.5 block text-[13px] font-semibold text-stone-700">
                  Email
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
                    placeholder="john@gmail.com"
                    {...register("email", {
                      required: "Email is required",
                    })}
                    className="peer w-full rounded-xl border border-stone-200 bg-stone-50/60 py-2.5 pl-11 pr-4 text-[15px] text-stone-900 placeholder-stone-400 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 sm:py-3"
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

              {/* ---------- PASSWORD ---------- */}
              <div>
                <label htmlFor="password" className="mb-1.5 block text-[13px] font-semibold text-stone-700">
                  Password
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400 transition-colors peer-focus:text-emerald-600">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </span>

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Minimum 6 characters",
                      },
                    })}
                    className="peer w-full rounded-xl border border-stone-200 bg-stone-50/60 py-2.5 pl-11 pr-12 text-[15px] text-stone-900 placeholder-stone-400 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 sm:py-3"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-stone-400 transition hover:text-stone-600"
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-[13px] font-medium text-rose-600">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* ---------- CONFIRM PASSWORD ---------- */}
              <div>
                <label htmlFor="confirmPassword" className="mb-1.5 block text-[13px] font-semibold text-stone-700">
                  Confirm Password
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400 transition-colors peer-focus:text-emerald-600">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  </span>

                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    {...register("confirmPassword", {
                      validate: (value) => value === password || "Passwords do not match",
                    })}
                    className="peer w-full rounded-xl border border-stone-200 bg-stone-50/60 py-2.5 pl-11 pr-12 text-[15px] text-stone-900 placeholder-stone-400 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 sm:py-3"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-stone-400 transition hover:text-stone-600"
                  >
                    {showConfirmPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>

                {errors.confirmPassword && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-[13px] font-medium text-rose-600">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* ---------- ROLE SELECT ---------- */}
              <div>
                <label htmlFor="role" className="mb-1.5 block text-[13px] font-semibold text-stone-700">
                  Register As
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400 transition-colors peer-focus:text-emerald-600">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                  </span>

                  <select
                    id="role"
                    {...register("role")}
                    className="peer w-full appearance-none rounded-xl border border-stone-200 bg-stone-50/60 py-2.5 pl-11 pr-11 text-[15px] text-stone-900 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 sm:py-3"
                  >
                    <option value="CUSTOMER">Customer</option>
                    <option value="VENDOR">Vendor</option>
                  </select>

                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-stone-400 transition-colors peer-focus:text-emerald-600">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                    </svg>
                  </span>
                </div>

                <p className="mt-1.5 text-[12px] text-stone-400">
                  You can change your role later in account settings
                </p>
              </div>

              {/* ---------- SUBMIT ---------- */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="group w-full rounded-xl bg-emerald-800 py-3 text-[15px] font-semibold text-white shadow-lg shadow-emerald-800/25 transition-all duration-200 hover:bg-emerald-900 hover:shadow-xl hover:shadow-emerald-900/25 active:scale-[0.99]"
                >
                  <span className="flex items-center justify-center gap-2">
                    Create Account
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </span>
                </button>
              </div>

              {/* ---------- LOGIN LINK ---------- */}
              <div className="pt-2">
                <div className="mb-5 h-px w-full bg-stone-200" />
                <p className="text-center text-sm text-stone-600">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-emerald-700 transition hover:text-emerald-900 hover:underline"
                  >
                    Login
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Terms footer */}
          <p className="mt-4 text-center text-xs text-stone-400">
            By creating an account, you agree to our{" "}
            <a href="#" className="underline transition hover:text-stone-600">
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="underline transition hover:text-stone-600">
              Privacy Policy
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}