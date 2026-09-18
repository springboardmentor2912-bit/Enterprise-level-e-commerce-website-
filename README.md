# 🛒 ShopStack — Java Enterprise Multi-Vendor E-Commerce Platform

## 📌 Project Overview

**ShopStack** is a full-stack multi-vendor e-commerce platform developed as part of the **Infosys Springboard Virtual Internship**.

The platform provides separate functionality for **Customers, Vendors, Administrators, and Warehouse Staff**.

Customers can browse products, manage their shopping cart, apply coupons, place orders, make payments, track orders, request returns, and view refund information.

Vendors can manage products, pricing, inventory, and customer orders. Administrators can manage vendors, products, orders, returns, refunds, coupons, and commission information.

The application is built using a **React.js frontend, Spring Boot backend, and PostgreSQL database**.

---

## 🎯 Objectives

* Develop a complete multi-vendor e-commerce platform.
* Provide separate functionality for Customers, Vendors, Administrators, and Warehouse Staff.
* Implement secure authentication and role-based authorization.
* Manage products, inventory, carts, and orders.
* Provide coupon and commission management.
* Implement return and refund workflows.
* Integrate online payment processing.
* Provide responsive and user-friendly interfaces.
* Handle invalid requests and API/server errors gracefully.

---

## 👥 User Roles

### 👤 Customer

Customers can:

* Register and log in.
* Browse available products.
* Add products to cart.
* Update cart quantities.
* Manage delivery addresses.
* Apply available coupons.
* Select payment methods.
* Place orders.
* View order history.
* Cancel eligible orders.
* Request returns for delivered orders.
* Track order status.
* View refund information.

### 🏪 Vendor

Vendors can:

* Access the vendor dashboard.
* Create and manage products.
* Manage product prices and details.
* Set original prices and discount percentages.
* View calculated selling prices.
* Monitor inventory.
* Manage product stock.
* View customer orders.
* Update order status.

### 👑 Administrator

Administrators can:

* Access the admin dashboard.
* Manage customers and vendors.
* Approve or reject vendors.
* Manage products.
* Monitor orders.
* Manage returns and refunds.
* Manage coupons.
* View commission records.
* View commission reports.
* Monitor platform activity.

### 🏭 Warehouse Staff

Warehouse staff support inventory and shipment-related operations within the platform.

---

## ✨ Main Features

### 🔐 Authentication & Authorization

* User registration
* User login
* JWT-based authentication
* Spring Security
* Role-based authorization
* Protected REST API endpoints
* Customer, Vendor, Administrator, and Warehouse access control
* Password encryption

### 🛍️ Product Management

* Product listing
* Product details
* Product creation and management
* Vendor-specific products
* Product quantity management
* Product availability checking
* Original price management
* Discount percentage management
* Automatic selling-price calculation

### 🛒 Shopping Cart

* Add products to cart
* Increase/decrease quantity
* Remove products
* Stock validation
* Automatic total calculation
* Empty cart handling

### 📍 Address Management

Customers can:

* Add delivery addresses
* View saved addresses
* Select an address during checkout

### 🎟️ Coupon Management

* Display active coupons
* Validate coupon codes
* Handle invalid or expired coupons
* Apply discounts during checkout
* Track coupon usage
* Minimum order amount validation

### 💳 Checkout & Payment

The checkout process follows:

**Cart → Address → Coupon → Payment Method → Review → Place Order**

The system validates:

* Customer authentication
* Delivery address
* Cart contents
* Product availability
* Product stock
* Coupon validity
* Payment method

The platform supports:

* Razorpay payment integration
* Test-mode payment processing
* Cash on Delivery
* Server-side payment verification

### 📦 Order Management

Customers can:

* Place orders
* View orders
* Cancel eligible orders
* Track order status
* Request returns

Vendors and administrators can manage order status.

Order status flow:

**PENDING → CONFIRMED → SHIPPED → DELIVERED**

Orders may also be cancelled when permitted.

### 📊 Inventory Management

When an order is successfully processed:

1. Product stock is checked.
2. Order is created.
3. Order items are created.
4. Product quantity is reduced.
5. Inventory quantity is updated.
6. Reserved quantity is updated.
7. Cart is cleared after successful checkout.

Insufficient-stock situations are handled with user-friendly error messages.

### ↩️ Return Management

Customers can request returns for eligible delivered orders.

Return workflow:

**DELIVERED → RETURN REQUESTED → APPROVED / REJECTED**

Customers provide a return reason when submitting a request.

### 💰 Refund Management

Approved returns can proceed to refund processing.

The system maintains refund information such as:

* Refund amount
* Refund transaction ID
* Refund date
* Refund status

### 💼 Commission Management

The platform maintains vendor commission information for completed orders.

Commission information includes:

* Order amount
* Commission amount
* Vendor amount
* Vendor
* Product
* Order

Administrators can view commission records and reports.

### 📱 Responsive Design

The frontend supports different screen sizes, including:

