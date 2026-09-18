import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { getErrorMessage } from '../api/errorUtils';
import { fetchCategories, fetchCatalogProducts, setFilters, resetFilters } from '../store/slices/productSlice';
import { setCartItems } from '../store/slices/cartSlice';
import { setWishlistItems } from '../store/slices/wishlistSlice';
import ProductCard from '../components/ProductCard';
import {
  Search,
  Filter,
  RefreshCw,
  ShoppingBag,
  SlidersHorizontal,
  Star,
  ChevronLeft,
  ChevronRight,
  X,
  Zap,
  Cpu,
  Shirt,
  Home,
  Sofa,
  Activity,
  BookOpen,
  Sparkles,
  Watch
} from 'lucide-react';

// Flipkart-style quick-filter category pills (matched against DB category names)
const QUICK_CATEGORIES = [
  { label: 'All', icon: ShoppingBag, color: 'indigo' },
  { label: 'Electronics', icon: Cpu, color: 'blue' },
  { label: 'Fashion', icon: Shirt, color: 'pink' },
  { label: 'Home & Kitchen', icon: Home, color: 'amber' },
  { label: 'Furniture', icon: Sofa, color: 'orange' },
  { label: 'Sports', icon: Activity, color: 'green' },
  { label: 'Books', icon: BookOpen, color: 'purple' },
  { label: 'Beauty', icon: Sparkles, color: 'rose' },
  { label: 'Accessories', icon: Watch, color: 'teal' },
];

const colorMap = {
  indigo: { active: 'bg-indigo-600 text-white border-indigo-500', inactive: 'bg-slate-900 text-slate-300 border-slate-700 hover:border-indigo-500/50 hover:text-indigo-300' },
  blue:   { active: 'bg-blue-600 text-white border-blue-500',     inactive: 'bg-slate-900 text-slate-300 border-slate-700 hover:border-blue-500/50 hover:text-blue-300' },
  pink:   { active: 'bg-pink-600 text-white border-pink-500',     inactive: 'bg-slate-900 text-slate-300 border-slate-700 hover:border-pink-500/50 hover:text-pink-300' },
  amber:  { active: 'bg-amber-600 text-white border-amber-500',   inactive: 'bg-slate-900 text-slate-300 border-slate-700 hover:border-amber-500/50 hover:text-amber-300' },
  orange: { active: 'bg-orange-600 text-white border-orange-500', inactive: 'bg-slate-900 text-slate-300 border-slate-700 hover:border-orange-500/50 hover:text-orange-300' },
  green:  { active: 'bg-emerald-600 text-white border-emerald-500', inactive: 'bg-slate-900 text-slate-300 border-slate-700 hover:border-emerald-500/50 hover:text-emerald-300' },
  purple: { active: 'bg-purple-600 text-white border-purple-500', inactive: 'bg-slate-900 text-slate-300 border-slate-700 hover:border-purple-500/50 hover:text-purple-300' },
  rose:   { active: 'bg-rose-600 text-white border-rose-500',     inactive: 'bg-slate-900 text-slate-300 border-slate-700 hover:border-rose-500/50 hover:text-rose-300' },
  teal:   { active: 'bg-teal-600 text-white border-teal-500',     inactive: 'bg-slate-900 text-slate-300 border-slate-700 hover:border-teal-500/50 hover:text-teal-300' },
};

const ProductCatalogPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { isAuthenticated } = useSelector((state) => state.auth);
  const { products, categories, loading, categoryLoading, categoryError, pagination, filters } = useSelector((state) => state.products);
  const { items: wishlistItems } = useSelector((state) => state.wishlist);

  const [searchTerm, setSearchTerm] = useState(filters.search || searchParams.get('search') || '');
  const [selectedCat, setSelectedCat] = useState(filters.categoryId || searchParams.get('category') || '');
  const [brandFilter, setBrandFilter] = useState(filters.brand || '');
  const [minPrice, setMinPrice] = useState(filters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice || '');
  const [ratingFilter, setRatingFilter] = useState(filters.rating || '');
  const [sortBy, setSortBy] = useState(filters.sort || searchParams.get('sort') || 'newest');
  const [currentPage, setCurrentPage] = useState(0);
  const [activeQuickCat, setActiveQuickCat] = useState('All');

  const [toastMessage, setToastMessage] = useState('');

  // Helper to find category object by ID or Name
  const findCategory = (identifier, catList = categories) => {
    if (!identifier || !catList || catList.length === 0) return null;
    const target = String(identifier).trim().toLowerCase();

    // Exact ID match
    let found = catList.find((c) => String(c.id) === target);
    if (found) return found;

    // Exact Name match
    found = catList.find((c) => c.name.toLowerCase() === target);
    if (found) return found;

    // Partial/Fuzzy Name match (e.g. "Home" matching "Home & Kitchen")
    found = catList.find(
      (c) => c.name.toLowerCase().includes(target) || target.includes(c.name.toLowerCase())
    );
    return found || null;
  };

  // Initial category fetch
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Sync parameters with URL & DB categories
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    const urlSort = searchParams.get('sort');
    const urlSearch = searchParams.get('search');

    if (urlSort) setSortBy(urlSort);
    if (urlSearch !== null) setSearchTerm(urlSearch);

    let effectiveCatId = '';
    let effectiveCatName = 'All';

    const targetCatIdentifier = urlCategory || selectedCat;
    if (targetCatIdentifier) {
      const catObj = findCategory(targetCatIdentifier, categories);
      if (catObj) {
        effectiveCatId = String(catObj.id);
        effectiveCatName = catObj.name;
      } else if (!isNaN(targetCatIdentifier)) {
        effectiveCatId = String(targetCatIdentifier);
      } else {
        effectiveCatName = targetCatIdentifier;
      }
    }

    setSelectedCat(effectiveCatId);
    setActiveQuickCat(effectiveCatName);

    loadProducts(
      effectiveCatId,
      brandFilter,
      urlSearch !== null ? urlSearch : searchTerm,
      minPrice,
      maxPrice,
      ratingFilter,
      urlSort || sortBy,
      currentPage
    );
  }, [categories, searchParams, currentPage]);

  const loadProducts = (cat, brand, search, minP, maxP, rating, sort, page) => {
    const params = {
      page: page,
      size: 12,
      sort: sort || 'newest'
    };
    if (cat) params.categoryId = cat;
    if (brand) params.brand = brand;
    if (search) params.search = search;
    if (minP) params.minPrice = minP;
    if (maxP) params.maxPrice = maxP;
    if (rating) params.rating = rating;

    dispatch(fetchCatalogProducts(params));
  };

  const updateQueryParams = (newParams) => {
    const current = Object.fromEntries(searchParams.entries());
    const updated = { ...current, ...newParams };
    Object.keys(updated).forEach((k) => {
      if (!updated[k]) delete updated[k];
    });
    setSearchParams(updated);
  };

  // Handle quick category pill click
  const handleQuickCatClick = (catLabel) => {
    setCurrentPage(0);

    if (catLabel === 'All') {
      setSelectedCat('');
      setActiveQuickCat('All');
      updateQueryParams({ category: '', page: 0 });
      loadProducts('', brandFilter, searchTerm, minPrice, maxPrice, ratingFilter, sortBy, 0);
    } else {
      const matched = findCategory(catLabel, categories);
      if (matched) {
        const catIdStr = String(matched.id);
        setSelectedCat(catIdStr);
        setActiveQuickCat(matched.name);
        updateQueryParams({ category: catIdStr, page: 0 });
        loadProducts(catIdStr, brandFilter, searchTerm, minPrice, maxPrice, ratingFilter, sortBy, 0);
      } else {
        // Fallback search by category label
        setSelectedCat('');
        setActiveQuickCat(catLabel);
        updateQueryParams({ category: '', search: catLabel, page: 0 });
        loadProducts('', brandFilter, catLabel, minPrice, maxPrice, ratingFilter, sortBy, 0);
      }
    }
  };

  const handleCategorySelectChange = (e) => {
    const val = e.target.value;
    setSelectedCat(val);
    setCurrentPage(0);
    if (!val) {
      setActiveQuickCat('All');
      updateQueryParams({ category: '', page: 0 });
      loadProducts('', brandFilter, searchTerm, minPrice, maxPrice, ratingFilter, sortBy, 0);
    } else {
      const matched = findCategory(val, categories);
      setActiveQuickCat(matched ? matched.name : 'All');
      updateQueryParams({ category: val, page: 0 });
      loadProducts(val, brandFilter, searchTerm, minPrice, maxPrice, ratingFilter, sortBy, 0);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    updateQueryParams({ search: searchTerm, page: 0 });
    loadProducts(selectedCat, brandFilter, searchTerm, minPrice, maxPrice, ratingFilter, sortBy, 0);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCat('');
    setBrandFilter('');
    setMinPrice('');
    setMaxPrice('');
    setRatingFilter('');
    setSortBy('newest');
    setCurrentPage(0);
    setActiveQuickCat('All');
    setSearchParams({});
    dispatch(resetFilters());
    loadProducts('', '', '', '', '', '', 'newest', 0);
  };

  const handleAddToCart = async (productId) => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    try {
      await axiosClient.post('/cart', { productId, quantity: 1 });
      const cartRes = await axiosClient.get('/cart');
      dispatch(setCartItems(cartRes.data));
      showToast('Product added to cart!');
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to add item to cart.'));
    }
  };

  const handleAddToWishlist = async (productId) => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    try {
      await axiosClient.post(`/wishlist/${productId}`);
      const wishRes = await axiosClient.get('/wishlist');
      dispatch(setWishlistItems(wishRes.data));
      showToast('Saved to your wishlist!');
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to save to wishlist.'));
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const wishlistedIds = new Set(wishlistItems.map((item) => item.product?.id));

  // Extract unique brands from current products list for brand filter
  const uniqueBrands = Array.from(new Set(products.map((p) => p.brand).filter(Boolean)));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl font-medium text-sm flex items-center space-x-2 animate-bounce">
            <ShoppingBag className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Hero Catalog Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-10 rounded-3xl border border-indigo-500/20 shadow-2xl">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold border border-indigo-500/30">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Multi-Vendor Product Catalog</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Explore Enterprise <span className="text-indigo-400">Products</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Filter by category, brand, price, or rating. All items feature real-time inventory and verified vendors.
            </p>
          </div>
        </div>

        {/* Flipkart-style Quick Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {QUICK_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeQuickCat === cat.label;
            const colors = colorMap[cat.color];
            return (
              <button
                key={cat.label}
                onClick={() => handleQuickCatClick(cat.label)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer flex-shrink-0 ${
                  isActive ? colors.active : colors.inactive
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Advanced Filters & Search */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-xl space-y-4">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
              {/* Search Bar */}
              <div className="lg:col-span-4 relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search title, brand, or keywords..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Category Filter Dropdown */}
              <div className="lg:col-span-3">
                <select
                  value={selectedCat}
                  onChange={handleCategorySelectChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  disabled={categoryLoading}
                >
                  <option value="">{categoryLoading ? 'Loading categories...' : 'All Categories'}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {categoryError && (
                  <p className="text-xs text-rose-400 mt-1">⚠ {categoryError}</p>
                )}
              </div>

              {/* Brand Filter */}
              <div className="lg:col-span-2">
                <select
                  value={brandFilter}
                  onChange={(e) => {
                    if (!isAuthenticated) {
                      navigate('/auth');
                      return;
                    }
                    setBrandFilter(e.target.value);
                    setCurrentPage(0);
                    loadProducts(selectedCat, e.target.value, searchTerm, minPrice, maxPrice, ratingFilter, sortBy, 0);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">All Brands</option>
                  {uniqueBrands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div className="lg:col-span-3">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    if (!isAuthenticated) {
                      navigate('/auth');
                      return;
                    }
                    setSortBy(e.target.value);
                    setCurrentPage(0);
                    loadProducts(selectedCat, brandFilter, searchTerm, minPrice, maxPrice, ratingFilter, e.target.value, 0);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="newest">Sort: Newest Arrivals</option>
                  <option value="price_asc">Sort: Price (Low → High)</option>
                  <option value="price_desc">Sort: Price (High → Low)</option>
                  <option value="rating_desc">Sort: Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Price & Rating Sub-filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-12 gap-3 pt-2 border-t border-slate-800/80 items-center">
              <div className="lg:col-span-3 flex items-center space-x-2">
                <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Price ₹:</span>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <span className="text-slate-500">-</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Rating Filter */}
              <div className="lg:col-span-3">
                <select
                  value={ratingFilter}
                  onChange={(e) => {
                    if (!isAuthenticated) {
                      navigate('/auth');
                      return;
                    }
                    setRatingFilter(e.target.value);
                    setCurrentPage(0);
                    loadProducts(selectedCat, brandFilter, searchTerm, minPrice, maxPrice, e.target.value, sortBy, 0);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Rating: Any</option>
                  <option value="4.5">4.5+ Stars ★★★★½</option>
                  <option value="4.0">4.0+ Stars ★★★★☆</option>
                  <option value="3.5">3.5+ Stars ★★★½☆</option>
                </select>
              </div>

              {/* Submit & Reset Buttons */}
              <div className="lg:col-span-6 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer flex items-center space-x-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>

                <button
                  type="submit"
                  className="flex items-center space-x-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer transition-all"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Apply Filters</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Product Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <ShoppingBag className="w-5 h-5 mr-2 text-indigo-400" />
              {activeQuickCat !== 'All' ? `${activeQuickCat} Products` : 'All Products'}
              <span className="ml-2 text-sm font-normal text-slate-400">
                ({pagination.totalElements || products.length} found)
              </span>
            </h2>

            <button
              onClick={() => {
                if (!isAuthenticated) {
                  navigate('/auth');
                  return;
                }
                loadProducts(selectedCat, brandFilter, searchTerm, minPrice, maxPrice, ratingFilter, sortBy, currentPage);
              }}
              className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-slate-300 transition-all cursor-pointer"
              title="Refresh Products"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Skeleton Loaders */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-2xl h-80 animate-pulse p-5 space-y-4">
                  <div className="h-44 bg-slate-800/80 rounded-xl"></div>
                  <div className="h-4 bg-slate-800/80 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-800/80 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-16 text-center space-y-4">
              <ShoppingBag className="w-14 h-14 text-slate-600 mx-auto" />
              <h3 className="text-xl font-bold text-white">No products found</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                No items match your selected filters. Try clearing search terms or selecting a different category.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-500 transition-all cursor-pointer inline-block"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onAddToWishlist={handleAddToWishlist}
                  isWishlisted={wishlistedIds.has(product.id)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center space-x-3 pt-10">
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/auth');
                    return;
                  }
                  setCurrentPage((prev) => Math.max(prev - 1, 0));
                }}
                disabled={currentPage === 0}
                className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-all"
                title="Previous Page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <span className="text-xs font-semibold text-slate-400">
                Page <span className="text-white font-bold">{currentPage + 1}</span> of <span className="text-white font-bold">{pagination.totalPages}</span>
              </span>

              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/auth');
                    return;
                  }
                  setCurrentPage((prev) => Math.min(prev + 1, pagination.totalPages - 1));
                }}
                disabled={currentPage >= pagination.totalPages - 1}
                className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-all"
                title="Next Page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCatalogPage;
