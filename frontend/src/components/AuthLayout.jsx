import React from "react";

const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-slate-50 to-stone-200 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white/95 backdrop-blur-md border border-stone-200 shadow-xl md:grid-cols-2">
        
        {/* Left Section - Hero Brand Panel */}
        <div className="hidden md:flex flex-col justify-between bg-slate-900 p-10 lg:p-12 text-white relative overflow-hidden">
          {/* Subtle Background Glow Accent */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-2.5 text-2xl font-serif font-bold tracking-tight">
              <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-sans text-lg font-extrabold shadow-sm">
                S
              </div>
              <span className="tracking-tight text-white font-extrabold">
                Shop<span className="text-emerald-400">Stack</span>
              </span>
            </div>

            <p className="mt-4 text-slate-300 font-medium text-base">
              Enterprise Multi-Vendor E-Commerce Platform
            </p>
          </div>

          {/* Key Feature Highlights */}
          <div className="space-y-6 my-auto pt-8">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">Multi-Vendor Marketplace</h4>
                <p className="text-xs text-slate-400 mt-0.5">Shop from independent vendors all in one unified checkout.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">Secure Authentication</h4>
                <p className="text-xs text-slate-400 mt-0.5">Role-based access control powered by JWT authorization.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">Real-time Performance</h4>
                <p className="text-xs text-slate-400 mt-0.5">Instant cart synchronization & streamlined store navigation.</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} ShopStack Inc. All rights reserved.
          </p>
        </div>

        {/* Right Section - Auth Form Container */}
        <div className="flex items-center justify-center p-6 sm:p-10 lg:p-12 bg-white">
          <div className="w-full max-w-sm">
            {/* Mobile-only logo */}
            <div className="flex md:hidden items-center gap-2 text-xl font-bold text-slate-900 mb-6">
              <div className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-sm font-extrabold">
                S
              </div>
              <span>Shop<span className="text-emerald-700">Stack</span></span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {title}
            </h2>

            <p className="mt-2 mb-6 text-sm text-slate-600">
              {subtitle}
            </p>

            {children}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthLayout;