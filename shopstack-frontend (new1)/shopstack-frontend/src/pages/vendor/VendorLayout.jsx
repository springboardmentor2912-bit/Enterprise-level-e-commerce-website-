import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'

const tabs = [
  { to: '/vendor', label: 'Overview', end: true },
  { to: '/vendor/products', label: 'Products' },
  { to: '/vendor/products/new', label: 'Add Product' },
  { to: '/vendor/orders', label: 'Orders' },
  { to: '/vendor/commission', label: 'Earnings' },
]

export default function VendorLayout() {
  return (
    <div className="max-w-6xl mx-auto mt-8 px-2">
      <h1 className="text-2xl font-bold mb-4">Vendor Dashboard</h1>
      <div className="flex gap-1 border-b border-gray-200 mb-6">
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
