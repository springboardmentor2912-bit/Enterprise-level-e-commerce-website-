import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { wishlistApi } from '../api/wishlistApi'
import { cartApi } from '../api/cartApi'
import { useDispatch } from 'react-redux'
import { setCart } from '../features/cart/cartSlice'
import LoadingSpinner from '../components/LoadingSpinner'
import StarRating from '../components/StarRating'

export default function WishlistPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()

  const load = () => {
    setLoading(true)
    wishlistApi.get().then(({ data }) => setItems(data.data)).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const remove = async (productId) => {
    await wishlistApi.remove(productId)
    setItems((prev) => prev.filter((i) => i.product.id !== productId))
  }

  const moveToCart = async (productId) => {
    const { data } = await cartApi.addItem({ productId, quantity: 1 })
    dispatch(setCart(data.data))
    remove(productId)
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-4xl mx-auto mt-8 px-2">
      <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
      {items.length === 0 ? (
        <p className="text-gray-400">Your wishlist is empty. <Link to="/" className="text-brand-600">Browse products</Link></p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map(({ id, product }) => (
            <div key={id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                {product.images?.[0] && <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1">
                <Link to={`/products/${product.id}`} className="font-medium hover:text-brand-600">{product.name}</Link>
                <StarRating rating={product.averageRating} count={product.reviewCount} />
                <p className="text-sm font-semibold mt-1">₹{product.discountPrice ?? product.price}</p>
              </div>
              <button onClick={() => moveToCart(product.id)} className="bg-brand-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-brand-700">
                Move to cart
              </button>
              <button onClick={() => remove(product.id)} className="text-red-500 hover:text-red-700 text-sm">Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
