/**
 * ShopStack Notification Service
 * Manages real dynamic notifications and read/unread states for each dashboard
 * strictly based on live user role and data without mock coupons or promotional noise.
 */

const NOTIF_STORAGE_KEY_PREFIX = 'shopstack_read_notifs_';
const NOTIF_DISMISSED_KEY_PREFIX = 'shopstack_dismissed_notifs_';

export function resolveUserId(userOrId) {
  if (!userOrId) return 'guest';
  if (typeof userOrId === 'object') {
    return userOrId.id || userOrId.email || 'guest';
  }
  return String(userOrId);
}

export function getReadNotifIds(userId = 'guest') {
  try {
    const uid = resolveUserId(userId);
    const raw = localStorage.getItem(`${NOTIF_STORAGE_KEY_PREFIX}${uid}`);
    if (raw) return JSON.parse(raw);
    const rawSession = sessionStorage.getItem(`${NOTIF_STORAGE_KEY_PREFIX}${uid}`);
    if (rawSession) {
      const parsed = JSON.parse(rawSession);
      localStorage.setItem(`${NOTIF_STORAGE_KEY_PREFIX}${uid}`, rawSession);
      return parsed;
    }
    return [];
  } catch (e) {
    return [];
  }
}

export function markNotifAsRead(notifId, userId = 'guest') {
  try {
    const uid = resolveUserId(userId);
    const ids = getReadNotifIds(uid);
    if (!ids.includes(notifId)) {
      ids.push(notifId);
      localStorage.setItem(`${NOTIF_STORAGE_KEY_PREFIX}${uid}`, JSON.stringify(ids));
    }
  } catch (e) {}
}

export function markAllNotifsAsRead(notifIds = [], userId = 'guest') {
  try {
    const uid = resolveUserId(userId);
    const ids = getReadNotifIds(uid);
    const combined = [...new Set([...ids, ...notifIds])];
    localStorage.setItem(`${NOTIF_STORAGE_KEY_PREFIX}${uid}`, JSON.stringify(combined));
  } catch (e) {}
}

export function getDismissedNotifIds(userId = 'guest') {
  try {
    const uid = resolveUserId(userId);
    const raw = localStorage.getItem(`${NOTIF_DISMISSED_KEY_PREFIX}${uid}`);
    if (raw) return JSON.parse(raw);
    const rawSession = sessionStorage.getItem(`${NOTIF_DISMISSED_KEY_PREFIX}${uid}`);
    if (rawSession) {
      const parsed = JSON.parse(rawSession);
      localStorage.setItem(`${NOTIF_DISMISSED_KEY_PREFIX}${uid}`, rawSession);
      return parsed;
    }
    return [];
  } catch (e) {
    return [];
  }
}

export function dismissNotif(notifId, userId = 'guest') {
  try {
    const uid = resolveUserId(userId);
    const ids = getDismissedNotifIds(uid);
    if (!ids.includes(notifId)) {
      ids.push(notifId);
      localStorage.setItem(`${NOTIF_DISMISSED_KEY_PREFIX}${uid}`, JSON.stringify(ids));
    }
  } catch (e) {}
}

export function clearAllNotifs(userId = 'guest', notifIds = []) {
  try {
    const uid = resolveUserId(userId);
    const ids = getDismissedNotifIds(uid);
    let combined;
    if (Array.isArray(notifIds) && notifIds.length > 0) {
      combined = [...new Set([...ids, ...notifIds])];
    } else {
      combined = [...new Set([...ids, '__all__'])];
    }
    localStorage.setItem(`${NOTIF_DISMISSED_KEY_PREFIX}${uid}`, JSON.stringify(combined));
  } catch (e) {}
}

/**
 * Generate real customer order notifications strictly from active orders
 */
