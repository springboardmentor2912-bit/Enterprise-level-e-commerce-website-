import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../api/axiosClient';
import { getErrorMessage } from '../api/errorUtils';
import {
  fetchCategories,
  fetchFeaturedProducts,
  fetchNewArrivals,
  fetchBestSellers,
} from '../store/slices/productSlice';

import { setCartItems } from '../store/slices/cartSlice';
import { setWishlistItems } from '../store/slices/wishlistSlice';

import ProductCard from '../components/ProductCard';

import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Award,
  Zap,
  ShieldCheck,
  Truck,
  Headphones,
  ArrowRight,
  Store,
  ShoppingBag,
} from 'lucide-react';

const HERO_SLIDES = [
  {
    id: 1,
    title: 'Enterprise Multi-Vendor Marketplace',
    subtitle:
      'Discover top-tier electronics, fashion, home decor, and lifestyle goods directly from verified vendors worldwide.',
    tag: 'Next-Gen Commerce',
    ctaText: 'Explore Catalog',
    ctaLink: '/products',
    badge: 'Verified Sellers',
    bgGradient: 'from-indigo-950 via-slate-900 to-purple-950',
    image:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80',
  },
  {
    id: 2,
    title: 'Smart Real-Time Stock & Instant Checkout',
    subtitle:
      'Shop with full transparency. Automated inventory tracking ensures products are available and dispatched without delay.',
    tag: 'Automated Inventory',
    ctaText: 'Shop New Arrivals',
    ctaLink: '/products?sort=newest',
    badge: 'Fast Delivery',
    bgGradient: 'from-purple-950 via-slate-900 to-indigo-950',
    image:
      'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1000&auto=format&fit=crop&q=80',
  },
  {
    id: 3,
    title: 'Verified Vendor Quality Guarantee',
    subtitle:
      'All vendor products undergo strict quality checks with secure payment protection and reliable delivery.',
    tag: 'Guaranteed Quality',
    ctaText: 'Browse Best Sellers',
    ctaLink: '/products?sort=rating_desc',
    badge: '24/7 Support',
    bgGradient: 'from-slate-900 via-indigo-950 to-slate-900',
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&auto=format&fit=crop&q=80',
  },
];

const FALLBACK_CATEGORY_IMAGE =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80';

