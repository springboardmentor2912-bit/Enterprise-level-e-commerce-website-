# ShopStack – Enterprise-Level Multi-Vendor E-Commerce Platform

ShopStack is an enterprise-level, multi-vendor e-commerce platform designed to support customers, vendors, administrators, and warehouse staff through a unified web application.

The platform provides product management, shopping cart and checkout, secure authentication, Razorpay payments, coupon management, inventory and warehouse management, order tracking, returns, commissions, notifications, and administrative analytics.

---

## 📌 Project Overview

ShopStack follows a modern client-server architecture:

```text
                    ┌─────────────────────┐
                    │      Customer       │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │    React Frontend   │
                    │     + Axios         │
                    └──────────┬──────────┘
                               │ REST API
                    ┌──────────▼──────────┐
                    │   Spring Boot API   │
                    │    Spring MVC      │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
      ┌───────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
      │     JPA /    │ │ JWT Security│ │  Business   │
      │   Hibernate  │ │   + RBAC    │ │   Services  │
      └───────┬──────┘ └─────────────┘ └─────────────┘
              │
      ┌───────▼────────┐
      │   PostgreSQL   │
      └────────────────┘

              External Services
                     │
              ┌──────▼──────┐
              │   Razorpay  │
              └─────────────┘
✨ Key Features
👤 Customer Features
User registration and login
JWT-based authentication
Role-based access control
Product browsing
Product details
Shopping cart
Address management
Coupon application
Secure checkout
Razorpay payment integration
Order placement
Order history
Order status tracking
Return requests
Refund-related workflows
Profile management
Vendor notifications
User-friendly error handling
🏪 Vendor Features
Vendor dashboard
Add products
Edit products
Product management
Inventory management
Vendor-specific orders
Vendor coupon creation
Coupon approval workflow
Sales-related information
Commission tracking
Notifications for customer orders
Vendor management features
👨‍💼 Admin Features
Admin dashboard
Platform analytics
Vendor management
Product and platform overview
Order management
Coupon management
Coupon approval/rejection
Commission management
Return management
Warehouse management
Inventory monitoring
Administrative analytics
📦 Warehouse Features
Warehouse management
Warehouse staff management
Inventory allocation
Warehouse inventory tracking
Stock updates
Stock movement tracking
Warehouse analytics
Warehouse staff dashboard
Product allocation between warehouse resources
💳 Payment Features

ShopStack integrates Razorpay for online payments.

The payment flow is designed so that the backend creates the Razorpay order and verifies the payment before the ShopStack order is created.

Customer
   │
   ▼
Checkout
   │
   ▼
Backend creates Razorpay Order
   │
   ▼
Razorpay Checkout
   │
   ▼
Payment
   │
   ▼
Razorpay returns payment details
   │
   ▼
Backend verifies payment signature
   │
   ▼
Payment verified
   │
   ▼
ShopStack Order Created

Payment information includes:

Razorpay Order ID
Razorpay Payment ID
Razorpay Signature
Payment status
Payment method

Sensitive Razorpay credentials must be stored using environment variables or secure configuration and must never be committed to the repository.

🔐 Authentication & Authorization

ShopStack uses JWT-based authentication with role-based authorization.

Authentication

Users authenticate using their registered credentials.

After successful authentication, the backend generates a JWT.

The frontend sends the token with protected API requests:

Authorization: Bearer <JWT_TOKEN>

The backend validates the JWT through the security filter.

Role-Based Access Control

The platform supports multiple roles:

CUSTOMER
VENDOR
ADMIN
WAREHOUSE STAFF

Different roles have access to different platform capabilities.

Example:

CUSTOMER
 ├── Browse products
 ├── Cart
 ├── Checkout
 ├── Orders
 └── Returns

VENDOR
 ├── Product management
 ├── Inventory
 ├── Vendor orders
 ├── Coupons
 └── Commission information

ADMIN
 ├── Dashboard
 ├── Vendors
 ├── Orders
 ├── Coupons
 ├── Commissions
 ├── Returns
 └── Warehouses

WAREHOUSE STAFF
 ├── Warehouse dashboard
 ├── Inventory
 ├── Stock movement
 └── Allocations
🏷️ Coupon Management

ShopStack provides a controlled coupon system.

The coupon workflow includes:

Vendor creates coupon
        │
        ▼
Coupon status = PENDING
        │
        ▼
Admin reviews coupon
        │
        ├───────────────┐
        ▼               ▼
    APPROVED          REJECTED
        │
        ▼
Customer can apply
eligible coupon

Supported functionality includes:

Percentage discounts
Fixed discounts
Minimum order amount
Maximum discount
Usage limits
Start date
Expiry date
Product eligibility
Vendor eligibility
Coupon approval
Coupon rejection
Coupon usage tracking
Discount analytics
📦 Inventory Management

ShopStack provides inventory management capabilities for products and warehouse operations.

Features include:

Stock quantity management
Stock updates
Inventory summaries
Stock movement tracking
Warehouse inventory
Warehouse allocation
Inventory analytics

Stock-related operations are tracked through stock movement records.

🏭 Warehouse Management

The platform supports warehouse operations through dedicated modules.

Warehouse functionality includes:

Warehouse creation
Warehouse management
Warehouse staff
Staff assignment
Inventory allocation
Warehouse inventory
Warehouse analytics
Stock management

This allows the platform to support inventory operations beyond a basic product-stock model.

📋 Order Management

ShopStack provides an order lifecycle for customer purchases.

The order status workflow is:

PLACED
   │
   ▼
CONFIRMED
   │
   ▼
PROCESSING
   │
   ▼
SHIPPED
   │
   ▼
OUT_FOR_DELIVERY
   │
   ▼
DELIVERED

Orders can also be cancelled where permitted by the order state.

The backend maintains:

Order information
Order items
Product information
Vendor information
Payment information
Coupon information
Order status
Total amount
Order date
🔄 Returns Management

ShopStack supports customer return requests and administrative return processing.

Return functionality includes:

Customer return request
Return status
Return condition
Return inspection
Admin return management
Return action processing

The system separates the customer request from administrative processing.

💰 Vendor Commission Management

ShopStack includes a vendor commission system.

When eligible orders are processed, commissions can be calculated based on the configured commission rate.

Commission records contain information such as:

Order
Vendor
Sale amount
Commission rate
Commission amount
Vendor amount
Commission status
Creation date

The platform also provides administrative commission management.

🔔 Notifications

ShopStack provides notification functionality for relevant platform events.

For example, when a customer places an order containing products from a vendor, the corresponding vendor can receive an order notification.

Notification information includes:

Recipient
Order
Message
Read/unread status
Creation timestamp
⚠️ Error Handling

The application includes frontend and backend error handling for common scenarios.

Examples include:

Invalid login
Invalid registration data
Invalid form inputs
API failures
Server errors
Payment failures
Insufficient stock
Invalid coupons
Expired coupons
Unauthorized access
Order errors
Return errors
Refund-related errors

The frontend uses centralized error-handling utilities to provide user-friendly messages instead of exposing backend stack traces directly to users.

🛠️ Technology Stack
Frontend
React
JavaScript
JSX
Axios
Vite
CSS
Backend
Java
Spring Boot
Spring MVC
Spring Security
REST APIs
Maven
Database
PostgreSQL
JPA
Hibernate
Authentication
JWT
Spring Security
Role-Based Access Control
Payments
Razorpay
DevOps / Deployment
Docker
Docker Compose
Nginx
AWS-ready deployment architecture
🏗️ Backend Architecture

The backend follows a layered architecture.

Controller
     │
     ▼
Service
     │
     ▼
Repository
     │
     ▼
JPA / Hibernate
     │
     ▼
PostgreSQL
Controller Layer

Responsible for:

Receiving HTTP requests
Validating request flow
Calling service methods
Returning API responses

Example:

ProductController
OrderController
CartController
PaymentController
CouponController
AdminController
Service Layer

Contains the application's business logic.

Examples:

ProductService
OrderService
CartService
PaymentService
CouponService
InventoryService
CommissionService
NotificationService
WarehouseService
Repository Layer

Responsible for database access through Spring Data JPA.

Examples:

ProductRepository
OrderRepository
CartRepository
UserRepository
CouponRepository
InventoryRepository
WarehouseRepository
Entity Layer

JPA entities represent database tables and relationships.

Examples:

User
Product
Cart
CartItem
Order
OrderItem
Coupon
CouponUsage
Commission
Notification
Warehouse
WarehouseInventory
WarehouseAllocation
ReturnRequest
StockMovement
🌐 Frontend Architecture

The React application is organized into:

frontend/
│
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── config/
│   ├── pages/
│   ├── services/
│   ├── utils/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── package.json
├── vite.config.js
├── nginx.conf
└── Dockerfile
📁 Project Structure
ShopStack/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── config/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.js
│
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/shopstack/backend/
│   │   │       ├── config/
│   │   │       ├── controller/
│   │   │       ├── dto/
│   │   │       ├── entity/
│   │   │       ├── enums/
│   │   │       ├── filter/
│   │   │       ├── repository/
│   │   │       └── service/
│   │   │
│   │   └── resources/
│   │       └── application.properties
│   │
│   └── test/
│
├── Dockerfile
├── docker-compose.yml
├── pom.xml
├── mvnw
├── mvnw.cmd
├── .gitignore
└── README.md
🚀 Getting Started
Prerequisites

Install the following before running the project:

Java 21
Node.js
npm
PostgreSQL
Git
Maven (optional because Maven Wrapper is included)
Docker (optional)
🔧 Backend Setup

Clone the repository:

git clone <repository-url>
cd Enterprise-level-e-commerce-website-

Navigate to the backend:

cd .

The backend is a Spring Boot application managed using Maven.

Run using Maven Wrapper:

Windows
mvnw.cmd spring-boot:run
Linux / macOS
./mvnw spring-boot:run

The backend runs on:

http://localhost:8080
🎨 Frontend Setup

Navigate to the frontend:

cd frontend

Install dependencies:

npm install

Start the development server:

npm run dev

The frontend will normally be available at:

http://localhost:5173
🗄️ PostgreSQL Configuration

Create a PostgreSQL database for ShopStack.

Configure the database connection in:

src/main/resources/application.properties

Example structure:

spring.datasource.url=jdbc:postgresql://localhost:5432/shopstack
spring.datasource.username=<your-username>
spring.datasource.password=<your-password>

Do not commit real passwords or production secrets to GitHub.

For production environments, use environment variables or a secure secrets-management solution.

🐳 Docker Setup

ShopStack includes Docker configuration for containerized deployment.

Build and start the application using:

docker compose up --build

To run containers in detached mode:

docker compose up -d --build

To stop the containers:

docker compose down

To view running containers:

docker ps
🔑 Environment Variables & Secrets

The following types of information should be treated as secrets:

PostgreSQL passwords
JWT secrets
Razorpay API keys
Razorpay secret keys
Email credentials
Cloud credentials
Production API credentials

Never commit production credentials directly into:

application.properties
.env
source code
Git history

Use environment variables for sensitive configuration.

Example:

spring.datasource.password=${DB_PASSWORD}
🔌 API Modules

The backend provides REST API modules for:

/api/auth
/api/products
/api/cart
/api/orders
/api/payment
/api/coupons
/api/admin
/api/notifications
/api/inventory
/api/returns

Additional administrative and warehouse endpoints are provided for their respective modules.

🔒 Security Architecture

The security flow is:

User Login
    │
    ▼
Credentials Verified
    │
    ▼
JWT Generated
    │
    ▼
JWT Stored by Frontend
    │
    ▼
Frontend Sends Bearer Token
    │
    ▼
JwtAuthenticationFilter
    │
    ▼
JWT Validation
    │
    ▼
User + Role Identified
    │
    ▼
Role-Based Authorization
    │
    ▼
Protected API

The application uses stateless authentication through JWT.

🧪 Testing

The project includes backend test cases using the Spring testing framework.

Tests are located under:

src/test/

Run backend tests using:

mvnw.cmd test

or:

./mvnw test

Frontend functionality should also be manually verified across:

Desktop
Tablet
Mobile

Important scenarios include:

Login
Registration
Product browsing
Cart
Checkout
Payment
Coupon application
Order placement
Inventory
Unauthorized access
Return requests
Admin workflows
Vendor workflows
Warehouse workflows
📱 Responsive Design

The frontend is designed to support different screen sizes:

Desktop
Tablet
Mobile

Responsive testing should verify:

Navigation
Product cards
Forms
Tables
Buttons
Checkout
Dashboards
Admin pages
Vendor pages
Warehouse pages
Error messages
Spacing and alignment
📊 Major Modules
Module	Description
Authentication	User registration, login and JWT authentication
Authorization	Role-based access control
Products	Product creation, editing and browsing
Cart	Shopping cart management
Checkout	Address, coupon and payment flow
Payments	Razorpay integration
Orders	Order creation and lifecycle
Coupons	Vendor coupons and admin approval
Inventory	Stock and inventory management
Warehouse	Warehouse and allocation management
Returns	Customer returns and administrative processing
Commissions	Vendor commission calculation and management
Notifications	Vendor/customer-related notifications
Analytics	Administrative and warehouse analytics
Error Handling	User-friendly frontend/backend error handling
🔄 Typical Customer Purchase Flow
Register / Login
       │
       ▼
Browse Products
       │
       ▼
Product Details
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
Checkout
       │
       ▼
Razorpay Payment
       │
       ▼
Payment Verification
       │
       ▼
Order Creation
       │
       ▼
Order Tracking
       │
       ▼
Delivery
🏪 Multi-Vendor Order Flow

A customer can purchase products associated with different vendors.

The backend maintains vendor relationships for products and order items.

This enables:

Vendor-specific product ownership
Vendor order visibility
Vendor notifications
Commission calculation
Vendor coupon eligibility
Vendor-specific management
🧩 Design Principles

ShopStack follows several software engineering principles:

Layered architecture
Separation of concerns
RESTful API design
DTO-based API communication
Role-based authorization
Stateless authentication
Service-layer business logic
Repository-based persistence
Centralized error handling
Modular frontend structure
Containerized deployment
☁️ Deployment

The project is structured to support containerized deployment.

Potential deployment architecture:

                    Internet
                       │
                       ▼
                 ┌───────────┐
                 │   Nginx   │
                 └─────┬─────┘
                       │
             ┌─────────▼─────────┐
             │ React Frontend    │
             │ Docker Container  │
             └─────────┬─────────┘
                       │
                       │ REST API
                       ▼
             ┌───────────────────┐
             │ Spring Boot       │
             │ Backend Container │
             └─────────┬─────────┘
                       │
                       ▼
                ┌─────────────┐
                │ PostgreSQL  │
                └─────────────┘

                       │
                       ▼
                  Razorpay

The application can be deployed using Docker and cloud infrastructure such as AWS according to the deployment environment requirements.

📌 Future Enhancements

Potential future improvements include:

Advanced product search
Product recommendations
Advanced analytics dashboards
Distributed caching
Improved observability
Automated CI/CD
Cloud-native database deployment
Enhanced notification infrastructure
Advanced fraud detection
Search optimization
Performance monitoring
Automated frontend testing
Automated API testing
👩‍💻 Contributors
Development Team

This project is developed as part of an enterprise-level multi-vendor e-commerce application.

Contributors can be added below:

Yuktha
Team Members
📄 License

This project is intended for educational and development purposes.

Refer to the repository's LICENSE file for the applicable license terms.