export function generateCustomerNotifications({
  user,
  orders = [],
  coupons = [],
  onOpenOrders,
  onShopNow
}) {
  const userId = resolveUserId(user);
  const readIds = getReadNotifIds(userId);
  const dismissedIds = getDismissedNotifIds(userId);
  if (dismissedIds.includes('__all__')) return [];

  const list = [];

  // 1. Promotional Coupon Notifications from active campaigns
  if (Array.isArray(coupons) && coupons.length > 0) {
    coupons.forEach((coupon, idx) => {
      if (coupon.active === false) return;
      const code = coupon.code ? coupon.code.toUpperCase().trim() : '';
      if (!code) return;
      const discountLabel = coupon.discountType === 'PERCENTAGE' 
        ? `${coupon.discountValue}% OFF` 
        : `₹${coupon.discountValue} OFF`;
      const minOrderText = coupon.minOrderAmount 
        ? ` on orders above ₹${Number(coupon.minOrderAmount).toLocaleString('en-IN')}` 
        : '';
      const expiryText = coupon.expiryDate 
        ? ` Valid until ${coupon.expiryDate.replace('T', ' ').substring(0, 16)}.` 
        : '';
      const uniqueSuffix = coupon.id || code || idx;

      list.push({
        id: `cust_coupon_${uniqueSuffix}`,
        category: 'coupons',
        iconType: 'coupon',
        title: `Special Offer: ${code} (${discountLabel})`,
        message: `Use promo code ${code} for ${discountLabel}${minOrderText}.${expiryText} Apply at checkout to save!`,
        time: 'Active Offer',
        badge: discountLabel,
        badgeType: 'success',
        codeToCopy: code,
        actionLabel: 'Shop Now',
        onAction: () => onShopNow && onShopNow(coupon)
      });
    });
  }

  // 2. Order Lifecycle Notifications from real customer orders
  if (Array.isArray(orders)) {
    orders.forEach((order, idx) => {
      const orderId = order.id || order.orderId || `ORD-${idx + 1}`;
      const status = (order.orderStatus || order.status || 'PLACED').toUpperCase();
      const amount = Number(order.totalAmount || 0).toLocaleString('en-IN');
      const itemCount = order.items?.length || 1;
      const uniqueSuffix = `${orderId}_${idx}`;

      if (status === 'PLACED' || status === 'PROCESSING' || status === 'CONFIRMED') {
        const notifId = `cust_order_conf_${uniqueSuffix}`;
        list.push({
          id: notifId,
          category: 'orders',
          iconType: 'order_confirmed',
          title: `Order #${orderId} Confirmed & Paid`,
          message: `Payment of ₹${amount} received. ${itemCount} item(s) are being prepped for dispatch.`,
          time: 'Recent',
          badge: 'CONFIRMED',
          badgeType: 'success',
          actionLabel: 'Track Order',
          onAction: () => onOpenOrders && onOpenOrders(order)
        });
      } else if (status === 'SHIPPED') {
        const notifId = `cust_order_ship_${uniqueSuffix}`;
        list.push({
          id: notifId,
          category: 'orders',
          iconType: 'order_shipped',
          title: `Order #${orderId} Dispatched`,
          message: `Package shipped via ${order.deliveryPartner || 'ShopStack Logistics'}. In transit.`,
          time: 'Recent',
          badge: 'IN TRANSIT',
          badgeType: 'info',
          actionLabel: 'Live Tracking',
          onAction: () => onOpenOrders && onOpenOrders(order)
        });
      } else if (status === 'OUT_FOR_DELIVERY') {
        const notifId = `cust_order_ofd_${uniqueSuffix}`;
        list.push({
          id: notifId,
          category: 'orders',
          iconType: 'order_shipped',
          title: `Order #${orderId} Out for Delivery`,
          message: `Delivery agent is on the way to your shipping address. Arriving today.`,
          time: 'Recent',
          badge: 'OUT FOR DELIVERY',
          badgeType: 'warning',
          actionLabel: 'Track Agent',
          onAction: () => onOpenOrders && onOpenOrders(order)
        });
      } else if (status === 'DELIVERED') {
        const notifId = `cust_order_del_${uniqueSuffix}`;
        list.push({
          id: notifId,
          category: 'orders',
          iconType: 'order_delivered',
          title: `Order #${orderId} Delivered`,
          message: `Package successfully delivered. View invoice or leave a verified review.`,
          time: 'Recent',
          badge: 'DELIVERED',
          badgeType: 'success',
          actionLabel: 'View Order',
          onAction: () => onOpenOrders && onOpenOrders(order)
        });
      } else if (status === 'CANCELLED') {
        const notifId = `cust_order_canc_${uniqueSuffix}`;
        list.push({
          id: notifId,
          category: 'orders',
          iconType: 'warning',
          title: `Order #${orderId} Cancelled & Refunded`,
          message: `Order was cancelled. Refund of ₹${amount} initiated to source payment method.`,
          time: 'Recent',
          badge: 'REFUNDED',
          badgeType: 'danger',
          actionLabel: 'View Details',
          onAction: () => onOpenOrders && onOpenOrders(order)
        });
      }
    });
  }

  // Filter out dismissed notifications and attach read flag
  return list
    .filter(item => !dismissedIds.includes(item.id))
    .map(item => ({
      ...item,
      read: readIds.includes(item.id)
    }));
}

