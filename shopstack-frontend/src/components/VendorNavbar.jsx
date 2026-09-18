import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { vendorLogout } from '../store/slices/vendorAuthSlice';
import { LayoutDashboard, Package, ShoppingBag, LogOut, ArrowLeft, Menu, X } from 'lucide-react';

const VendorNavbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { vendor } = useSelector((state) => state.vendorAuth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleVendorLogout = () => {
    dispatch(vendorLogout());
    navigate('/vendor/login');
  };

  const navLinks = [
    { to: '/vendor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/vendor/products', label: 'My Inventory', icon: Package },
    { to: '/vendor/orders', label: 'Sales Orders', icon: ShoppingBag },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-slate-900 border-b border-purple-900/40 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand & Vendor Badge */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/vendor/dashboard')}>
            <div className="bg-gradient-to-tr from-purple-600 to-indigo-600 p-2 rounded-xl text-white shadow-lg">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-white">ShopStack</span>
              <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
                Vendor Hub
              </span>
            </div>
          </div>

          {/* Vendor Nav Links - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active ? 'bg-purple-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Vendor Business Badge & Customer Store Switch - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Customer Store</span>
            </button>

            <div className="px-3 py-1.5 bg-purple-950/60 rounded-full border border-purple-800 text-xs text-purple-300 font-semibold truncate max-w-[150px]">
              {vendor?.businessName || vendor?.email || 'Vendor'}
            </div>

            <button
              onClick={handleVendorLogout}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-xl text-xs font-medium transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center space-x-2">
            <div className="px-2 py-1 bg-purple-950/60 rounded-full border border-purple-800 text-xs text-purple-300 font-semibold truncate max-w-[100px]">
              {vendor?.businessName || 'Vendor'}
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900/95 px-4 pt-3 pb-4 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.to);
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => { setMobileMenuOpen(false); navigate('/'); }}
              className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Customer Store</span>
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); handleVendorLogout(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default VendorNavbar;