* Mobile
* Tablet
* Laptop
* Desktop

Responsive layouts are implemented across major areas such as:

* Customer Dashboard
* Products
* Cart
* Checkout
* Orders
* Vendor Dashboard
* Admin Dashboard
* Reports

---

## 🛠️ Technology Stack

### Frontend

* React.js
* JavaScript
* HTML5
* CSS3
* Axios
* Vite
* React Router

### Backend

* Java 21
* Spring Boot
* Spring Security
* Spring Data JPA
* REST APIs
* JWT Authentication
* Maven
* Lombok

### Database

* PostgreSQL

### Payment

* Razorpay

### Development & Deployment Tools

* Visual Studio Code
* pgAdmin
* Postman
* Git
* GitHub
* Docker
* Docker Compose
* AWS EC2
* Vercel

---

## 🏗️ Application Architecture

```text
                    ┌──────────────────────┐
                    │      React.js        │
                    │      Frontend        │
                    └──────────┬───────────┘
                               │
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │     Spring Boot      │
                    │       Backend        │
                    ├──────────────────────┤
                    │ Controllers           │
                    │ Services              │
                    │ Repositories          │
                    │ Spring Security       │
                    │ JWT Authentication    │
                    └──────────┬───────────┘
                               │
                               │ JPA / Hibernate
                               ▼
                    ┌──────────────────────┐
                    │      PostgreSQL       │
                    │       Database        │
                    └──────────────────────┘

                               │
                               │ Payment API
                               ▼
                    ┌──────────────────────┐
                    │      Razorpay        │
                    │   Payment Gateway    │
                    └──────────────────────┘
```

---

## 📂 Major Modules

```text
ShopStack
│
├── Authentication
├── Customer Management
├── Vendor Management
├── Admin Management
├── Warehouse Management
├── Product Management
├── Cart Management
├── Address Management
├── Coupon Management
├── Checkout
├── Payment
├── Order Management
├── Inventory Management
├── Shipment Management
├── Return Management
├── Refund Management
└── Commission & Reports
```

---

## 🔄 Order Processing Workflow

```text
Customer
   │
   ▼
Browse Products
   │
   ▼
Add to Cart
   │
   ▼
Select Address
   │
   ▼
Apply Coupon
   │
   ▼
Select Payment Method
   │
   ▼
Review Order
   │
   ▼
Place Order
   │
   ▼
Validate Stock
   │
   ▼
Create Order
   │
   ├──────────────► Update Inventory
   │
   ├──────────────► Calculate Commission
   │
   └──────────────► Update Coupon Usage
   │
   ▼
Clear Cart
   │
   ▼
Customer Orders
```

---

## 🔄 Return & Refund Workflow

```text
Delivered Order
       │
       ▼
Customer Requests Return
       │
       ▼
Admin Reviews Request
       │
       ├──────────────► Reject
       │
       ▼
     Approve
       │
       ▼
Inventory Restored
       │
       ▼
Refund Processed
       │
       ▼
    REFUNDED
```

---

## ⚠️ Error Handling

ShopStack provides user-friendly handling for common application and API errors.

Handled scenarios include:

* Invalid login credentials
* Duplicate registration
* Empty or invalid form fields
* Unauthorized access
* Expired session
* Backend unavailable
* API/server errors
* Insufficient stock
* Invalid product
* Invalid or expired coupon
* Missing address
* Missing payment method
* Invalid order
* Invalid cancellation request
* Invalid return request
* Refund errors

The frontend displays understandable error messages instead of exposing technical server details to users.

---

## 🧪 Testing

The application has been tested across major functional areas.

### Authentication

* Valid login
* Invalid email
* Invalid password
* Duplicate registration
* Empty form fields
* Logout

### Shopping

* Product listing
* Add to cart
* Quantity updates
* Stock validation
* Empty cart
* Total calculation

### Checkout

* Address selection
* Address creation
* Coupon validation
* Invalid coupon
* Payment method selection
* Order placement
* Insufficient stock
* Backend error handling

### Orders

* Order creation
* Order history
* Order status
* Order cancellation
* Return request
* Refund workflow

### Vendor

* Product management
* Inventory management
* Order management
* Order status updates

### Admin

* Vendor approval/rejection
* Product management
* Order management
* Returns/refunds
* Coupon management
* Commission reports

### Responsive Testing

The UI has been tested across different screen sizes, including:

* Mobile: 375 × 667
* Mobile: 390 × 844
* Tablet: 768 × 1024
* Laptop: 1024 × 768
* Desktop: 1440 × 900

---

# 🚀 How to Run the Project

## Prerequisites

Install the following:

* Java 21
* Node.js
* PostgreSQL
* Git
* Maven
* Visual Studio Code or another IDE

---

## Backend Setup

Navigate to the backend project:

```bash
cd authentication
```

Configure PostgreSQL database settings in:

```text
src/main/resources/application.properties
```

Create or use the PostgreSQL database:

```text
authentication_db
```

Run the backend:

```bash
mvnw.cmd spring-boot:run
```

The backend runs on:

```text
http://localhost:8080
```

---

## Frontend Setup

Navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm.cmd install
```

Start the development server:

```bash
npm.cmd run dev
```

Vite will display the frontend URL in the terminal.

---

## 🔧 Build Commands

### Backend

```bash
mvnw.cmd clean compile
```

### Frontend

```bash
npm.cmd run build
```

---

# 🐳 Docker Deployment

ShopStack can be run using Docker and Docker Compose.

The main services are:

```text
┌─────────────────────────────┐
│     shopstack-frontend      │
│       React + Nginx         │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│      shopstack-backend      │
│       Spring Boot           │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│     shopstack-postgres      │
│       PostgreSQL            │
└─────────────────────────────┘
```

### Start all services

```bash
docker-compose up -d --build
```

### Check service status

```bash
docker-compose ps
```

### View backend logs

```bash
docker-compose logs -f backend
```

### View frontend logs

```bash
docker-compose logs -f frontend
```

---

# ☁️ Deployment Architecture

ShopStack supports local development as well as cloud-based deployment.

```text
                         ┌─────────────────────┐
                         │   GitHub Repository  │
                         └──────────┬──────────┘
                                    │
                       ┌────────────┴────────────┐
                       │                         │
                       ▼                         ▼
              ┌────────────────┐        ┌────────────────┐
              │     Vercel     │        │    AWS EC2     │
              │ React Frontend │        │ Spring Boot    │
              │                │        │ + Docker       │
              └───────┬────────┘        └───────┬────────┘
                      │                         │
                      │      REST API           │
                      └─────────────────────────┘
                                                │
                                                ▼
                                      ┌─────────────────┐
                                      │   PostgreSQL    │
                                      │    Database     │
                                      └─────────────────┘
```

### 1. Local Development

Developers can run:

* Spring Boot backend locally
* React frontend locally
* PostgreSQL locally

### 2. AWS EC2 Deployment

The backend can be deployed to an AWS EC2 instance using Docker.

The repository can be synchronized on the EC2 instance using Git:

```bash
git pull origin main
```

Docker services can then be rebuilt and restarted using:

```bash
docker-compose up -d --build
```

### 3. Vercel Frontend Deployment

The React frontend can be deployed through Vercel.

Frontend API configuration is controlled using the environment variable:

```text
VITE_API_URL
```

This allows the frontend to communicate with the appropriate Spring Boot backend without hard-coding the API server throughout the application.

---

# 🔒 Security

ShopStack uses several security mechanisms:

* JWT authentication
* Spring Security
* BCrypt password encryption
* Role-based authorization
* Protected REST endpoints
* Token-based API access
* Server-side payment verification

Sensitive credentials such as database passwords and payment gateway secrets should be stored using environment variables and **must not be committed to GitHub**.

---

# 💳 Payment Security

Razorpay payment processing uses server-side verification.

The general flow is:

```text
Customer
   │
   ▼
Checkout
   │
   ▼
Create Payment Order
   │
   ▼
Razorpay Checkout
   │
   ▼
Payment
   │
   ▼
Server-side Verification
   │
   ▼
Order Processing
```

Payment credentials are configured through environment variables rather than being exposed in the frontend source code.

---

# 📈 Future Enhancements

Possible future improvements include:

* Production payment gateway configuration
* Additional payment gateway integrations
* SMS notifications
* Advanced product search
* Product reviews and ratings
* Wishlist improvements
* Advanced analytics
* Vendor analytics
* AI-powered product recommendations
* Improved reporting and dashboards

---

# 🎓 Project Information

**Project:** ShopStack — Java Enterprise Multi-Vendor E-Commerce Platform

**Program:** Infosys Springboard Virtual Internship

**Technology:** Java 21 / Spring Boot / React.js / PostgreSQL

**Department:** Information Technology

**Academic Year:** 4th Year, 7th Semester

---

# 👩‍💻 Developer

**Sayani Khanra**

B.Tech — Information Technology

St. Thomas' College of Engineering & Technology

---

# 📌 Project Status

| Area                       | Status      |
| -------------------------- | ----------- |
| Development                | Completed   |
| Backend Build              | Successful  |
| Frontend Build             | Successful  |
| Responsive UI              | Implemented |
| Authentication             | Implemented |
| Product Management         | Implemented |
| Cart & Checkout            | Implemented |
| Order Management           | Implemented |
| Inventory Management       | Implemented |
| Return & Refund Workflow   | Implemented |
| Payment Integration        | Implemented |
| Error Handling             | Implemented |
| Docker Deployment          | Configured  |
| AWS Deployment             | Configured  |
| Vercel Frontend Deployment | Configured  |

---

## ✅ Project Ready for Final Demonstration

ShopStack brings together product management, multi-role access control, shopping cart functionality, checkout, payments, orders, inventory, returns, refunds, coupons, commissions, and cloud deployment into a single enterprise-style e-commerce platform.
