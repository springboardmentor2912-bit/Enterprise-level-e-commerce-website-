import React from "react";
import { useNavigate } from "react-router-dom";

function CustomerDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const tiles = [
    {
      title: "Browse Products",
      description: "Explore the full marketplace catalog",
      onClick: () => navigate("/products"),
      primary: true,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      title: "Wishlist",
      description: "Items you've saved for later",
      onClick: () => navigate("/wishlist"),
      icon: (
        <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      title: "My Cart",
      description: "Review items ready for checkout",
      onClick: () => navigate("/cart"),
      icon: (
        <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
      ),
    },
    {
      title: "Order History",
      description: "Track past and current orders",
      onClick: () => navigate("/orders"),
      icon: (
        <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      title: "My Profile",
      description: "View your account details",
      onClick: () => navigate("/profile"),
      icon: (
        <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      title: "Edit Profile",
      description: "Update your name and password",
      onClick: () => navigate("/editprofile"),
      icon: (
        <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header Banner */}
      <div className="relative overflow-hidden border-b border-stone-200 bg-white">
        {/* Subtle Decorative Background Graphic */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-slate-100/60 pointer-events-none blur-3xl" />
        
        <div className="max-w-6xl mx-auto px-6 py-10 relative z-10">
          <span className="inline-block text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3">
            Customer Account
          </span>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-serif font-bold text-slate-900">
                Welcome back
              </h1>
              <p className="text-slate-500 mt-2 max-w-xl">
                Browse products from vendors across the marketplace, track your orders, and manage your account.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/products")}
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition shadow-sm"
              >
                Browse Products
              </button>
              <button
                onClick={handleLogout}
                className="border border-stone-300 text-slate-600 hover:bg-stone-100 px-6 py-2.5 rounded-lg text-sm font-medium transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Insights Bar */}
      <div className="max-w-6xl mx-auto px-6 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-stone-100 rounded-lg text-slate-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Active Deals</p>
              <p className="text-lg font-bold text-slate-800">Fresh Drops Available</p>
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-stone-100 rounded-lg text-slate-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Orders</p>
              <p className="text-lg font-bold text-slate-800">Track Packages</p>
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-stone-100 rounded-lg text-slate-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Buyer Protection</p>
              <p className="text-lg font-bold text-slate-800">Verified Marketplace</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Tiles */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Quick Actions
        </h2>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tiles.map((tile) => (
            <div
              key={tile.title}
              onClick={tile.onClick}
              className={`group cursor-pointer rounded-xl p-6 border transition-all duration-200 hover:shadow-md ${
                tile.primary
                  ? "bg-slate-900 border-slate-900 text-white hover:bg-slate-800"
                  : "bg-white border-stone-200 text-slate-900 hover:border-stone-300"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-lg ${tile.primary ? "bg-slate-800 text-white" : "bg-stone-100"}`}>
                  {tile.icon}
                </div>
                <svg className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${tile.primary ? "text-slate-400" : "text-slate-300"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="text-base font-semibold">{tile.title}</h3>
              <p className={`text-sm mt-1 ${tile.primary ? "text-slate-300" : "text-slate-500"}`}>
                {tile.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center text-xs text-slate-400">
          ShopStack · Customer Portal
        </div>
      </div>
    </div>
  );
}

export default CustomerDashboard;