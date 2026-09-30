import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  User, Package, RefreshCw, ArrowLeft, Edit2, Save, X, LogOut, ChevronDown,
  CheckCircle2, AlertCircle, Phone, MapPin, Sun, Moon, Heart, 
  ShoppingCart, Plus, Minus, Trash2, Check,
  CreditCard, QrCode, Smartphone, ArrowRight, ShieldCheck, Lock, Store, Truck,
  Receipt, RotateCcw, DollarSign, Clock, HelpCircle, FileText, CheckCircle, Search, Filter, AlertTriangle,
  UploadCloud, Image, Camera, Eye, Maximize2
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

export default function CustomerDashboard({ 
  user, orders = [], setOrders, cart = [], setCart, wishlist = [], setWishlist, 
  toggleWishlist, addToCart, fetchOrders, fetchWishlist, onUpdateUser, onLogout, onGoToHome, onGoToAdmin, onGoToWarehouse, onGoToVendor, theme, onToggleTheme,
  initialTab = 'profile'
}) {
  const [profile, setProfile] = useState({
    id: user?.id,
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    role: user?.role || 'CUSTOMER',
    vendorCode: user?.vendorCode || null
  });

  const isAdmin = profile.role === 'ADMINISTRATOR' || profile.role === 'ADMIN' || user?.role === 'ADMINISTRATOR' || user?.role === 'ADMIN';
  const isStaff = profile.role === 'WAREHOUSE_STAFF' || user?.role === 'WAREHOUSE_STAFF';
  const isVendor = profile.role === 'VENDOR' || profile.role === 'SELLER' || user?.role === 'VENDOR' || user?.role === 'SELLER';
  const isPrivileged = isAdmin || isStaff;

  const [activeTab, setActiveTab] = useState(isPrivileged ? 'profile' : initialTab);
  const [showDropdown, setShowDropdown] = useState(false);
  const userMenuRef = useRef(null);

  // If Admin or Warehouse Staff, ensure activeTab stays on profile
  useEffect(() => {
    if (isPrivileged && activeTab !== 'profile') {
      setActiveTab('profile');
    }
  }, [isPrivileged, activeTab]);

  // Close dropdown when clicking outside
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
  
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (activeTab === 'wishlist' && fetchWishlist) {
      fetchWishlist();
    }
  }, [activeTab, fetchWishlist]);

  const [isEditing, setIsEditing] = useState(false);
  const [flash, setFlash] = useState({ type: '', title: '', text: '' });

  // Role-specific metrics for notification engine
  const [pendingProductsCount, setPendingProductsCount] = useState(0);
  const [adminPlatformOrdersCount, setAdminPlatformOrdersCount] = useState(0);
  const [adminVendorsCount, setAdminVendorsCount] = useState(0);
  const [warehouseAllocationsCount, setWarehouseAllocationsCount] = useState(0);
  const [vendorOrders, setVendorOrders] = useState([]);
  const [vendorProducts, setVendorProducts] = useState([]);
  const [vendorCoupons, setVendorCoupons] = useState([]);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [couponApprovals, setCouponApprovals] = useState([]);
  const [couponMappings, setCouponMappings] = useState([]);

  const activeUserId = profile?.id || user?.id;

  const fetchRoleNotificationData = async () => {
    if (!activeUserId) return;
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
      } else if (isVendor) {
        const [ordersRes, prodsRes, couponsRes] = await Promise.allSettled([
          axios.get(`http://localhost:8080/api/vendor/${activeUserId}/orders`),
          axios.get(`http://localhost:8080/api/products/vendor/${activeUserId}`),
          axios.get(`http://localhost:8080/api/coupons/vendor/${activeUserId}`)
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
      console.error("Failed to fetch role notification data in CustomerDashboard", err);
    }
  };

  useEffect(() => {
    fetchRoleNotificationData();
  }, [activeUserId, isAdmin, isStaff, isVendor]);

  // Notifications State for Customer Dashboard
  const [notificationList, setNotificationList] = useState([]);

  const refreshNotifications = () => {
    let list = [];
    const targetUser = profile.id ? profile : user;
    if (isAdmin) {
      list = generateAdminNotifications({
        user: targetUser,
        pendingProductsCount,
        ordersCount: adminPlatformOrdersCount || orders?.length || 0,
        vendorsCount: adminVendorsCount,
        onGoToTab: (tab) => {
          if (onGoToAdmin) onGoToAdmin(tab);
        }
      });
    } else if (isStaff) {
      list = generateWarehouseNotifications({
        user: targetUser,
        pendingAllocationsCount: warehouseAllocationsCount,
        onGoToQueue: (tab, subTab) => {
          if (onGoToWarehouse) onGoToWarehouse(tab, subTab);
        }
      });
    } else if (isVendor) {
      list = generateVendorNotifications({
        user: targetUser,
        products: vendorProducts,
        orders: vendorOrders,
        purchaseOrders: orders, // Vendor personal shopping orders
        coupons: vendorCoupons,
        onGoToTab: (tab) => {
          if (onGoToVendor) onGoToVendor(tab);
        },
        onOpenPurchaseOrder: () => {
          setActiveTab('orders');
        }
      });
    } else {
      list = generateCustomerNotifications({
        user: targetUser,
        orders,
        coupons: availableCoupons,
        onOpenOrders: () => {
          setActiveTab('orders');
        },
        onShopNow: (coupon) => {
          if (coupon && coupon.code) {
            setCouponCodeInput(coupon.code);
            setActiveTab('cart');
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
    profile, 
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
    markNotifAsRead(id, profile?.id || user?.id || profile?.email || user?.email);
    refreshNotifications();
  };

  const handleMarkAllNotifsAsRead = () => {
    markAllNotifsAsRead(notificationList.map(n => n.id), profile?.id || user?.id || profile?.email || user?.email);
    refreshNotifications();
  };

  const handleClearAllNotifs = () => {
    clearAllNotifs(profile?.id || user?.id || profile?.email || user?.email, notificationList.map(n => n.id));
    refreshNotifications();
  };

  const handleDismissNotif = (id) => {
    dismissNotif(id, profile?.id || user?.id || profile?.email || user?.email);
    refreshNotifications();
  };

  const showToast = (type, title, text) => {
    let msg = text;
    if (typeof text === 'object' && text !== null) {
      msg = extractErrorMessage(text);
    }
    setFlash({ type, title: title || (type === 'success' ? 'Success' : 'Notification'), text: msg });
    setTimeout(() => setFlash({ type: '', title: '', text: '' }), 3500);
  };

  const [showVendorPromptModal, setShowVendorPromptModal] = useState(false);
  const [switchVendorCode, setSwitchVendorCode] = useState('');
  const [showUpgradedCodeModal, setShowUpgradedCodeModal] = useState(null);

  // Address Management state
  const [addresses, setAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressModalMode, setAddressModalMode] = useState('add'); // 'add' | 'edit'
  const [showCustomAddressInput, setShowCustomAddressInput] = useState(false);
  const [selectedCartItemIds, setSelectedCartItemIds] = useState([]);
  const [products, setProducts] = useState([]);

  // Transactions & Refunds State
  const [transactions, setTransactions] = useState([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [transactionFilter, setTransactionFilter] = useState('ALL');
  const [transactionSearch, setTransactionSearch] = useState('');
  
  // Customer Return / Refund Request Modal State
  const [refundModalOrder, setRefundModalOrder] = useState(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [returnReasonCategory, setReturnReasonCategory] = useState('DEFECTIVE_DAMAGED');
  const [resolutionType, setResolutionType] = useState('REFUND');
  const [refundReason, setRefundReason] = useState('Defective or damaged item received');
  const [customerNotes, setCustomerNotes] = useState('');
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);
  const [orderRefundHistory, setOrderRefundHistory] = useState([]);
  const [customerProofImage, setCustomerProofImage] = useState('');
  


  // Experience feedback survey states
  const [feedbackRatingInput, setFeedbackRatingInput] = useState({});
  const [feedbackCommentInput, setFeedbackCommentInput] = useState({});
  const [feedbackImageInput, setFeedbackImageInput] = useState({});
  const [editingFeedbackOrderId, setEditingFeedbackOrderId] = useState(null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState({});
  const [isUploadingFeedbackImage, setIsUploadingFeedbackImage] = useState({});
  const [previewLightboxImage, setPreviewLightboxImage] = useState(null);
  const [orderRefundsMap, setOrderRefundsMap] = useState({});

  const handleFeedbackImageUpload = async (orderId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'File Too Large', 'Please select an image smaller than 5MB.');
      return;
    }

    setIsUploadingFeedbackImage(prev => ({ ...prev, [orderId]: true }));
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post('http://localhost:8080/api/products/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.imageUrl) {
        setFeedbackImageInput(prev => ({ ...prev, [orderId]: res.data.imageUrl }));
        showToast('success', 'Image Uploaded', 'Product review photo attached.');
      }
    } catch (err) {
      // Fallback: Read as base64 data URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setFeedbackImageInput(prev => ({ ...prev, [orderId]: event.target.result }));
        showToast('success', 'Image Attached', 'Product review photo attached.');
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingFeedbackImage(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const fetchTransactions = async () => {
    if (!profile.id) return;
    setIsLoadingTransactions(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/payment/transactions?userId=${profile.id}`);
      setTransactions(res.data || []);
    } catch (err) {
      console.error("Failed to load customer transactions", err);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const getDaysElapsed = (orderDateStr) => {
    try {
      // Parse MMM dd, yyyy
      const parts = orderDateStr.split(' ');
      if (parts.length < 3) return 0;
      const orderDate = new Date(orderDateStr);
      if (isNaN(orderDate.getTime())) return 0;
      const diffTime = Math.abs(new Date() - orderDate);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (e) {
      return 0;
    }
  };

  const getProductReturnPolicy = (productId) => {
    const prod = products.find(p => p.id === productId);
    return prod ? prod.returnPolicy || '7_DAYS' : '7_DAYS';
  };

  const handleOpenRefundModal = async (order) => {
    const isDelivered = (order.status || '').toUpperCase() === 'DELIVERED';
    const daysElapsed = isDelivered ? getDaysElapsed(order.deliveredAt || order.date) : 0;
    const hasEligibleItem = order.items && order.items.some(item => {
      const policy = getProductReturnPolicy(item.productId);
      if (policy === 'NON_RETURNABLE') return false;
      if (isDelivered) {
        if (policy === '7_DAYS' && daysElapsed > 7) return false;
        if (policy === '15_DAYS' && daysElapsed > 15) return false;
      }
      return true;
    });

    if (!hasEligibleItem) {
      showToast('error', 'Return Blocked', 'None of the items in this order are eligible for return (policy window expired or marked non-returnable).');
      return;
    }

    setRefundModalOrder(order);
    const rem = order.refundableBalance !== undefined ? order.refundableBalance : order.totalAmount;
    setRefundAmount(rem.toString());
    setReturnReasonCategory('DEFECTIVE_DAMAGED');
    setResolutionType('REFUND');
    setRefundReason('Defective or damaged item received');
    setCustomerNotes('');
    setCustomerProofImage('');
    try {
      const res = await axios.get(`http://localhost:8080/api/payment/refund/${order.orderId}`);
      setOrderRefundHistory(res.data || []);
    } catch (err) {
      setOrderRefundHistory([]);
    }
  };

  const handleSubmitRefund = async (e) => {
    if (e) e.preventDefault();
    if (!refundModalOrder) return;
    const amt = parseFloat(refundAmount);
    if (isNaN(amt) || amt <= 0) {
      showToast('error', 'Invalid Amount', 'Please enter a valid refund amount.');
      return;
    }
    setIsSubmittingRefund(true);
    try {
      const res = await axios.post('http://localhost:8080/api/payment/refund/request', {
        orderId: refundModalOrder.orderId,
        amount: amt,
        returnReasonCategory: returnReasonCategory,
        resolutionType: resolutionType,
        reason: refundReason.trim() || 'Customer requested return',
        customerNotes: customerNotes.trim(),
        customerProofImage: customerProofImage.trim()
      });
      showToast('success', 'Return Request Submitted!', `Your request is PENDING inspection. Once the item is returned and verified, your ${resolutionType.toLowerCase()} of ₹${amt} will be approved.`);
      setRefundModalOrder(null);
      if (fetchOrders) fetchOrders();
      fetchTransactions();
    } catch (err) {
      showToast('error', 'Request Failed', err.response?.data || 'Failed to submit return request.');
    } finally {
      setIsSubmittingRefund(false);
    }
  };

  useEffect(() => {
    const fetchRefundsForOrders = async () => {
      const returnOrders = (orders || []).filter(o => 
        o.status === 'RETURN_REQUESTED' || 
        o.paymentStatus === 'REFUND_PENDING' || 
        o.paymentStatus === 'REFUNDED' || 
        o.paymentStatus === 'PARTIALLY_REFUNDED'
      );
      
      const newMap = { ...orderRefundsMap };
      let changed = false;
      
      await Promise.all(returnOrders.map(async (o) => {
        try {
          const res = await axios.get(`http://localhost:8080/api/payment/refund/${o.orderId}`);
          if (res.data && res.data.length > 0) {
            const latestRefund = res.data[0];
            const existingRefund = newMap[o.orderId];
            if (!existingRefund || 
                existingRefund.returnStage !== latestRefund.returnStage || 
                existingRefund.status !== latestRefund.status || 
                existingRefund.id !== latestRefund.id) {
              newMap[o.orderId] = latestRefund;
              changed = true;
            }
          }
        } catch (e) {
          console.error("Failed to load refund for " + o.orderId, e);
        }
      }));
      
      if (changed) {
        setOrderRefundsMap(newMap);
      }
    };
    
    if (orders && orders.length > 0) {
      fetchRefundsForOrders();
    }
  }, [orders]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/products');
      if (Array.isArray(res.data)) {
        setProducts(res.data);
      }
    } catch (err) {
      console.error("Failed to load products in CustomerDashboard", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchTransactions();
  }, [profile.id]);

  useEffect(() => {
    if (activeTab === 'transactions') {
      fetchTransactions();
    }
  }, [activeTab]);

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
      showToast('error', 'Item Out of Stock', "This product is currently out of stock and cannot be selected for purchase.");
      return;
    }

    setSelectedCartItemIds(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const selectedCartItems = (Array.isArray(cart) ? cart : []).filter(item => selectedCartItemIds.includes(item.id));
  const [addressForm, setAddressForm] = useState({
    id: null,
    fullName: '',
    phone: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    addressType: 'HOME',
    isDefault: false
  });

  const fetchAddresses = async () => {
    if (!profile?.id) return;
    try {
      const res = await axios.get(`http://localhost:8080/api/customer/${profile.id}/addresses`);
      if (Array.isArray(res.data)) {
        setAddresses(res.data);
      } else {
        setAddresses([]);
      }
    } catch (err) {
      console.error("Failed to load addresses", err);
      setAddresses([]);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [profile.id]);

  const handleOpenAddAddress = () => {
    setAddressModalMode('add');
    setAddressForm({
      id: null,
      fullName: '',
      phone: '',
      streetAddress: '',
      city: '',
      state: '',
      postalCode: '',
      addressType: 'HOME',
      isDefault: false
    });
    setShowAddressModal(true);
  };

  const handleOpenEditAddress = (addr) => {
    setAddressModalMode('edit');
    setAddressForm({
      id: addr.id,
      fullName: addr.fullName || '',
      phone: addr.phone || '',
      streetAddress: addr.streetAddress || '',
      city: addr.city || '',
      state: addr.state || '',
      postalCode: addr.postalCode || '',
      addressType: addr.addressType || 'HOME',
      isDefault: !!addr.isDefault
    });
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.streetAddress.trim()) {
      showToast('error', 'Incomplete Address', 'Street address is required.');
      return;
    }

    try {
      if (addressModalMode === 'add') {
        await axios.post(`http://localhost:8080/api/customer/${profile.id}/addresses`, addressForm);
        showToast('success', 'Address Saved', 'New shipping address added successfully.');
      } else {
        await axios.put(`http://localhost:8080/api/customer/${profile.id}/addresses/${addressForm.id}`, addressForm);
        showToast('success', 'Address Updated', 'Shipping address updated successfully.');
      }
      setShowAddressModal(false);
      fetchAddresses();
    } catch (err) {
      showToast('error', 'Failed', err.response?.data || 'Could not save address.');
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      await axios.put(`http://localhost:8080/api/customer/${profile.id}/addresses/${addressId}/default`);
      showToast('success', 'Default Address Set', 'Default shipping address updated.');
      fetchAddresses();
    } catch (err) {
      showToast('error', 'Failed', 'Could not set default address.');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await axios.delete(`http://localhost:8080/api/customer/${profile.id}/addresses/${addressId}`);
      showToast('success', 'Deleted', 'Address removed from your profile.');
      fetchAddresses();
    } catch (err) {
      showToast('error', 'Failed', 'Could not delete address.');
    }
  };

  // Payment Modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Coupon State variables
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1);
  const [deliveryInfo, setDeliveryInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' | 'cod'
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Pricing & Discount calculations (based on SELECTED items)
  const calculateOriginalSubtotal = () => {
    return selectedCartItems.reduce((sum, item) => {
      const orig = Number(item?.originalPrice) || Number(item?.price) || 0;
      const qty = Number(item?.quantity) || 1;
      return sum + (orig * qty);
    }, 0);
  };

  const calculateSubtotal = () => {
    return selectedCartItems.reduce((sum, item) => {
      const pr = Number(item?.price) || 0;
      const qty = Number(item?.quantity) || 1;
      return sum + (pr * qty);
    }, 0);
  };

  const calculateDiscountSavings = () => {
    return Math.max(0, Math.round((calculateOriginalSubtotal() - calculateSubtotal()) * 100) / 100);
  };

  const calculateDeliveryFee = () => {
    const subtotal = calculateSubtotal();
    if (subtotal <= 0) return 0;
    return subtotal < 500 ? 99 : 0;
  };

  const calculateTotalSavings = () => {
    const discountSavings = calculateDiscountSavings();
    const deliverySavings = (calculateSubtotal() >= 500 && calculateSubtotal() > 0) ? 99 : 0;
    return discountSavings + deliverySavings;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    if (subtotal <= 0) return 0;
    const discount = appliedCoupon ? Number(appliedCoupon.discountAmount) : 0;
    return Math.max(0, Math.round((subtotal + calculateDeliveryFee() - discount) * 100) / 100);
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
        userId: profile.id,
        items: selectedCartItems
      };
      
      const res = await axios.post('http://localhost:8080/api/coupons/validate', payload);
      if (res.data.valid) {
        setAppliedCoupon(res.data);
        setCouponSuccess(res.data.message);
        showToast('success', 'Coupon Applied', 'Coupon applied successfully!');
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
    showToast('info', 'Coupon Removed', 'Coupon removed from your order.');
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
      console.error("Failed to fetch available coupons/approvals", err);
    }
  };

  const isCouponEligibleForCart = (coupon) => {
    const subtotal = calculateSubtotal();
    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      return false;
    }

    const approvalsArray = Array.isArray(couponApprovals) ? couponApprovals : (couponApprovals?.value || []);
    const mappingsArray = Array.isArray(couponMappings) ? couponMappings : (couponMappings?.value || []);

    const hasEligibleProduct = selectedCartItems.some(item => {
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
      showToast('error', 'Cart Selection', 'Please select at least 1 in-stock item from your cart to proceed to checkout.');
      return;
    }

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
        showToast('error', 'Out of Stock', `Cannot proceed to checkout: "${outOfStockItem.name}" is currently out of stock. Please remove it from your selection.`);
      } else {
        showToast('error', 'Insufficient Stock', `Cannot proceed to checkout: "${outOfStockItem.name}" only has ${stock} units available.`);
      }
      return;
    }
    
    // Check if user has a default address
    const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
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
      showToast('error', 'Incomplete Details', 'Please provide a valid delivery address and recipient name.');
      return;
    }

    // Cash on Delivery flow
    if (paymentMethod === 'cod') {
      setIsProcessingPayment(true);
      setPaymentStep(3);

      try {
        const payload = {
          userId: profile.id,
          items: selectedCartItems,
          deliveryInfo: deliveryInfo,
          paymentMethod: 'COD',
          couponCode: appliedCoupon ? appliedCoupon.couponCode : null
        };

        const res = await axios.post('http://localhost:8080/api/payment/verify-and-order', payload);
        setConfirmedOrder(res.data);
        setCart(prev => prev.filter(item => !selectedCartItemIds.includes(item.id)));
        setSelectedCartItemIds([]);
        setIsProcessingPayment(false);
        setPaymentStep(4);
        if (fetchOrders) fetchOrders();
      } catch (err) {
        setIsProcessingPayment(false);
        setPaymentStep(2);
        showToast('error', 'Order Failed', err.response?.data || 'Failed to place Cash on Delivery order.');
      }
      return;
    }

    // Razorpay Online Gateway flow (UPI, Card, NetBanking)
    setIsProcessingPayment(true);

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setIsProcessingPayment(false);
        showToast('error', 'Gateway Error', 'Could not load Razorpay SDK. Please check your internet connection.');
        return;
      }

      const totalAmount = calculateTotal();
      const orderRes = await axios.post('http://localhost:8080/api/payment/create-order', {
        amount: totalAmount,
        receipt: `rcpt_${profile.id}_${Date.now()}`
      });

      const { razorpayOrderId, amount, currency, keyId } = orderRes.data;

      const options = {
        key: keyId || 'rzp_test_placeholder',
        amount: amount,
        currency: currency || 'INR',
        name: 'ShopStack Enterprise',
        description: `Order Checkout (${selectedCartItems.length} items)`,
        order_id: razorpayOrderId,
        prefill: {
          name: deliveryInfo.name || profile.fullName,
          email: profile.email || '',
          contact: deliveryInfo.phone || profile.phone || ''
        },
        notes: {
          address: deliveryInfo.address
        },
        theme: {
          color: '#0d9488'
        },
        handler: async function (response) {
          setPaymentStep(3); // Authorizing / processing animation
          try {
            const verifyPayload = {
              userId: profile.id,
              items: selectedCartItems,
              deliveryInfo: deliveryInfo,
              paymentMethod: 'RAZORPAY',
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              couponCode: appliedCoupon ? appliedCoupon.couponCode : null
            };

            const verifyRes = await axios.post('http://localhost:8080/api/payment/verify-and-order', verifyPayload);
            setConfirmedOrder(verifyRes.data);
            setCart(prev => prev.filter(item => !selectedCartItemIds.includes(item.id)));
            setSelectedCartItemIds([]);
            setIsProcessingPayment(false);
            setPaymentStep(4);
            if (fetchOrders) fetchOrders();
            fetchTransactions();
          } catch (err) {
            setIsProcessingPayment(false);
            setPaymentStep(2);
            showToast('error', 'Verification Failed', err.response?.data || 'Could not verify Razorpay payment.');
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
            setPaymentStep(2);
            showToast('info', 'Payment Cancelled', 'Razorpay checkout was dismissed.');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setIsProcessingPayment(false);
        setPaymentStep(2);
        showToast('error', 'Payment Failed', response.error?.description || 'Razorpay transaction was unsuccessful.');
      });
      rzp.open();
    } catch (err) {
      setIsProcessingPayment(false);
      setPaymentStep(2);
      showToast('error', 'Payment Initialization Failed', err.response?.data || 'Failed to initialize Razorpay checkout.');
    }
  };

  const handleCheckout = async () => {
    handleStartCheckout();
  };

  const updateCartQuantity = (productId, amount, maxStock) => {
    const cartItems = Array.isArray(cart) ? cart : [];
    const existing = cartItems.find(item => item.id === productId);
    if (!existing) return;
    
    const newQty = existing.quantity + amount;
    if (newQty <= 0) {
      removeFromCart(productId);
    } else if (newQty > maxStock) {
      showToast('error', 'Inventory Warning', `Only ${maxStock} items available in stock.`);
    } else {
      setCart(cartItems.map(item => 
        item.id === productId ? { ...item, quantity: newQty } : item
      ));
    }
  };

  const removeFromCart = (productId) => {
    const cartItems = Array.isArray(cart) ? cart : [];
    setCart(cartItems.filter(item => item.id !== productId));
    showToast('success', 'Removed', 'Item removed from your cart.');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`http://localhost:8080/api/customer/${profile.id}`, profile);
      setProfile(res.data);
      onUpdateUser(res.data);
      setIsEditing(false);
      showToast('success', 'Profile updated successfully.', 'Your account details have been saved.');
    } catch (err) {
      showToast('error', 'Update failed.', err.response?.data || 'Could not update profile details.');
    }
  };

  const handleToggleRole = async (targetRole, enteredCode = null) => {
    if (!profile.id) {
      showToast('error', 'Action Failed', 'User ID is missing. Please log in again.');
      return;
    }

    if (profile.role === 'ADMINISTRATOR' || profile.role === 'ADMIN' || profile.role === 'WAREHOUSE_STAFF') {
      showToast('error', 'Action Restricted', 'Administrators and Warehouse staff accounts cannot switch user profiles.');
      return;
    }

    // If target is VENDOR and user already has a code, but we didn't get it yet, show the prompt modal!
    if (targetRole === 'VENDOR' && profile.role === 'CUSTOMER' && profile.vendorCode && !enteredCode) {
      setSwitchVendorCode('');
      setShowVendorPromptModal(true);
      return;
    }

    try {
      const payload = { role: targetRole };
      if (enteredCode) {
        payload.vendorCode = enteredCode.trim();
      }

      const res = await axios.put(`http://localhost:8080/api/auth/customer/${profile.id}/role`, payload);
      
      const isFirstTimeVendor = targetRole === 'VENDOR' && !profile.vendorCode;

      setProfile(res.data);
      onUpdateUser(res.data);
      setShowVendorPromptModal(false);
      
      if (targetRole === 'VENDOR') {
        if (isFirstTimeVendor) {
          setShowUpgradedCodeModal(res.data.vendorCode);
        } else {
          showToast('success', 'Switched to Vendor View!', 'You now have selling privileges on ShopStack.');
        }
      } else {
        showToast('success', 'Switched to Customer View!', 'You are now browsing as a standard Customer.');
      }
    } catch (err) {
      showToast('error', 'Switch Failed', err.response?.data || 'Failed to switch account role.');
    }
  };

  return (
    <div className="dashboard-container">
      {flash.text && (
        <div className={`toast-notification ${flash.type === 'success' ? 'toast-success' : 'toast-error'}`}>
          <div className="toast-icon-container">
            {flash.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          </div>
          <div>
            <strong className="toast-message-title">{flash.title}</strong>
            <div className="toast-message-desc">{flash.text}</div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <div className="navbar">
        <div className="nav-left">
          <h1 
            className="nav-logo" 
            onClick={onGoToHome} 
            style={{ cursor: 'pointer', margin: 0, fontSize: '20px' }}
          >
            ShopStack
          </h1>
        </div>

        <div className="nav-right">
          {isPrivileged ? (
            <button 
              type="button"
              onClick={onGoToHome} 
              className="btn-store-nav"
              title="Return to Home Dashboard"
              style={{ 
                borderColor: isAdmin ? 'rgba(244, 63, 94, 0.3)' : 'rgba(99, 102, 241, 0.3)', 
                color: isAdmin ? 'var(--accent-rose)' : 'var(--accent-indigo)' 
              }}
            >
              <ArrowLeft size={15} style={{ flexShrink: 0 }} />
              <span>Back</span>
            </button>
          ) : (
            <button 
              type="button"
              onClick={onGoToHome} 
              className="btn-store-nav"
              title="Return to Store"
            >
              <ArrowLeft size={15} style={{ flexShrink: 0 }} />
              <span className="hide-on-mobile">Back to Store</span>
              <span className="show-on-mobile">Store</span>
            </button>
          )}

          {/* Customer Notifications Center */}
          <NotificationCenter
            notifications={notificationList}
            onMarkAsRead={handleMarkNotifAsRead}
            onMarkAllAsRead={handleMarkAllNotifsAsRead}
            onClearAll={handleClearAllNotifs}
            onDismiss={handleDismissNotif}
            role={profile.role || user?.role || 'CUSTOMER'}
            panelTitle={isAdmin ? "Admin System Alerts" : isStaff ? "Facility Alerts" : isVendor ? "Merchant & Purchase Alerts" : "Activity & Orders"}
            iconSize={16}
            align="right"
          />

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
                <User size={14} style={{ color: isAdmin ? 'var(--accent-rose)' : isStaff ? 'var(--accent-indigo)' : 'var(--accent-blue)', flexShrink: 0 }} />
              </div>
              <strong className="nav-user-name">{profile.fullName || user?.fullName || 'User'}</strong>
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
                      {profile.fullName || user?.fullName || 'User'}
                    </strong>
                    <span className={`badge ${isAdmin ? 'badge-rejected' : isStaff ? 'badge-warehouse' : profile.role === 'VENDOR' ? 'badge-vendor' : 'badge-customer'}`} style={{ fontSize: '9px', padding: '1px 6px' }}>
                      {isAdmin ? 'ADMIN' : isStaff ? 'STAFF' : (profile.role || 'CUSTOMER')}
                    </span>
                  </div>
                </div>

                <div onClick={() => { setShowDropdown(false); setActiveTab('profile'); }} className="dropdown-item">
                  <User size={16} style={{ flexShrink: 0 }} /> <span>My Profile</span>
                </div>

                {!isPrivileged && (
                  <>
                    <div onClick={() => { setShowDropdown(false); setActiveTab('addresses'); }} className="dropdown-item">
                      <MapPin size={16} style={{ flexShrink: 0 }} /> <span>Your Addresses</span>
                    </div>
                    <div onClick={() => { setShowDropdown(false); setActiveTab('orders'); }} className="dropdown-item">
                      <Package size={16} style={{ flexShrink: 0 }} /> <span>Order History</span>
                    </div>
                    <div onClick={() => { setShowDropdown(false); setActiveTab('wishlist'); }} className="dropdown-item">
                      <Heart size={16} style={{ flexShrink: 0 }} /> <span>Wishlist</span>
                    </div>
                    <div onClick={() => { setShowDropdown(false); onGoToHome(); }} className="dropdown-item">
                      <ArrowLeft size={16} style={{ flexShrink: 0 }} /> <span>Back to Store</span>
                    </div>
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
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div className="dashboard-layout">
        {/* Interactive Sidebar Tabs */}
        <div className="sidebar">
          <div 
            onClick={() => setActiveTab('profile')} 
            className={`sidebar-item ${activeTab === 'profile' ? 'sidebar-item-active' : ''}`}
          >
            <User size={18} /> My Profile
          </div>

          {!isPrivileged && (
            <>
              <div 
                onClick={() => setActiveTab('addresses')} 
                className={`sidebar-item ${activeTab === 'addresses' ? 'sidebar-item-active' : ''}`}
              >
                <MapPin size={18} /> Your Addresses ({addresses.length})
              </div>
              <div 
                onClick={() => setActiveTab('orders')} 
                className={`sidebar-item ${activeTab === 'orders' ? 'sidebar-item-active' : ''}`}
              >
                <Package size={18} /> My Orders ({orders.length})
              </div>
              <div 
                onClick={() => setActiveTab('transactions')} 
                className={`sidebar-item ${activeTab === 'transactions' ? 'sidebar-item-active' : ''}`}
              >
                <Receipt size={18} /> Transactions ({transactions.length})
              </div>
              <div 
                onClick={() => setActiveTab('wishlist')} 
                className={`sidebar-item ${activeTab === 'wishlist' ? 'sidebar-item-active' : ''}`}
              >
                <Heart size={18} /> My Wishlist ({wishlist.length})
              </div>
              <div 
                onClick={() => setActiveTab('cart')} 
                className={`sidebar-item ${activeTab === 'cart' ? 'sidebar-item-active' : ''}`}
              >
                <ShoppingCart size={18} /> My Cart ({Array.isArray(cart) ? cart.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0) : 0})
              </div>
            </>
          )}
        </div>

        {/* Tab Content Panel */}
        <div className="main-content">
          {activeTab === 'profile' && (
            <>
              {profile.role === 'CUSTOMER' ? (
                <div className="banner-gradient banner-customer">
                  <div>
                    <h3 className="banner-title">Want to sell on ShopStack?</h3>
                    <p className="banner-subtitle">
                      Switch your profile mode to Vendor to list products, track customer sales, and more.
                    </p>
                  </div>
                  <button onClick={() => handleToggleRole('VENDOR')} className="btn btn-primary" style={{ background: '#fff', color: '#070a13', boxShadow: 'none' }}>
                    <RefreshCw size={16} /> Switch to Vendor Mode
                  </button>
                </div>
              ) : profile.role === 'VENDOR' ? (
                <div className="banner-gradient banner-vendor">
                  <div>
                    <h3 className="banner-title">Currently in Vendor Mode</h3>
                    <p className="banner-subtitle">
                      You have active seller privileges. You can switch back to browse as a customer anytime.
                    </p>
                  </div>
                  <button onClick={() => handleToggleRole('CUSTOMER')} className="btn btn-primary" style={{ background: '#fff', color: '#070a13', boxShadow: 'none' }}>
                    <RefreshCw size={16} /> Switch to Customer Mode
                  </button>
                </div>
              ) : profile.role === 'ADMINISTRATOR' || profile.role === 'ADMIN' ? (
                <div className="banner-gradient banner-vendor" style={{ background: 'var(--gradient-danger)' }}>
                  <div>
                    <h3 className="banner-title">Administrator Profile</h3>
                    <p className="banner-subtitle">
                      You are logged in with elevated administrative privileges. Dedicated admin account.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="banner-gradient banner-vendor" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                  <div>
                    <h3 className="banner-title">Warehouse Staff Profile</h3>
                    <p className="banner-subtitle">
                      You are logged in with dedicated warehouse operations and fulfillment privileges.
                    </p>
                  </div>
                </div>
              )}

              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Your Account Profile</h2>

              {!isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="order-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                      <span style={{ width: '180px', color: 'var(--text-secondary)', fontWeight: '600' }}>Full Name</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{profile.fullName}</strong>
                    </div>
                    
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                      <span style={{ width: '180px', color: 'var(--text-secondary)', fontWeight: '600' }}>Account Mode</span>
                      <div>
                        <span className={`badge ${
                          profile.role === 'VENDOR' ? 'badge-vendor' : 
                          profile.role === 'ADMINISTRATOR' ? 'badge-rejected' : 
                          profile.role === 'WAREHOUSE_STAFF' ? 'badge-pending' : 'badge-customer'
                        }`}>
                          {profile.role}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                      <span style={{ width: '180px', color: 'var(--text-secondary)', fontWeight: '600' }}>Email Address</span>
                      <span style={{ color: 'var(--text-primary)' }}>{profile.email}</span>
                    </div>

                    <div style={{ display: 'flex' }}>
                      <span style={{ width: '180px', color: 'var(--text-secondary)', fontWeight: '600' }}>Phone Number</span>
                      <span style={{ color: profile.phone ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {profile.phone || 'No phone number linked'}
                      </span>
                    </div>
                  </div>
                  
                  <button onClick={() => setIsEditing(true)} className="btn btn-primary" style={{ width: 'fit-content' }}>
                    <Edit2 size={16} /> Edit Profile Details
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <div className="input-icon-wrapper">
                      <User className="input-icon" />
                      <input 
                        type="text" 
                        value={profile.fullName} 
                        onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} 
                        required 
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <div className="input-icon-wrapper">
                      <Phone className="input-icon" />
                      <input 
                        type="text" 
                        placeholder="+1 (555) 000-0000"
                        value={profile.phone} 
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })} 
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <button type="submit" className="btn btn-success">
                      <Save size={16} /> Save Changes
                    </button>
                    <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary">
                      <X size={16} /> Cancel
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {activeTab === 'addresses' && (
            <div>
              <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 4px 0' }}>Your Saved Addresses</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
                    Manage multiple shipping addresses and configure your default delivery destination.
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={handleOpenAddAddress} 
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
                >
                  <Plus size={16} /> Add New Address
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="cart-empty-state" style={{ background: 'var(--bg-input)', borderRadius: '12px', padding: '48px 24px' }}>
                  <MapPin className="cart-empty-icon" style={{ opacity: 0.2, width: '48px', height: '48px' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: '700', marginTop: '16px' }}>No saved addresses found</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>Add your home, office, or other delivery addresses for faster checkout.</p>
                  <button type="button" onClick={handleOpenAddAddress} className="btn btn-primary">
                    <Plus size={16} /> Add Your First Address
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                  {addresses.map((addr) => {
                    const isDef = !!addr.isDefault;
                    return (
                      <div 
                        key={addr.id} 
                        className="order-card"
                        style={{ 
                          padding: '20px', 
                          borderRadius: '12px',
                          border: isDef ? '2px solid var(--accent-teal)' : '1px solid var(--border-light)',
                          background: isDef ? 'rgba(20, 184, 166, 0.04)' : 'var(--bg-input)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          position: 'relative',
                          boxShadow: isDef ? '0 4px 20px rgba(20, 184, 166, 0.12)' : 'none',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div>
                          {/* Header row: Address type & Default badge */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className="badge badge-customer" style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>
                                {addr.addressType || 'HOME'}
                              </span>
                              {isDef && (
                                <span className="badge badge-approved" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                                  <Check size={12} strokeWidth={3} /> DEFAULT ADDRESS
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Recipient details */}
                          <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
                            {addr.fullName}
                          </h3>

                          {/* Address text */}
                          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0 0 8px 0' }}>
                            {addr.streetAddress}
                          </p>
                          
                          {(addr.city || addr.state || addr.postalCode) && (
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 12px 0', fontWeight: '500' }}>
                              {[addr.city, addr.state].filter(Boolean).join(', ')} {addr.postalCode ? `- ${addr.postalCode}` : ''}
                            </p>
                          )}

                          {addr.phone && (
                            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                              <Phone size={13} style={{ color: 'var(--accent-teal)' }} />
                              <span>Phone: <strong style={{ color: 'var(--text-primary)' }}>{addr.phone}</strong></span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--border-light)', paddingTop: '14px', marginTop: '10px', flexWrap: 'wrap' }}>
                          {!isDef && (
                            <button 
                              type="button" 
                              onClick={() => handleSetDefaultAddress(addr.id)}
                              className="btn btn-secondary"
                              style={{ fontSize: '12px', padding: '6px 12px' }}
                            >
                              Set as Default
                            </button>
                          )}
                          <button 
                            type="button" 
                            onClick={() => handleOpenEditAddress(addr)}
                            className="btn btn-secondary"
                            style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Edit2 size={13} /> Edit
                          </button>
                          <button 
                            type="button" 
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="btn-icon-only"
                            style={{ color: 'var(--accent-rose)', padding: '6px 10px', marginLeft: 'auto' }}
                            title="Delete Address"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Your Order History</h2>
                <button 
                  type="button" 
                  onClick={() => { if (fetchOrders) fetchOrders(); fetchTransactions(); }} 
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
                >
                  <RefreshCw size={13} /> Refresh
                </button>
              </div>

              {orders.filter(ord => ord && !ord.orderId?.startsWith('ORD-FAIL-') && ord.paymentStatus !== 'FAILED').length === 0 ? (
                <div className="cart-empty-state" style={{ background: 'var(--bg-input)', borderRadius: '10px' }}>
                  <Package className="cart-empty-icon" style={{ opacity: 0.2 }} />
                  <p>You haven't placed any orders yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {orders.filter(ord => ord && !ord.orderId?.startsWith('ORD-FAIL-') && ord.paymentStatus !== 'FAILED').map((ord, i) => {
                    const payStatus = ord.paymentStatus || 'PENDING';
                    const isPaid = payStatus === 'PAID';
                    const isRefunded = payStatus === 'REFUNDED';
                    const isPartiallyRefunded = payStatus === 'PARTIALLY_REFUNDED';
                    const isFailed = payStatus === 'FAILED';

                    return (
                      <div key={ord.id || i} className="order-card" style={{ padding: '24px', borderRadius: '12px', background: 'var(--bg-input)' }}>
                        <div className="order-card-header" style={{ flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span className="order-id" style={{ fontSize: '16px', fontWeight: '700' }}>{ord.orderId}</span>
                            <span className="badge badge-customer" style={{ fontSize: '11px' }}>
                              {ord.paymentMethod || 'RAZORPAY'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            {/* Fulfillment Status */}
                            <span className="order-status-badge">
                              {ord.status}
                            </span>

                            {/* Payment Status Badge */}
                            {isPaid && (
                              <span className="badge badge-approved" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                                <Check size={12} strokeWidth={3} /> PAID
                              </span>
                            )}
                            {isRefunded && (
                              <span className="badge" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                                <RotateCcw size={12} /> REFUNDED
                              </span>
                            )}
                            {isPartiallyRefunded && (
                              <span className="badge" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                                <RotateCcw size={12} /> PARTIAL REFUND
                              </span>
                            )}
                            {isFailed && (
                              <span className="badge badge-rejected" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <X size={12} /> PAYMENT FAILED
                              </span>
                            )}
                            {!isPaid && !isRefunded && !isPartiallyRefunded && !isFailed && (
                              <span className="badge" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                                <Clock size={12} /> {payStatus}
                              </span>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                          <div>Date: <strong style={{ color: 'var(--text-primary)' }}>{ord.date}</strong></div>
                          {ord.razorpayPaymentId && (
                            <div style={{ fontSize: '12px' }}>
                              Payment ID: <code style={{ color: 'var(--accent-teal)', background: 'var(--bg-primary)', padding: '2px 6px', borderRadius: '4px' }}>{ord.razorpayPaymentId}</code>
                            </div>
                          )}
                        </div>

                        {/* Order / Return Roadmap Progress Bar */}
                        {(() => {
                          const isReturnOrder = ord.status === 'RETURN_REQUESTED' || 
                            ord.paymentStatus === 'REFUND_PENDING' || 
                            ord.paymentStatus === 'REFUNDED' || 
                            ord.paymentStatus === 'PARTIALLY_REFUNDED';
                          
                          if (isReturnOrder) {
                            const refundObj = orderRefundsMap[ord.orderId];
                            const returnStage = refundObj ? refundObj.returnStage : 'REQUESTED';
                            const refundStatus = refundObj ? refundObj.status : 'PENDING';
                            
                            const isRefundedStatus = ord.status === 'REFUNDED' || ord.paymentStatus === 'REFUNDED';
                            
                            const isRequested = true;
                            const isPickedUp = ['ITEM_RETURNED', 'QC_PASSED', 'QC_FAILED', 'REFUNDED', 'REJECTED'].includes(returnStage) || isRefundedStatus;
                            const isQcInspected = ['QC_PASSED', 'QC_FAILED', 'REFUNDED', 'REJECTED'].includes(returnStage) || isRefundedStatus;
                            const isResolved = ['PROCESSED', 'REFUNDED', 'REJECTED'].includes(refundStatus) || returnStage === 'REFUNDED' || isRefundedStatus;
                            
                            const qcLabel = returnStage === 'QC_FAILED' ? 'QC Failed' : 'QC Passed';
                            const resolveLabel = refundStatus === 'REJECTED' ? 'Rejected' : 'Refunded';
                            const resolveColor = refundStatus === 'REJECTED' ? 'var(--accent-rose)' : 'var(--accent-teal)';
                            
                            return (
                              <div style={{ margin: '14px 0 10px 0', padding: '12px 14px', background: 'var(--bg-primary)', borderRadius: '10px', border: '1.5px dashed rgba(168, 85, 247, 0.25)' }}>
                                <div style={{ fontSize: '11px', fontWeight: '800', color: '#c084fc', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <RotateCcw size={12} /> Return Progress Roadmap
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  {[
                                    { label: 'Requested', done: isRequested, color: 'var(--accent-teal)' },
                                    { label: 'Picked Up', done: isPickedUp, color: 'var(--accent-teal)' },
                                    { label: qcLabel, done: isQcInspected, color: returnStage === 'QC_FAILED' ? 'var(--accent-rose)' : 'var(--accent-teal)' },
                                    { label: resolveLabel, done: isResolved, color: resolveColor }
                                  ].map((step, idx) => (
                                    <React.Fragment key={idx}>
                                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                                        <div style={{
                                          width: '20px',
                                          height: '20px',
                                          borderRadius: '50%',
                                          background: step.done ? step.color : 'var(--border-light)',
                                          color: step.done ? '#fff' : 'var(--text-muted)',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          fontSize: '9px',
                                          fontWeight: 'bold',
                                          border: step.done ? 'none' : '1px solid var(--border-light)',
                                          boxShadow: step.done ? `0 2px 6px ${step.color}30` : 'none'
                                        }}>
                                          {step.done ? '✓' : idx + 1}
                                        </div>
                                        <span style={{ fontSize: '9px', fontWeight: '700', marginTop: '4px', color: step.done ? 'var(--text-primary)' : 'var(--text-muted)', textAlign: 'center' }}>
                                          {step.label}
                                        </span>
                                      </div>
                                      {idx < 3 && (
                                        <div style={{ 
                                          flex: 1, 
                                          height: '2px', 
                                          background: [isPickedUp, isQcInspected, isResolved][idx] ? 'var(--accent-teal)' : 'var(--border-light)', 
                                          margin: '0 4px', 
                                          transform: 'translateY(-8px)' 
                                        }} />
                                      )}
                                    </React.Fragment>
                                  ))}
                                </div>
                              </div>
                            );
                          } else {
                            // Standard Order Road Map
                            const isStep1 = ['CONFIRMED', 'ALLOCATED', 'PICKED', 'PACKED', 'READY_FOR_SHIPMENT', 'SHIPPED', 'DELIVERED'].includes(ord.status);
                            const isStep2 = ['PACKED', 'READY_FOR_SHIPMENT', 'SHIPPED', 'DELIVERED'].includes(ord.status);
                            const isStep3 = ['READY_FOR_SHIPMENT', 'SHIPPED', 'DELIVERED'].includes(ord.status);
                            const isStep4 = ['DELIVERED'].includes(ord.status);
                            
                            return (
                              <div style={{ margin: '14px 0 10px 0', padding: '12px 14px', background: 'var(--bg-primary)', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                                <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Truck size={12} style={{ color: 'var(--accent-teal)' }} /> Order Progress Roadmap
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  {[
                                    { label: 'Confirmed', done: isStep1 },
                                    { label: 'Packed', done: isStep2 },
                                    { label: 'Shipped', done: isStep3 },
                                    { label: 'Delivered', done: isStep4 }
                                  ].map((step, idx) => (
                                    <React.Fragment key={idx}>
                                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                                        <div style={{
                                          width: '20px',
                                          height: '20px',
                                          borderRadius: '50%',
                                          background: step.done ? 'var(--accent-teal)' : 'var(--border-light)',
                                          color: step.done ? '#fff' : 'var(--text-muted)',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          fontSize: '9px',
                                          fontWeight: 'bold',
                                          border: step.done ? 'none' : '1px solid var(--border-light)',
                                          boxShadow: step.done ? '0 2px 6px rgba(20, 184, 166, 0.2)' : 'none'
                                        }}>
                                          {step.done ? '✓' : idx + 1}
                                        </div>
                                        <span style={{ fontSize: '9px', fontWeight: '700', marginTop: '4px', color: step.done ? 'var(--text-primary)' : 'var(--text-muted)', textAlign: 'center' }}>
                                          {step.label}
                                        </span>
                                      </div>
                                      {idx < 3 && (
                                        <div style={{ 
                                          flex: 1, 
                                          height: '2px', 
                                          background: [isStep2, isStep3, isStep4][idx] ? 'var(--accent-teal)' : 'var(--border-light)', 
                                          margin: '0 4px', 
                                          transform: 'translateY(-8px)' 
                                        }} />
                                      )}
                                    </React.Fragment>
                                  ))}
                                </div>
                              </div>
                            );
                          }
                        })()}

                        {/* Order Items */}
                        <div className="order-items-list" style={{ background: 'var(--bg-primary)', margin: '14px 0', borderRadius: '8px', padding: '12px' }}>
                          {ord.items && ord.items.map((item, idx) => {
                            const policy = getProductReturnPolicy(item.productId);
                            const isDelivered = (ord.status || '').toUpperCase() === 'DELIVERED';
                            const daysElapsed = isDelivered ? getDaysElapsed(ord.deliveredAt || ord.date) : 0;
                            let isEligible = true;
                            let policyText = '7-Day Return Policy';
                            if (policy === 'NON_RETURNABLE') {
                              isEligible = false;
                              policyText = 'Non-Returnable';
                            } else if (policy === '7_DAYS') {
                              policyText = '7-Day Return';
                              if (isDelivered && daysElapsed > 7) isEligible = false;
                            } else if (policy === '15_DAYS') {
                              policyText = '15-Day Return';
                              if (isDelivered && daysElapsed > 15) isEligible = false;
                            }

                            return (
                              <div key={idx} className="order-item-row" style={{ alignItems: 'center', gap: '12px', padding: '8px 0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div style={{ width: '28px', height: '28px', flexShrink: 0, borderRadius: '6px', overflow: 'hidden', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ProductIcon name={item.productName || item.name} category={item.category} size={14} />
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: '600', fontSize: '13px' }}>{item.productName || item.name}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                      Qty: {item.quantity} × ₹{item.price}
                                      <span 
                                        className={`badge ${isEligible ? 'badge-approved' : 'badge-rejected'}`}
                                        style={{ marginLeft: '10px', fontSize: '9px', padding: '1px 5px' }}
                                      >
                                        {policyText} {(!isEligible && policy !== 'NON_RETURNABLE') ? '(Expired)' : ''}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <strong style={{ fontSize: '13px' }}>₹{Math.round(item.price * item.quantity * 100) / 100}</strong>
                              </div>
                            );
                          })}
                        </div>

                        {/* Delivery address snippet */}
                        {ord.deliveryAddress && (
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MapPin size={13} style={{ color: 'var(--accent-teal)' }} />
                            <span>Delivery to: <strong style={{ color: 'var(--text-primary)' }}>{ord.recipientName || profile.fullName}</strong> — {ord.deliveryAddress}</span>
                          </div>
                        )}

                        <div className="order-total-row" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '14px', marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                          <div>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block' }}>Order Total</span>
                            <strong style={{ fontSize: '18px', color: 'var(--accent-emerald)' }}>₹{ord.totalAmount}</strong>
                          </div>

                          {/* Refund / Return Action Buttons */}
                          {(payStatus === 'REFUND_PENDING' || ord.status === 'RETURN_REQUESTED' || ord.hasPendingRefund) ? (
                            <span 
                              className="badge badge-pending"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
                            >
                              <Clock size={14} /> Return Pending QC
                            </span>
                          ) : (isPaid || isPartiallyRefunded) ? (
                            <button 
                              type="button" 
                              onClick={() => handleOpenRefundModal(ord)} 
                              className="btn btn-secondary"
                              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '8px 14px', borderColor: 'rgba(168, 85, 247, 0.3)', color: '#c084fc' }}
                            >
                              <RotateCcw size={14} /> Request Return / Refund
                            </button>
                          ) : isRefunded ? (
                            <span 
                              className="badge" 
                              style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', fontSize: '12px', padding: '6px 12px', border: '1px solid rgba(139, 92, 246, 0.3)' }}
                            >
                              ✓ Refunded
                            </span>
                          ) : null}
                        </div>

                        {ord.status === 'DELIVERED' && (
                          <div style={{
                            marginTop: '12px',
                            background: 'var(--bg-primary)',
                            padding: '14px',
                            borderRadius: '10px',
                            border: '1.5px solid rgba(20, 184, 166, 0.3)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}>
                            {ord.feedbackRating != null && editingFeedbackOrderId !== ord.orderId ? (
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                                      Product & Delivery Review
                                    </h4>
                                    <span style={{ 
                                      display: 'inline-flex', 
                                      alignItems: 'center', 
                                      gap: '4px', 
                                      background: 'rgba(20, 184, 166, 0.15)', 
                                      color: 'var(--accent-teal)', 
                                      fontSize: '11px', 
                                      fontWeight: '700', 
                                      padding: '2px 8px', 
                                      borderRadius: '12px', 
                                      border: '1px solid rgba(20, 184, 166, 0.35)' 
                                    }}>
                                      <CheckCircle2 size={12} /> Submitted
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingFeedbackOrderId(ord.orderId);
                                      setFeedbackRatingInput(prev => ({ ...prev, [ord.orderId]: ord.feedbackRating }));
                                      setFeedbackCommentInput(prev => ({ ...prev, [ord.orderId]: ord.feedbackComment || '' }));
                                      setFeedbackImageInput(prev => ({ ...prev, [ord.orderId]: ord.feedbackImage || '' }));
                                    }}
                                    className="btn btn-secondary"
                                    style={{ 
                                      padding: '4px 10px', 
                                      fontSize: '11.5px', 
                                      display: 'inline-flex', 
                                      alignItems: 'center', 
                                      gap: '5px',
                                      borderRadius: '6px',
                                      border: '1px solid var(--border-color)',
                                      background: 'var(--bg-secondary)',
                                      color: 'var(--text-primary)',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <Edit2 size={12} style={{ color: 'var(--accent-teal)' }} /> Edit Review
                                  </button>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                  <span style={{ color: '#f59e0b', fontSize: '16px', letterSpacing: '2px' }}>
                                    {'★'.repeat(ord.feedbackRating)}{'☆'.repeat(5 - ord.feedbackRating)}
                                  </span>
                                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)' }}>
                                    {ord.feedbackRating}.0 / 5.0
                                  </span>
                                </div>
                                <div style={{ 
                                  color: 'var(--text-secondary)', 
                                  fontSize: '12.5px', 
                                  fontStyle: 'italic',
                                  background: 'rgba(255, 255, 255, 0.03)',
                                  padding: '8px 12px',
                                  borderRadius: '6px',
                                  borderLeft: '3px solid var(--accent-teal)',
                                  marginBottom: ord.feedbackImage ? '10px' : '0'
                                }}>
                                  "{ord.feedbackComment || 'No comment provided.'}"
                                </div>

                                {/* Customer Review Attached Photo */}
                                {ord.feedbackImage && (
                                  <div style={{ marginTop: '10px' }}>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '5px' }}>
                                      Attached Customer Photo:
                                    </span>
                                    <div 
                                      onClick={() => setPreviewLightboxImage(ord.feedbackImage)}
                                      style={{ 
                                        position: 'relative', 
                                        display: 'inline-block', 
                                        cursor: 'pointer',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        border: '1.5px solid var(--border-color)',
                                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                                      }}
                                      title="Click to view full photo"
                                    >
                                      <img 
                                        src={formatImageUrl(ord.feedbackImage)} 
                                        alt="Customer Review Photo" 
                                        style={{ width: '80px', height: '80px', objectFit: 'cover', display: 'block' }}
                                      />
                                      <div style={{ 
                                        position: 'absolute', 
                                        bottom: '4px', 
                                        right: '4px', 
                                        background: 'rgba(0,0,0,0.65)', 
                                        borderRadius: '4px', 
                                        padding: '3px', 
                                        display: 'flex', 
                                        color: '#fff' 
                                      }}>
                                        <Eye size={12} />
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                                    {editingFeedbackOrderId === ord.orderId ? 'Edit Product & Delivery Review' : 'Rate Your Experience & Review Products'}
                                  </h4>
                                  {editingFeedbackOrderId === ord.orderId && (
                                    <button
                                      type="button"
                                      onClick={() => setEditingFeedbackOrderId(null)}
                                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                                    >
                                      <X size={13} /> Cancel
                                    </button>
                                  )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Your Rating:</span>
                                  <div style={{ display: 'flex', gap: '4px' }}>
                                    {[1, 2, 3, 4, 5].map(star => {
                                      const currentVal = feedbackRatingInput[ord.orderId] !== undefined ? feedbackRatingInput[ord.orderId] : (ord.feedbackRating || 5);
                                      return (
                                        <span 
                                          key={star}
                                          onClick={() => setFeedbackRatingInput(prev => ({
                                            ...prev,
                                            [ord.orderId]: star
                                          }))}
                                          style={{ 
                                            cursor: 'pointer', 
                                            fontSize: '20px', 
                                            color: star <= currentVal ? '#f59e0b' : 'var(--text-muted)',
                                            transition: 'transform 0.15s'
                                          }}
                                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        >
                                          ★
                                        </span>
                                      );
                                    })}
                                  </div>
                                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#f59e0b' }}>
                                    ({feedbackRatingInput[ord.orderId] !== undefined ? feedbackRatingInput[ord.orderId] : (ord.feedbackRating || 5)} Stars)
                                  </span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  <input 
                                    type="text"
                                    placeholder="Tell us about product quality and delivery experience..."
                                    value={feedbackCommentInput[ord.orderId] !== undefined ? feedbackCommentInput[ord.orderId] : (ord.feedbackComment || '')}
                                    onChange={(e) => setFeedbackCommentInput(prev => ({
                                      ...prev,
                                      [ord.orderId]: e.target.value
                                    }))}
                                    className="form-input"
                                    style={{ flex: 1, height: '36px', fontSize: '12.5px', padding: '6px 10px', borderRadius: '6px' }}
                                  />
                                </div>

                                {/* Review Image Upload Control & Preview */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                    <label 
                                      htmlFor={`review-img-upload-${ord.orderId}`}
                                      className="btn btn-secondary"
                                      style={{ 
                                        padding: '5px 12px', 
                                        fontSize: '12px', 
                                        cursor: 'pointer', 
                                        display: 'inline-flex', 
                                        alignItems: 'center', 
                                        gap: '6px',
                                        borderRadius: '6px',
                                        background: 'var(--bg-secondary)',
                                        border: '1px solid var(--border-color)'
                                      }}
                                    >
                                      {isUploadingFeedbackImage[ord.orderId] ? (
                                        <RefreshCw size={13} className="spin" />
                                      ) : (
                                        <UploadCloud size={14} style={{ color: 'var(--accent-teal)' }} />
                                      )}
                                      <span>{isUploadingFeedbackImage[ord.orderId] ? 'Uploading Photo...' : '📷 Upload Review Image'}</span>
                                    </label>
                                    <input 
                                      id={`review-img-upload-${ord.orderId}`}
                                      type="file" 
                                      accept="image/*"
                                      disabled={isUploadingFeedbackImage[ord.orderId]}
                                      onChange={(e) => handleFeedbackImageUpload(ord.orderId, e)}
                                      style={{ display: 'none' }}
                                    />
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                      Attach photo of delivered product (PNG, JPG, WebP up to 5MB)
                                    </span>
                                  </div>

                                  {/* Uploaded Image Preview */}
                                  {(feedbackImageInput[ord.orderId] !== undefined ? feedbackImageInput[ord.orderId] : ord.feedbackImage) && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                                      <div style={{ position: 'relative', width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden', border: '1.5px solid var(--accent-teal)' }}>
                                        <img 
                                          src={formatImageUrl(feedbackImageInput[ord.orderId] !== undefined ? feedbackImageInput[ord.orderId] : ord.feedbackImage)} 
                                          alt="Review attachment" 
                                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                        <button
                                          type="button"
                                          onClick={() => setFeedbackImageInput(prev => ({ ...prev, [ord.orderId]: '' }))}
                                          style={{ 
                                            position: 'absolute', 
                                            top: '2px', 
                                            right: '2px', 
                                            background: 'rgba(0,0,0,0.75)', 
                                            color: '#ff4d4f', 
                                            border: 'none', 
                                            borderRadius: '50%', 
                                            width: '18px', 
                                            height: '18px', 
                                            cursor: 'pointer', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            padding: 0
                                          }}
                                          title="Remove attached image"
                                        >
                                          <X size={11} />
                                        </button>
                                      </div>
                                      <div style={{ fontSize: '11.5px', color: 'var(--accent-emerald)', fontWeight: '600' }}>
                                        ✓ Photo attached to review
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Form Action Buttons */}
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-start', marginTop: '2px' }}>
                                  <button
                                    type="button"
                                    disabled={isSubmittingFeedback[ord.orderId] || isUploadingFeedbackImage[ord.orderId]}
                                    onClick={async () => {
                                      const rating = feedbackRatingInput[ord.orderId] !== undefined ? feedbackRatingInput[ord.orderId] : (ord.feedbackRating || 5);
                                      const comment = feedbackCommentInput[ord.orderId] !== undefined ? feedbackCommentInput[ord.orderId] : (ord.feedbackComment || '');
                                      const image = feedbackImageInput[ord.orderId] !== undefined ? feedbackImageInput[ord.orderId] : (ord.feedbackImage || '');
                                      const removeImage = feedbackImageInput[ord.orderId] === '';

                                      setIsSubmittingFeedback(prev => ({ ...prev, [ord.orderId]: true }));
                                      try {
                                        await axios.post(`http://localhost:8080/api/customer/orders/${ord.orderId}/feedback`, { 
                                          rating, 
                                          comment,
                                          image: image || null,
                                          removeImage
                                        });
                                        if (setOrders) {
                                          setOrders(prev => prev.map(o => o.orderId === ord.orderId ? { 
                                            ...o, 
                                            feedbackRating: rating, 
                                            feedbackComment: comment,
                                            feedbackImage: removeImage ? null : (image || o.feedbackImage)
                                          } : o));
                                        }
                                        if (fetchOrders) await fetchOrders();
                                        setEditingFeedbackOrderId(null);
                                        showToast('success', 'Review Saved!', 'Your review, rating, and photo have been submitted.');
                                      } catch (err) {
                                        showToast('error', 'Submission Failed', 'Could not record review. Please try again.');
                                      } finally {
                                        setIsSubmittingFeedback(prev => ({ ...prev, [ord.orderId]: false }));
                                      }
                                    }}
                                    className="btn btn-primary"
                                    style={{ 
                                      padding: '8px 18px', 
                                      fontSize: '12px', 
                                      fontWeight: '600',
                                      background: 'var(--accent-teal)', 
                                      border: 'none', 
                                      color: '#fff',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '6px'
                                    }}
                                  >
                                    {isSubmittingFeedback[ord.orderId] ? (
                                      <>
                                        <RefreshCw size={13} className="spin" /> Saving Review...
                                      </>
                                    ) : editingFeedbackOrderId === ord.orderId ? (
                                      <>
                                        <Save size={13} /> Update Review
                                      </>
                                    ) : (
                                      <>
                                        <Check size={13} /> Submit Review
                                      </>
                                    )}
                                  </button>
                                  {editingFeedbackOrderId === ord.orderId && (
                                    <button
                                      type="button"
                                      onClick={() => setEditingFeedbackOrderId(null)}
                                      className="btn btn-secondary"
                                      style={{ padding: '8px 14px', fontSize: '12px', borderRadius: '6px' }}
                                    >
                                      Cancel
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'transactions' && (
            <div>
              <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Payment Transactions Ledger</h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    Complete audit trail of your checkout transactions, gateway responses, and refunds.
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={fetchTransactions} 
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 14px' }}
                >
                  <RefreshCw size={13} className={isLoadingTransactions ? "spin-animation" : ""} /> Refresh
                </button>
              </div>

              {/* Transactions Overview Metric Cards */}
              <div className="analytics-grid" style={{ marginBottom: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="analytics-card" style={{ padding: '16px' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Total Paid Volume</span>
                    <DollarSign size={16} style={{ color: 'var(--accent-emerald)' }} />
                  </div>
                  <div className="analytics-card-value" style={{ fontSize: '22px' }}>
                    ₹{transactions
                      .filter(t => t.paymentStatus === 'PAID' || t.paymentStatus === 'REFUNDED' || t.paymentStatus === 'PARTIALLY_REFUNDED')
                      .reduce((sum, t) => sum + (Number(t.totalAmount) || 0), 0)
                      .toLocaleString('en-IN')}
                  </div>
                  <div className="analytics-card-desc">Successful transactions</div>
                </div>

                <div className="analytics-card" style={{ padding: '16px' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Completed Orders</span>
                    <CheckCircle size={16} style={{ color: 'var(--accent-teal)' }} />
                  </div>
                  <div className="analytics-card-value" style={{ fontSize: '22px' }}>
                    {transactions.filter(t => t.paymentStatus === 'PAID').length}
                  </div>
                  <div className="analytics-card-desc">Active paid orders</div>
                </div>

                <div className="analytics-card" style={{ padding: '16px' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Refunded Amount</span>
                    <RotateCcw size={16} style={{ color: 'var(--accent-indigo)' }} />
                  </div>
                  <div className="analytics-card-value" style={{ fontSize: '22px' }}>
                    ₹{transactions.reduce((sum, t) => sum + (Number(t.totalRefunded) || 0), 0).toLocaleString('en-IN')}
                  </div>
                  <div className="analytics-card-desc">Returned to source</div>
                </div>

                <div className="analytics-card" style={{ padding: '16px' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Failed Attempts</span>
                    <AlertTriangle size={16} style={{ color: 'var(--accent-rose)' }} />
                  </div>
                  <div className="analytics-card-value" style={{ fontSize: '22px' }}>
                    {transactions.filter(t => t.paymentStatus === 'FAILED').length}
                  </div>
                  <div className="analytics-card-desc">Cancelled or rejected</div>
                </div>
              </div>

              {/* Search and Filters Bar */}
              <div className="dashboard-filter-bar">
                <div className="dashboard-filter-search">
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    placeholder="Search by Order ID or Razorpay Payment ID..." 
                    value={transactionSearch}
                    onChange={(e) => setTransactionSearch(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '36px', height: '38px', fontSize: '13px' }}
                  />
                </div>

                <div className="dashboard-filter-chips">
                  {['ALL', 'PAID', 'PENDING', 'FAILED', 'REFUNDED'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setTransactionFilter(st)}
                      className={`btn ${transactionFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transactions Table */}
              {transactions.length === 0 ? (
                <div className="cart-empty-state" style={{ background: 'var(--bg-input)', borderRadius: '10px' }}>
                  <Receipt className="cart-empty-icon" style={{ opacity: 0.2 }} />
                  <p>No transaction history recorded yet.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="custom-table" style={{ minWidth: '880px' }}>
                    <thead>
                      <tr>
                        <th style={{ minWidth: '110px' }}>Date & Time</th>
                        <th style={{ minWidth: '110px' }}>Order ID</th>
                        <th style={{ minWidth: '90px' }}>Method</th>
                        <th style={{ minWidth: '150px' }}>Razorpay Payment ID</th>
                        <th style={{ minWidth: '100px' }}>Total Amount</th>
                        <th style={{ minWidth: '110px', textAlign: 'center' }}>Payment Status</th>
                        <th style={{ minWidth: '110px', textAlign: 'center' }}>Refunds</th>
                        <th style={{ textAlign: 'center', minWidth: '100px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions
                        .filter(tx => {
                          if (transactionFilter !== 'ALL') {
                            if (transactionFilter === 'REFUNDED') {
                              if (tx.paymentStatus !== 'REFUNDED' && tx.paymentStatus !== 'PARTIALLY_REFUNDED') return false;
                            } else if (tx.paymentStatus !== transactionFilter) {
                              return false;
                            }
                          }
                          if (transactionSearch.trim()) {
                            const query = transactionSearch.toLowerCase();
                            const matchOrderId = tx.orderId?.toLowerCase().includes(query);
                            const matchPaymentId = tx.razorpayPaymentId?.toLowerCase().includes(query);
                            return matchOrderId || matchPaymentId;
                          }
                          return true;
                        })
                        .map((tx) => {
                          const isPaid = tx.paymentStatus === 'PAID';
                          const isRefunded = tx.paymentStatus === 'REFUNDED';
                          const isPartiallyRefunded = tx.paymentStatus === 'PARTIALLY_REFUNDED';
                          const isFailed = tx.paymentStatus === 'FAILED';

                          return (
                            <tr key={tx.id}>
                              <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{tx.date}</td>
                              <td>
                                <strong style={{ color: 'var(--text-primary)', fontSize: '13px' }}>{tx.orderId}</strong>
                              </td>
                              <td>
                                <span className="badge badge-customer" style={{ fontSize: '11px' }}>
                                  {tx.paymentMethod || 'RAZORPAY'}
                                </span>
                              </td>
                              <td>
                                {tx.razorpayPaymentId ? (
                                  <code style={{ fontSize: '11px', color: 'var(--accent-teal)', background: 'var(--bg-primary)', padding: '2px 6px', borderRadius: '4px' }}>
                                    {tx.razorpayPaymentId}
                                  </code>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>
                                )}
                              </td>
                              <td>
                                <strong style={{ color: 'var(--accent-emerald)', fontSize: '14px' }}>
                                  ₹{tx.totalAmount}
                                </strong>
                              </td>
                              <td>
                                {isPaid && (
                                  <span className="badge badge-approved" style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                                    PAID
                                  </span>
                                )}
                                {isRefunded && (
                                  <span className="badge" style={{ fontSize: '11px', background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
                                    REFUNDED
                                  </span>
                                )}
                                {isPartiallyRefunded && (
                                  <span className="badge" style={{ fontSize: '11px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
                                    PARTIAL REFUND
                                  </span>
                                )}
                                {isFailed && (
                                  <span className="badge badge-rejected" style={{ fontSize: '11px' }}>
                                    FAILED
                                  </span>
                                )}
                                {!isPaid && !isRefunded && !isPartiallyRefunded && !isFailed && (
                                  <span className="badge" style={{ fontSize: '11px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                                    {tx.paymentStatus}
                                  </span>
                                )}
                              </td>
                              <td>
                                {tx.totalRefunded > 0 ? (
                                  <div style={{ fontSize: '12px', color: '#c084fc' }}>
                                    <strong>₹{tx.totalRefunded}</strong> ({tx.refunds?.length} refund{tx.refunds?.length === 1 ? '' : 's'})
                                  </div>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>None</span>
                                )}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                {(tx.paymentStatus === 'REFUND_PENDING' || tx.hasPendingRefund) ? (
                                  <span
                                    className="badge badge-pending"
                                    style={{ fontSize: '11px', padding: '4px 8px' }}
                                  >
                                    <Clock size={12} /> Pending QC
                                  </span>
                                ) : (isPaid || isPartiallyRefunded) ? (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenRefundModal(tx)}
                                    className="btn btn-secondary"
                                    style={{ fontSize: '11px', padding: '4px 10px', color: '#c084fc', borderColor: 'rgba(168, 85, 247, 0.3)' }}
                                  >
                                    <RotateCcw size={12} /> Return
                                  </button>
                                ) : isRefunded ? (
                                  <span
                                    className="badge"
                                    style={{ fontSize: '11px', padding: '4px 8px', color: '#a78bfa', background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.3)' }}
                                  >
                                    <Check size={12} /> Refunded
                                  </span>
                                ) : (
                                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Your Saved Wishlist</h2>
              {wishlist.length === 0 ? (
                <div className="cart-empty-state" style={{ background: 'var(--bg-input)', borderRadius: '10px' }}>
                  <Heart className="cart-empty-icon" style={{ opacity: 0.2 }} />
                  <p>Your wishlist is empty.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {wishlist.map((prod) => (
                    <div key={prod.id} className="cart-item" style={{ background: 'var(--bg-input)', padding: '14px 16px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '180px' }}>
                        <div style={{ width: '44px', height: '44px', background: 'var(--bg-primary)', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--border-light)' }}>
                          {prod.imageUrl && formatImageUrl(prod.imageUrl).length > 4 ? (
                            <img src={formatImageUrl(prod.imageUrl)} alt={prod.name} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <ProductIcon name={prod.name} category={prod.category} size={20} />
                          )}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '700', wordBreak: 'break-word' }}>{prod.name}</h4>
                          <span className="badge badge-customer" style={{ fontSize: '10px', padding: '2px 6px' }}>{prod.category}</span>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginLeft: 'auto' }}>
                        <strong style={{ fontSize: '16px', color: 'var(--accent-teal)' }}>₹{prod.price}</strong>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button 
                            type="button" 
                            onClick={() => addToCart(prod, (type, text) => showToast(type, type === 'success' ? 'Success' : 'Notification', text))} 
                            className="btn btn-primary" 
                            style={{ padding: '6px 14px', fontSize: '12px' }}
                            disabled={prod.stock <= 0}
                          >
                            {prod.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                          </button>
                          <button 
                            type="button" 
                            onClick={() => toggleWishlist(prod, (type, text) => showToast(type, type === 'success' ? 'Success' : 'Notification', text))} 
                            className="btn-icon-only" 
                            style={{ width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-rose)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                            title="Remove from wishlist"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
                )}
            </div>
          )}

          {activeTab === 'cart' && (
            <div>
              <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Your Shopping Cart</h2>
                {cart.length > 0 && (
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Total {cart.length} item{cart.length === 1 ? '' : 's'} in cart
                  </span>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="cart-empty-state" style={{ background: 'var(--bg-input)', borderRadius: '10px' }}>
                  <ShoppingCart className="cart-empty-icon" style={{ opacity: 0.2 }} />
                  <p>Your cart is empty.</p>
                </div>
              ) : (
                <div className="dashboard-layout" style={{ gap: '24px', alignItems: 'flex-start', padding: 0 }}>
                  <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Select All Bar */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: 'var(--bg-input)',
                      borderRadius: '10px',
                      border: '1px solid var(--border-light)'
                    }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: inStockCartItems.length > 0 ? 'pointer' : 'not-allowed', fontWeight: '600', fontSize: '13px', userSelect: 'none', opacity: inStockCartItems.length > 0 ? 1 : 0.6 }}>
                        <input 
                          type="checkbox" 
                          checked={isAllSelected} 
                          disabled={inStockCartItems.length === 0}
                          onChange={toggleSelectAll} 
                          style={{ width: '18px', height: '18px', accentColor: 'var(--accent-teal)', cursor: inStockCartItems.length > 0 ? 'pointer' : 'not-allowed' }}
                        />
                        <span>Select All In-Stock ({inStockCartItems.length}/{cart.length})</span>
                      </label>
                      <span style={{ fontSize: '12px', color: selectedCartItems.length > 0 ? 'var(--accent-teal)' : 'var(--text-muted)', fontWeight: '700' }}>
                        {selectedCartItems.length} selected for checkout
                      </span>
                    </div>

                    {cart.map((item) => {
                      const liveProduct = products.find(p => p.id === item.id);
                      const currentStock = liveProduct != null ? liveProduct.stock : (item.stock ?? 0);
                      const isOutOfStock = currentStock <= 0;
                      const isExceedingStock = !isOutOfStock && item.quantity > currentStock;
                      const hasDiscount = item.originalPrice && item.originalPrice > item.price;
                      const isItemSelected = selectedCartItemIds.includes(item.id) && !isOutOfStock;

                      return (
                        <div 
                          key={item.id} 
                          className="cart-item-card-responsive" 
                          style={{ 
                            background: isOutOfStock ? 'rgba(239, 68, 68, 0.04)' : 'var(--bg-input)', 
                            padding: '14px 16px', 
                            borderRadius: '10px', 
                            display: 'flex', 
                            flexDirection: 'column',
                            gap: '12px',
                            opacity: isOutOfStock ? 0.65 : (isItemSelected ? 1 : 0.65),
                            border: isOutOfStock ? '1px dashed rgba(239, 68, 68, 0.35)' : (isItemSelected ? '1px solid var(--border-light)' : '1px dashed var(--border-light)'),
                            transition: 'all 0.2s ease',
                            width: '100%',
                            boxSizing: 'border-box'
                          }}
                        >
                          {/* Top Row: Checkbox + Thumbnail + Title/Badges + Delete Button */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', width: '100%' }}>
                            {/* Checkbox */}
                            <input 
                              type="checkbox" 
                              checked={isItemSelected} 
                              disabled={isOutOfStock}
                              onChange={() => toggleSelectItem(item.id)}
                              style={{ width: '20px', height: '20px', accentColor: 'var(--accent-teal)', cursor: isOutOfStock ? 'not-allowed' : 'pointer', flexShrink: 0, marginTop: '2px' }}
                              title={isOutOfStock ? "Out of stock - cannot be selected" : (isItemSelected ? "Deselect item" : "Select item for purchase")}
                            />

                            {/* Product Image */}
                            <div style={{ width: '48px', height: '48px', background: 'var(--bg-primary)', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--border-light)' }}>
                              {item.imageUrl && formatImageUrl(item.imageUrl).length > 4 ? (
                                <img src={formatImageUrl(item.imageUrl)} alt={item.name} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: isOutOfStock ? 'grayscale(0.7)' : 'none' }} />
                              ) : (
                                <ProductIcon name={item.name} category={item.category} size={20} />
                              )}
                            </div>

                            {/* Title & Metadata */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '700', color: isOutOfStock ? 'var(--text-muted)' : 'var(--text-primary)', wordBreak: 'break-word', lineHeight: '1.3' }}>
                                {item.name}
                              </h4>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                <span className="badge badge-customer" style={{ fontSize: '10px', padding: '2px 6px' }}>{item.category}</span>
                                
                                {isOutOfStock ? (
                                  <span style={{ 
                                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.25))', 
                                    color: '#ef4444', 
                                    fontWeight: '800', 
                                    fontSize: '10px', 
                                    padding: '2px 6px', 
                                    borderRadius: '4px',
                                    border: '1px solid rgba(239, 68, 68, 0.35)'
                                  }}>
                                    🚫 OUT OF STOCK
                                  </span>
                                ) : isExceedingStock ? (
                                  <span style={{ 
                                    background: 'rgba(245, 158, 11, 0.15)', 
                                    color: '#f59e0b', 
                                    fontWeight: '700', 
                                    fontSize: '10px', 
                                    padding: '2px 6px', 
                                    borderRadius: '4px',
                                    border: '1px solid rgba(245, 158, 11, 0.35)'
                                  }}>
                                    ⚠️ Only {currentStock} in stock
                                  </span>
                                ) : hasDiscount ? (
                                  <span style={{ 
                                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
                                    color: '#ffffff', 
                                    fontWeight: '800', 
                                    fontSize: '10px', 
                                    padding: '2px 6px', 
                                    borderRadius: '4px',
                                    boxShadow: '0 2px 4px rgba(239, 68, 68, 0.4)'
                                  }}>
                                    {item.discountPercentage}% OFF
                                  </span>
                                ) : null}
                              </div>
                            </div>

                            {/* Trash Button */}
                            <button 
                              type="button" 
                              onClick={() => removeFromCart(item.id)} 
                              className="btn-icon-only" 
                              style={{ color: 'var(--accent-rose)', borderColor: 'rgba(239, 68, 68, 0.2)', width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                              title="Remove item from cart"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                          {/* Bottom Row: Quantity controls on Left, Total price on Right */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border-light)', width: '100%' }}>
                            {/* Quantity Controls */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <button 
                                type="button" 
                                onClick={() => updateCartQuantity(item.id, -1, currentStock)} 
                                className="btn-icon-only"
                                style={{ width: '30px', height: '30px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' }}
                                title="Decrease quantity"
                              >
                                <Minus size={13} />
                              </button>
                              <strong style={{ fontSize: '14px', minWidth: '22px', textAlign: 'center', color: isOutOfStock ? 'var(--accent-rose)' : 'var(--text-primary)' }}>
                                {item.quantity}
                              </strong>
                              <button 
                                type="button" 
                                onClick={() => updateCartQuantity(item.id, 1, currentStock)} 
                                disabled={isOutOfStock || item.quantity >= currentStock}
                                className="btn-icon-only"
                                style={{ 
                                  width: '30px', 
                                  height: '30px', 
                                  padding: 0, 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  borderRadius: '6px',
                                  opacity: (isOutOfStock || item.quantity >= currentStock) ? 0.35 : 1,
                                  cursor: (isOutOfStock || item.quantity >= currentStock) ? 'not-allowed' : 'pointer'
                                }}
                                title={isOutOfStock ? "Product is out of stock" : (item.quantity >= currentStock ? "Reached maximum available stock" : "Increase quantity")}
                              >
                                <Plus size={13} />
                              </button>
                            </div>

                            {/* Total Item Price & Strikethrough MRP */}
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '16px', fontWeight: '800', color: isOutOfStock ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                              </div>
                              {hasDiscount && (
                                <div style={{ fontSize: '11px', fontWeight: '600', textDecoration: 'line-through', color: '#94a3b8', textDecorationColor: '#ef4444', textDecorationThickness: '1.5px' }}>
                                  ₹{(item.originalPrice * item.quantity).toLocaleString('en-IN')}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {(() => {
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
                      <div style={{ flex: 1, background: 'var(--bg-input)', padding: '24px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 8px 0' }}>Order Price Summary</h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                          <div className="flex-between">
                            <span>Total MRP ({selectedCartItems.length} selected)</span>
                            <span>₹{calculateOriginalSubtotal().toLocaleString('en-IN')}</span>
                          </div>
                          {calculateDiscountSavings() > 0 && (
                            <div className="flex-between" style={{ color: 'var(--accent-teal)' }}>
                              <span style={{ fontWeight: '600' }}>Discount Savings</span>
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

                          {/* Delivery notification indicator */}
                          {calculateSubtotal() > 0 && calculateSubtotal() < 500 && (
                            <div style={{ 
                              background: 'rgba(245, 158, 11, 0.12)', 
                              border: '1px solid rgba(245, 158, 11, 0.3)', 
                              borderRadius: '6px', 
                              padding: '6px 10px', 
                              fontSize: '11px', 
                              color: '#f59e0b', 
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}>
                              <span>🚚</span> Add ₹{(500 - calculateSubtotal()).toLocaleString('en-IN')} more for <strong>FREE Delivery</strong>!
                            </div>
                          )}
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
                            <span style={{ fontWeight: '700' }}>Total Amount</span>
                            <strong style={{ color: 'var(--accent-teal)', fontSize: '18px', fontWeight: '800' }}>
                              ₹{calculateTotal().toLocaleString('en-IN')}
                            </strong>
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
                          type="button" 
                          onClick={handleStartCheckout} 
                          disabled={!canProceed}
                          className="btn btn-success btn-block" 
                          style={{ 
                            marginTop: '12px', 
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
              )}
            </div>
          )}
        </div>
      </div>

      {/* Switch to Vendor Prompt Modal */}
      {showVendorPromptModal && (
        <div className="modal-overlay" style={{ zIndex: 3000 }} onClick={() => setShowVendorPromptModal(false)}>
          <div className="dialog-content" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Enter Vendor ID</h2>
              <button onClick={() => setShowVendorPromptModal(false)} className="btn-icon-only">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleToggleRole('VENDOR', switchVendorCode);
            }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5' }}>
                Please enter your unique 6-digit Vendor ID to verify your identity and switch to Vendor mode.
              </p>
              <div className="form-group">
                <input 
                  type="text" 
                  maxLength="6"
                  pattern="\d{6}"
                  placeholder="e.g. 123456"
                  value={switchVendorCode}
                  onChange={(e) => setSwitchVendorCode(e.target.value.replace(/\D/g, ''))}
                  className="form-input" 
                  style={{ textAlign: 'center', fontSize: '20px', letterSpacing: '4px', fontFamily: 'monospace' }}
                  required
                  autoFocus
                />
              </div>
              <div className="modal-footer" style={{ borderTop: 'none', marginTop: '0', paddingTop: '0' }}>
                <button type="button" onClick={() => setShowVendorPromptModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Verify & Switch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upgraded First-Time Vendor Code Center Overlay Dialog Modal */}
      {showUpgradedCodeModal && (
        <div className="modal-overlay" style={{ zIndex: 3000 }}>
          <div className="dialog-content" style={{ maxWidth: '440px', textAlign: 'center', padding: '36px' }}>
            <div className="flex-center" style={{ marginBottom: '16px', color: 'var(--accent-emerald)' }}>
              <CheckCircle2 size={44} />
            </div>
            <h2 className="modal-title" style={{ marginBottom: '8px', fontSize: '20px' }}>Upgraded to Vendor</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px', lineHeight: '1.5' }}>
              Congratulations! Your customer profile has been upgraded. Here is your permanent, unique **6-digit Vendor ID**. You will need this code to log in or switch back to Vendor mode.
            </p>
            <div style={{ 
              background: 'var(--bg-input)', 
              border: '2px dashed var(--accent-indigo)', 
              borderRadius: '10px', 
              padding: '12px', 
              fontSize: '28px', 
              fontWeight: '800', 
              letterSpacing: '6px',
              color: 'var(--text-primary)',
              marginBottom: '20px',
              fontFamily: 'monospace'
            }}>
              {showUpgradedCodeModal}
            </div>
            <button 
              type="button" 
              onClick={() => {
                setShowUpgradedCodeModal(null);
                showToast('success', 'Switched to Vendor View!', 'You now have selling privileges on ShopStack.');
              }} 
              className="btn btn-primary btn-block"
            >
              I have copied my Vendor ID
            </button>
          </div>
        </div>
      )}

      {/* Interactive Checkout & Payment Gateway Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" style={{ zIndex: 2500 }} onClick={() => { if (!isProcessingPayment) setShowPaymentModal(false); }}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            
            {/* Modal Header & Progress Stepper */}
            <div className="modal-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldCheck size={22} style={{ color: 'var(--accent-teal)' }} />
                  {paymentStep === 1 && "Checkout: Delivery & Review"}
                  {paymentStep === 2 && "Secure Payment Gateway"}
                  {paymentStep === 3 && "Processing Payment"}
                  {paymentStep === 4 && "Order Confirmed!"}
                </h2>
                {!isProcessingPayment && (
                  <button onClick={() => setShowPaymentModal(false)} className="btn-icon-only">
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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: addresses.length > 0 ? '10px' : '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={16} style={{ color: 'var(--accent-teal)' }} />
                        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Delivery Address
                        </span>
                      </div>
                      {addresses.length > 0 && (
                        <button 
                          type="button" 
                          onClick={handleOpenAddAddress} 
                          style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontSize: '11px', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                        >
                          + Add New Address
                        </button>
                      )}
                    </div>

                    {addresses.length > 0 ? (
                      <div>
                        {/* Horizontal Compact Address Selection Chips */}
                        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '6px' }}>
                          {addresses.map((addr) => {
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
                      Items to Purchase ({selectedCartItems.reduce((sum, it) => sum + it.quantity, 0)})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                      {selectedCartItems.map((item) => {
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
                        showToast('error', 'Incomplete Details', 'Please fill in your recipient name and delivery address.');
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
                        setActiveTab('orders');
                      }} 
                      className="btn btn-secondary" 
                      style={{ flex: 1, padding: '12px' }}
                    >
                      View Order History
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setShowPaymentModal(false)} 
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

      {/* Add / Edit Shipping Address Modal */}
      {showAddressModal && (
        <div className="modal-overlay" style={{ zIndex: 3100 }} onClick={() => setShowAddressModal(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={20} style={{ color: 'var(--accent-teal)' }} />
                {addressModalMode === 'add' ? 'Add New Address' : 'Edit Shipping Address'}
              </h2>
              <button onClick={() => setShowAddressModal(false)} className="btn-icon-only">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
              <div className="form-group">
                <label className="form-label">Recipient Full Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Rahul Sharma"
                  value={addressForm.fullName} 
                  onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })} 
                  required 
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input 
                  type="text" 
                  placeholder="e.g. +91 98765 43210"
                  value={addressForm.phone} 
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} 
                  required 
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Flat, House no., Building, Street Address *</label>
                <textarea 
                  rows="3"
                  placeholder="e.g. Flat 402, Sunshine Heights, 12th Main, Indiranagar"
                  value={addressForm.streetAddress} 
                  onChange={(e) => setAddressForm({ ...addressForm, streetAddress: e.target.value })} 
                  required 
                  className="form-input"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">City / District *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Bengaluru"
                    value={addressForm.city} 
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} 
                    required 
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Karnataka"
                    value={addressForm.state} 
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} 
                    required 
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">PIN Code / Postal Code *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 560038"
                    value={addressForm.postalCode} 
                    onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })} 
                    required 
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Address Type</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {['HOME', 'WORK', 'OTHER'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setAddressForm({ ...addressForm, addressType: type })}
                        className={addressForm.addressType === type ? "btn btn-primary" : "btn btn-secondary"}
                        style={{ flex: 1, padding: '8px 4px', fontSize: '11px', textTransform: 'capitalize' }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0' }}>
                <input 
                  type="checkbox" 
                  id="makeDefaultCheckbox"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--accent-teal)', cursor: 'pointer' }}
                />
                <label htmlFor="makeDefaultCheckbox" style={{ fontSize: '14px', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: '500' }}>
                  Make this my default shipping address
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="submit" className="btn btn-success" style={{ flex: 1, padding: '12px', fontSize: '14px', fontWeight: '700' }}>
                  <Save size={16} /> Save Address
                </button>
                <button type="button" onClick={() => setShowAddressModal(false)} className="btn btn-secondary" style={{ padding: '12px 20px' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Return & Refund Request Modal */}
      {refundModalOrder && (
        <div className="modal-overlay" onClick={() => setRefundModalOrder(null)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RotateCcw size={20} style={{ color: '#a78bfa' }} />
                <h2 className="modal-title">Initiate Return & Refund</h2>
              </div>
              <button onClick={() => setRefundModalOrder(null)} className="btn-icon-only">
                <X size={18} />
              </button>
            </div>

            {/* Return Policy Banner */}
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)', 
              border: '1px solid rgba(20, 184, 166, 0.3)', 
              borderRadius: '8px', 
              padding: '10px 14px', 
              marginBottom: '16px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <CheckCircle size={18} style={{ color: 'var(--accent-teal)', flexShrink: 0 }} />
              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block' }}>Buyer Protection Return Policy Active</strong>
                <span style={{ color: 'var(--text-secondary)' }}>Free pickup will be arranged. Refund will be approved once product passes quality inspection at warehouse.</span>
              </div>
            </div>

            {/* Return Progress Preview */}
            <div style={{ 
              background: 'var(--bg-input)', 
              borderRadius: '8px', 
              padding: '12px', 
              marginBottom: '16px',
              border: '1px solid var(--border-light)'
            }}>
              <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Return Lifecycle Stages
              </div>
              <div className="responsive-lifecycle-grid">
                <div style={{ padding: '6px', background: 'rgba(20, 184, 166, 0.15)', borderRadius: '6px', color: 'var(--accent-teal)', fontWeight: '700' }}>
                  1. Request (Pending)
                </div>
                <div style={{ padding: '6px', background: 'var(--bg-card)', borderRadius: '6px', color: 'var(--text-muted)' }}>
                  2. Pickup & Transit
                </div>
                <div style={{ padding: '6px', background: 'var(--bg-card)', borderRadius: '6px', color: 'var(--text-muted)' }}>
                  3. Quality Check
                </div>
                <div style={{ padding: '6px', background: 'var(--bg-card)', borderRadius: '6px', color: 'var(--text-muted)' }}>
                  4. Refunded
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitRefund} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '8px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Order ID:</span>
                  <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{refundModalOrder.orderId}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Order Total:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>₹{refundModalOrder.totalAmount}</strong>
                </div>
                {refundModalOrder.razorpayPaymentId && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Razorpay Payment ID:</span>
                    <code style={{ color: 'var(--accent-teal)' }}>{refundModalOrder.razorpayPaymentId}</code>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '6px', marginTop: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Refundable Balance:</span>
                  <strong style={{ color: 'var(--accent-emerald)' }}>
                    ₹{refundModalOrder.refundableBalance !== undefined ? refundModalOrder.refundableBalance : refundModalOrder.totalAmount}
                  </strong>
                </div>
              </div>

              {/* Reason Category Selection */}
              <div className="form-group">
                <label className="form-label">Return Reason Category *</label>
                <select 
                  value={returnReasonCategory}
                  onChange={(e) => {
                    setReturnReasonCategory(e.target.value);
                    if (e.target.value === 'DEFECTIVE_DAMAGED') setRefundReason('Defective or damaged item received');
                    else if (e.target.value === 'WRONG_ITEM') setRefundReason('Wrong item delivered by seller');
                    else if (e.target.value === 'SIZE_FIT_ISSUE') setRefundReason('Size or fit issue');
                    else if (e.target.value === 'CHANGED_MIND') setRefundReason('Changed mind / No longer needed');
                    else if (e.target.value === 'NOT_AS_DESCRIBED') setRefundReason('Product does not match catalog description');
                  }}
                  className="form-select"
                >
                  <option value="DEFECTIVE_DAMAGED">Defective / Damaged Product</option>
                  <option value="WRONG_ITEM">Wrong Item Received</option>
                  <option value="SIZE_FIT_ISSUE">Size or Fit Issue</option>
                  <option value="NOT_AS_DESCRIBED">Item Not As Described / Missing Parts</option>
                  <option value="CHANGED_MIND">Changed Mind / Accidental Purchase</option>
                </select>
              </div>

              {/* Resolution Type Selection */}
              <div className="form-group">
                <label className="form-label">Desired Resolution *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setResolutionType('REFUND')}
                    className={`btn ${resolutionType === 'REFUND' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '12px', padding: '8px' }}
                  >
                    💳 Refund to Source
                  </button>
                  <button
                    type="button"
                    onClick={() => setResolutionType('REPLACEMENT')}
                    className={`btn ${resolutionType === 'REPLACEMENT' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '12px', padding: '8px' }}
                  >
                    🔄 Replacement
                  </button>
                  <button
                    type="button"
                    onClick={() => setResolutionType('EXCHANGE')}
                    className={`btn ${resolutionType === 'EXCHANGE' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '12px', padding: '8px' }}
                  >
                    👕 Size Exchange
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Refund Amount (₹) *</label>
                <input 
                  type="number"
                  step="0.01"
                  min="1"
                  max={refundModalOrder.refundableBalance !== undefined ? refundModalOrder.refundableBalance : refundModalOrder.totalAmount}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="form-input"
                  placeholder="Enter amount to refund"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Reason Summary *</label>
                <input 
                  type="text"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g. Broken screen on arrival"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Additional Comments / Item Condition</label>
                <textarea 
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="Provide any additional details about the packaging, accessories, or defects..."
                  className="form-input"
                  style={{ minHeight: '60px', resize: 'vertical' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Attach Proof Photo URL (Optional)</label>
                <input 
                  type="url"
                  placeholder="https://example.com/item-defect.jpg"
                  value={customerProofImage}
                  onChange={(e) => setCustomerProofImage(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setRefundModalOrder(null)} 
                  className="btn btn-secondary"
                  disabled={isSubmittingRefund}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: '#fff' }}
                  disabled={isSubmittingRefund || !refundAmount}
                >
                  {isSubmittingRefund ? "Submitting Request..." : "Submit Return Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Photo Preview Lightbox Modal */}
      {previewLightboxImage && (
        <div 
          className="modal-overlay" 
          onClick={() => setPreviewLightboxImage(null)} 
          style={{ zIndex: 9999, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <button 
              type="button" 
              onClick={() => setPreviewLightboxImage(null)}
              style={{ 
                position: 'absolute', 
                top: '-42px', 
                right: '0', 
                background: 'rgba(255,255,255,0.2)', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '50%', 
                width: '34px', 
                height: '34px', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                transition: 'background 0.2s'
              }}
              title="Close image view"
            >
              <X size={20} />
            </button>
            <img 
              src={formatImageUrl(previewLightboxImage)} 
              alt="Full resolution review attachment" 
              style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: '10px', objectFit: 'contain', boxShadow: '0 12px 40px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)' }} 
            />
          </div>
        </div>
      )}

    </div>
  );
}