/**
 * Generate real Vendor notifications including both merchant sales, personal purchases, and coupon campaigns
 */
export function generateVendorNotifications({
  user,
  products = [],
  orders = [], // Merchant orders received from customers
  purchaseOrders = [], // Orders the vendor bought as a customer
  coupons = [], // Vendor coupon campaigns (pending approval or approved)
  onGoToTab,
  onOpenPurchaseOrder
}) {
  const userId = resolveUserId(user || 'vendor');
  const readIds = getReadNotifIds(userId);
  const dismissedIds = getDismissedNotifIds(userId);
  if (dismissedIds.includes('__all__')) return [];

  const list = [];

  // 1. Promotional Coupon Campaigns from Admin (Pending Review or Accepted)
  if (Array.isArray(coupons) && coupons.length > 0) {
    coupons.forEach((coupon, idx) => {
      const code = coupon.code ? coupon.code.toUpperCase().trim() : '';
      if (!code) return;
      const discountLabel = coupon.discountType === 'PERCENTAGE' 
        ? `${coupon.discountValue}% Off` 
        : `₹${coupon.discountValue} Off`;
      const uniqueSuffix = coupon.id || code || idx;
      const status = (coupon.approvalStatus || 'PENDING').toUpperCase();

      if (status === 'PENDING') {
        list.push({
          id: `vend_coupon_pending_${uniqueSuffix}`,
          category: 'coupons',
          iconType: 'coupon',
          title: `New Coupon Campaign: ${code}`,
          message: `Admin launched promotional campaign "${code}" (${discountLabel}). Action required: Review and accept or reject for your products.`,
          time: 'Action Required',
          badge: 'ACTION REQUIRED',
          badgeType: 'warning',
          codeToCopy: code,
          actionLabel: 'Review Campaign',
          onAction: () => onGoToTab && onGoToTab('coupons')
        });
      } else if (status === 'APPROVED' || status === 'ACCEPTED') {
        list.push({
          id: `vend_coupon_accepted_${uniqueSuffix}`,
          category: 'coupons',
          iconType: 'coupon',
          title: `Campaign Active: ${code}`,
          message: `You accepted coupon campaign "${code}" (${discountLabel}). Participating store products are now active for customer discounts.`,
          time: 'Active',
          badge: 'ACCEPTED',
          badgeType: 'success',
          codeToCopy: code,
          actionLabel: 'Manage Campaign',
          onAction: () => onGoToTab && onGoToTab('coupons')
        });
      }
    });
  }

  // 2. Personal Purchase Orders (Vendor ordering as a customer)
  if (Array.isArray(purchaseOrders) && purchaseOrders.length > 0) {
    purchaseOrders.forEach((pOrder, idx) => {
      const orderId = pOrder.orderId || pOrder.id || `ORD-${idx + 1}`;
      const status = (pOrder.orderStatus || pOrder.status || 'PLACED').toUpperCase();
      const amount = Number(pOrder.totalAmount || 0).toLocaleString('en-IN');
      const uniqueSuffix = `${orderId}_${idx}`;

      if (status === 'PLACED' || status === 'PROCESSING' || status === 'CONFIRMED') {
        list.push({
          id: `vend_purchase_conf_${uniqueSuffix}`,
          category: 'purchases',
          iconType: 'order_confirmed',
          title: `My Purchase #${orderId} Confirmed`,
          message: `Payment of ₹${amount} received. Seller is preparing your order.`,
          time: 'Recent',
          badge: 'PURCHASE CONFIRMED',
          badgeType: 'success',
          actionLabel: 'Track Purchase',
          onAction: () => onOpenPurchaseOrder && onOpenPurchaseOrder(pOrder)
        });
      } else if (status === 'SHIPPED') {
        list.push({
          id: `vend_purchase_ship_${uniqueSuffix}`,
          category: 'purchases',
          iconType: 'order_shipped',
          title: `My Purchase #${orderId} Dispatched`,
          message: `Your package is in transit with ${pOrder.deliveryPartner || 'ShopStack Express'}.`,
          time: 'Recent',
          badge: 'IN TRANSIT',
          badgeType: 'info',
          actionLabel: 'Live Tracking',
          onAction: () => onOpenPurchaseOrder && onOpenPurchaseOrder(pOrder)
        });
      } else if (status === 'OUT_FOR_DELIVERY') {
        list.push({
          id: `vend_purchase_ofd_${uniqueSuffix}`,
          category: 'purchases',
          iconType: 'order_shipped',
          title: `My Purchase #${orderId} Out for Delivery`,
          message: `Courier driver is delivering your purchase today.`,
          time: 'Recent',
          badge: 'ARRIVING TODAY',
          badgeType: 'warning',
          actionLabel: 'Track Agent',
          onAction: () => onOpenPurchaseOrder && onOpenPurchaseOrder(pOrder)
        });
      } else if (status === 'DELIVERED') {
        list.push({
          id: `vend_purchase_del_${uniqueSuffix}`,
          category: 'purchases',
          iconType: 'order_delivered',
          title: `My Purchase #${orderId} Delivered`,
          message: `Your ordered item was successfully delivered.`,
          time: 'Recent',
          badge: 'DELIVERED',
          badgeType: 'success',
          actionLabel: 'View Order',
          onAction: () => onOpenPurchaseOrder && onOpenPurchaseOrder(pOrder)
        });
      }
    });
  }

  // 3. Incoming Customer Orders (Sales received by vendor)
  if (Array.isArray(orders) && orders.length > 0) {
    orders.forEach((order, idx) => {
      const orderId = order.orderId || order.id || (order.orderItemId ? `ITEM-${order.orderItemId}` : `104${idx + 1}`);
      const amount = Number(order.totalAmount || order.price || 0).toLocaleString('en-IN');
      const uniqueSuffix = order.orderItemId ? `item_${order.orderItemId}` : `${orderId}_${idx}`;
      list.push({
        id: `vend_order_new_${uniqueSuffix}`,
        category: 'sales',
        iconType: 'order_placed',
        title: `Store Order #${orderId} Received`,
        message: `${order.productName ? `"${order.productName}" purchased` : 'Customer purchased items'} worth ₹${amount}. Ready for packing & fulfillment.`,
        time: 'Recent',
        badge: 'NEW SALE',
        badgeType: 'warning',
        actionLabel: 'Fulfill Order',
        onAction: () => onGoToTab && onGoToTab('orders')
      });
    });
  }

  // 4. Product Quality Moderation & Approvals
  if (Array.isArray(products)) {
    const approvedProducts = products.filter(p => p.approvalStatus === 'APPROVED' || !p.approvalStatus);
    const pendingProducts = products.filter(p => p.approvalStatus === 'PENDING');
    const lowStockProducts = products.filter(p => Number(p.stock) > 0 && Number(p.stock) <= 5);

    if (approvedProducts.length > 0) {
      const p = approvedProducts[0];
      list.push({
        id: `vend_prod_appr_${p.id || 1}`,
        category: 'products',
        iconType: 'product_approved',
        title: `Product Approved: ${p.name || 'Listing'}`,
        message: `Admin approved your listing "${p.name || 'Product'}". It is live and searchable in store catalog.`,
        time: 'Recent',
        badge: 'APPROVED',
        badgeType: 'success',
        actionLabel: 'View Products',
        onAction: () => onGoToTab && onGoToTab('products')
      });
    }

    if (pendingProducts.length > 0) {
      list.push({
        id: `vend_prod_pend_${pendingProducts.length}`,
        category: 'products',
        iconType: 'product_pending',
        title: `${pendingProducts.length} Listing(s) in Review`,
        message: `Products submitted are currently in administrator moderation queue.`,
        time: 'Recent',
        badge: 'IN REVIEW',
        badgeType: 'warning',
        actionLabel: 'Check Status',
        onAction: () => onGoToTab && onGoToTab('products')
      });
    }

    // 5. Low Stock Alerts
    if (lowStockProducts.length > 0) {
      const p = lowStockProducts[0];
      list.push({
        id: `vend_stock_low_${p.id || 3}`,
        category: 'products',
        iconType: 'low_stock',
        title: `Low Stock: ${p.name || 'Product'}`,
        message: `Only ${p.stock} units remaining in stock. Restock soon to prevent stockout.`,
        time: 'Recent',
        badge: 'LOW STOCK',
        badgeType: 'danger',
        actionLabel: 'Manage Stock',
        onAction: () => onGoToTab && onGoToTab('inventory')
      });
    }
  }

  return list
    .filter(item => !dismissedIds.includes(item.id))
    .map(item => ({
      ...item,
      read: readIds.includes(item.id)
    }));
}

