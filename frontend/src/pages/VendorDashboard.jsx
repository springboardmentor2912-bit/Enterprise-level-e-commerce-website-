import React from "react";
import { useNavigate } from "react-router-dom";

function VendorDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const tiles = [
    {
      title: "Add Product",
      description: "List a new item in your storefront",
      onClick: () => navigate("/addproduct"),
      primary: true,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      title: "My Products",
      description: "View and manage your listings",
      onClick: () => navigate("/myproducts"),
      icon: (
        <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      title: "View All Products",
      description: "See the full marketplace catalog",
      onClick: () => navigate("/products"),
      icon: (
        <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
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
        {/* Decorative Background Accent */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-slate-100/60 pointer-events-none blur-3xl" />

        <div className="max-w-6xl mx-auto px-6 py-10 relative z-10">
          <span className="inline-block text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3">
            Vendor Account
          </span>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-serif font-bold text-slate-900">
                Vendor Dashboard
              </h1>
              <p className="text-slate-500 mt-2 max-w-xl">
                Add new products, monitor stock levels, and manage your storefront.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/addproduct")}
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition shadow-sm"
              >
                + Add Product
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

      {/* Overview Stat Cards */}
      <div className="max-w-6xl mx-auto px-6 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold uppercase text-slate-400">Inventory</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded">Active</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">Store Management</p>
            <p className="text-xs text-slate-500 mt-1">Keep stock quantities updated</p>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold uppercase text-slate-400">Store Status</span>
              <span className="text-xs bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded">Live</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">Marketplace</p>
            <p className="text-xs text-slate-500 mt-1">Visible to all customer traffic</p>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold uppercase text-slate-400">Account Type</span>
              <span className="text-xs bg-stone-100 text-slate-600 font-medium px-2 py-0.5 rounded">Vendor</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">Verified Merchant</p>
            <p className="text-xs text-slate-500 mt-1">Full access to product tools</p>
          </div>
        </div>
      </div>

      {/* Action Tiles */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Vendor Tools
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
          ShopStack · Vendor Management Portal
        </div>
      </div>
    </div>
  );
}

export default VendorDashboard;