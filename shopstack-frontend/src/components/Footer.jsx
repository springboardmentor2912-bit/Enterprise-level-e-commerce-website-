import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Truck, CreditCard, Headphones, Send, Heart, Store } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 font-sans mt-auto">
      {/* Top Features Banner */}
      <div className="border-b border-slate-800/80 py-8 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-3 p-3">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Verified Vendors</h4>
                <p className="text-xs text-slate-400 mt-0.5">Strict quality & seller vetting</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-3 p-3">
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Secure Payments</h4>
                <p className="text-xs text-slate-400 mt-0.5">256-bit encrypted checkout</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-3 p-3">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Fast Delivery</h4>
                <p className="text-xs text-slate-400 mt-0.5">Insured global dispatch</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-3 p-3">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">24/7 Support</h4>
                <p className="text-xs text-slate-400 mt-0.5">Dedicated customer assistance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-tr from-indigo-500 to-purple-600 p-2 rounded-xl text-white shadow-lg">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <span className="font-bold text-2xl tracking-tight text-white">ShopStack</span>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                Enterprise
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              ShopStack is an enterprise multi-vendor e-commerce platform powering seamless buying, instant vendor catalog synchronization, and real-time inventory management.
            </p>

            <div className="flex items-center space-x-3 pt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                System Operational
              </span>
            </div>
          </div>

          {/* Catalog Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Quick Navigation</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/" className="hover:text-indigo-400 transition-colors">Home Page</Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-indigo-400 transition-colors">Product Catalog</Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-indigo-400 transition-colors">My Orders</Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-indigo-400 transition-colors">Wishlist</Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-indigo-400 transition-colors">Shopping Cart</Link>
              </li>
            </ul>
          </div>

          {/* Vendor Portal Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Vendor Marketplace</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/vendor/login" className="hover:text-purple-400 transition-colors">Vendor Login</Link>
              </li>
              <li>
                <Link to="/vendor/register" className="hover:text-purple-400 transition-colors">Become a Seller</Link>
              </li>
              <li>
                <Link to="/vendor/dashboard" className="hover:text-purple-400 transition-colors">Vendor Dashboard</Link>
              </li>
              <li>
                <Link to="/vendor/products" className="hover:text-purple-400 transition-colors">Inventory Manager</Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Stay Updated</h4>
            <p className="text-xs text-slate-400">Subscribe for exclusive vendor discounts and product releases.</p>
            <form onSubmit={(e) => e.preventDefault()} className="flex space-x-2">
              <input
                type="email"
                placeholder="Enter email..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800/80 py-6 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 text-xs">
          <p className="text-slate-400">
            &copy; {new Date().getFullYear()} ShopStack Enterprise Multi-Vendor E-Commerce Platform. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            <span className="text-slate-400">Powered by Spring Boot 3 & React</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
