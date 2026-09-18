import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { productApi } from '../api/productApi'
import { cartApi } from '../api/cartApi'
import { wishlistApi } from '../api/wishlistApi'
import { setCart } from '../features/cart/cartSlice'
import StarRating from '../components/StarRating'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBanner from '../components/ErrorBanner'

export default function ProductDetailPage() {
  const { id } = useParams()
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [{ data: prodData }, { data: reviewData }] = await Promise.all([
        productApi.getOne(id),
        productApi.getReviews(id, { page: 0, size: 10 }),
      ])
      setProduct(prodData.data)
      setReviews(reviewData.data.content)
    } catch (err) {
      console.error('Failed to load product:', err)
      setError(err.response?.data?.message || 'Could not load this product.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const addToCart = async () => {
    setError(''); setMessage('')
    try {
      const { data } = await cartApi.addItem({ productId: Number(id), quantity: 1 })
      dispatch(setCart(data.data))
      setMessage('Added to cart')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add to cart')
    }
  }

  const addToWishlist = async () => {
    setError(''); setMessage('')
    try {
      await wishlistApi.add(id)
      setMessage('Added to wishlist')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add to wishlist')
    }
  }

  const submitReview = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await productApi.addReview(id, reviewForm)
      setReviewForm({ rating: 5, comment: '' })
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit review')
    }
  }

  if (loading) return <LoadingSpinner />
  if (!product) return <p className="text-center py-16 text-gray-400">Product not found.</p>

  const price = product.discountPrice ?? product.price

  return (
    <div className="max-w-5xl mx-auto mt-8 px-2">
      <ErrorBanner message={error} />
      {message && <p className="text-green-600 text-sm mb-4">{message}</p>}

      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          ) : <span className="text-gray-300">No image</span>}
        </div>

        <div>
          <span className="text-xs text-gray-400 uppercase">{product.vendorName} · {product.categoryName}</span>
          <h1 className="text-2xl font-bold mt-1">{product.name}</h1>
          <div className="mt-2"><StarRating rating={product.averageRating} count={product.reviewCount} /></div>
          <div className="flex items-center gap-3 mt-4">
            <span className="text-2xl font-bold">₹{price}</span>
            {product.discountPrice != null && <span className="text-gray-400 line-through">₹{product.price}</span>}
          </div>
          <p className="text-gray-600 mt-4 whitespace-pre-line">{product.description}</p>

          <div className="mt-4 text-sm">
            {product.availableStock > 0 ? (
              <span className="text-green-600">In stock ({product.availableStock} available)</span>
            ) : (
              <span className="text-red-500">Out of stock</span>
            )}
          </div>

          {user && (
            <div className="flex gap-3 mt-6">
              <button onClick={addToCart} disabled={product.availableStock === 0}
                className="bg-brand-600 text-white rounded-md px-6 py-2.5 font-medium hover:bg-brand-700 disabled:opacity-50">
                Add to cart
              </button>
              <button onClick={addToWishlist}
                className="border border-gray-300 rounded-md px-6 py-2.5 font-medium hover:bg-gray-50">
                ♡ Wishlist
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-lg font-semibold mb-4">Reviews ({product.reviewCount})</h2>

        {user && (
          <form onSubmit={submitReview} className="bg-white border border-gray-200 rounded-lg p-4 mb-6 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Your rating</label>
              <select value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm">
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <textarea value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              placeholder="Share your thoughts about this product..."
              className="border border-gray-300 rounded-md px-3 py-2 text-sm" rows={3} />
            <button className="self-start bg-brand-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-brand-700">
              Submit review
            </button>
          </form>
        )}

        <div className="flex flex-col gap-4">
          {reviews.length === 0 && <p className="text-gray-400 text-sm">No reviews yet.</p>}
          {reviews.map((r) => (
            <div key={r.id} className="border-b border-gray-100 pb-4">
              <StarRating rating={r.rating} />
              <p className="text-sm text-gray-600 mt-1">{r.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
