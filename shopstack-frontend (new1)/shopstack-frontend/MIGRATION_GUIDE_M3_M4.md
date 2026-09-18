# ShopStack — Milestone 3 & 4 Migration Guide

This package assumes you already have your own working copy of the
Milestone 1+2 project running in Eclipse, with the fixes we made together
during debugging (OAuth2 removed, hardcoded DB/Razorpay credentials, DTO
fixes for reviews/wishlist). **This zip is a full project snapshot with all
of that already baked in**, so the simplest path is usually:

1. Back up your current `shopstack-backend` and `shopstack-frontend` folders
   (copy them somewhere safe, or `git commit` if you're using git).
2. Extract this zip's `shopstack-backend` and `shopstack-frontend` folders
   **over** your existing ones (replace everything).
3. Re-apply your own machine-specific settings that aren't meant to be
   shared: your real DB password and Razorpay keys in `application.yml`
   (this package ships with placeholder/env-var defaults, not your
   hardcoded local values).
4. Re-import the Maven project in Eclipse (right-click → Maven → Update
   Project) and restart the backend.

If you'd rather hand-merge instead of overwriting, everything new is listed
below by category.

---

## 1. What's new in the backend

### New enums (`enums/`)
- `DiscountType` (PERCENTAGE, FIXED_AMOUNT)
- `ReturnStatus` (REQUESTED, APPROVED, REJECTED, REFUNDED)
- `ShipmentStatus` (PREPARING, SHIPPED, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, FAILED)
- `WarehouseTaskStatus` (PENDING, PICKING, PACKED, READY_FOR_SHIPMENT)

### New entities (`entity/`)
- `Coupon` — promo codes with percentage or flat discounts, usage limits, validity windows
- `ReturnRequest` — customer return/refund requests tied to an order
- `Shipment` — carrier + tracking number + delivery status per order
- `WarehouseTask` — pick/pack workflow state per order, assignable to warehouse staff

### New repositories (`repository/`)
`CouponRepository`, `ReturnRequestRepository`, `ShipmentRepository`, `WarehouseTaskRepository`

### New DTOs
- `dto/coupon/` — `CouponRequest`, `CouponResponse`, `ApplyCouponResult`
- `dto/fulfillment/` — `ReturnRequestCreate`, `ReturnResponse`, `ShipmentRequest`, `ShipmentResponse`, `WarehouseTaskResponse`
- `dto/report/` — `VendorCommissionSummary`, `MarketplaceAnalytics`

### New services (`service/`)
- `CouponService` — create/list/deactivate coupons; validates a code against
  a subtotal and computes the discount; usage count only increments once
  payment is actually confirmed (not at checkout, so abandoned carts don't
  burn a customer's coupon use)
- `ReturnService` — customer requests a return on a DELIVERED order; admin
  approves (restocks inventory + issues a real Razorpay refund + marks order
  REFUNDED) or rejects
- `ShipmentService` — creates a shipment (carrier + tracking number),
  transitions the order to SHIPPED, and lets warehouse/admin update
  in-transit/delivered/failed status
- `WarehouseTaskService` — auto-creates a pick/pack task the moment an
  order's payment is confirmed; warehouse staff advance it through
  PENDING → PICKING → PACKED → READY_FOR_SHIPMENT
- `AnalyticsService` — marketplace-wide stats for the admin dashboard
  (users, vendors, products, orders, gross revenue, commission earned,
  pending returns, open warehouse tasks)
- `ReportService` — generates CSV exports (sales, orders, inventory,
  vendors, financial/commission) — no external library needed, just
  hand-built CSV strings returned with a `Content-Disposition` header so
  the browser downloads them directly

### Changed services
- `PaymentService` — added a `refund(orderId, amount)` method that calls
  Razorpay's real refund API (still test-mode safe under your test keys)
- `OrderService` — `checkout()` now validates/applies a coupon code if
  supplied and stores the discount on the order; `verifyAndConfirmPayment()`
  now marks the coupon used and auto-creates the warehouse task
- `VendorService` — added `getCommissionSummary(vendorId)` for the vendor's
  own gross revenue / commission / net earnings view

### New/changed controllers (`controller/`)
- `CouponController` — admin-only CRUD at `/api/admin/coupons`
- `CouponValidationController` — customer-facing `/api/coupons/validate`
  used by the checkout page to preview a discount before placing the order
- `ReturnController` — customer endpoints: `POST /api/orders/{id}/return`,
  `GET /api/orders/returns/mine`
- `WarehouseController` — `/api/warehouse/tasks` (list + status updates)
  and `/api/warehouse/orders/{id}/ship`
- `ShipmentController` — customer tracking view
  `GET /api/orders/{id}/shipment` and warehouse/admin
  `PATCH /api/warehouse/orders/{id}/shipment-status`
- `AdminController` — extended with return approval/rejection, marketplace
  analytics (`GET /api/admin/analytics`), and five CSV report endpoints
  under `/api/admin/reports/*.csv`
- `VendorController` — added `GET /api/vendor/commission-summary`

### Also fixed in this snapshot (carried over from our debugging session)
- `SecurityConfig` — OAuth2 login removed entirely (you can re-add it later
  following the same pattern we discussed, no structural changes needed)
- `application.yml` — CORS now allows both `localhost:5173` and `:5174` by
  default; OAuth2 property block removed
- `ReviewService`/`ReviewController` and `WishlistService`/`WishlistController`
  — now return proper DTOs instead of raw JPA entities (fixes the
  `ByteBuddyInterceptor` 500 errors)

**Important:** this snapshot's `application.yml` uses environment-variable
placeholders (`${DB_PASSWORD:postgres}`, `${RAZORPAY_KEY_SECRET:}`, etc.),
**not** the hardcoded values you put in your own copy while debugging. After
merging, put your real local DB password and Razorpay test keys back in —
either directly in `application.yml` (simplest, matches what you were doing)
or via a `.env`/environment variables if you prefer.

---

## 2. What's new in the frontend

### New API modules (`src/api/`)
`couponApi.js`, `returnApi.js`, `shipmentApi.js`, `warehouseApi.js` — plus
`adminApi.js` and `vendorApi.js` extended with analytics/reports/commission
endpoints.

### New pages
- `pages/CheckoutPage.jsx` (rewritten) — coupon code input with live
  discount preview before payment
- `pages/OrderDetailPage.jsx` (rewritten) — shipment tracking display and a
  "Request a return" form for delivered orders
- `pages/admin/AdminAnalyticsPage.jsx` — the new default `/admin` landing
  page with marketplace-wide stat tiles
- `pages/admin/AdminReturnsPage.jsx` — approve/reject pending returns
- `pages/admin/AdminCouponsPage.jsx` — create coupons, view usage, deactivate
- `pages/admin/AdminReportsPage.jsx` — one-click CSV downloads
- `pages/vendor/VendorCommissionPage.jsx` — vendor's own earnings breakdown
- `pages/warehouse/WarehouseDashboardPage.jsx` — pick/pack task board +
  mark-as-shipped form

### Changed routing/navigation
- `App.jsx` — new routes for all of the above; note `/admin` (the vendor
  approval page) **moved to `/admin/vendors`** since `/admin` is now the
  analytics dashboard
- `pages/admin/AdminLayout.jsx` — tabs updated to include Analytics,
  Returns, Coupons, Reports
- `pages/vendor/VendorLayout.jsx` — added an "Earnings" tab
- `components/Navbar.jsx` — added a "Warehouse" link, visible to
  `WAREHOUSE_STAFF` and `ADMIN` roles
- `pages/ProductDetailPage.jsx` — the silent-failure bug fix from our
  debugging session (proper error banner instead of a generic "not found")

---

## 3. Database — still nothing to run by hand

Hibernate's `ddl-auto: update` will automatically create the four new
tables (`coupons`, `return_requests`, `shipments`, `warehouse_tasks`) the
first time you start the backend against this new code — same as every
other table so far. No manual SQL needed.

---

## 4. How to actually test the new features end-to-end

1. **Coupons**: log in as Admin → Coupons tab → create one (e.g. code
   `WELCOME10`, 10% off, no minimum). Then as a customer, add items to cart
   → checkout → enter `WELCOME10` → Apply → confirm the discount shows
   before paying.

2. **Fulfillment (warehouse) staff**: there's no public sign-up for this
   role either, same as Admin. Register a normal account, then promote it:
   ```sql
   UPDATE users SET role = 'WAREHOUSE_STAFF' WHERE email = 'warehouse@shopstack.com';
   ```
   Log out/in, and you'll see a "Warehouse" link in the navbar.

3. **Full order lifecycle test**:
   - Customer completes checkout + payment → order becomes `CONFIRMED`
     and a warehouse task is auto-created at `PENDING`
   - Warehouse staff: `/warehouse` → advance the task through
     Picking → Packed → enter a carrier + tracking number → "Mark shipped"
     → order becomes `SHIPPED`
   - Warehouse/Admin can then push the shipment status further
     (in transit → out for delivery → delivered) via the
     `PATCH /api/warehouse/orders/{id}/shipment-status` endpoint (no
     dedicated UI button for this progression yet — see "Not included"
     below)
   - Customer can see live tracking info on their Order Detail page

4. **Returns/refunds**: once an order is `DELIVERED`, the customer can
   request a return from the Order Detail page. Admin sees it under
   Returns → Approve (this automatically restocks inventory, issues a real
   Razorpay test-mode refund, and marks the order `REFUNDED`) or Reject.

5. **Reports**: Admin → Reports tab → download any of the five CSVs, opens
   cleanly in Excel/Google Sheets.

6. **Vendor earnings**: Vendor dashboard → Earnings tab shows gross
   revenue, the marketplace's commission cut, and net earnings.

---

## 5. Known gaps / intentionally out of scope

- **Shipment status progression UI**: warehouse staff can mark an order
  shipped, but there's no dedicated button yet for "in transit" → "out for
  delivery" → "delivered" — that's a backend endpoint
  (`PATCH /api/warehouse/orders/{id}/shipment-status`) without a frontend
  control yet. Easy to add a small dropdown on the Warehouse dashboard if
  you want it.
- **Reports are CSV, not PDF/Excel**: matches "Reports & Export" in spirit
  without pulling in a PDF/XLSX-generation library. If you specifically
  need formatted PDF or native `.xlsx`, that's an additional library
  (e.g. Apache POI for Excel, OpenPDF for PDF) — say the word and I'll wire
  it in.
- **Partial refunds**: `ReturnService.approve()` currently always refunds
  the order's full total. Partial/line-item refunds would need a small
  extension (accepting an amount parameter) if you need that granularity.
- **No automated tests included**: the Milestone 4 spec mentions "system
  testing" — this snapshot doesn't include a JUnit test suite. Happy to
  add core test coverage (auth, checkout, inventory reservation) as a
  follow-up if useful.
- **Final deployment**: `docker-compose.yml`/`Dockerfile` from Milestone
  1+2 still apply unchanged — no new infrastructure was needed for these
  modules.
