import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { 
  Search, User, ChevronDown, ShoppingCart, Heart, MapPin, 
  Package, LogOut, X, Trash2, Plus, Minus, Sun, Moon, Star, 
  MessageSquare, ShieldAlert, Store, ShoppingBag, Send, Truck, Check, Bell,
  CreditCard, QrCode, Smartphone, CheckCircle2, ArrowRight, ShieldCheck, Lock,
  ExternalLink, Maximize2, Zap, Eye, Camera, UploadCloud, Image
} from 'lucide-react';
import ProductIcon from './ProductIcon';
import NotificationCenter from './NotificationCenter';
import { extractErrorMessage } from '../utils/errorHandler';
import { formatImageUrl } from '../utils/imageHelper';
import { 
  generateCustomerNotifications, 
  generateAdminNotifications,
  generateWarehouseNotifications,
  generateVendorNotifications,
  markNotifAsRead, 
  markAllNotifsAsRead, 
  clearAllNotifs, 
  dismissNotif 
} from '../utils/notificationService';

export default function HomeDashboard({ 
  user, cart, setCart, orders, setOrders, onLogout, 
  onGoToProfile, onGoToVendor, onGoToAdmin, onGoToWarehouse, theme, onToggleTheme,
  wishlist, setWishlist, toggleWishlist, addToCart, fetchOrders,
  isCartOpen, setIsCartOpen
}) {
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'ADMINISTRATOR' || user?.email?.endsWith('@admin');
  const isStaff = user?.role === 'WAREHOUSE_STAFF' || user?.role === 'STAFF' || user?.email?.endsWith('@staff');
  const isVendor = user?.role === 'VENDOR' || user?.role === 'SELLER';
  const isStaffOrAdmin = isAdmin || isStaff;
  const [showDropdown, setShowDropdown] = useState(false);
  const userMenuRef = useRef(null);

  // Close profile dropdown when clicking or tapping outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [showDropdown]);

  const [products, setProducts] = useState([]);
  const [showCartModal, setShowCartModal] = useState(isCartOpen || false);

  useEffect(() => {
    if (isCartOpen !== undefined) {
      setShowCartModal(isCartOpen);
    }
  }, [isCartOpen]);

  const handleCloseCartModal = () => {
    setShowCartModal(false);
    if (setIsCartOpen) setIsCartOpen(false);
  };

  const handleOpenCartModal = () => {
    setShowCartModal(true);
    if (setIsCartOpen) setIsCartOpen(true);
  };

  const [showOrdersModal, setShowOrdersModal] = useState(false);

  // Checkout & Payment Modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Coupon State variables
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [vendorCoupons, setVendorCoupons] = useState([]);
  const [couponApprovals, setCouponApprovals] = useState([]);
  const [couponMappings, setCouponMappings] = useState([]);
  const [paymentStep, setPaymentStep] = useState(1); // 1: Review & Address, 2: Payment Method, 3: Processing, 4: Confirmed
  const [deliveryInfo, setDeliveryInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' | 'cod'
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showCustomAddressInput, setShowCustomAddressInput] = useState(false);
  const [selectedCartItemIds, setSelectedCartItemIds] = useState([]);
  const [checkoutMode, setCheckoutMode] = useState('cart'); // 'cart' | 'buynow'
  const [buyNowItem, setBuyNowItem] = useState(null);

  // Auto-select valid in-stock items in cart initially or when items/products change
  useEffect(() => {
    if (Array.isArray(cart)) {
      const inStockIds = cart.filter(item => {
        const liveProd = products.find(p => p.id === item.id);
        const stock = liveProd != null ? liveProd.stock : (item.stock ?? 0);
        return stock > 0;
      }).map(i => i.id);

      setSelectedCartItemIds(prev => {
        if (prev.length === 0 && inStockIds.length > 0) return inStockIds;
        const validPrev = prev.filter(id => inStockIds.includes(id));
        const newIds = inStockIds.filter(id => !prev.includes(id));
        const merged = Array.from(new Set([...validPrev, ...newIds]));
        return merged;
      });
    }
  }, [cart, products]);

  const inStockCartItems = (Array.isArray(cart) ? cart : []).filter(item => {
    const liveProd = products.find(p => p.id === item.id);
    const stock = liveProd != null ? liveProd.stock : (item.stock ?? 0);
    return stock > 0;
  });

  const isAllSelected = inStockCartItems.length > 0 && inStockCartItems.every(i => selectedCartItemIds.includes(i.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedCartItemIds([]);
    } else {
      setSelectedCartItemIds(inStockCartItems.map(i => i.id));
    }
  };

  const toggleSelectItem = (productId) => {
    const liveProd = products.find(p => p.id === productId);
    const itemInCart = (Array.isArray(cart) ? cart : []).find(i => i.id === productId);
    const stock = liveProd != null ? liveProd.stock : (itemInCart?.stock ?? 0);
    
    if (stock <= 0) {
      showFlash('error', "This product is currently out of stock and cannot be selected for purchase.");
      return;
    }

    setSelectedCartItemIds(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const selectedCartItems = (Array.isArray(cart) ? cart : []).filter(item => selectedCartItemIds.includes(item.id));
  const activeCheckoutItems = (checkoutMode === 'buynow' && buyNowItem) ? [buyNowItem] : selectedCartItems;

  // Fetch saved addresses
  const fetchSavedAddresses = async () => {
    if (!user?.id) return;
    try {
      const res = await axios.get(`http://localhost:8080/api/customer/${user.id}/addresses`);
      if (Array.isArray(res.data)) {
        setSavedAddresses(res.data);
      }
    } catch (e) {
      console.error("Could not fetch addresses", e);
    }
  };

  useEffect(() => {
    fetchSavedAddresses();
  }, [user?.id]);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [maxPriceFilter, setMaxPriceFilter] = useState('');
  const [minRatingFilter, setMinRatingFilter] = useState(0);

  // Product reviews & details modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productReviews, setProductReviews] = useState([]);
  const [vendorDetails, setVendorDetails] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewImage, setReviewImage] = useState('');
  const [isUploadingReviewImg, setIsUploadingReviewImg] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editReviewForm, setEditReviewForm] = useState({ rating: 5, comment: '' });
  const [editReviewImage, setEditReviewImage] = useState('');
  const [isUploadingEditReviewImg, setIsUploadingEditReviewImg] = useState(false);
  const [reviewLightboxImg, setReviewLightboxImg] = useState(null);

  // Lightbox keyboard navigation (Left/Right arrow keys & Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showLightbox || !selectedProduct) return;
      
      const allImgs = [];
      if (selectedProduct.imageUrl && selectedProduct.imageUrl !== '📦') {
        const formatted = formatImageUrl(selectedProduct.imageUrl);
        if (formatted) allImgs.push(formatted);
      }
      if (selectedProduct.images && selectedProduct.images.length > 0) {
        selectedProduct.images.forEach(img => {
          const formatted = formatImageUrl(img);
          if (formatted && !allImgs.includes(formatted)) allImgs.push(formatted);
        });
      }
      if (allImgs.length === 0) allImgs.push(formatImageUrl(selectedProduct.imageUrl) || '📦');

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setActiveImageIndex(prev => (prev - 1 + allImgs.length) % allImgs.length);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setActiveImageIndex(prev => (prev + 1) % allImgs.length);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowLightbox(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLightbox, selectedProduct]);
  
  // Toast notifications
  const [flash, setFlash] = useState({ type: '', text: '' });

  const showFlash = (type, text) => {
    let msg = text;
    if (typeof text === 'object' && text !== null) {
      msg = extractErrorMessage(text);
    }
    setFlash({ type, text: msg });
    setTimeout(() => setFlash({ type: '', text: '' }), 3500);
  };

  // Role-specific metrics for notification engine
  const [pendingProductsCount, setPendingProductsCount] = useState(0);
  const [adminPlatformOrdersCount, setAdminPlatformOrdersCount] = useState(0);
  const [adminVendorsCount, setAdminVendorsCount] = useState(0);
  const [warehouseAllocationsCount, setWarehouseAllocationsCount] = useState(0);
  const [vendorOrders, setVendorOrders] = useState([]);
  const [vendorProducts, setVendorProducts] = useState([]);

  const fetchRoleNotificationData = async () => {
    if (!user) return;
    try {
      if (isAdmin) {
        const [pendingRes, ordersRes, vendorsRes] = await Promise.allSettled([
          axios.get('http://localhost:8080/api/products/pending'),
          axios.get('http://localhost:8080/api/customer/orders/all'),
          axios.get('http://localhost:8080/api/admin/vendors')
        ]);
        if (pendingRes.status === 'fulfilled' && Array.isArray(pendingRes.value.data)) {
          setPendingProductsCount(pendingRes.value.data.length);
        }
        if (ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value.data)) {
          setAdminPlatformOrdersCount(ordersRes.value.data.length);
        }
        if (vendorsRes.status === 'fulfilled' && Array.isArray(vendorsRes.value.data)) {
          setAdminVendorsCount(vendorsRes.value.data.length);
        }
      } else if (isStaff) {
        const res = await axios.get('http://localhost:8080/api/warehouses/allocations');
        if (Array.isArray(res.data)) {
          const pending = res.data.filter(a => a.status === 'ALLOCATED' || a.status === 'PICKING' || a.status === 'PACKING');
          setWarehouseAllocationsCount(pending.length);
        }
      } else if (isVendor && user.id) {
        const [ordersRes, prodsRes, couponsRes] = await Promise.allSettled([
          axios.get(`http://localhost:8080/api/vendor/${user.id}/orders`),
          axios.get(`http://localhost:8080/api/products/vendor/${user.id}`),
          axios.get(`http://localhost:8080/api/coupons/vendor/${user.id}`)
        ]);
        if (ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value.data)) {
          setVendorOrders(ordersRes.value.data);
        }
        if (prodsRes.status === 'fulfilled' && Array.isArray(prodsRes.value.data)) {
          setVendorProducts(prodsRes.value.data);
        }
        if (couponsRes.status === 'fulfilled' && Array.isArray(couponsRes.value.data)) {
          setVendorCoupons(couponsRes.value.data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch role notification data", err);
    }
  };

  // Dynamic Notifications State
  const [notificationList, setNotificationList] = useState([]);

  const refreshNotifications = () => {
    let list = [];
    if (isAdmin) {
      list = generateAdminNotifications({
        user,
        pendingProductsCount,
        ordersCount: adminPlatformOrdersCount,
        vendorsCount: adminVendorsCount,
        onGoToTab: (tab) => {
          if (onGoToAdmin) onGoToAdmin(tab);
        }
      });
    } else if (isStaff) {
      list = generateWarehouseNotifications({
        user,
        pendingAllocationsCount: warehouseAllocationsCount,
        onGoToQueue: (tab, subTab) => {
          if (onGoToWarehouse) onGoToWarehouse(tab, subTab);
        }
      });
    } else if (isVendor) {
      list = generateVendorNotifications({
        user,
        products: vendorProducts,
        orders: vendorOrders,
        purchaseOrders: orders, // Personal customer orders placed by vendor
        coupons: vendorCoupons,
        onGoToTab: (tab) => {
          if (onGoToVendor) onGoToVendor(tab);
        },
        onOpenPurchaseOrder: () => {
          setShowOrdersModal(true);
        }
      });
    } else {
      list = generateCustomerNotifications({
        user,
        orders,
        coupons: availableCoupons,
        onOpenOrders: () => {
          setShowOrdersModal(true);
        },
        onShopNow: (coupon) => {
          if (coupon && coupon.code) {
            setCouponCodeInput(coupon.code);
          }
        }
      });
    }
    setNotificationList(list);
  };

  useEffect(() => {
    fetchAvailableCoupons();
  }, []);

  useEffect(() => {
    refreshNotifications();
  }, [
    user, 
    orders, 
    pendingProductsCount, 
    adminPlatformOrdersCount, 
    adminVendorsCount, 
    warehouseAllocationsCount, 
    vendorOrders, 
    vendorProducts, 
    availableCoupons,
    vendorCoupons,
    isAdmin, 
    isStaff, 
    isVendor
  ]);

  const handleMarkNotifAsRead = (id) => {
    markNotifAsRead(id, user?.id || user?.email);
    refreshNotifications();
  };

  const handleMarkAllNotifsAsRead = () => {
    markAllNotifsAsRead(notificationList.map(n => n.id), user?.id || user?.email);
    refreshNotifications();
  };

  const handleClearAllNotifs = () => {
    clearAllNotifs(user?.id || user?.email, notificationList.map(n => n.id));
    refreshNotifications();
  };

  const handleDismissNotif = (id) => {
    dismissNotif(id, user?.id || user?.email);
    refreshNotifications();
  };

  useEffect(() => {
    fetchProducts();
    if (user) {
      fetchRoleNotificationData();
      const interval = setInterval(fetchRoleNotificationData, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.id, isAdmin, isStaff, isVendor]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/products');
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to load products", err);
    }
  };

  // Local cart adjustments
  const updateCartQuantity = (productId, amount, maxStock) => {
    const cartItems = Array.isArray(cart) ? cart : [];
    const existing = cartItems.find(item => item.id === productId);
    if (!existing) return;
    
    const newQty = existing.quantity + amount;
    if (newQty <= 0) {
      removeFromCart(productId);
    } else if (newQty > maxStock) {
      showFlash('error', `Only ${maxStock} items available in inventory.`);
    } else {
      setCart(cartItems.map(item => 
        item.id === productId ? { ...item, quantity: newQty } : item
      ));
    }
  };

  const removeFromCart = (productId) => {
    const cartItems = Array.isArray(cart) ? cart : [];
    setCart(cartItems.filter(item => item.id !== productId));
    showFlash('success', "Item removed from cart.");
  };

  // Pricing & Discount calculations
  const calculateOriginalSubtotal = (items = activeCheckoutItems) => {
    return (items || []).reduce((sum, item) => {
      const orig = Number(item?.originalPrice) || Number(item?.price) || 0;
      const qty = Number(item?.quantity) || 1;
      return sum + (orig * qty);
    }, 0);
  };

  const calculateSubtotal = (items = activeCheckoutItems) => {
    return (items || []).reduce((sum, item) => {
      const pr = Number(item?.price) || 0;
      const qty = Number(item?.quantity) || 1;
      return sum + (pr * qty);
    }, 0);
  };

  const calculateDiscountSavings = (items = activeCheckoutItems) => {
    return Math.max(0, Math.round((calculateOriginalSubtotal(items) - calculateSubtotal(items)) * 100) / 100);
  };

  const calculateDeliveryFee = (items = activeCheckoutItems) => {
    const subtotal = calculateSubtotal(items);
    if (subtotal <= 0) return 0;
    return subtotal < 500 ? 99 : 0;
  };

  const calculateTotalSavings = (items = activeCheckoutItems) => {
    const discountSavings = calculateDiscountSavings(items);
    const deliverySavings = (calculateSubtotal(items) >= 500 && calculateSubtotal(items) > 0) ? 99 : 0;
    return discountSavings + deliverySavings;
  };

  const calculateTotal = (items = activeCheckoutItems) => {
    const subtotal = calculateSubtotal(items);
    if (subtotal <= 0) return 0;
    const discount = appliedCoupon ? Number(appliedCoupon.discountAmount) : 0;
    return Math.max(0, Math.round((subtotal + calculateDeliveryFee(items) - discount) * 100) / 100);
  };

  const handleApplyCoupon = async () => {
    if (!couponCodeInput.trim()) {
      setCouponError('Please enter a coupon code.');
      return;
    }
    setIsValidatingCoupon(true);
    setCouponError('');
    setCouponSuccess('');
    
    try {
      const payload = {
        code: couponCodeInput.trim().toUpperCase(),
        userId: user.id,
        items: activeCheckoutItems
      };
      
      const res = await axios.post('http://localhost:8080/api/coupons/validate', payload);
      if (res.data.valid) {
        setAppliedCoupon(res.data);
        setCouponSuccess(res.data.message);
        showFlash('success', 'Coupon applied successfully!');
      } else {
        setAppliedCoupon(null);
        setCouponError(res.data.message || 'Invalid coupon.');
      }
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err.response?.data?.message || err.response?.data || 'Failed to validate coupon.');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput('');
    setCouponError('');
    setCouponSuccess('');
    showFlash('info', 'Coupon removed.');
  };

  const fetchAvailableCoupons = async () => {
    try {
      const [res, appRes, mapRes] = await Promise.all([
        axios.get('http://localhost:8080/api/coupons'),
        axios.get('http://localhost:8080/api/coupons/approvals'),
        axios.get('http://localhost:8080/api/coupons/mappings')
      ]);
      const tzOffset = new Date().getTimezoneOffset() * 60000;
      const nowLocalDate = new Date(Date.now() - tzOffset).toISOString();
      const todayStr = nowLocalDate.substring(0, 10);
      const nowStr = nowLocalDate.substring(0, 16);
      const activeCoupons = res.data.filter(c => {
        const start = c.startDate ? c.startDate.substring(0, 16) : '';
        const expiry = c.expiryDate ? c.expiryDate.substring(0, 16) : '';
        const isStarted = !start || start <= nowStr || start.substring(0, 10) <= todayStr;
        const isNotExpired = !expiry || expiry >= nowStr || expiry.substring(0, 10) >= todayStr;
        return (
          c.active && 
          isStarted && 
          isNotExpired &&
          (!c.usageLimit || c.usageCount < c.usageLimit)
        );
      });
      setCouponApprovals(appRes.data || []);
      setCouponMappings(mapRes.data || []);
      setAvailableCoupons(activeCoupons);
    } catch (err) {
      console.error("Failed to fetch available coupons", err);
    }
  };

  const isCouponEligibleForCart = (coupon) => {
    const subtotal = calculateSubtotal(activeCheckoutItems);
    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      return false;
    }

    const approvalsArray = Array.isArray(couponApprovals) ? couponApprovals : (couponApprovals?.value || []);
    const mappingsArray = Array.isArray(couponMappings) ? couponMappings : (couponMappings?.value || []);

    const hasEligibleProduct = activeCheckoutItems.some(item => {
      const liveProd = products.find(p => String(p.id) === String(item.id));
      if (!liveProd) return false;
      if (liveProd.couponsEnabled === false) return false;
      if (liveProd.vendorId) {
        const approval = approvalsArray.find(a => 
          a && a.vendorId && String(a.vendorId) === String(liveProd.vendorId) && 
          a.couponCode && a.couponCode.trim().toUpperCase() === coupon.code.trim().toUpperCase()
        );
        if (!approval || approval.status !== 'APPROVED') return false;

        const mapping = mappingsArray.find(m => 
          m && String(m.productId) === String(liveProd.id) && 
          m.couponCode && m.couponCode.trim().toUpperCase() === coupon.code.trim().toUpperCase()
        );
        return !!mapping;
      }
      return true;
    });

    return hasEligibleProduct;
  };

  const handleStartCheckout = () => {
    if (selectedCartItems.length === 0) {
      showFlash('error', 'Please select at least 1 in-stock item from your cart to proceed to checkout.');
      return;
    }

    setCheckoutMode('cart');
    setBuyNowItem(null);
    setAppliedCoupon(null);
    setCouponCodeInput('');
    setCouponError('');
    setCouponSuccess('');
    fetchAvailableCoupons();

    // Check if any selected item is out of stock or exceeds inventory
    const outOfStockItem = selectedCartItems.find(item => {
      const liveProd = products.find(p => p.id === item.id);
      const stock = liveProd != null ? liveProd.stock : (item.stock ?? 0);
      return stock <= 0 || item.quantity > stock;
    });

    if (outOfStockItem) {
      const liveProd = products.find(p => p.id === outOfStockItem.id);
      const stock = liveProd != null ? liveProd.stock : (outOfStockItem.stock ?? 0);
      if (stock <= 0) {
        showFlash('error', `Cannot proceed to checkout: "${outOfStockItem.name}" is currently out of stock. Please remove it from your selection.`);
      } else {
        showFlash('error', `Cannot proceed to checkout: "${outOfStockItem.name}" only has ${stock} units available.`);
      }
      return;
    }

    const defaultAddr = savedAddresses.find(a => a.isDefault) || savedAddresses[0];
    if (defaultAddr) {
      setDeliveryInfo({
        name: defaultAddr.fullName || '',
        phone: defaultAddr.phone || '',
        address: `${defaultAddr.streetAddress || ''}, ${defaultAddr.city || ''}, ${defaultAddr.state || ''} - ${defaultAddr.postalCode || ''}`.replace(/^, | - $/g, '').trim()
      });
    } else {
      setDeliveryInfo({
        name: '',
        phone: '',
        address: ''
      });
    }
    setPaymentStep(1);
    handleCloseCartModal();
    setShowPaymentModal(true);
  };

  const handleBuyNow = (product) => {
    if (!product || product.stock <= 0) {
      showFlash('error', "This product is currently out of stock.");
      return;
    }

    const discPct = Number(product.discountPercentage) || 0;
    const origPrice = Number(product.price) || 0;
    const effectivePrice = product.finalPrice != null 
      ? Number(product.finalPrice) 
      : (discPct > 0 ? Math.round(origPrice * (1 - discPct / 100) * 100) / 100 : origPrice);

    const directItem = { 
      ...product, 
      price: effectivePrice,
      originalPrice: origPrice,
      discountPercentage: discPct,
      quantity: 1 
    };

    setCheckoutMode('buynow');
    setBuyNowItem(directItem);
    setAppliedCoupon(null);
    setCouponCodeInput('');
    setCouponError('');
    setCouponSuccess('');
    fetchAvailableCoupons();

    const defaultAddr = savedAddresses.find(a => a.isDefault) || savedAddresses[0];
    if (defaultAddr) {
      setDeliveryInfo({
        name: defaultAddr.fullName || '',
        phone: defaultAddr.phone || '',
        address: `${defaultAddr.streetAddress || ''}, ${defaultAddr.city || ''}, ${defaultAddr.state || ''} - ${defaultAddr.postalCode || ''}`.replace(/^, | - $/g, '').trim()
      });
    } else {
      setDeliveryInfo({
        name: '',
        phone: '',
        address: ''
      });
    }

    handleCloseCartModal();
    setSelectedProduct(null);
    setPaymentStep(1);
    setShowPaymentModal(true);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleProcessPayment = async () => {
    if (!deliveryInfo.address.trim() || !deliveryInfo.name.trim()) {
      showFlash('error', 'Please provide a valid delivery address and recipient name.');
      return;
    }

    // Cash on Delivery flow
    if (paymentMethod === 'cod') {
      setIsProcessingPayment(true);
      setPaymentStep(3); // Processing screen

      try {
        const payload = {
          userId: user.id,
          items: activeCheckoutItems,
          deliveryInfo: deliveryInfo,
          paymentMethod: 'COD',
          couponCode: appliedCoupon ? appliedCoupon.couponCode : null
        };

        const res = await axios.post('http://localhost:8080/api/payment/verify-and-order', payload);
        setConfirmedOrder(res.data);
        if (checkoutMode === 'cart') {
          setCart(prev => prev.filter(item => !selectedCartItemIds.includes(item.id)));
          setSelectedCartItemIds([]);
        } else {
          setBuyNowItem(null);
        }
        setIsProcessingPayment(false);
        setPaymentStep(4); // Confirmed screen
        fetchOrders();
        fetchProducts();
      } catch (err) {
        setIsProcessingPayment(false);
        setPaymentStep(2);
        showFlash('error', err.response?.data || "Failed to place Cash on Delivery order.");
      }
      return;
    }

    // Razorpay Online Gateway flow
    setIsProcessingPayment(true);

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setIsProcessingPayment(false);
        showFlash('error', 'Could not load Razorpay SDK. Please check your internet connection.');
        return;
      }

      const totalAmount = calculateTotal(activeCheckoutItems);
      const orderRes = await axios.post('http://localhost:8080/api/payment/create-order', {
        amount: totalAmount,
        receipt: `rcpt_${user.id}_${Date.now()}`
      });

      const { razorpayOrderId, amount, currency, keyId } = orderRes.data;

      const options = {
        key: keyId || 'rzp_test_placeholder',
        amount: amount,
        currency: currency || 'INR',
        name: 'ShopStack Enterprise',
        description: `Order Checkout (${activeCheckoutItems.length} items)`,
        order_id: razorpayOrderId,
        prefill: {
          name: deliveryInfo.name || user.fullName,
          email: user.email || '',
          contact: deliveryInfo.phone || user.phone || ''
        },
        notes: {
          address: deliveryInfo.address
        },
        theme: {
          color: '#0d9488'
        },
        handler: async function (response) {
          setPaymentStep(3);
          try {
            const verifyPayload = {
              userId: user.id,
              items: activeCheckoutItems,
              deliveryInfo: deliveryInfo,
              paymentMethod: 'RAZORPAY',
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              couponCode: appliedCoupon ? appliedCoupon.couponCode : null
            };

            const verifyRes = await axios.post('http://localhost:8080/api/payment/verify-and-order', verifyPayload);
            setConfirmedOrder(verifyRes.data);
            if (checkoutMode === 'cart') {
              setCart(prev => prev.filter(item => !selectedCartItemIds.includes(item.id)));
              setSelectedCartItemIds([]);
            } else {
              setBuyNowItem(null);
            }
            setIsProcessingPayment(false);
            setPaymentStep(4);
            fetchOrders();
            fetchProducts();
          } catch (err) {
            setIsProcessingPayment(false);
            setPaymentStep(2);
            showFlash('error', err.response?.data || "Payment verification failed.");
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
            setPaymentStep(2);
            showFlash('info', 'Razorpay checkout cancelled.');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setIsProcessingPayment(false);
        setPaymentStep(2);
        showFlash('error', response.error?.description || 'Razorpay transaction failed.');
      });
      rzp.open();
    } catch (err) {
      setIsProcessingPayment(false);
      setPaymentStep(2);
      showFlash('error', err.response?.data || "Failed to initialize Razorpay payment.");
    }
  };

  // Details & Reviews modal
  const handleOpenProductDetails = async (product) => {
    setSelectedProduct(product);
    setVendorDetails(null);
    setActiveImageIndex(0);
    try {
      const res = await axios.get(`http://localhost:8080/api/products/${product.id}/reviews`);
      setProductReviews(res.data);
    } catch (err) {
      console.error("Failed to load reviews", err);
    }
    if (product.vendorId) {
      try {
        const res = await axios.get(`http://localhost:8080/api/customer/${product.vendorId}`);
        setVendorDetails(res.data);
      } catch (err) {
        console.error("Failed to load vendor details", err);
      }
    }
  };

  const handleReviewImageUpload = async (e, isEditing = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showFlash('error', "Please upload a valid image file (PNG, JPG, JPEG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showFlash('error', "Image size exceeds 5MB limit. Please choose a smaller photo.");
      return;
    }

    if (isEditing) {
      setIsUploadingEditReviewImg(true);
    } else {
      setIsUploadingReviewImg(true);
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await axios.post('http://localhost:8080/api/products/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data && res.data.imageUrl) {
        if (isEditing) {
          setEditReviewImage(res.data.imageUrl);
        } else {
          setReviewImage(res.data.imageUrl);
        }
        showFlash('success', "Review photo uploaded successfully!");
      } else {
        throw new Error('No imageUrl returned');
      }
    } catch (err) {
      console.warn("Direct upload failed, falling back to Base64 encoding", err);
      const reader = new FileReader();
      reader.onload = (uploadEvt) => {
        const base64Data = uploadEvt.target.result;
        if (isEditing) {
          setEditReviewImage(base64Data);
        } else {
          setReviewImage(base64Data);
        }
        showFlash('success', "Review photo attached!");
      };
      reader.readAsDataURL(file);
    } finally {
      if (isEditing) {
        setIsUploadingEditReviewImg(false);
      } else {
        setIsUploadingReviewImg(false);
      }
      e.target.value = '';
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) {
      showFlash('error', "Please enter a comment for your review.");
      return;
    }

    try {
      const payload = {
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        imageUrl: reviewImage || null,
        reviewerName: user.fullName || "Anonymous Customer",
        userId: user.id,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      };
      
      await axios.post(`http://localhost:8080/api/products/${selectedProduct.id}/reviews`, payload);
      
      // Reload reviews
      const res = await axios.get(`http://localhost:8080/api/products/${selectedProduct.id}/reviews`);
      setProductReviews(res.data);
      setReviewForm({ rating: 5, comment: '' });
      setReviewImage('');
      showFlash('success', "Review submitted successfully!");
      fetchProducts();
    } catch (err) {
      showFlash('error', "Failed to submit review.");
    }
  };

  const handleStartEditReview = (rev) => {
    setEditingReviewId(rev.id);
    setEditReviewForm({ rating: rev.rating, comment: rev.comment });
    setEditReviewImage(rev.imageUrl || '');
  };

  const handleCancelEditReview = () => {
    setEditingReviewId(null);
    setEditReviewForm({ rating: 5, comment: '' });
    setEditReviewImage('');
  };

  const handleUpdateReview = async (e, reviewId) => {
    e.preventDefault();
    if (!editReviewForm.comment.trim()) {
      showFlash('error', "Please enter a comment for your review.");
      return;
    }
    try {
      const payload = {
        rating: editReviewForm.rating,
        comment: editReviewForm.comment,
        imageUrl: editReviewImage || null,
        userId: user.id
      };
      await axios.put(`http://localhost:8080/api/products/reviews/${reviewId}`, payload);
      
      // Reload reviews
      const res = await axios.get(`http://localhost:8080/api/products/${selectedProduct.id}/reviews`);
      setProductReviews(res.data);
      setEditingReviewId(null);
      setEditReviewImage('');
      showFlash('success', "Review updated successfully!");
      fetchProducts();
    } catch (err) {
      showFlash('error', err.response?.data || "Failed to update review.");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete your review? This action cannot be undone.")) return;
    try {
      await axios.delete(`http://localhost:8080/api/products/reviews/${reviewId}?userId=${user.id}`);
      
      // Reload reviews
      const res = await axios.get(`http://localhost:8080/api/products/${selectedProduct.id}/reviews`);
      setProductReviews(res.data);
      showFlash('success', "Review deleted successfully!");
      fetchProducts();
    } catch (err) {
      showFlash('error', err.response?.data || "Failed to delete review.");
    }
  };

  // Calculate dynamic average rating
  const getAverageRating = (reviewsList) => {
    if (reviewsList.length === 0) return 0.0;
    const sum = reviewsList.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / reviewsList.length) * 10) / 10;
  };

  // Filters logic
  const categories = useMemo(() => ['All', ...new Set(products.map(p => p.category))], [products]);
  
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const maxP = maxPriceFilter ? parseFloat(maxPriceFilter) : null;
    return products.filter(prod => {
      const matchesSearch = !q || (prod.name && prod.name.toLowerCase().includes(q)) || 
                            (prod.category && prod.category.toLowerCase().includes(q));
      const matchesCategory = categoryFilter === 'All' || prod.category === categoryFilter;
      const disc = Number(prod.discountPercentage) || 0;
      const effectiveP = prod.finalPrice != null ? prod.finalPrice : (disc > 0 ? Math.round(prod.price * (1 - disc / 100) * 100) / 100 : prod.price);
      const matchesPrice = maxP === null || effectiveP <= maxP;
      
      const ratingScore = prod.averageRating !== null && prod.averageRating !== undefined ? prod.averageRating : 0.0;
      const matchesRating = ratingScore >= minRatingFilter;
      
      return matchesSearch && matchesCategory && matchesPrice && matchesRating;
    });
  }, [products, searchQuery, categoryFilter, maxPriceFilter, minRatingFilter]);

  return (
    <div className="dashboard-container">
      {/* Toast Alert Banner */}
      {flash.text && (
        <div className={`toast-notification ${flash.type === 'success' ? 'toast-success' : 'toast-error'}`}>
          <div className="toast-icon-container">
            {flash.type === 'success' ? <Check size={18} /> : <X size={18} />}
          </div>
          <div>
            <strong className="toast-message-title">{flash.type === 'success' ? 'Success' : 'Notification'}</strong>
            <div className="toast-message-desc">{flash.text}</div>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <div className="navbar">
        <div className="nav-left">
          <h1 className="nav-logo" onClick={() => fetchProducts()} style={{ cursor: 'pointer' }}>ShopStack</h1>
          <div className="nav-search">
            <Search className="nav-search-icon" />
            <input 
              type="text" 
              placeholder="Search for Products, Brands and More..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="nav-search-input"
            />
          </div>
        </div>

        {/* Mobile Notification Button (Visible on mobile <= 768px) */}
        <div className="show-on-mobile" style={{ display: 'inline-flex', alignItems: 'center' }}>
          <NotificationCenter
            notifications={notificationList}
            onMarkAsRead={handleMarkNotifAsRead}
            onMarkAllAsRead={handleMarkAllNotifsAsRead}
            onClearAll={handleClearAllNotifs}
            onDismiss={handleDismissNotif}
            role={user?.role || 'CUSTOMER'}
            panelTitle={isAdmin ? "Admin System Alerts" : isStaff ? "Facility Alerts" : isVendor ? "Merchant & Purchase Alerts" : "Notifications & Offers"}
            iconSize={17}
            align="right"
          />
        </div>

        <div className="nav-right nav-right-home">
          {/* Notification Bell on Desktop */}
          <div className="hide-on-mobile" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <NotificationCenter
              notifications={notificationList}
              onMarkAsRead={handleMarkNotifAsRead}
              onMarkAllAsRead={handleMarkAllNotifsAsRead}
              onClearAll={handleClearAllNotifs}
              onDismiss={handleDismissNotif}
              role={user?.role || 'CUSTOMER'}
              panelTitle={isAdmin ? "Admin System Alerts" : isStaff ? "Facility Alerts" : isVendor ? "Merchant & Purchase Alerts" : "Notifications & Offers"}
              iconSize={16}
              align="right"
            />
          </div>

          {/* Admin link */}
          {isAdmin && (
            <button 
              onClick={onGoToAdmin} 
              className="btn btn-secondary" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-rose)' }}
            >
              <ShieldAlert size={16} /> Admin Console
            </button>
          )}

          {/* Vendor link */}
          {(user?.role === 'VENDOR') && (
            <button 
              onClick={onGoToVendor} 
              className="btn btn-secondary" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-emerald)' }}
            >
              <Store size={16} /> Seller Console
            </button>
          )}

          {/* Warehouse link */}
          {isStaff && (
            <button 
              onClick={onGoToWarehouse} 
              className="btn btn-secondary" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-indigo)' }}
            >
              <Truck size={16} strokeWidth={2} /> Warehouse Panel
            </button>
          )}

          <div 
            className="nav-user-menu"
            ref={userMenuRef}
          >
            <div 
              className="nav-user-trigger"
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(prev => !prev);
              }}
              style={{ cursor: 'pointer' }}
            >
              <div className="nav-user-avatar">
                <User size={14} style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />
              </div>
              <strong className="nav-user-name">{user?.fullName || 'User'}</strong>
              <ChevronDown 
                size={13} 
                className="nav-user-chevron"
                style={{ 
                  transform: showDropdown ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s ease'
                }} 
              />
            </div>

            {showDropdown && (
              <div className="nav-dropdown" onClick={(e) => e.stopPropagation()}>
                <div className="dropdown-header" style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Signed in as</span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                    <strong style={{ fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user?.fullName || 'User'}
                    </strong>
                    <span className={`badge ${(user?.role === 'ADMIN' || user?.role === 'ADMINISTRATOR') ? 'badge-rejected' : user?.role === 'VENDOR' ? 'badge-vendor' : user?.role === 'WAREHOUSE_STAFF' ? 'badge-warehouse' : 'badge-customer'}`} style={{ fontSize: '9px', padding: '1px 6px' }}>
                      {(user?.role === 'ADMIN' || user?.role === 'ADMINISTRATOR') ? 'ADMIN' : (user?.role || 'CUSTOMER')}
                    </span>
                  </div>
                </div>

                <div onClick={() => { setShowDropdown(false); onGoToProfile('profile'); }} className="dropdown-item">
                  <User size={16} style={{ flexShrink: 0 }} /> <span>My Profile</span>
                </div>

                {isAdmin ? (
                  onGoToAdmin && (
                    <div onClick={() => { setShowDropdown(false); onGoToAdmin(); }} className="dropdown-item" style={{ color: 'var(--accent-rose)' }}>
                      <ShieldAlert size={16} style={{ flexShrink: 0 }} /> <span>Admin Console</span>
                    </div>
                  )
                ) : isStaff ? (
                  onGoToWarehouse && (
                    <div onClick={() => { setShowDropdown(false); onGoToWarehouse(); }} className="dropdown-item" style={{ color: 'var(--accent-indigo)' }}>
                      <Truck size={16} style={{ flexShrink: 0 }} /> <span>Warehouse Panel</span>
                    </div>
                  )
                ) : (
                  <>
                    <div onClick={() => { setShowDropdown(false); onGoToProfile('addresses'); }} className="dropdown-item">
                      <MapPin size={16} style={{ flexShrink: 0 }} /> <span>Your Addresses</span>
                    </div>
                    <div onClick={() => { setShowDropdown(false); setShowOrdersModal(true); }} className="dropdown-item">
                      <Package size={16} style={{ flexShrink: 0 }} /> <span>Order History</span>
                    </div>
                    <div onClick={() => { setShowDropdown(false); onGoToProfile('wishlist'); }} className="dropdown-item">
                      <Heart size={16} style={{ flexShrink: 0 }} /> <span>Wishlist</span>
                    </div>
                    {user?.role === 'VENDOR' && (
                      <div onClick={() => { setShowDropdown(false); onGoToVendor(); }} className="dropdown-item" style={{ color: 'var(--accent-emerald)' }}>
                        <Store size={16} style={{ flexShrink: 0 }} /> <span>Seller Console</span>
                      </div>
                    )}
                  </>
                )}

                <div className="dropdown-divider" />

                {/* Light / Dark Mode Toggle Button */}
                {onToggleTheme && (
                  <div 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onToggleTheme(); 
                    }} 
                    className="dropdown-item" 
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {theme === 'dark' ? (
                        <Sun size={16} style={{ color: '#fbbf24', flexShrink: 0 }} />
                      ) : (
                        <Moon size={16} style={{ color: '#6366f1', flexShrink: 0 }} />
                      )}
                      <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                    </div>
                    <span 
                      style={{ 
                        fontSize: '10px', 
                        fontWeight: '700', 
                        padding: '2px 6px', 
                        borderRadius: '4px', 
                        background: 'var(--bg-input)', 
                        color: 'var(--text-secondary)', 
                        border: '1px solid var(--border-light)' 
                      }}
                    >
                      {theme === 'dark' ? 'DARK' : 'LIGHT'}
                    </span>
                  </div>
                )}

                <div className="dropdown-divider" />

                {/* Logout Button */}
                <div 
                  onClick={() => { 
                    setShowDropdown(false); 
                    if (onLogout) onLogout(); 
                  }} 
                  className="dropdown-item dropdown-item-danger" 
                  style={{ color: 'var(--accent-rose)', fontWeight: '600' }}
                >
                  <LogOut size={16} style={{ flexShrink: 0 }} /> <span>Logout</span>
                </div>
              </div>
            )}
          </div>

          {!isStaffOrAdmin && (
            <div onClick={handleOpenCartModal} className="nav-cart-btn">
              <ShoppingCart size={18} /> Cart ({Array.isArray(cart) ? cart.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0) : 0})
            </div>
          )}
        </div>
      </div>

      {/* Advanced Filters Bar */}
      <div className="section-container" style={{ paddingBottom: '0', paddingTop: '24px' }}>
        <div className="filters-container">
          <div className="filter-group">
            <label>Product Category</label>
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-select"
            >
              {categories.map((cat, i) => (
                <option key={i} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Max Budget Price (₹)</label>
            <input 
              type="number" 
              placeholder="e.g. 3000" 
              value={maxPriceFilter}
              onChange={(e) => setMaxPriceFilter(e.target.value)}
              className="form-input"
              style={{ padding: '8px 12px', fontSize: '14px' }}
            />
          </div>

          <div className="filter-group">
            <label>Minimum Rating</label>
            <select 
              value={minRatingFilter}
              onChange={(e) => setMinRatingFilter(parseFloat(e.target.value))}
              className="form-select"
            >
              <option value="0">Show All Ratings</option>
              <option value="4">4.0 ★ & Above</option>
              <option value="4.5">4.5 ★ & Above</option>
              <option value="5">5.0 ★ Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid Section */}
      <div className="section-container" style={{ paddingTop: '20px' }}>
        <div className="section-header">
          <h3 className="section-title">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Browse Catalog'}
          </h3>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Showing {filteredProducts.length} approved products
          </span>
        </div>
        
        {filteredProducts.length === 0 ? (
          <div className="cart-empty-state" style={{ gridColumn: 'span 4' }}>
            <Package className="cart-empty-icon" style={{ opacity: 0.2 }} />
            <p>No products match your active search or filters.</p>
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((prod) => {
              const isWishlisted = Array.isArray(wishlist) && wishlist.some(p => p.id === prod.id);
              const disc = Number(prod.discountPercentage) || 0;
              const finalPrice = prod.finalPrice != null ? prod.finalPrice : (disc > 0 ? Math.round(prod.price * (1 - disc / 100) * 100) / 100 : prod.price);
              const savings = Math.max(0, Math.round((prod.price - finalPrice) * 100) / 100);

              return (
                <div key={prod.id} className="product-card">
                  {/* High-visibility Vibrant Discount Badge */}
                  {disc > 0 && (
                    <div className="product-discount-badge">
                      {disc}% OFF
                    </div>
                  )}
                  {/* Heart button - only for customers */}
                  {!isStaffOrAdmin && (
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist(prod, showFlash);
                      }} 
                      className={`product-wishlist-btn ${isWishlisted ? 'product-wishlist-active' : ''}`}
                      title="Add to Wishlist"
                    >
                      <Heart size={15} fill={isWishlisted ? "currentColor" : "none"} />
                    </button>
                  )}

                  {/* Body click opens detail modal */}
                  <div 
                    onClick={() => handleOpenProductDetails(prod)} 
                    style={{ cursor: 'pointer', flex: 1, display: 'flex', flexDirection: 'column' }}
                  >
                    <div className="product-image-container">
                      {prod.imageUrl && formatImageUrl(prod.imageUrl).length > 4 ? (
                        <img 
                          src={formatImageUrl(prod.imageUrl)} 
                          alt={prod.name} 
                          loading="lazy"
                          decoding="async"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      ) : (
                        <ProductIcon name={prod.name} category={prod.category} size={36} />
                      )}
                    </div>
                    <div className="product-info" style={{ flex: 1 }}>
                      <span className="product-category">{prod.category}</span>
                      <h4 className="product-title">{prod.name}</h4>
                      
                      {/* Rating display */}
                      <div className="stars-display" style={{ marginBottom: '12px', fontSize: '12px' }}>
                        <Star size={13} fill="currentColor" style={{ color: '#fbbf24' }} />
                        <strong>
                          {prod.averageRating !== null && prod.averageRating !== undefined && prod.averageRating > 0 
                            ? prod.averageRating.toFixed(1) 
                            : '0.0'}
                        </strong>
                        <span style={{ color: 'var(--text-muted)' }}>
                          ({prod.reviewCount !== null && prod.reviewCount !== undefined ? prod.reviewCount : 0} reviews)
                        </span>
                      </div>

                      <div className="flex-between" style={{ marginTop: 'auto', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <span style={{ margin: '0', fontSize: '20px', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                              ₹{Number(finalPrice).toLocaleString('en-IN')}
                            </span>
                            {disc > 0 && (
                              <span style={{ fontSize: '13px', fontWeight: '600', textDecoration: 'line-through', color: '#94a3b8', textDecorationColor: '#ef4444', textDecorationThickness: '1.5px' }}>
                                ₹{Number(prod.price).toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>

                          {disc > 0 && (
                            <div style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '4px',
                              background: 'rgba(16, 185, 129, 0.16)', 
                              border: '1px solid rgba(16, 185, 129, 0.45)', 
                              color: '#10b981', 
                              fontSize: '11px', 
                              fontWeight: '700', 
                              padding: '2px 7px', 
                              borderRadius: '4px', 
                              width: 'fit-content'
                            }}>
                              <span>✓</span> Save ₹{Number(savings).toLocaleString('en-IN')}
                            </div>
                          )}
                        </div>

                        {prod.stock <= 0 ? (
                          <span className="badge badge-rejected" style={{ fontWeight: '700' }}>Out of Stock</span>
                        ) : prod.stock < 5 ? (
                          <span className="badge badge-pending" style={{ fontWeight: '700' }}>Only {prod.stock} left!</span>
                        ) : (
                          <span className="badge badge-approved" style={{ fontWeight: '700' }}>In Stock</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isAdmin ? (
                    <div style={{ marginTop: '16px' }}>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleOpenProductDetails(prod);
                        }} 
                        className="btn btn-secondary" 
                        style={{ 
                          width: '100%',
                          padding: '9px 12px', 
                          fontSize: '13px', 
                          justifyContent: 'center', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px', 
                          fontWeight: '700',
                          color: 'var(--accent-rose)',
                          borderColor: 'rgba(244, 63, 94, 0.4)',
                          background: 'rgba(244, 63, 94, 0.08)'
                        }}
                      >
                        <Eye size={15} /> Inspect Details
                      </button>
                    </div>
                  ) : isStaff ? (
                    <div style={{ marginTop: '16px' }}>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleOpenProductDetails(prod);
                        }} 
                        className="btn btn-secondary" 
                        style={{ 
                          width: '100%',
                          padding: '9px 12px', 
                          fontSize: '13px', 
                          justifyContent: 'center', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px', 
                          fontWeight: '700',
                          color: 'var(--accent-indigo)',
                          borderColor: 'rgba(99, 102, 241, 0.4)',
                          background: 'rgba(99, 102, 241, 0.08)'
                        }}
                      >
                        <Truck size={15} /> Inspect Inventory
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: prod.stock <= 0 ? '1fr' : '1fr 1fr', gap: '8px', marginTop: '16px' }}>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          addToCart(prod, showFlash);
                        }} 
                        className="btn btn-secondary" 
                        style={{ padding: '8px 10px', fontSize: '12.5px', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}
                        disabled={prod.stock <= 0}
                      >
                        {prod.stock <= 0 ? "Out of Stock" : <><ShoppingCart size={14} /> Add to Cart</>}
                      </button>
                      
                      {prod.stock > 0 && (
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleBuyNow(prod);
                          }} 
                          className="btn btn-primary" 
                          style={{ 
                            padding: '8px 10px', 
                            fontSize: '12.5px', 
                            justifyContent: 'center', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px', 
                            fontWeight: '700', 
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
                            borderColor: '#d97706', 
                            color: '#ffffff',
                            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)' 
                          }}
                        >
                          <Zap size={14} /> Buy Now
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cart Drawer */}
      {showCartModal && (
        <div className="modal-overlay modal-overlay-drawer" onClick={handleCloseCartModal}>
          <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShoppingCart size={22} style={{ color: 'var(--accent-blue)' }} />
                Shopping Cart ({Array.isArray(cart) ? cart.reduce((sum, item) => sum + item.quantity, 0) : 0})
              </h2>
              <button onClick={handleCloseCartModal} className="btn-icon-only">
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {!Array.isArray(cart) || cart.length === 0 ? (
                <div className="cart-empty-state">
                  <ShoppingCart className="cart-empty-icon" style={{ opacity: 0.2 }} />
                  <p>Your cart is empty.</p>
                </div>
              ) : (
                <>
                  {/* Select All Bar */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: 'var(--bg-input)',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    border: '1px solid var(--border-light)'
                  }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: inStockCartItems.length > 0 ? 'pointer' : 'not-allowed', fontWeight: '600', fontSize: '13px', userSelect: 'none', opacity: inStockCartItems.length > 0 ? 1 : 0.6 }}>
                      <input 
                        type="checkbox" 
                        checked={isAllSelected} 
                        disabled={inStockCartItems.length === 0}
                        onChange={toggleSelectAll} 
                        style={{ width: '17px', height: '17px', accentColor: 'var(--accent-teal)', cursor: inStockCartItems.length > 0 ? 'pointer' : 'not-allowed' }}
                      />
                      <span>Select All In-Stock ({inStockCartItems.length}/{cart.length})</span>
                    </label>
                    <span style={{ fontSize: '12px', color: selectedCartItems.length > 0 ? 'var(--accent-teal)' : 'var(--text-muted)', fontWeight: '700' }}>
                      {selectedCartItems.length} selected
                    </span>
                  </div>

                  {cart.map((item) => {
                    const liveProduct = products.find(p => p.id === item.id);
                    const currentStock = liveProduct != null ? liveProduct.stock : (item.stock ?? 0);
                    const isOutOfStock = currentStock <= 0;
                    const isExceedingStock = !isOutOfStock && item.quantity > currentStock;
                    const isItemSelected = selectedCartItemIds.includes(item.id) && !isOutOfStock;
                    const hasDiscount = item.originalPrice && item.originalPrice > item.price;

                    return (
                      <div 
                        key={item.id} 
                        className="cart-item-card-responsive" 
                        style={{ 
                          opacity: isOutOfStock ? 0.65 : (isItemSelected ? 1 : 0.65), 
                          background: isOutOfStock ? 'rgba(239, 68, 68, 0.04)' : 'var(--bg-input)',
                          border: isOutOfStock ? '1px dashed rgba(239, 68, 68, 0.35)' : (isItemSelected ? '1px solid var(--border-light)' : '1px dashed var(--border-light)'),
                          borderRadius: '10px',
                          padding: '12px 14px',
                          marginBottom: '10px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          transition: 'all 0.2s ease',
                          width: '100%',
                          boxSizing: 'border-box'
                        }}
                      >
                        {/* Top Tier: Checkbox + Image + Title/Badges + Delete Button */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', width: '100%' }}>
                          {/* Item Selection Box */}
                          <input 
                            type="checkbox" 
                            checked={isItemSelected} 
                            disabled={isOutOfStock}
                            onChange={() => toggleSelectItem(item.id)}
                            style={{ width: '18px', height: '18px', accentColor: 'var(--accent-teal)', cursor: isOutOfStock ? 'not-allowed' : 'pointer', marginTop: '2px', flexShrink: 0 }}
                            title={isOutOfStock ? "Out of Stock - Cannot be selected" : (isItemSelected ? "Deselect item" : "Select item for purchase")}
                          />

                          <div style={{ width: '44px', height: '44px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', position: 'relative', border: '1px solid var(--border-light)' }}>
                            {item.imageUrl && formatImageUrl(item.imageUrl).length > 4 ? (
                              <img src={formatImageUrl(item.imageUrl)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: isOutOfStock ? 'grayscale(0.7)' : 'none' }} />
                            ) : (
                              <ProductIcon name={item.name} category={item.category} size={20} />
                            )}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: '700', fontSize: '13px', color: isOutOfStock ? 'var(--text-muted)' : 'var(--text-primary)', wordBreak: 'break-word', lineHeight: '1.3' }}>
                              {item.name}
                            </div>

                            {/* Out of Stock & Inventory Warnings */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', marginTop: '2px' }}>
                              {isOutOfStock ? (
                                <span style={{ 
                                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.25))',
                                  color: '#ef4444', 
                                  border: '1px solid rgba(239, 68, 68, 0.4)',
                                  fontSize: '10px', 
                                  fontWeight: '800', 
                                  padding: '1px 6px', 
                                  borderRadius: '3px'
                                }}>
                                  🚫 OUT OF STOCK
                                </span>
                              ) : isExceedingStock ? (
                                <span style={{ 
                                  background: 'rgba(245, 158, 11, 0.15)', 
                                  color: '#f59e0b', 
                                  border: '1px solid rgba(245, 158, 11, 0.35)',
                                  fontSize: '10px', 
                                  fontWeight: '700', 
                                  padding: '1px 5px', 
                                  borderRadius: '3px'
                                }}>
                                  ⚠️ Only {currentStock} in stock
                                </span>
                              ) : null}
                            </div>
                          </div>

                          <button 
                            type="button"
                            onClick={() => removeFromCart(item.id)} 
                            className="btn-icon-only" 
                            style={{ color: 'var(--accent-rose)', borderColor: 'rgba(239, 68, 68, 0.2)', width: '28px', height: '28px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                            title="Remove item from cart"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        {/* Bottom Tier: Quantity controls on Left, Total price on Right */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border-light)', width: '100%' }}>
                          {/* Quantity Toggles */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button 
                              type="button"
                              onClick={() => updateCartQuantity(item.id, -1, currentStock)} 
                              className="btn-icon-only"
                              style={{ width: '26px', height: '26px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '5px' }}
                              title="Decrease quantity"
                            >
                              <Minus size={11} />
                            </button>
                            <strong style={{ fontSize: '13px', minWidth: '18px', textAlign: 'center', color: isOutOfStock ? 'var(--accent-rose)' : 'inherit' }}>
                              {item.quantity}
                            </strong>
                            <button 
                              type="button"
                              onClick={() => updateCartQuantity(item.id, 1, currentStock)} 
                              disabled={isOutOfStock || item.quantity >= currentStock}
                              className="btn-icon-only"
                              style={{ 
                                width: '26px', 
                                height: '26px', 
                                padding: 0, 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                borderRadius: '5px',
                                opacity: (isOutOfStock || item.quantity >= currentStock) ? 0.35 : 1,
                                cursor: (isOutOfStock || item.quantity >= currentStock) ? 'not-allowed' : 'pointer'
                              }}
                              title={isOutOfStock ? "Product is out of stock" : (item.quantity >= currentStock ? "Reached maximum available stock" : "Increase quantity")}
                            >
                              <Plus size={11} />
                            </button>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '14px', fontWeight: '800', color: isOutOfStock ? 'var(--text-muted)' : 'var(--accent-teal)' }}>
                              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                            {hasDiscount && (
                              <span style={{ marginLeft: '6px', fontSize: '11px', fontWeight: '600', textDecoration: 'line-through', color: '#94a3b8', textDecorationColor: '#ef4444' }}>
                                ₹{(item.originalPrice * item.quantity).toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            {cart.length > 0 && (() => {
              const hasOutOfStockInCart = cart.some(item => {
                const liveProd = products.find(p => p.id === item.id);
                const stock = liveProd != null ? liveProd.stock : (item.stock ?? 0);
                return stock <= 0;
              });

              const selectedOutOfStockItems = selectedCartItems.filter(item => {
                const liveProd = products.find(p => p.id === item.id);
                const stock = liveProd != null ? liveProd.stock : (item.stock ?? 0);
                return stock <= 0 || item.quantity > stock;
              });

              const hasInvalidSelection = selectedOutOfStockItems.length > 0;
              const canProceed = selectedCartItems.length > 0 && !hasInvalidSelection;

              return (
                <div className="modal-footer" style={{ flexDirection: 'column', gap: '14px', alignItems: 'stretch', background: 'var(--bg-input)', padding: '16px 20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <div className="flex-between">
                      <span>Total MRP ({selectedCartItems.length} selected)</span>
                      <span>₹{calculateOriginalSubtotal().toLocaleString('en-IN')}</span>
                    </div>
                    {calculateDiscountSavings() > 0 && (
                      <div className="flex-between" style={{ color: 'var(--accent-teal)' }}>
                        <span style={{ fontWeight: '600' }}>Applied Discount Savings</span>
                        <strong style={{ fontWeight: '700' }}>-₹{calculateDiscountSavings().toLocaleString('en-IN')}</strong>
                      </div>
                    )}
                    <div className="flex-between">
                      <span>Items Subtotal</span>
                      <span>₹{calculateSubtotal().toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex-between">
                      <span>Delivery Charges</span>
                      {calculateDeliveryFee() === 0 ? (
                        <span style={{ color: '#10b981', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>FREE</span>
                          <span style={{ fontSize: '11px', textDecoration: 'line-through', color: 'var(--text-muted)' }}>₹99</span>
                        </span>
                      ) : (
                        <strong style={{ color: 'var(--text-primary)' }}>₹99</strong>
                      )}
                    </div>

                    {/* Total Savings banner */}
                    {calculateTotalSavings() > 0 && (
                      <div style={{ 
                        background: 'rgba(16, 185, 129, 0.12)', 
                        border: '1px solid rgba(16, 185, 129, 0.35)', 
                        borderRadius: '8px', 
                        padding: '10px 14px', 
                        fontSize: '13px', 
                        color: '#10b981', 
                        fontWeight: '700', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between'
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>💰</span> Total Savings
                        </span>
                        <strong style={{ fontSize: '15px', color: '#10b981', fontWeight: '800' }}>
                          ₹{calculateTotalSavings().toLocaleString('en-IN')}
                        </strong>
                      </div>
                    )}

                    <div className="flex-between" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '10px', fontSize: '17px', color: 'var(--text-primary)' }}>
                      <span style={{ fontWeight: '700' }}>Final Amount</span>
                      <strong style={{ color: 'var(--accent-teal)', fontWeight: '800' }}>₹{calculateTotal().toLocaleString('en-IN')}</strong>
                    </div>
                  </div>

                  {/* Out of Stock Notice */}
                  {hasOutOfStockInCart && (
                    <div style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#ef4444',
                      fontSize: '12px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span>🚫</span>
                      <span>Out-of-stock items in cart cannot be checked out. Please remove or uncheck them.</span>
                    </div>
                  )}

                  <button 
                    onClick={handleStartCheckout} 
                    disabled={!canProceed}
                    className="btn btn-success btn-block" 
                    style={{ 
                      marginTop: '4px', 
                      padding: '12px', 
                      fontSize: '15px', 
                      fontWeight: '700', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '8px',
                      opacity: !canProceed ? 0.5 : 1,
                      cursor: !canProceed ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {selectedCartItems.length === 0 
                      ? "Select items to checkout" 
                      : hasInvalidSelection
                        ? "Cannot Checkout (Out of Stock items selected)"
                        : `Proceed to Checkout (${selectedCartItems.length} item${selectedCartItems.length === 1 ? '' : 's'})`} 
                    <ArrowRight size={18} />
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Order History Modal */}
      {showOrdersModal && (
        <div className="modal-overlay" onClick={() => setShowOrdersModal(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShoppingBag size={22} style={{ color: 'var(--accent-blue)' }} />
                Your Purchases ({orders.length})
              </h2>
              <button onClick={() => setShowOrdersModal(false)} className="btn-icon-only">
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {orders.length === 0 ? (
                <div className="cart-empty-state">
                  <Package className="cart-empty-icon" style={{ opacity: 0.2 }} />
                  <p>You haven't placed any orders yet.</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="order-card">
                    <div className="order-card-header">
                      <span className="order-id">{order.orderId}</span>
                      <span className={`badge ${
                        order.status === 'DELIVERED' ? 'badge-approved' : 
                        order.status === 'SHIPPED' ? 'badge-pending' : 'badge-customer'
                      }`}>{order.status}</span>
                    </div>
                    <div className="order-date">Placed on: {order.date}</div>
                    
                    <div className="order-items-list">
                      {order.items && order.items.map((it, i) => (
                        <div key={i} className="order-item-row">
                          <span>{it.productName} (x{it.quantity})</span>
                          <strong>₹{it.price * it.quantity}</strong>
                        </div>
                      ))}
                    </div>
                    
                    <div className="order-total-row">
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total Invoice Amount</span>
                      <strong style={{ fontSize: '16px', color: 'var(--accent-blue)' }}>₹{order.totalAmount}</strong>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Product Details & Reviews Modal */}
      {selectedProduct && (() => {
        const allImages = [];
        if (selectedProduct.imageUrl && selectedProduct.imageUrl !== '📦') {
          const formatted = formatImageUrl(selectedProduct.imageUrl);
          if (formatted) allImages.push(formatted);
        }
        if (selectedProduct.images && selectedProduct.images.length > 0) {
          selectedProduct.images.forEach(img => {
            const formatted = formatImageUrl(img);
            if (formatted && !allImages.includes(formatted)) {
              allImages.push(formatted);
            }
          });
        }
        if (allImages.length === 0) {
          allImages.push(formatImageUrl(selectedProduct.imageUrl) || '📦');
        }
        const activeImg = allImages[activeImageIndex] || allImages[0] || '📦';

        return (
          <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
            <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: isStaffOrAdmin ? '780px' : '650px', maxHeight: '88vh', display: 'flex', flexDirection: 'column', width: '100%', overflowX: 'hidden' }}>
              <div className="modal-header">
                <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isAdmin ? (
                    <>
                      <ShieldAlert size={20} style={{ color: 'var(--accent-rose)' }} />
                      <span>Product Inspection Console</span>
                      <span className="badge badge-rejected" style={{ fontSize: '10px', marginLeft: '6px' }}>ADMIN MODE</span>
                    </>
                  ) : isStaff ? (
                    <>
                      <Truck size={20} style={{ color: 'var(--accent-indigo)' }} />
                      <span>Warehouse Inventory Inspection</span>
                      <span className="badge badge-warehouse" style={{ fontSize: '10px', marginLeft: '6px' }}>WAREHOUSE STAFF</span>
                    </>
                  ) : (
                    <>
                      <ProductIcon name={selectedProduct.name} category={selectedProduct.category} size={20} />
                      <span>Product Details</span>
                    </>
                  )}
                </h2>
                <button onClick={() => setSelectedProduct(null)} className="btn-icon-only">
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body" style={{ overflowY: 'auto', overflowX: 'hidden' }}>
                {/* Product Gallery & Info Header Split */}
                <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', flexWrap: 'wrap', width: '100%', minWidth: 0 }}>
                  {/* Left Column: Image Gallery */}
                  <div style={{ flex: '1 1 240px', minWidth: 0, maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* Main Preview Box */}
                    <div 
                      style={{ 
                        position: 'relative', 
                        width: '100%', 
                        height: '220px', 
                        borderRadius: '12px', 
                        background: 'var(--bg-input)', 
                        border: '1px solid var(--border-light)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        overflow: 'hidden',
                        cursor: 'pointer'
                      }}
                      onClick={() => setShowLightbox(true)}
                      title="Click to open in-app image viewer slideshow"
                    >
                      {activeImg.length <= 4 ? (
                        <span style={{ fontSize: '72px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.05))' }}>{activeImg}</span>
                      ) : (
                        <img 
                          src={activeImg} 
                          alt={selectedProduct.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                        />
                      )}

                      {/* Open In-App Gallery Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowLightbox(true);
                        }}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: 'rgba(15, 23, 42, 0.78)',
                          color: '#ffffff',
                          border: '1px solid rgba(255, 255, 255, 0.25)',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '11px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer',
                          backdropFilter: 'blur(4px)',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                          zIndex: 3
                        }}
                        title="Open interactive slideshow gallery"
                      >
                        <Maximize2 size={12} /> View Gallery ({allImages.length})
                      </button>

                      {/* Navigation Arrows */}
                      {allImages.length > 1 && (
                        <>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
                            }}
                            style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', fontSize: '16px', fontWeight: 'bold', zIndex: 2 }}
                            title="Previous Image"
                          >
                            ‹
                          </button>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveImageIndex((prev) => (prev + 1) % allImages.length);
                            }}
                            style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', fontSize: '16px', fontWeight: 'bold', zIndex: 2 }}
                            title="Next Image"
                          >
                            ›
                          </button>
                        </>
                      )}
                    </div>

                    {/* Thumbnail Carousel Slider (Moves images only, no modal scrollbar) */}
                    {allImages.length > 1 && (
                      <div className="thumbnail-slider-container">
                        {allImages.length > 4 && (
                          <button 
                            type="button"
                            className="thumbnail-slider-btn"
                            title="Scroll left"
                            onClick={() => {
                              const track = document.getElementById('product-thumb-track');
                              if (track) track.scrollBy({ left: -100, behavior: 'smooth' });
                            }}
                          >
                            ‹
                          </button>
                        )}
                        <div 
                          id="product-thumb-track"
                          className="thumbnail-slider-track"
                        >
                          {allImages.map((img, idx) => {
                            const isActive = idx === activeImageIndex;
                            const isEmoji = img.length <= 4;
                            return (
                              <div 
                                key={idx}
                                onClick={() => setActiveImageIndex(idx)}
                                onDoubleClick={() => {
                                  if (!isEmoji) window.open(img, '_blank');
                                }}
                                style={{ 
                                  width: '46px', 
                                  height: '46px', 
                                  flexShrink: 0, 
                                  borderRadius: '6px', 
                                  overflow: 'hidden', 
                                  border: isActive ? '2px solid var(--accent-indigo)' : '1px solid var(--border-light)', 
                                  cursor: 'pointer', 
                                  background: 'var(--bg-card)', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  transition: 'transform 0.15s ease, border-color 0.15s ease'
                                }}
                                title={isEmoji ? img : "Click to preview (Double-click to open in new tab)"}
                              >
                                {isEmoji ? (
                                  <span style={{ fontSize: '20px' }}>{img}</span>
                                ) : (
                                  <img src={img} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                )}
                              </div>
                            );
                          })}
                        </div>
                        {allImages.length > 4 && (
                          <button 
                            type="button"
                            className="thumbnail-slider-btn"
                            title="Scroll right"
                            onClick={() => {
                              const track = document.getElementById('product-thumb-track');
                              if (track) track.scrollBy({ left: 100, behavior: 'smooth' });
                            }}
                          >
                            ›
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Main Info Block */}
                  <div style={{ flex: '1.2 1 280px', display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
                    <span className="product-category" style={{ margin: '0', width: 'fit-content' }}>{selectedProduct.category}</span>
                    <h3 style={{ fontSize: '22px', fontWeight: '800', lineHeight: '1.2', color: 'var(--text-primary)' }}>{selectedProduct.name}</h3>
                    
                    <div className="stars-display" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Star size={16} fill="currentColor" style={{ color: '#fbbf24' }} />
                      <strong style={{ fontSize: '14px' }}>{getAverageRating(productReviews)} / 5.0</strong>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({productReviews.length} reviews)</span>
                    </div>

                    {(() => {
                      const disc = Number(selectedProduct.discountPercentage) || 0;
                      const finalP = selectedProduct.finalPrice != null ? selectedProduct.finalPrice : (disc > 0 ? Math.round(selectedProduct.price * (1 - disc / 100) * 100) / 100 : selectedProduct.price);
                      const savings = Math.max(0, Math.round((selectedProduct.price - finalP) * 100) / 100);

                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'baseline', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '30px', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                              ₹{Number(finalP).toLocaleString('en-IN')}
                            </span>
                            {disc > 0 && (
                              <>
                                <span style={{ fontSize: '18px', fontWeight: '600', textDecoration: 'line-through', color: '#94a3b8', textDecorationColor: '#ef4444', textDecorationThickness: '2px' }}>
                                  ₹{Number(selectedProduct.price).toLocaleString('en-IN')}
                                </span>
                                <span style={{ 
                                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
                                  color: '#ffffff', 
                                  fontWeight: '800', 
                                  fontSize: '12px', 
                                  padding: '4px 10px', 
                                  borderRadius: '6px',
                                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
                                }}>
                                  {disc}% OFF
                                </span>
                              </>
                            )}
                            <span className={`badge ${selectedProduct.stock > 0 ? 'badge-approved' : 'badge-rejected'}`} style={{ marginLeft: 'auto', fontWeight: '700', fontSize: '12px', padding: '6px 12px' }}>
                              {selectedProduct.stock > 0 ? `In Stock (${selectedProduct.stock} units)` : 'Out of Stock'}
                            </span>
                          </div>
                          {!isStaffOrAdmin && disc > 0 && (
                            <div style={{ 
                              background: 'rgba(16, 185, 129, 0.14)', 
                              border: '1px solid rgba(16, 185, 129, 0.4)', 
                              borderRadius: '8px', 
                              padding: '10px 14px', 
                              color: '#10b981', 
                              fontSize: '13px', 
                              fontWeight: '700',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              <span>🎉</span>
                              <span>Special Discount Applied! You save ₹{Number(savings).toLocaleString('en-IN')} ({disc}% discount) on this product!</span>
                            </div>
                          )}

                          {/* Action Buttons / Synchronized Admin or Warehouse Inspection Panel */}
                          {isAdmin ? (
                            <div style={{ 
                              marginTop: '12px', 
                              padding: '16px', 
                              borderRadius: 'var(--radius-md)', 
                              background: 'rgba(244, 63, 94, 0.06)', 
                              border: '1px solid rgba(244, 63, 94, 0.22)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '12px'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(244, 63, 94, 0.15)', paddingBottom: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-rose)', fontWeight: '800', fontSize: '12.5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                  <ShieldAlert size={15} /> System Inspection Matrix
                                </div>
                                <span className={`badge ${selectedProduct.status === 'APPROVED' ? 'badge-approved' : selectedProduct.status === 'REJECTED' ? 'badge-rejected' : 'badge-pending'}`} style={{ fontSize: '10px', fontWeight: '700' }}>
                                  {selectedProduct.status || 'ACTIVE'}
                                </span>
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 14px', fontSize: '12.5px' }}>
                                <div style={{ background: 'var(--bg-card)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10.5px', fontWeight: '600', textTransform: 'uppercase' }}>Product ID</span>
                                  <strong style={{ color: 'var(--text-primary)', fontSize: '13px' }}>#{selectedProduct.id}</strong>
                                </div>
                                <div style={{ background: 'var(--bg-card)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10.5px', fontWeight: '600', textTransform: 'uppercase' }}>Inventory Stock</span>
                                  <strong style={{ color: selectedProduct.stock > 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontSize: '13px' }}>
                                    {selectedProduct.stock} units {selectedProduct.stock <= 0 ? '(Out of Stock)' : selectedProduct.stock < 5 ? '(Low)' : ''}
                                  </strong>
                                </div>
                                <div style={{ background: 'var(--bg-card)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10.5px', fontWeight: '600', textTransform: 'uppercase' }}>Category</span>
                                  <strong style={{ color: 'var(--text-primary)', fontSize: '13px' }}>{selectedProduct.category}</strong>
                                </div>
                                <div style={{ background: 'var(--bg-card)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10.5px', fontWeight: '600', textTransform: 'uppercase' }}>Merchant / Vendor</span>
                                  <strong style={{ color: 'var(--text-primary)', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                                    {selectedProduct.vendorName || selectedProduct.vendor?.fullName || vendorDetails?.fullName || 'Vendor #' + (selectedProduct.vendorId || selectedProduct.vendorCode || 'N/A')}
                                  </strong>
                                </div>
                              </div>

                              {onGoToAdmin && (
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    handleCloseProductDetails();
                                    onGoToAdmin();
                                  }}
                                  className="btn btn-primary"
                                  style={{ 
                                    marginTop: '4px', 
                                    justifyContent: 'center', 
                                    background: 'var(--gradient-danger)', 
                                    borderColor: 'transparent',
                                    color: '#ffffff', 
                                    fontWeight: '700', 
                                    fontSize: '13px', 
                                    padding: '10px 16px',
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px',
                                    boxShadow: '0 4px 14px rgba(244, 63, 94, 0.35)',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <ShieldAlert size={16} /> Open in Admin Console
                                </button>
                              )}
                            </div>
                          ) : isStaff ? (
                            <div style={{ 
                              marginTop: '12px', 
                              padding: '16px', 
                              borderRadius: 'var(--radius-md)', 
                              background: 'rgba(99, 102, 241, 0.06)', 
                              border: '1px solid rgba(99, 102, 241, 0.22)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '12px'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(99, 102, 241, 0.15)', paddingBottom: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-indigo)', fontWeight: '800', fontSize: '12.5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                  <Truck size={15} /> Warehouse Inventory Matrix
                                </div>
                                <span className={`badge ${selectedProduct.stock > 0 ? 'badge-approved' : 'badge-rejected'}`} style={{ fontSize: '10px', fontWeight: '700' }}>
                                  {selectedProduct.stock > 0 ? `${selectedProduct.stock} IN STOCK` : 'DEPLETED'}
                                </span>
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 14px', fontSize: '12.5px' }}>
                                <div style={{ background: 'var(--bg-card)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10.5px', fontWeight: '600', textTransform: 'uppercase' }}>Product ID</span>
                                  <strong style={{ color: 'var(--text-primary)', fontSize: '13px' }}>#{selectedProduct.id}</strong>
                                </div>
                                <div style={{ background: 'var(--bg-card)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10.5px', fontWeight: '600', textTransform: 'uppercase' }}>Stock Quantity</span>
                                  <strong style={{ color: selectedProduct.stock > 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontSize: '13px' }}>
                                    {selectedProduct.stock} units {selectedProduct.stock < 5 && selectedProduct.stock > 0 ? '(Low Stock Alert)' : ''}
                                  </strong>
                                </div>
                                <div style={{ background: 'var(--bg-card)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10.5px', fontWeight: '600', textTransform: 'uppercase' }}>Category</span>
                                  <strong style={{ color: 'var(--text-primary)', fontSize: '13px' }}>{selectedProduct.category}</strong>
                                </div>
                                <div style={{ background: 'var(--bg-card)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10.5px', fontWeight: '600', textTransform: 'uppercase' }}>Assigned Warehouse</span>
                                  <strong style={{ color: 'var(--text-primary)', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                                    {user?.warehouseName || 'Central Distribution Hub'}
                                  </strong>
                                </div>
                              </div>

                              {onGoToWarehouse && (
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    handleCloseProductDetails();
                                    onGoToWarehouse();
                                  }}
                                  className="btn btn-primary"
                                  style={{ 
                                    marginTop: '4px', 
                                    justifyContent: 'center', 
                                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
                                    borderColor: 'transparent', 
                                    color: '#ffffff', 
                                    fontWeight: '700', 
                                    fontSize: '13px', 
                                    padding: '10px 16px',
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px',
                                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <Truck size={16} /> Open in Warehouse Panel
                                </button>
                              )}
                            </div>
                          ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: selectedProduct.stock > 0 ? '1fr 1fr' : '1fr', gap: '12px', marginTop: '12px' }}>
                              <button 
                                type="button"
                                onClick={() => addToCart(selectedProduct, showFlash)} 
                                className="btn btn-secondary" 
                                style={{ padding: '12px 18px', fontSize: '14px', fontWeight: '700', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '8px' }}
                                disabled={selectedProduct.stock <= 0}
                              >
                                {selectedProduct.stock <= 0 ? "Out of Stock" : <><ShoppingCart size={17} /> Add to Cart</>}
                              </button>
                              
                              {selectedProduct.stock > 0 && (
                                <button 
                                  type="button"
                                  onClick={() => handleBuyNow(selectedProduct)} 
                                  className="btn btn-primary" 
                                  style={{ 
                                    padding: '12px 18px', 
                                    fontSize: '14px', 
                                    fontWeight: '700', 
                                    justifyContent: 'center', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px',
                                    background: 'var(--gradient-primary)',
                                    borderColor: 'transparent'
                                  }}
                                >
                                  <CreditCard size={17} /> Buy Now
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Product Info Section (Brand & Description) */}
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px', paddingBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedProduct.brand && (
                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold', display: 'block' }}>Brand</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{selectedProduct.brand}</span>
                    </div>
                  )}
                  {selectedProduct.description && (
                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold', display: 'block' }}>Description</span>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '4px 0 0 0', whiteSpace: 'pre-wrap' }}>{selectedProduct.description}</p>
                    </div>
                  )}
                </div>

                {/* Vendor Details Section */}
                {vendorDetails ? (
                  <div style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.15)', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--accent-indigo)', marginBottom: '10px', letterSpacing: '0.05em' }}>Merchant / Vendor Details</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                      <div>
                        <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11px', marginBottom: '2px' }}>Store Name</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{vendorDetails.fullName}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11px', marginBottom: '2px' }}>Contact Email</span>
                        <a href={`mailto:${vendorDetails.email}`} style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: '600' }}>{vendorDetails.email}</a>
                      </div>
                      {vendorDetails.phone && (
                        <div>
                          <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11px', marginBottom: '2px' }}>Phone</span>
                          <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{vendorDetails.phone}</span>
                        </div>
                      )}
                      {vendorDetails.address && (
                        <div>
                          <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '11px', marginBottom: '2px' }}>Location</span>
                          <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{vendorDetails.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : selectedProduct.vendorId ? (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '24px', fontStyle: 'italic' }}>
                    Loading merchant information...
                  </div>
                ) : null}

                {/* Write Review Form - only for regular customers */}
                {!isStaffOrAdmin && (
                  <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '20px', marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>Write a Customer Review</h4>
                    <form onSubmit={handleAddReview} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Your Rating:</span>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                size={18} 
                                onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                fill={star <= reviewForm.rating ? '#fbbf24' : 'none'}
                                style={{ color: '#fbbf24', cursor: 'pointer' }}
                                className="star-interactive"
                              />
                            ))}
                          </div>
                        </div>

                        {/* Attach Photo Button */}
                        <div>
                          <label 
                            style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '6px', 
                              padding: '5px 12px', 
                              background: 'var(--bg-secondary)', 
                              border: '1px solid var(--border-color)', 
                              borderRadius: '6px', 
                              fontSize: '12px', 
                              cursor: 'pointer',
                              color: 'var(--text-secondary)'
                            }}
                          >
                            <Camera size={14} style={{ color: 'var(--accent-teal)' }} />
                            <span>{isUploadingReviewImg ? 'Uploading...' : reviewImage ? 'Change Photo' : 'Attach Photo'}</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => handleReviewImageUpload(e, false)} 
                              style={{ display: 'none' }} 
                            />
                          </label>
                        </div>
                      </div>

                      {/* Uploaded Photo Preview */}
                      {reviewImage && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                          <img 
                            src={formatImageUrl(reviewImage)} 
                            alt="Attached Review" 
                            style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} 
                          />
                          <span style={{ fontSize: '12px', color: 'var(--text-primary)', flex: 1 }}>Photo attached</span>
                          <button 
                            type="button" 
                            onClick={() => setReviewImage('')}
                            style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px' }}
                          >
                            <X size={14} /> Remove
                          </button>
                        </div>
                      )}

                      <div className="input-icon-wrapper">
                        <input 
                          type="text" 
                          placeholder="Share your thoughts about this product..."
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                          className="form-input"
                          required
                        />
                        <button type="submit" className="input-action-btn" style={{ right: '12px' }}>
                          <Send size={16} style={{ color: 'var(--accent-blue)' }} />
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Reviews List */}
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px' }}>Customer Reviews</h4>
                  {productReviews.length === 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
                      <MessageSquare size={16} />
                      <span>No reviews yet. Be the first to review this product!</span>
                    </div>
                  ) : (
                    <div className="reviews-list">
                      {productReviews.map((rev) => {
                        const isEditing = editingReviewId === rev.id;
                        const isOwner = user && rev.userId === user.id;

                        if (isEditing) {
                          return (
                            <div key={rev.id} className="review-item" style={{ background: 'var(--bg-card)', border: '1px dashed var(--accent-indigo)', padding: '16px' }}>
                              <form onSubmit={(e) => handleUpdateReview(e, rev.id)} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                  <span className="review-author" style={{ fontWeight: 'bold' }}>Editing Your Review</span>
                                  <div style={{ display: 'flex', gap: '4px' }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star 
                                        key={star} 
                                        size={16} 
                                        onClick={() => setEditReviewForm({ ...editReviewForm, rating: star })}
                                        fill={star <= editReviewForm.rating ? '#fbbf24' : 'none'}
                                        style={{ color: '#fbbf24', cursor: 'pointer' }}
                                        className="star-interactive"
                                      />
                                    ))}
                                  </div>
                                </div>

                                <div className="input-icon-wrapper">
                                  <input 
                                    type="text"
                                    value={editReviewForm.comment}
                                    onChange={(e) => setEditReviewForm({ ...editReviewForm, comment: e.target.value })}
                                    className="form-input"
                                    required
                                    style={{ width: '100%' }}
                                  />
                                </div>

                                {/* Edit Photo attachment */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                  <label 
                                    style={{ 
                                      display: 'inline-flex', 
                                      alignItems: 'center', 
                                      gap: '6px', 
                                      padding: '4px 10px', 
                                      background: 'var(--bg-secondary)', 
                                      border: '1px solid var(--border-color)', 
                                      borderRadius: '6px', 
                                      fontSize: '11.5px', 
                                      cursor: 'pointer',
                                      color: 'var(--text-secondary)'
                                    }}
                                  >
                                    <Camera size={13} style={{ color: 'var(--accent-teal)' }} />
                                    <span>{isUploadingEditReviewImg ? 'Uploading...' : editReviewImage ? 'Replace Photo' : 'Attach Photo'}</span>
                                    <input 
                                      type="file" 
                                      accept="image/*" 
                                      onChange={(e) => handleReviewImageUpload(e, true)} 
                                      style={{ display: 'none' }} 
                                    />
                                  </label>

                                  {editReviewImage && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <img 
                                        src={formatImageUrl(editReviewImage)} 
                                        alt="Preview" 
                                        style={{ width: '30px', height: '30px', borderRadius: '4px', objectFit: 'cover' }} 
                                      />
                                      <button 
                                        type="button" 
                                        onClick={() => setEditReviewImage('')}
                                        style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', fontSize: '11px' }}
                                      >
                                        Remove Photo
                                      </button>
                                    </div>
                                  )}
                                </div>

                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                  <button type="button" onClick={handleCancelEditReview} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }}>
                                    Cancel
                                  </button>
                                  <button type="submit" className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '12px' }}>
                                    Save Changes
                                  </button>
                                </div>
                              </form>
                            </div>
                          );
                        }

                        return (
                          <div key={rev.id} className="review-item" style={{ padding: '16px' }}>
                            <div className="review-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <span className="review-author">{rev.reviewerName}</span>
                                <div style={{ display: 'flex', gap: '2px', color: '#fbbf24', marginTop: '4px' }}>
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star 
                                      key={star} 
                                      size={12} 
                                      fill={star <= rev.rating ? '#fbbf24' : 'none'}
                                      style={{ color: '#fbbf24' }}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                                <span className="review-date">{rev.date}</span>
                                {isOwner && (
                                  <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                                    <button 
                                      type="button" 
                                      onClick={() => handleStartEditReview(rev)} 
                                      style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', padding: '0', textDecoration: 'underline' }}
                                    >
                                      Edit
                                    </button>
                                    <span style={{ color: 'var(--text-muted)' }}>|</span>
                                    <button 
                                      type="button" 
                                      onClick={() => handleDeleteReview(rev.id)} 
                                      style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', padding: '0', textDecoration: 'underline' }}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <p className="review-comment" style={{ marginTop: '8px' }}>{rev.comment}</p>

                            {/* Customer Uploaded Review Photo */}
                            {rev.imageUrl && (
                              <div style={{ marginTop: '10px' }}>
                                <div 
                                  onClick={() => setReviewLightboxImg({ url: formatImageUrl(rev.imageUrl), author: rev.reviewerName, product: selectedProduct.name })}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    background: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    padding: '6px 12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    maxWidth: '100%'
                                  }}
                                  title="Click to view customer photo"
                                >
                                  <img 
                                    src={formatImageUrl(rev.imageUrl)} 
                                    alt="Customer Unboxing Photo" 
                                    style={{ width: '46px', height: '46px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-light)' }} 
                                  />
                                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <Camera size={13} style={{ color: 'var(--accent-teal)' }} /> Customer Photo
                                    </span>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                      <Eye size={11} /> Click to enlarge
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Customer Review Image Lightbox Modal */}
      {reviewLightboxImg && (
        <div 
          className="image-lightbox-overlay" 
          style={{ zIndex: 99999 }}
          onClick={() => setReviewLightboxImg(null)}
        >
          <div className="lightbox-header" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-title">
              <Camera size={18} style={{ color: 'var(--accent-teal)' }} />
              <span>Customer Review Photo: {reviewLightboxImg.product}</span>
              <span className="badge badge-customer" style={{ marginLeft: '6px', fontSize: '11px' }}>By {reviewLightboxImg.author}</span>
            </div>
            <button 
              type="button" 
              className="lightbox-close-btn" 
              onClick={() => setReviewLightboxImg(null)}
              title="Close Preview (Esc)"
            >
              <X size={20} />
            </button>
          </div>
          <div className="lightbox-main-stage" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-img-wrapper" style={{ maxHeight: '80vh', maxWidth: '85vw' }}>
              <img 
                src={reviewLightboxImg.url} 
                alt="Customer Review Photo" 
                style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }} 
              />
            </div>
          </div>
        </div>
      )}

      {/* In-App Fullscreen Image Gallery Lightbox (Slides images one by one with arrows/touch) */}
      {showLightbox && selectedProduct && (() => {
        const allImages = [];
        if (selectedProduct.imageUrl && selectedProduct.imageUrl !== '📦') {
          const formatted = formatImageUrl(selectedProduct.imageUrl);
          if (formatted) allImages.push(formatted);
        }
        if (selectedProduct.images && selectedProduct.images.length > 0) {
          selectedProduct.images.forEach(img => {
            const formatted = formatImageUrl(img);
            if (formatted && !allImages.includes(formatted)) allImages.push(formatted);
          });
        }
        if (allImages.length === 0) {
          allImages.push(formatImageUrl(selectedProduct.imageUrl) || '📦');
        }
        const currentImg = allImages[activeImageIndex] || allImages[0] || '📦';
        const isEmoji = currentImg.length <= 4;

        return (
          <div className="image-lightbox-overlay" onClick={() => setShowLightbox(false)}>
            {/* Top Bar */}
            <div className="lightbox-header" onClick={(e) => e.stopPropagation()}>
              <div className="lightbox-title">
                <ProductIcon name={selectedProduct.name} category={selectedProduct.category} size={22} />
                <span>{selectedProduct.name}</span>
                <span className="badge badge-customer" style={{ marginLeft: '6px', fontSize: '11px' }}>{selectedProduct.category}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span className="lightbox-counter">
                  Image {activeImageIndex + 1} of {allImages.length}
                </span>
                <button 
                  type="button"
                  className="lightbox-close-btn"
                  onClick={() => setShowLightbox(false)}
                  title="Close Gallery (Esc)"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Main Stage with Big Image and Nav Buttons */}
            <div className="lightbox-main-stage" onClick={(e) => e.stopPropagation()}>
              {allImages.length > 1 && (
                <button 
                  type="button"
                  className="lightbox-nav-btn prev"
                  onClick={() => setActiveImageIndex(prev => (prev - 1 + allImages.length) % allImages.length)}
                  title="Previous Image (Left Arrow)"
                >
                  ‹
                </button>
              )}

              <div className="lightbox-img-wrapper">
                {isEmoji ? (
                  <span style={{ fontSize: '140px', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }}>
                    {currentImg}
                  </span>
                ) : (
                  <img 
                    key={activeImageIndex}
                    src={currentImg} 
                    alt={`${selectedProduct.name} - slide ${activeImageIndex + 1}`} 
                  />
                )}
              </div>

              {allImages.length > 1 && (
                <button 
                  type="button"
                  className="lightbox-nav-btn next"
                  onClick={() => setActiveImageIndex(prev => (prev + 1) % allImages.length)}
                  title="Next Image (Right Arrow)"
                >
                  ›
                </button>
              )}
            </div>

            {/* Bottom Thumbnail Strip */}
            <div className="lightbox-thumbnails" onClick={(e) => e.stopPropagation()}>
              {allImages.map((img, idx) => {
                const isActive = idx === activeImageIndex;
                const thumbIsEmoji = img.length <= 4;
                return (
                  <div 
                    key={idx}
                    className={`lightbox-thumb-item ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(idx)}
                    title={`Slide to Image ${idx + 1}`}
                  >
                    {thumbIsEmoji ? (
                      <span style={{ fontSize: '24px' }}>{img}</span>
                    ) : (
                      <img src={img} alt={`thumb ${idx + 1}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

                  {/* Payment & Checkout Modal */}
      {showPaymentModal && (
        <div 
          className="modal-overlay" 
          style={{ zIndex: 2500 }} 
          onClick={() => { 
            if (!isProcessingPayment) { 
              setShowPaymentModal(false); 
              setBuyNowItem(null); 
              setCheckoutMode('cart'); 
            } 
          }}
        >
          <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            
            {/* Modal Header & Progress Stepper */}
            <div className="modal-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldCheck size={22} style={{ color: 'var(--accent-teal)' }} />
                  {paymentStep === 1 && (checkoutMode === 'buynow' ? "Direct Buy Now Checkout" : "Checkout: Delivery & Review")}
                  {paymentStep === 2 && "Secure Payment Gateway"}
                  {paymentStep === 3 && "Processing Payment"}
                  {paymentStep === 4 && "Order Confirmed!"}
                </h2>
                {!isProcessingPayment && (
                  <button 
                    onClick={() => { 
                      setShowPaymentModal(false); 
                      setBuyNowItem(null); 
                      setCheckoutMode('cart'); 
                    }} 
                    className="btn-icon-only"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* Step indicator */}
              <div className="checkout-stepper-container">
                {[
                  { num: 1, label: 'Address', fullLabel: 'Review & Address' },
                  { num: 2, label: 'Payment', fullLabel: 'Payment' },
                  { num: 3, label: 'Verify', fullLabel: 'Verification' },
                  { num: 4, label: 'Created', fullLabel: 'Order Created' }
                ].map((s, idx) => {
                  const isActive = paymentStep === s.num;
                  const isCompleted = paymentStep > s.num;
                  return (
                    <React.Fragment key={s.num}>
                      <div className="checkout-step-item">
                        <div className={`checkout-step-circle ${isCompleted ? 'completed' : isActive ? 'active' : ''}`}>
                          {isCompleted ? <Check size={12} /> : s.num}
                        </div>
                        <span className={`checkout-step-label ${isActive ? 'active' : ''}`}>
                          <span className="step-label-desktop">{s.fullLabel}</span>
                          <span className="step-label-mobile">{s.label}</span>
                        </span>
                      </div>
                      {idx < 3 && (
                        <div className={`checkout-step-line ${paymentStep > s.num ? 'completed' : ''}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Modal Body: Dynamic per step */}
            <div className="modal-body" style={{ overflowY: 'auto', padding: '20px' }}>
              
              {/* STEP 1: Delivery Address & Order Review */}
              {paymentStep === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Modern Compact Delivery Address Section */}
                  <div style={{ background: 'var(--bg-input)', padding: '14px 16px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: savedAddresses.length > 0 ? '10px' : '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={16} style={{ color: 'var(--accent-teal)' }} />
                        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Delivery Address
                        </span>
                      </div>
                      {savedAddresses.length > 0 && (
                        <button 
                          type="button" 
                          onClick={() => {
                            setShowPaymentModal(false);
                            onGoToProfile('addresses');
                          }} 
                          style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontSize: '11px', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                        >
                          + Manage Addresses
                        </button>
                      )}
                    </div>

                    {savedAddresses.length > 0 ? (
                      <div>
                        {/* Horizontal Compact Address Selection Chips */}
                        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '6px' }}>
                          {savedAddresses.map((addr) => {
                            const formattedAddr = `${addr.streetAddress}, ${addr.city}, ${addr.state} - ${addr.postalCode}`;
                            const isSelected = deliveryInfo.address === formattedAddr && deliveryInfo.name === addr.fullName;
                            return (
                              <div
                                key={addr.id}
                                onClick={() => {
                                  setDeliveryInfo({
                                    name: addr.fullName,
                                    phone: addr.phone,
                                    address: formattedAddr
                                  });
                                  setShowCustomAddressInput(false);
                                }}
                                style={{
                                  flex: '1 1 0px',
                                  minWidth: '200px',
                                  padding: '10px 12px',
                                  borderRadius: '8px',
                                  border: isSelected ? '2px solid var(--accent-teal)' : '1px solid var(--border-light)',
                                  background: isSelected ? 'rgba(20, 184, 166, 0.08)' : 'var(--bg-card)',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                  position: 'relative'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                  <span className="badge badge-customer" style={{ fontSize: '9px', padding: '1px 5px', fontWeight: '700' }}>
                                    {addr.addressType || 'HOME'}
                                  </span>
                                  {isSelected ? (
                                    <span style={{ fontSize: '10px', color: 'var(--accent-teal)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                      <Check size={11} strokeWidth={3} /> Selected
                                    </span>
                                  ) : addr.isDefault ? (
                                    <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Default</span>
                                  ) : null}
                                </div>

                                <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {addr.fullName} <span style={{ fontWeight: '400', fontSize: '11px', color: 'var(--text-muted)' }}>({addr.phone})</span>
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                  {addr.streetAddress}, {addr.city}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Toggle button for custom manual address */}
                        <div style={{ marginTop: '8px' }}>
                          <button
                            type="button"
                            onClick={() => setShowCustomAddressInput(!showCustomAddressInput)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '11px', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            {showCustomAddressInput ? '▲ Hide Custom Address Form' : '▼ Or enter a different delivery address'}
                          </button>
                        </div>

                        {showCustomAddressInput && (
                          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px dashed var(--border-light)', paddingTop: '10px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                              <input 
                                type="text" 
                                value={deliveryInfo.name} 
                                onChange={(e) => setDeliveryInfo({ ...deliveryInfo, name: e.target.value })} 
                                className="form-input" 
                                placeholder="Recipient Name"
                                style={{ fontSize: '12px', padding: '8px 10px' }}
                                required
                              />
                              <input 
                                type="tel" 
                                value={deliveryInfo.phone} 
                                onChange={(e) => setDeliveryInfo({ ...deliveryInfo, phone: e.target.value })} 
                                className="form-input" 
                                placeholder="Contact Phone"
                                style={{ fontSize: '12px', padding: '8px 10px' }}
                                required
                              />
                            </div>
                            <input 
                              type="text" 
                              value={deliveryInfo.address} 
                              onChange={(e) => setDeliveryInfo({ ...deliveryInfo, address: e.target.value })} 
                              className="form-input" 
                              placeholder="Street Address, City, State, PIN Code"
                              style={{ fontSize: '12px', padding: '8px 10px' }}
                              required
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <input 
                            type="text" 
                            value={deliveryInfo.name} 
                            onChange={(e) => setDeliveryInfo({ ...deliveryInfo, name: e.target.value })} 
                            className="form-input" 
                            placeholder="Recipient Name *"
                            style={{ fontSize: '12px', padding: '8px 10px' }}
                            required
                          />
                          <input 
                            type="tel" 
                            value={deliveryInfo.phone} 
                            onChange={(e) => setDeliveryInfo({ ...deliveryInfo, phone: e.target.value })} 
                            className="form-input" 
                            placeholder="Phone Number *"
                            style={{ fontSize: '12px', padding: '8px 10px' }}
                            required
                          />
                        </div>
                        <input 
                          type="text" 
                          value={deliveryInfo.address} 
                          onChange={(e) => setDeliveryInfo({ ...deliveryInfo, address: e.target.value })} 
                          className="form-input" 
                          placeholder="Full Street Address, City, State, PIN Code *"
                          style={{ fontSize: '12px', padding: '8px 10px' }}
                          required
                        />
                      </div>
                    )}
                  </div>

                  {/* Order Items Review */}
                  <div>
                    <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: '700' }}>
                      Items to Purchase ({activeCheckoutItems.reduce((sum, it) => sum + it.quantity, 0)})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                      {activeCheckoutItems.map((item) => {
                        const hasDisc = item.originalPrice && item.originalPrice > item.price;
                        return (
                          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-input)' }}>
                                {item.imageUrl && formatImageUrl(item.imageUrl).length > 4 ? (
                                  <img src={formatImageUrl(item.imageUrl)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  <ProductIcon name={item.name} category={item.category} size={16} />
                                )}
                              </div>
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: '600' }}>{item.name}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                  Qty: {item.quantity} × ₹{Number(item.price).toLocaleString('en-IN')}
                                  {hasDisc && (
                                    <span style={{ 
                                      marginLeft: '6px', 
                                      fontSize: '9px', 
                                      padding: '1px 5px', 
                                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                      color: '#ffffff',
                                      fontWeight: '800',
                                      borderRadius: '3px'
                                    }}>
                                      {item.discountPercentage}% OFF
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <strong style={{ fontSize: '14px', color: 'var(--accent-teal)' }}>
                              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                            </strong>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Coupon Code Selection Field */}
                  <div style={{ background: 'var(--bg-input)', padding: '14px 16px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                      Select Available Coupon / Promo Code
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select 
                        value={couponCodeInput}
                        onChange={(e) => {
                          setCouponCodeInput(e.target.value);
                          if (appliedCoupon && appliedCoupon.couponCode !== e.target.value) {
                            setAppliedCoupon(null);
                            setCouponError('');
                            setCouponSuccess('');
                          }
                        }}
                        className="form-input"
                        style={{ fontSize: '13px', padding: '6px 10px', flex: 1 }}
                        disabled={appliedCoupon != null}
                      >
                        <option value="">-- Choose Coupon --</option>
                        {availableCoupons.map(c => {
                          const isEligible = isCouponEligibleForCart(c);
                          const errorMsg = !isEligible ? ' [Not Applicable]' : '';
                          const formatDateTime = (isoString) => {
                            if (!isoString) return '';
                            return isoString.replace('T', ' ').substring(0, 16);
                          };

                          return (
                            <option 
                              key={c.id} 
                              value={c.code}
                              disabled={!isEligible}
                              style={{ textDecoration: !isEligible ? 'line-through' : 'none', color: !isEligible ? 'var(--text-muted)' : 'inherit' }}
                            >
                              {c.code} - {c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `₹${c.discountValue}`} Off {c.minOrderAmount ? `(Min: ₹${c.minOrderAmount})` : ''} (Expires: {formatDateTime(c.expiryDate)}){errorMsg}
                            </option>
                          );
                        })}
                      </select>
                      {appliedCoupon ? (
                        <button 
                          type="button" 
                          onClick={handleRemoveCoupon}
                          className="btn btn-secondary"
                          style={{ fontSize: '12px', padding: '6px 12px', color: 'var(--accent-rose)' }}
                        >
                          Remove
                        </button>
                      ) : (
                        <button 
                          type="button" 
                          onClick={handleApplyCoupon}
                          className="btn btn-primary"
                          style={{ fontSize: '12px', padding: '6px 16px', background: 'var(--accent-teal)' }}
                          disabled={isValidatingCoupon}
                        >
                          {isValidatingCoupon ? 'Checking...' : 'Apply'}
                        </button>
                      )}
                    </div>
                    {couponError && (
                      <div style={{ fontSize: '11px', color: 'var(--accent-rose)', marginTop: '6px', fontWeight: '600' }}>
                        ⚠️ {couponError}
                      </div>
                    )}
                    {couponSuccess && (
                      <div style={{ fontSize: '11px', color: 'var(--accent-emerald)', marginTop: '6px', fontWeight: '600' }}>
                        ✓ {couponSuccess}
                      </div>
                    )}
                    {appliedCoupon && appliedCoupon.excludedItems && appliedCoupon.excludedItems.length > 0 && (
                      <div style={{ fontSize: '11px', color: '#f59e0b', marginTop: '6px', lineHeight: '1.3' }}>
                        ℹ️ <strong>Excluded items</strong>: {appliedCoupon.excludedItems.join(', ')}
                      </div>
                    )}
                  </div>

                  {/* Financial Price Breakdown */}
                  <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                    <div className="flex-between" style={{ color: 'var(--text-secondary)' }}>
                      <span>Total Regular MRP</span>
                      <span>₹{calculateOriginalSubtotal().toLocaleString('en-IN')}</span>
                    </div>
                    {calculateDiscountSavings() > 0 && (
                      <div className="flex-between" style={{ color: 'var(--accent-teal)' }}>
                        <span style={{ fontWeight: '600' }}>Total Discount Savings</span>
                        <strong style={{ fontWeight: '700' }}>-₹{calculateDiscountSavings().toLocaleString('en-IN')}</strong>
                      </div>
                    )}
                    <div className="flex-between" style={{ color: 'var(--text-secondary)' }}>
                      <span>Items Subtotal</span>
                      <span>₹{calculateSubtotal().toLocaleString('en-IN')}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex-between" style={{ color: 'var(--accent-teal)' }}>
                        <span style={{ fontWeight: '600' }}>Coupon Discount ({appliedCoupon.couponCode})</span>
                        <strong style={{ fontWeight: '700' }}>-₹{appliedCoupon.discountAmount.toLocaleString('en-IN')}</strong>
                      </div>
                    )}
                    <div className="flex-between">
                      <span style={{ color: 'var(--text-secondary)' }}>Delivery Charges</span>
                      {calculateDeliveryFee() === 0 ? (
                        <span style={{ color: '#10b981', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>FREE</span>
                          <span style={{ fontSize: '11px', textDecoration: 'line-through', color: 'var(--text-muted)' }}>₹99</span>
                        </span>
                      ) : (
                        <strong style={{ color: 'var(--text-primary)' }}>₹99</strong>
                      )}
                    </div>
                    <div className="flex-between" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '10px', fontSize: '16px', color: 'var(--text-primary)' }}>
                      <span style={{ fontWeight: '700' }}>Final Amount Payable</span>
                      <strong style={{ color: 'var(--accent-teal)', fontSize: '18px', fontWeight: '800' }}>
                        ₹{calculateTotal().toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>

                  <button 
                    type="button"
                    onClick={() => {
                      if (!deliveryInfo.name.trim() || !deliveryInfo.address.trim()) {
                        showFlash('error', 'Please fill in your recipient name and delivery address.');
                        return;
                      }
                      setPaymentStep(2);
                    }} 
                    className="btn btn-primary btn-block" 
                    style={{ padding: '12px', fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    Proceed to Payment Options <ArrowRight size={18} />
                  </button>
                </div>
              )}

              {/* STEP 2: Choose Payment Method */}
              {paymentStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '12px', fontWeight: '700' }}>
                      Select Payment Method
                    </h4>

                    {/* Payment Method Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div 
                        onClick={() => setPaymentMethod('razorpay')}
                        style={{
                          padding: '16px',
                          borderRadius: '10px',
                          border: paymentMethod === 'razorpay' ? '2px solid var(--accent-teal)' : '1px solid var(--border-light)',
                          background: paymentMethod === 'razorpay' ? 'rgba(20, 184, 166, 0.08)' : 'var(--bg-input)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          position: 'relative'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ShieldCheck size={20} style={{ color: paymentMethod === 'razorpay' ? 'var(--accent-teal)' : 'var(--text-secondary)' }} />
                            <strong style={{ fontSize: '14px', color: paymentMethod === 'razorpay' ? 'var(--accent-teal)' : 'var(--text-primary)' }}>Razorpay Checkout</strong>
                          </div>
                          {paymentMethod === 'razorpay' && (
                            <span style={{ fontSize: '11px', color: 'var(--accent-teal)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '2px' }}>
                              <Check size={12} strokeWidth={3} /> Selected
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>UPI, Cards, NetBanking, Wallets</span>
                      </div>

                      <div 
                        onClick={() => setPaymentMethod('cod')}
                        style={{
                          padding: '16px',
                          borderRadius: '10px',
                          border: paymentMethod === 'cod' ? '2px solid var(--accent-teal)' : '1px solid var(--border-light)',
                          background: paymentMethod === 'cod' ? 'rgba(20, 184, 166, 0.08)' : 'var(--bg-input)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          position: 'relative'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Truck size={20} style={{ color: paymentMethod === 'cod' ? 'var(--accent-teal)' : 'var(--text-secondary)' }} />
                            <strong style={{ fontSize: '14px', color: paymentMethod === 'cod' ? 'var(--accent-teal)' : 'var(--text-primary)' }}>Cash on Delivery</strong>
                          </div>
                          {paymentMethod === 'cod' && (
                            <span style={{ fontSize: '11px', color: 'var(--accent-teal)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '2px' }}>
                              <Check size={12} strokeWidth={3} /> Selected
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pay cash or UPI upon package arrival</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Details Preview */}
                  <div style={{ background: 'var(--bg-input)', padding: '18px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                    {paymentMethod === 'razorpay' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(20, 184, 166, 0.1)', color: 'var(--accent-teal)' }}>
                            <ShieldCheck size={26} />
                          </div>
                          <div>
                            <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Razorpay Payment Gateway</strong>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                              Instant verification • Official Razorpay Sandbox Active
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                          {['UPI / QR', 'Google Pay', 'PhonePe', 'Paytm', 'Visa / Mastercard', 'RuPay', 'NetBanking (All Banks)', 'Wallets'].map((tag, i) => (
                            <span key={i} style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: 'var(--bg-card)', border: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                          Clicking below will securely open the official Razorpay Checkout popup with test mode support.
                        </p>
                      </div>
                    )}

                    {paymentMethod === 'cod' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(20, 184, 166, 0.1)', color: 'var(--accent-teal)' }}>
                          <Truck size={26} />
                        </div>
                        <div>
                          <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Cash on Delivery (COD)</strong>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            Pay ₹{calculateTotal().toLocaleString('en-IN')} in cash or scan QR when your order is delivered.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Payment Button & Security Note */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        type="button" 
                        onClick={() => setPaymentStep(1)} 
                        className="btn btn-secondary" 
                        style={{ padding: '12px 18px' }}
                      >
                        Back
                      </button>
                      <button 
                        type="button" 
                        onClick={handleProcessPayment} 
                        className="btn btn-success" 
                        style={{ flex: 1, padding: '12px', fontSize: '15px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        {paymentMethod === 'cod' ? (
                          <>
                            <Truck size={18} /> Confirm Cash on Delivery (₹{calculateTotal().toLocaleString('en-IN')})
                          </>
                        ) : (
                          <>
                            <Lock size={18} /> Pay ₹{calculateTotal().toLocaleString('en-IN')} with Razorpay
                          </>
                        )}
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <Lock size={12} /> 256-Bit SSL Encrypted & PCI-DSS Level 1 Certified via Razorpay
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Processing Screen */}
              {paymentStep === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center', gap: '16px' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '4px solid rgba(20, 184, 166, 0.2)', borderTopColor: 'var(--accent-teal)', animation: 'spin 1s linear infinite' }} />
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>Authorizing Payment</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '320px', margin: '0 auto' }}>
                      Communicating with payment gateway and securing order reservation. Please do not refresh.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 4: Order Created Confirmation Screen */}
              {paymentStep === 4 && confirmedOrder && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '20px 10px', gap: '16px' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={38} />
                  </div>

                  <div>
                    <span className="badge badge-approved" style={{ fontSize: '12px', padding: '4px 10px', marginBottom: '8px' }}>PAYMENT SUCCESSFUL</span>
                    <h3 style={{ fontSize: '22px', fontWeight: '800', marginTop: '6px', color: 'var(--text-primary)' }}>Order Placed Successfully!</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                      Order reference: <strong style={{ color: 'var(--accent-blue)' }}>{confirmedOrder.orderId}</strong>
                    </p>
                  </div>

                  <div style={{ width: '100%', background: 'var(--bg-input)', padding: '16px', borderRadius: '10px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                    <div className="flex-between">
                      <span style={{ color: 'var(--text-muted)' }}>Order Date:</span>
                      <strong>{confirmedOrder.date}</strong>
                    </div>
                    <div className="flex-between">
                      <span style={{ color: 'var(--text-muted)' }}>Deliver to:</span>
                      <strong>{deliveryInfo.name} ({deliveryInfo.phone})</strong>
                    </div>
                    <div className="flex-between">
                      <span style={{ color: 'var(--text-muted)' }}>Total Amount Paid:</span>
                      <strong style={{ color: 'var(--accent-teal)', fontSize: '16px' }}>₹{confirmedOrder.totalAmount?.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '8px' }}>
                    <button 
                      type="button" 
                      onClick={() => {
                        setShowPaymentModal(false);
                        setBuyNowItem(null);
                        setCheckoutMode('cart');
                        setShowOrdersModal(true);
                      }} 
                      className="btn btn-secondary" 
                      style={{ flex: 1, padding: '12px' }}
                    >
                      View Order History
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        setShowPaymentModal(false);
                        setBuyNowItem(null);
                        setCheckoutMode('cart');
                      }} 
                      className="btn btn-primary" 
                      style={{ flex: 1, padding: '12px' }}
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}