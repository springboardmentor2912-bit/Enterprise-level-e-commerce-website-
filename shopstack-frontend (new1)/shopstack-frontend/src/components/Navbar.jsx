import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../features/auth/authSlice'
import { clearCartState } from '../features/cart/cartSlice'

export default function Navbar() {
  const { user } = useSelector((state) => state.auth)
  const { totalItems } = useSelector((state) => state.cart)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    dispatch(clearCartState())
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="text-xl font-bold text-brand-600">ShopStack</Link>

        <div className="flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="hover:text-brand-600">Browse</Link>

          {user && (
            <>
              <Link to="/wishlist" className="hover:text-brand-600">Wishlist</Link>
              <Link to="/cart" className="relative hover:text-brand-600">
                Cart
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-3 bg-brand-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
              <Link to="/orders" className="hover:text-brand-600">Orders</Link>
            </>
          )}

          {user?.role === 'VENDOR' && (
            <Link to="/vendor" className="hover:text-brand-600">Vendor Dashboard</Link>
          )}
          {user?.role === 'ADMIN' && (
            <Link to="/admin" className="hover:text-brand-600">Admin</Link>
          )}
          {(user?.role === 'WAREHOUSE_STAFF' || user?.role === 'ADMIN') && (
            <Link to="/warehouse" className="hover:text-brand-600">Warehouse</Link>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="text-gray-500 hover:text-brand-600">{user.fullName}</Link>
              <button onClick={handleLogout} className="text-red-600 hover:text-red-700">Logout</button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="hover:text-brand-600">Login</Link>
              <Link to="/register" className="bg-brand-600 text-white px-4 py-1.5 rounded-md hover:bg-brand-700">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
