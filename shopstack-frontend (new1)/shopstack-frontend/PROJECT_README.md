# ShopStack — Enterprise Multi-Vendor E-Commerce Platform
Milestone 1 & 2 implementation (Java Spring Boot + React)

This delivers everything in your Milestone 1 + 2 scope:

- User Authentication & Role-Based Access (JWT, Google OAuth2, password reset, profile mgmt, 4 roles)
- Customer Module (registration, browse/search, wishlist, cart, order history, profile)
- Vendor Module (registration + admin approval, product listing, inventory, price mgmt, sales monitoring, product approval workflow)
- Product Catalog Module (CRUD, categories, search & filtering, reviews & ratings)
- Inventory Management Module (stock tracking, updates, allocation/reservation, reports, low-stock alerts, stock history)
- Cart & Checkout Module (add/remove/update, checkout workflow, address management, order confirmation)
- Payment Module — Razorpay **test mode** (online payments, server-side signature verification, transaction/status history)
- Order Management Module (creation, processing, tracking, cancellation)

Coupons, warehouse pick/pack, shipping carrier integration, admin commission dashboards, and reporting/export are Milestone 3/4 items and are intentionally left for later, as you specified.

---

## 1. Backend setup (`shopstack-backend/`)

**Requirements:** Java 17, Maven (or use the Docker path below), PostgreSQL 14+, Redis.

### Option A — Docker Compose (easiest)
```bash
cd shopstack-backend
docker compose up --build
```
This starts Postgres, Redis, and the API on `http://localhost:8080`. It reads secrets from the `.env` file already included (gitignored).

### Option B — Run locally
1. Create a Postgres database named `shopstack`.
2. Make sure Redis is running on `localhost:6379`.
3. Export the variables in `.env` into your shell, or copy `.env` values into `src/main/resources/application-local.yml` (this filename is gitignored).
4. `mvn spring-boot:run`

### About the Razorpay keys
Your `rzp-key.csv` contained a **test-mode** key id/secret pair. They're wired in via `.env` → environment variables → `application.yml` (`razorpay.key-id` / `razorpay.key-secret`), never hardcoded in Java source. `.env` is gitignored so it won't get committed by accident.

⚠️ Rotate these keys in the Razorpay dashboard before using this project for anything beyond local development, and definitely before any production deployment or public repo push.

### Google OAuth2 login
Set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` in `.env` if you want the OAuth2 login flow to work. Without them, `/api/auth/register` and `/api/auth/login` (JWT/email+password) still work fully — OAuth2 is additive.

### Key endpoints
| Area | Endpoint |
|---|---|
| Register/Login | `POST /api/auth/register`, `POST /api/auth/login` |
| Browse products | `GET /api/products?keyword=&categoryId=&minPrice=&maxPrice=&brand=` |
| Cart | `GET/POST/PUT/DELETE /api/cart/...` |
| Checkout | `POST /api/orders/checkout` → `POST /api/orders/verify-payment` |
| Vendor | `POST /api/vendor/products`, `PATCH /api/vendor/products/{id}/inventory`, etc. |
| Admin | `POST /api/admin/vendors/{id}/approve`, `POST /api/admin/products/{id}/approve` |

Full list is in the controller classes under `src/main/java/com/shopstack/controller/`.

---

## 2. Frontend setup (`shopstack-frontend/`)

```bash
cd shopstack-frontend
npm install
npm run dev
```
Runs on `http://localhost:5173`. It talks to the backend via `VITE_API_BASE_URL` in `.env` (defaults to `http://localhost:8080/api`).

The Razorpay **key id** (not the secret) is exposed to the frontend via `VITE_RAZORPAY_KEY_ID` — this is normal and safe; the key id is a public identifier, and Razorpay Checkout.js requires it client-side. The secret never leaves the backend.

### Test payment
On checkout, Razorpay's widget opens in test mode. Use:
- Card: `4111 1111 1111 1111`
- Any future expiry, any CVV, any name

### Roles & flow
1. Register as a **Customer** to browse/buy, or as a **Vendor** (needs admin approval before listing products).
2. To test the admin flow, manually promote a user's `role` to `ADMIN` in the `users` table (there's no public admin sign-up, by design — admins are provisioned directly).
3. As Admin: approve the vendor → vendor can then submit products → Admin approves products → products go live → customers can buy them.

---

## 3. What's deliberately deferred to Milestone 3/4
- Coupon & promotion engine
- Warehouse pick/pack + shipment carrier tracking
- Vendor commission payout calculations / admin commission dashboard
- Reports & PDF/Excel export
- Full admin marketplace analytics dashboards

The data model (e.g. `Vendor.commissionRate`, `OrderStatus.SHIPPED/DELIVERED/RETURNED/REFUNDED`) already has room for these so Milestone 3/4 work builds on top without breaking changes.
