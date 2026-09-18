import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { cartApi } from '../api/cartApi'
import { setCart } from '../features/cart/cartSlice'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBanner from '../components/ErrorBanner'

export default function CartPage() {
  const cart = useSelector((state) => state.cart)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    cartApi.get()
      .then(({ data }) => dispatch(setCart(data.data)))
      .finally(() => setLoading(false))
  }

  useEffect(load, []) // eslint-disable-line react-hooks/exhaustive-deps

  const updateQty = async (productId, quantity) => {
    setError('')
    try {
      const { data } = await cartApi.updateItem(productId, quantity)
      dispatch(setCart(data.data))
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update quantity')
    }
  }

  const removeItem = async (productId) => {
    const { data } = await cartApi.removeItem(productId)
    dispatch(setCart(data.data))
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-4xl mx-auto mt-8 px-2">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
      <ErrorBanner message={error} />

      {cart.items.length === 0 ? (
        <p className="text-gray-400">Your cart is empty. <Link to="/" className="text-brand-600">Continue shopping</Link></p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 flex flex-col gap-3">
            {cart.items.map((item) => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                  {item.productImage && <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-sm text-gray-500">₹{item.unitPrice} each</p>
                  {item.availableStock < item.quantity && (
                    <p className="text-xs text-red-500">Only {item.availableStock} left in stock</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQty(item.productId, Math.max(1, item.quantity - 1))}
                    className="w-7 h-7 border border-gray-300 rounded-md">−</button>
                  <span className="w-6 text-center">{item.quantity}</span>
                  <button onClick={() => updateQty(item.productId, item.quantity + 1)}
                    className="w-7 h-7 border border-gray-300 rounded-md">+</button>
                </div>
                <p className="w-20 text-right font-semibold">₹{item.lineTotal}</p>
                <button onClick={() => removeItem(item.productId)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5 h-fit">
            <h2 className="font-semibold mb-4">Order Summary</h2>
            <div className="flex justify-between text-sm mb-2">
              <span>Subtotal ({cart.totalItems} items)</span>
              <span>₹{cart.subtotal}</span>
            </div>
            <div className="flex justify-between font-semibold border-t border-gray-100 pt-3 mt-3">
              <span>Total</span>
              <span>₹{cart.subtotal}</span>
            </div>
            <button onClick={() => navigate('/checkout')}
              className="w-full mt-5 bg-brand-600 text-white rounded-md py-2.5 font-medium hover:bg-brand-700">
              Proceed to checkout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
