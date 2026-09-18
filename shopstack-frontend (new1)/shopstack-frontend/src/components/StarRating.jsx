import React from 'react'

export default function StarRating({ rating = 0, count }) {
  const rounded = Math.round(rating)
  return (
    <div className="flex items-center gap-1 text-amber-500 text-sm">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n}>{n <= rounded ? '★' : '☆'}</span>
      ))}
      {typeof count === 'number' && <span className="text-gray-400 ml-1">({count})</span>}
    </div>
  )
}
