import React from 'react'

export default function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
      <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-3" />
      <span>{label}</span>
    </div>
  )
}