const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated } = useSelector((state) => state.auth);

  const {
    categories = [],
    featuredProducts = [],
    newArrivals = [],
    bestSellers = [],
  } = useSelector((state) => state.products);

  const { items: wishlistItems = [] } = useSelector(
    (state) => state.wishlist
  );

  // Navigate to catalog path
  const navigateToCatalog = (path = '/products') => {
    navigate(path);
  };

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        return (prev + 1) % HERO_SLIDES.length;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused]);

  
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchFeaturedProducts());
    dispatch(fetchNewArrivals());
    dispatch(fetchBestSellers());
  }, [dispatch]);

  
  const wishlistedIds = new Set(
    wishlistItems
      .map((item) => item?.product?.id || item?.productId || item?.id)
      .filter(Boolean)
  );

  
  const showToast = (message) => {
    setToastMessage(message);

    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  };

  
  const handleNextSlide = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setCurrentSlide((prev) => {
      const next = prev + 1;

      return next >= HERO_SLIDES.length ? 0 : next;
    });
  };

  
  const handlePreviousSlide = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setCurrentSlide((prev) => {
      return prev === 0 ? HERO_SLIDES.length - 1 : prev - 1;
    });
  };

  
  const handleSelectSlide = (index) => {
    setCurrentSlide(index);
  };

  
  const handleAddToCart = async (productId) => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    try {
      await axiosClient.post('/cart', {
        productId,
        quantity: 1,
      });

      const cartRes = await axiosClient.get('/cart');

      dispatch(setCartItems(cartRes.data));

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

  const currentHero = HERO_SLIDES[currentSlide];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[100] max-w-sm">
          <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-slate-900 px-5 py-4 text-sm text-white shadow-2xl">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      
      <section
        className="relative mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className={`
            relative
            min-h-[460px]
            overflow-hidden
            rounded-3xl
            border
            border-indigo-500/20
            bg-gradient-to-r
            ${currentHero.bgGradient}
            shadow-2xl
            transition-all
            duration-700
            sm:min-h-[500px]
          `}
        >
          {/* HERO CONTENT */}
          <div className="relative z-10 grid min-h-[460px] w-full grid-cols-1 items-center gap-8 p-8 sm:p-12 lg:grid-cols-12 lg:p-14">
            {/* TEXT */}
            <div className="space-y-6 lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/20 px-3.5 py-1 text-xs font-semibold text-indigo-300">
                <Sparkles className="h-3.5 w-3.5" />

                <span>{currentHero.tag}</span>
              </div>

              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
                {currentHero.title}
              </h1>

              <p className="max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
                {currentHero.subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => navigateToCatalog(currentHero.ctaLink)}
                  className="flex cursor-pointer items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-indigo-500 hover:shadow-indigo-500/25 active:scale-95"
                >
                  <span>{currentHero.ctaText}</span>

                  <ArrowRight className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-xs text-slate-300">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />

                  <span>{currentHero.badge}</span>
                </div>
              </div>
            </div>

            {/* IMAGE */}
            <div className="hidden lg:col-span-5 lg:block">
              <div className="group relative h-80 overflow-hidden rounded-2xl border border-slate-700/60 shadow-2xl">
                <img
                  src={currentHero.image}
                  alt={currentHero.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_CATEGORY_IMAGE;
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
              </div>
            </div>
          </div>

          {/* ==================================================
              PREVIOUS BUTTON
          ================================================== */}
          <button
            type="button" onClick={handlePreviousSlide} aria-label="Previous slide" title="Previous Slide"
            className=" absolute left-4 top-1/2 z-50 flex h-11 w-11-translate-y-1/2 cursor-pointer items-center justify-center rounded-full border  border-slate-700
              bg-slate-900/90 text-white shadow-xl backdrop-blur-md transition-all duration-300
              hover:scale-110
              hover:bg-indigo-600
              hover:shadow-indigo-500/30
              active:scale-95
              sm:h-12
              sm:w-12
            "
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          
          <button
            type="button"
            onClick={handleNextSlide}
            aria-label="Next slide"
            title="Next Slide"
            className="
              absolute
              right-4
              top-1/2
              z-50
              flex
              h-11
              w-11
              -translate-y-1/2
              cursor-pointer
              items-center
              justify-center
              rounded-full
              border
              border-slate-700
              bg-slate-900/90
              text-white
              shadow-xl
              backdrop-blur-md
              transition-all
              duration-300
              hover:scale-110
              hover:bg-indigo-600
              hover:shadow-indigo-500/30
              active:scale-95
              sm:h-12
              sm:w-12
            "
          >
            <ChevronRight className="h-5 w-5" />
          </button>

        
          <div className="absolute bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2">
            {HERO_SLIDES.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => handleSelectSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`
                  h-2.5
                  cursor-pointer
                  rounded-full
                  transition-all
                  duration-300
                  ${currentSlide === index
                    ? 'w-8 bg-indigo-500'
                    : 'w-2.5 bg-slate-600/80 hover:bg-slate-400'
                  }
                `}
              />
            ))}
          </div>
        </div>
      </section>

     
      <section className="mx-auto max-w-7xl space-y-6 px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Explore Marketplaces
            </span>

            <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
              Featured Categories
            </h2>
          </div>

          <button
            type="button"
            onClick={() => navigateToCatalog('/products')}
            className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-indigo-400 transition-colors hover:text-indigo-300 sm:text-sm"
          >
            <span>View All</span>

            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {categories.slice(0, 8).map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigateToCatalog(`/products?category=${cat.id}`)}
              className="group flex cursor-pointer flex-col items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/90 p-4 text-center shadow-md transition-all duration-300 hover:scale-105 hover:border-indigo-500/50"
            >
              <div className="mb-3 h-14 w-14 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
                <img
                  src={cat.imageUrl || FALLBACK_CATEGORY_IMAGE}
                  alt={cat.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_CATEGORY_IMAGE;
                  }}
                />
              </div>

              <h3 className="line-clamp-1 text-xs font-bold text-white group-hover:text-indigo-300">
                {cat.name}
              </h3>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================
          FEATURED PRODUCTS
      ================================================== */}
      <section className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-400" />

            <h2 className="text-xl font-bold text-white sm:text-2xl">
              Featured Products
            </h2>
          </div>

          <button
            type="button"
            onClick={() => navigateToCatalog('/products')}
            className="text-xs font-medium text-indigo-400 hover:text-indigo-300 cursor-pointer"
          >
            Explore Catalog →
          </button>
        </div>

        {featuredProducts.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-400">
            No featured products available.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.slice(0, 4).map((product) => (
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
      </section>

      {/* ==================================================
          BEST SELLERS
      ================================================== */}
      <section className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-400" />

            <h2 className="text-xl font-bold text-white sm:text-2xl">
              Best Sellers
            </h2>
          </div>

          <button
            type="button"
            onClick={() => navigateToCatalog('/products?sort=rating_desc')}
            className="text-xs font-medium text-amber-400 hover:text-amber-300 cursor-pointer"
          >
            View Top Rated →
          </button>
        </div>

        {bestSellers.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-400">
            No best-selling products available.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {bestSellers.slice(0, 4).map((product) => (
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
      </section>

      {/* ==================================================
          NEW ARRIVALS
      ================================================== */}
      <section className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-400" />

            <h2 className="text-xl font-bold text-white sm:text-2xl">
              New Arrivals
            </h2>
          </div>

          <button
            type="button"
            onClick={() => navigateToCatalog('/products?sort=newest')}
            className="text-xs font-medium text-purple-400 hover:text-purple-300 cursor-pointer"
          >
            View Newest →
          </button>
        </div>

        {newArrivals.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-400">
            No new arrivals available.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {newArrivals.slice(0, 4).map((product) => (
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
      </section>

      
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8 rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 shadow-2xl sm:p-12">
          <div className="mx-auto max-w-2xl space-y-2 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Enterprise Standard
            </span>

            <h2 className="text-2xl font-extrabold text-white sm:text-4xl">
              Why ShopStack?
            </h2>

            <p className="text-xs text-slate-300 sm:text-sm">
              We empower buyers and multi-vendor sellers with transparent
              inventory management, secure payments, and reliable delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* VERIFIED VENDORS */}
            <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 transition-all hover:border-indigo-500/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/20 text-indigo-400">
                <Store className="h-6 w-6" />
              </div>

              <h3 className="text-lg font-bold text-white">
                Verified Vendors
              </h3>

              <p className="text-xs leading-relaxed text-slate-400">
                All vendors undergo strict verification to ensure product
                quality, seller authenticity, and fast fulfillment.
              </p>
            </div>

            {/* SECURE PAYMENTS */}
            <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 transition-all hover:border-purple-500/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/20 text-purple-400">
                <ShieldCheck className="h-6 w-6" />
              </div>

              <h3 className="text-lg font-bold text-white">
                Secure Payments
              </h3>

              <p className="text-xs leading-relaxed text-slate-400">
                Secure checkout and JWT authentication help protect your
                account and shopping information.
              </p>
            </div>

            {/* FAST DELIVERY */}
            <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 transition-all hover:border-blue-500/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/20 text-blue-400">
                <Truck className="h-6 w-6" />
              </div>

              <h3 className="text-lg font-bold text-white">
                Fast Delivery
              </h3>

              <p className="text-xs leading-relaxed text-slate-400">
                Direct dispatch from verified vendor hubs helps ensure your
                package is delivered safely and on schedule.
              </p>
            </div>

            {/* SUPPORT */}
            <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 transition-all hover:border-emerald-500/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/20 text-emerald-400">
                <Headphones className="h-6 w-6" />
              </div>

              <h3 className="text-lg font-bold text-white">
                24/7 Support
              </h3>

              <p className="text-xs leading-relaxed text-slate-400">
                Our support team is available to answer your questions and
                assist with order tracking.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;