import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const AdminNavbar = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Corrected routes mapped to standard administrative subpaths
  const links = [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'Vendors', path: '/admin/vendor' },
    { name: 'Orders', path: '/admin/order' },
    { name: 'Commissions', path: '/admin/commission' },
    { name: 'System', path: '/admin/system' },
    { name: 'Reports', path: '/admin/report' },
    {name: 'Coupons', path: '/admin/coupons'},
    {name: 'WareHouses' ,path: '/admin/warehouses'},
    {name: 'Fulfillment',path: '/admin/fulfillment'},
    {name: 'Staff', path: '/admin/warehouse-staff'},
    {name: 'Returns',path: '/admin/returns'}
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.dispatchEvent(new Event('authChange'));
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* BRAND LOGO & NAME */}
        <button
          type="button"
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-2.5 text-left text-xl font-serif font-bold tracking-tight text-slate-900 focus:outline-none cursor-pointer group"
        >
          <div className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-sans text-base font-extrabold shadow-2xs transition-transform group-hover:scale-105">
            S
          </div>
          <div className="flex items-center gap-2">
            <span className="tracking-tight text-slate-900 font-extrabold">
              Shop<span className="text-emerald-700">Stack</span>
            </span>
            <span className="bg-amber-100 text-amber-800 text-2xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wide border border-amber-200/80">
              Admin
            </span>
          </div>
        </button>

        {/* DESKTOP NAVIGATION LINKS */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-xl transition ${
                  isActive
                    ? 'bg-stone-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-stone-50'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* LOGOUT & MOBILE TOGGLE */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-stone-200 text-slate-700 hover:bg-stone-50 active:bg-stone-100 transition cursor-pointer shadow-2xs"
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>

          {/* MOBILE MENU TOGGLE BUTTON */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-stone-100 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

      </div>

      {/* MOBILE NAVIGATION MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-stone-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-stone-50'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleLogout();
            }}
            className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition mt-2 border-t border-stone-100"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default AdminNavbar;