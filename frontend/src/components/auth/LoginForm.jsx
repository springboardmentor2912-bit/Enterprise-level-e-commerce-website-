import { useState } from "react"; // UI-only: password visibility toggle
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";

import {
  loginStart,
  loginSuccess,
  loginFailure,
} from "../../redux/authSlice";

import { login } from "../../api/authApi";

export default function LoginForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false); // UI-only

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    dispatch(loginStart());

    try {
      const response = await login(data);
      console.log(response.data);

      dispatch(loginSuccess(response.data));

      const role = response.data.role;

      if (role === "ADMIN") {
        navigate("/admin");
      } else if (role === "VENDOR") {
        navigate("/vendor");
      } else if (role === "CUSTOMER") {
        console.log("Go Customer");
        navigate("/");
      } else if (role === "WAREHOUSE_STAFF") {
        // 🆕 ADD THIS LINE
        console.log("Go Warehouse Staff");
        navigate("/warehouse");
      } else {
        navigate("/profile");
      }
    } catch (error) {
      dispatch(loginFailure("Invalid Credentials"));
      alert(error.response?.data?.message || "Invalid Credentials");
    }
  };

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-[#f7f5f1] font-['Manrope',sans-serif]">
      {/* Scoped UI animations only — no logic */}
      <style>{`
        @keyframes lf-fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes lf-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes lf-ping-soft { 0% { transform: scale(1); opacity: .7; } 70%, 100% { transform: scale(2.4); opacity: 0; } }
        .lf-fade-up { animation: lf-fade-up .6s cubic-bezier(.22, 1, .36, 1) both; }
        .lf-float { animation: lf-float 6s ease-in-out infinite; }
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
        <div className="lf-fade-up relative z-10 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-950/50">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5.5 w-5.5 h-6 w-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
          </span>
          <span className="font-['Fraunces',serif] text-2xl font-semibold tracking-tight">
            ShopStack
          </span>
        </div>

        {/* Headline + live stats */}
        <div className="relative z-10 max-w-lg">
          <p className="lf-fade-up mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-200/90">
            <span className="relative flex h-2 w-2">
              <span
                className="absolute inline-flex h-full w-full rounded-full bg-emerald-400"
                style={{ animation: "lf-ping-soft 2s cubic-bezier(0, 0, .2, 1) infinite" }}
              />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Commerce Platform
          </p>

          <h2
            className="lf-fade-up font-['Fraunces',serif] text-4xl font-semibold leading-[1.12] tracking-tight xl:text-[2.9rem]"
            style={{ animationDelay: "80ms" }}
          >
            Every order, every vendor —{" "}
            <span className="italic text-amber-300">one stack.</span>
          </h2>

          <p
            className="lf-fade-up mt-5 text-[15px] leading-relaxed text-emerald-100/70"
            style={{ animationDelay: "160ms" }}
          >
            Manage storefronts, vendors and payouts from a single command
            center built to scale with you.
          </p>

          {/* Floating stat cards */}
          <div className="lf-fade-up mt-10 flex gap-4" style={{ animationDelay: "240ms" }}>
            <div className="lf-float w-40 rounded-xl border border-white/10 bg-white/[0.06] p-4 shadow-xl shadow-black/20 backdrop-blur-sm">
              <p className="text-[11px] uppercase tracking-wider text-emerald-200/70">
                Orders today
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums">2,431</p>
              <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-emerald-300">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
                +18.2%
              </p>
            </div>

            <div
              className="lf-float w-44 rounded-xl border border-white/10 bg-white/[0.06] p-4 shadow-xl shadow-black/20 backdrop-blur-sm"
              style={{ animationDelay: "1.4s" }}
            >
              <p className="text-[11px] uppercase tracking-wider text-emerald-200/70">
                Active vendors
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums">318</p>
              <div className="mt-2 flex items-center">
                <div className="flex -space-x-1.5">
                  <span className="h-5 w-5 rounded-full bg-amber-400 ring-2 ring-[#0b2b26]" />
                  <span className="h-5 w-5 rounded-full bg-emerald-400 ring-2 ring-[#0b2b26]" />
                  <span className="h-5 w-5 rounded-full bg-sky-400 ring-2 ring-[#0b2b26]" />
                  <span className="h-5 w-5 rounded-full bg-rose-400 ring-2 ring-[#0b2b26]" />
                </div>
                <span className="ml-2 text-xs text-emerald-100/60">+314</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature strip */}
        <div
          className="lf-fade-up relative z-10 flex flex-wrap items-center gap-x-8 gap-y-4"
          style={{ animationDelay: "320ms" }}
        >
          <div className="flex items-center gap-2.5 text-sm font-medium text-emerald-100/75">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/[0.06] text-emerald-300 ring-1 ring-white/10">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </span>
            Multi-vendor ready
          </div>

          <div className="flex items-center gap-2.5 text-sm font-medium text-emerald-100/75">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/[0.06] text-emerald-300 ring-1 ring-white/10">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </span>
            Bank-grade security
          </div>

          <div className="flex items-center gap-2.5 text-sm font-medium text-emerald-100/75">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/[0.06] text-emerald-300 ring-1 ring-white/10">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </span>
            Realtime inventory
          </div>
        </div>
      </aside>

      {/* ================= RIGHT — FORM ================= */}
      <main className="relative flex flex-1 flex-col items-center justify-center px-5 py-10 sm:px-8">
        {/* Soft ambient background */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute right-[-10%] top-[-15%] h-[420px] w-[420px] rounded-full bg-emerald-200/40 blur-[110px]" />
          <div className="absolute bottom-[-18%] left-[-8%] h-[380px] w-[380px] rounded-full bg-amber-200/40 blur-[110px]" />
        </div>

        {/* Mobile-only brand (left panel is hidden below lg) */}
        <div className="lf-fade-up relative z-10 mb-8 flex items-center gap-2.5 lg:hidden">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-md shadow-emerald-900/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4.5 w-4.5 h-5 w-5 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
          </span>
          <span className="font-['Fraunces',serif] text-xl font-semibold tracking-tight text-stone-900">
            ShopStack
          </span>
        </div>

        <div className="lf-fade-up relative z-10 w-full max-w-md" style={{ animationDelay: "100ms" }}>
          <div className="rounded-2xl border border-stone-200/80 bg-white p-7 shadow-[0_24px_60px_-24px_rgba(6,35,31,0.28)] sm:p-9">
            {/* Card header */}
            <div className="mb-8">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-700 ring-1 ring-emerald-600/15">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                Secure sign-in
              </span>

              <h1 className="mt-4 font-['Fraunces',serif] text-[1.9rem] font-semibold tracking-tight text-stone-900">
                Welcome back
              </h1>
              <p className="mt-1.5 text-sm text-stone-500">
                Sign in to your account
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                    placeholder="Enter your email"
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
                    placeholder="Enter your password"
                    {...register("password", {
                      required: "Password is required",
                    })}
                    className="peer w-full rounded-xl border border-stone-200 bg-stone-50/60 py-3 pl-11 pr-12 text-[15px] text-stone-900 placeholder-stone-400 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
                  />

                  {/* UI-only toggle */}
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

              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-[13px] font-semibold text-emerald-700 transition hover:text-emerald-900 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* ---------- SUBMIT ---------- */}
              <button
                type="submit"
                className="group w-full rounded-xl bg-emerald-800 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-emerald-800/25 transition-all duration-200 hover:bg-emerald-900 hover:shadow-xl hover:shadow-emerald-900/25 active:scale-[0.99]"
              >
                <span className="flex items-center justify-center gap-2">
                  Login
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </button>

              {/* ---------- REGISTER ---------- */}
              <div className="pt-2">
                <div className="mb-5 h-px w-full bg-stone-200" />
                <p className="text-center text-sm text-stone-600">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="font-semibold text-emerald-700 transition hover:text-emerald-900 hover:underline"
                  >
                    Register
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Trust footer */}
          <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-stone-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            Protected by 256-bit SSL encryption
          </p>
        </div>
      </main>
    </div>
  );
}