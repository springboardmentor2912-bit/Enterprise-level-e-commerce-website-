import React, { useEffect, useState } from 'react'
import { productApi } from '../api/productApi'
import ProductCard from '../components/ProductCard'
import LoadingSpinner from '../components/LoadingSpinner'

export default function ProductBrowsePage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [keyword, setKeyword] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    productApi.getCategories().then(({ data }) => setCategories(data.data)).catch(() => {})
  }, [])

  const fetchProducts = async (pageNum = 0) => {
    setLoading(true)
    try {
      const params = { page: pageNum, size: 12 }
      if (keyword) params.keyword = keyword
      if (categoryId) params.categoryId = categoryId
      if (minPrice) params.minPrice = minPrice
      if (maxPrice) params.maxPrice = maxPrice

      const { data } = await productApi.browse(params)
      setProducts(data.data.content)
      setTotalPages(data.data.totalPages)
      setPage(pageNum)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProducts(0) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterSubmit = (e) => {
    e.preventDefault()
    fetchProducts(0)
  }

  return (
    <div className="max-w-7xl mx-auto mt-6 px-2">
      <form onSubmit={handleFilterSubmit} className="bg-white p-4 rounded-lg border border-gray-200 flex flex-wrap gap-3 mb-6 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs text-gray-500">Search</label>
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search products..."
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-500">Category</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
            className="mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option value="">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500">Min price</label>
          <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
            className="mt-1 w-24 border border-gray-300 rounded-md px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-500">Max price</label>
          <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
            className="mt-1 w-24 border border-gray-300 rounded-md px-3 py-2 text-sm" />
        </div>
        <button className="bg-brand-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-brand-700">
          Apply filters
        </button>
      </form>

      {loading ? (
        <LoadingSpinner />
      ) : products.length === 0 ? (
        <p className="text-center text-gray-400 py-16">No products found. Try adjusting your filters.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => fetchProducts(i)}
                  className={`w-8 h-8 rounded-md text-sm ${i === page ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
