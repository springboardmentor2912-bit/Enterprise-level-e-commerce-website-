import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'

const tabs = [
  { to: '/admin', label: 'Analytics', end: true },
  { to: '/admin/vendors', label: 'Pending Vendors' },
  { to: '/admin/products', label: 'Pending Products' },
  { to: '/admin/returns', label: 'Returns' },
  { to: '/admin/coupons', label: 'Coupons' },
  { to: '/admin/reports', label: 'Reports' },
]

export default function AdminLayout() {
  return (
    <div className="max-w-6xl mx-auto mt-8 px-2">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="flex gap-1 border-b border-gray-200 mb-6 flex-wrap">
        {tabs.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.end}
            className={({ isActive }) =>
              `px-4 py-2 text-sm font-medium border-b-2 ${isActive ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`
            }>
            {t.label}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  )
}