/**
 * Generate real Admin notifications
 */
export function generateAdminNotifications({
  user,
  pendingProductsCount = 0,
  ordersCount = 0,
  vendorsCount = 0,
  onGoToTab
}) {
  const userId = resolveUserId(user || 'admin');
  const readIds = getReadNotifIds(userId);
  const dismissedIds = getDismissedNotifIds(userId);
  if (dismissedIds.includes('__all__')) return [];

  const list = [];

  // 1. Pending Product Submissions
  if (pendingProductsCount > 0) {
    list.push({
      id: `admin_pend_prods_${pendingProductsCount}`,
      category: 'approvals',
      iconType: 'admin_alert',
      title: `${pendingProductsCount} Product(s) Pending Review`,
      message: 'New vendor catalog submissions awaiting administrator verification and approval.',
      time: 'Live',
      badge: 'URGENT REVIEW',
      badgeType: 'danger',
      actionLabel: 'Review Listings',
      onAction: () => onGoToTab && onGoToTab('products')
    });
  }

  // 2. Vendor Management
  if (vendorsCount > 0) {
    list.push({
      id: 'admin_vendor_onboard',
      category: 'vendors',
      iconType: 'product_approved',
      title: `${vendorsCount} Registered Merchants Active`,
      message: 'Vendor accounts and store profiles active on the marketplace.',
      time: 'Recent',
      badge: 'VENDORS',
      badgeType: 'purple',
      actionLabel: 'Manage Vendors',
      onAction: () => onGoToTab && onGoToTab('vendors')
    });
  }

  // 3. Platform Order Volume
  if (ordersCount > 0) {
    list.push({
      id: 'admin_orders_traffic',
      category: 'orders',
      iconType: 'order_confirmed',
      title: `${ordersCount} Orders Processed Platform-Wide`,
      message: 'Customer transactions and order fulfillment active across stores.',
      time: 'Recent',
      badge: 'ORDERS',
      badgeType: 'success',
      actionLabel: 'View Orders',
      onAction: () => onGoToTab && onGoToTab('monitoring')
    });
  }

  return list
    .filter(item => !dismissedIds.includes(item.id))
    .map(item => ({
      ...item,
      read: readIds.includes(item.id)
    }));
}

/**
 * Generate real Warehouse Staff notifications
 */
export function generateWarehouseNotifications({
  user,
  pendingAllocationsCount = 0,
  onGoToQueue
}) {
  const userId = resolveUserId(user || 'staff');
  const readIds = getReadNotifIds(userId);
  const dismissedIds = getDismissedNotifIds(userId);
  if (dismissedIds.includes('__all__')) return [];

  const list = [];

  // Order Allocations for picking
  if (pendingAllocationsCount > 0) {
    list.push({
      id: `wh_alloc_tasks_${pendingAllocationsCount}`,
      category: 'picking',
      iconType: 'warehouse_alloc',
      title: `${pendingAllocationsCount} Pick Tasks Assigned`,
      message: `Administrator allocated order items to ${user?.warehouseName || 'your facility'} for picking.`,
      time: 'Live',
      badge: 'PRIORITY PICK',
      badgeType: 'danger',
      actionLabel: 'Open Picking Queue',
      onAction: () => onGoToQueue && onGoToQueue('fulfillment', 'pick')
    });
  }

  return list
    .filter(item => !dismissedIds.includes(item.id))
    .map(item => ({
      ...item,
      read: readIds.includes(item.id)
    }));
}
