import React from 'react'
import { Link } from 'react-router-dom'
import StarRating from './StarRating'

export default function ProductCard({ product }) {
  const price = product.discountPrice ?? product.price
  const hasDiscount = product.discountPrice != null && product.discountPrice < product.price

  return (
    <Link
      to={`/products/${product.id}`}
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
    >
      <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-300 text-sm">No image</span>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1">
        <span className="text-xs text-gray-400 uppercase tracking-wide">{product.vendorName}</span>
        <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
        <StarRating rating={product.averageRating} count={product.reviewCount} />
        <div className="flex items-center gap-2 mt-1">
          <span className="font-semibold">₹{price}</span>
          {hasDiscount && <span className="text-xs text-gray-400 line-through">₹{product.price}</span>}
        </div>
        {product.availableStock === 0 && (
          <span className="text-xs text-red-500 font-medium">Out of stock</span>
        )}
      </div>
    </Link>
  )
}
