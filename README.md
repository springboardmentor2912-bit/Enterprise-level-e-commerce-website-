# ShopStack — Enterprise Multi-Vendor E-Commerce Platform

## 1. Project Overview & Objectives
ShopStack is an Enterprise Multi-Vendor E-Commerce Platform built with a React frontend, Java Spring Boot backend, Spring Security, JWT authentication, and PostgreSQL database integration. It enables customers to browse, cart, and purchase products from multiple vendors through a unified checkout powered by **Razorpay Payment Gateway (TEST MODE)**. Vendors can manage product catalogs, inventory stock, and merchant order fulfillment, while Administrators manage vendor approvals, platform taxonomy, user authorization, and system-wide metrics.

---

## 2. Architecture & Technology Stack

### Frontend
- **Framework**: React.js + Vite
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Styling**: Clean CSS (Light & Responsive layout)

### Backend
- **Core Framework**: Java 17/25 + Spring Boot 3.2.2
- **Security**: Spring Security + JWT (JSON Web Tokens) + BCrypt Hashing
- **Data Access**: Spring Data JPA + Hibernate
- **Payment Gateway**: Razorpay Java SDK (`com.razorpay:razorpay-java:1.4.7`)
- **Build Tool**: Apache Maven

### Database
- **Primary Database**: PostgreSQL (H2 in-memory mode supported out of the box for dev testing)

---

## 3. Core Modules & Completed Milestones

### Milestone 1 — Project Initialization & Core Setup
- Spring Boot & React architecture setup.
- PostgreSQL database schema & JPA entities (`User`, `Role`, `VendorProfile`, `Category`, `Product`, `Review`).
- Role-based authorization (`CUSTOMER`, `VENDOR`, `ADMIN`).
- Secure registration, BCrypt password hashing, and JWT login session management.

### Milestone 2 — Inventory, Pricing & Order Processing
- Real-time stock quantity tracking & status updates.
- Shopping cart management (add to cart, update quantity, remove, stock validation).
- Order creation & inventory reduction workflows.

### Milestone 3 — Secure Checkout & Razorpay Integration
- Backend `Payment` entity and `PaymentRepository`.
- Razorpay order creation (`/api/payments/create-order`) with backend amount validation.
- Cryptographic signature verification (`razorpay_order_id + "|" + razorpay_payment_id` with `RAZORPAY_KEY_SECRET`).
- **Idempotent Stock Deduction**: Orders start as `PENDING` and are set to `CONFIRMED` only after verified payment. Stock is deducted **EXACTLY ONCE**.
- Default Customer Shipping Address:
  `Veerapunayunipalli, Kadapa, Andhra Pradesh, 516321, India`

### Milestone 4 — Complete E-Commerce Workflows
- **Customer**: Product catalog browsing, category filtering, search, Razorpay checkout, Order History page (`/orders`) with status tracking (`PENDING` -> `CONFIRMED` -> `PROCESSING` -> `SHIPPED` -> `DELIVERED`).
- **Vendor**: Vendor Dashboard (`/vendor`) with product catalog management, stock update modal, and order fulfillment status updates. Strict vendor isolation enforced.
- **Admin**: System Administrator Dashboard (`/admin`) with real DB metrics (Paid Revenue, Paid Transactions, Total Products, Vendors, Customers), user enablement/disabling controls, and vendor approvals.

### Milestone 5 — Security Hardening, Testing & Documentation
- Spring Security method authorization (`@PreAuthorize`).
- Environment variable configuration for secrets (`JWT_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`).
- Automated backend unit/integration tests (`ShopStackBackendApplicationTests.java`).
- Frontend production build verification (`npm run build`).

---

## 4. Database Setup & Environment Variables

### Database Configuration (`application.yml`)
To connect to PostgreSQL, set environment variables or edit `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: ${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5432/shopstack_db}
    username: ${SPRING_DATASOURCE_USERNAME:postgres}
    password: ${SPRING_DATASOURCE_PASSWORD:postgres}
```

### Razorpay Test Mode Credentials
Razorpay key ID and secret key are loaded via environment variables:

```bash
export RAZORPAY_KEY_ID="rzp_test_your_key_id"
export RAZORPAY_KEY_SECRET="your_razorpay_secret_key"
export JWT_SECRET="9a6f8b1c4e2d7a9b0c3f5e8d1a4b7c0d3e6f9a2b5c8d1e4f7a0b3c6d9e2f5a8b"
```

---

## 5. Demo Account Credentials

Default demo accounts are automatically initialized by `DataInitializer.java` on initial startup:

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **CUSTOMER** | `customer@shopstack.com` | `customer123` | Shopping customer account |
| **VENDOR** | `techstore@shopstack.com` | `vendor123` | Vendor store: Nexus Electronics |
| **VENDOR** | `apparel@shopstack.com` | `vendor123` | Vendor store: Aura Fashion House |
| **ADMIN** | `admin@shopstack.com` | `admin123` | System Administrator account |

---

## 6. How to Run the Project

### One-Click Launch (Recommended)
Run the root launcher script to start both Backend (port 8081) and Frontend (port 3000) simultaneously:

- **Windows Batch**: Double-click `start-all.bat` or run:
  ```bash
  .\start-all.bat
  ```
- **PowerShell**:
  ```powershell
  .\start-all.ps1
  ```

---

### Manual Launch

#### 1. Running Backend (Spring Boot)
```bash
cd backend
mvn clean compile
mvn spring-boot:run
```
- Backend REST API server starts on: `http://localhost:8081`
- Public Health Telemetry: `http://localhost:8081/api/health`
- H2 Database Console: `http://localhost:8081/h2-console`

#### 2. Running Backend Tests
```bash
cd backend
mvn test
```

#### 3. Running Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
- Frontend web application runs on: `http://localhost:3000`

#### 4. Building Frontend for Production
```bash
cd frontend
npm run build
```

---

## 7. Author & Project Info

**Author**: Chittiboina Chiranjeevi  
**Institution**: National Institute of Technology Andhra Pradesh  
**Project**: Infosys Springboard Internship - ShopStack Enterprise Multi-Vendor E-Commerce Platform  
