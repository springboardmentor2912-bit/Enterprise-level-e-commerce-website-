-- ============================================================
-- ShopStack reference schema (Milestone 1 & 2)
-- ============================================================
-- NOTE: You do NOT need to run this file yourself.
-- Spring Boot / Hibernate (spring.jpa.hibernate.ddl-auto=update)
-- creates and updates these tables automatically the first time
-- the backend connects to Postgres. This file is provided purely
-- as documentation of the resulting schema.
-- ============================================================

CREATE TABLE users (
    id                     BIGSERIAL PRIMARY KEY,
    full_name              VARCHAR(255) NOT NULL,
    email                  VARCHAR(255) NOT NULL UNIQUE,
    password               VARCHAR(255),
    phone                  VARCHAR(50),
    role                   VARCHAR(30) NOT NULL,           -- CUSTOMER, VENDOR, ADMIN, WAREHOUSE_STAFF
    enabled                BOOLEAN NOT NULL DEFAULT TRUE,
    oauth_user             BOOLEAN NOT NULL DEFAULT FALSE,
    password_reset_token   VARCHAR(255),
    password_reset_expiry  TIMESTAMP,
    created_at             TIMESTAMP,
    updated_at             TIMESTAMP
);

CREATE TABLE addresses (
    id             BIGSERIAL PRIMARY KEY,
    user_id        BIGINT NOT NULL REFERENCES users(id),
    label          VARCHAR(100),
    address_line1  VARCHAR(255) NOT NULL,
    address_line2  VARCHAR(255),
    city           VARCHAR(100) NOT NULL,
    state          VARCHAR(100) NOT NULL,
    postal_code    VARCHAR(20) NOT NULL,
    country        VARCHAR(100) NOT NULL,
    contact_phone  VARCHAR(50),
    is_default     BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE vendors (
    id                    BIGSERIAL PRIMARY KEY,
    user_id               BIGINT NOT NULL UNIQUE REFERENCES users(id),
    business_name         VARCHAR(255) NOT NULL,
    business_description  VARCHAR(1000),
    gst_number            VARCHAR(50),
    contact_phone         VARCHAR(50),
    approval_status       VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    commission_rate       NUMERIC(5,2) DEFAULT 10.00,
    created_at            TIMESTAMP
);

CREATE TABLE categories (
    id           BIGSERIAL PRIMARY KEY,
    name         VARCHAR(150) NOT NULL UNIQUE,
    description  VARCHAR(500),
    parent_id    BIGINT REFERENCES categories(id)
);

CREATE TABLE products (
    id               BIGSERIAL PRIMARY KEY,
    vendor_id        BIGINT NOT NULL REFERENCES vendors(id),
    category_id      BIGINT REFERENCES categories(id),
    name             VARCHAR(255) NOT NULL,
    brand            VARCHAR(150),
    description      VARCHAR(4000),
    price            NUMERIC(12,2) NOT NULL,
    discount_price   NUMERIC(12,2),
    approval_status  VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    active           BOOLEAN NOT NULL DEFAULT TRUE,
    average_rating   DOUBLE PRECISION DEFAULT 0,
    review_count     INTEGER DEFAULT 0,
    created_at       TIMESTAMP,
    updated_at       TIMESTAMP
);

CREATE TABLE product_images (
    product_id  BIGINT NOT NULL REFERENCES products(id),
    image_url   VARCHAR(1000)
);

CREATE TABLE inventory (
    id                    BIGSERIAL PRIMARY KEY,
    product_id            BIGINT NOT NULL UNIQUE REFERENCES products(id),
    stock_quantity        INTEGER NOT NULL DEFAULT 0,
    reserved_quantity     INTEGER NOT NULL DEFAULT 0,
    low_stock_threshold   INTEGER NOT NULL DEFAULT 10,
    warehouse_location    VARCHAR(255),
    last_updated          TIMESTAMP
);

CREATE TABLE inventory_history (
    id                BIGSERIAL PRIMARY KEY,
    product_id        BIGINT NOT NULL REFERENCES products(id),
    change_quantity   INTEGER,
    resulting_stock   INTEGER,
    reason            VARCHAR(50),   -- INITIAL_STOCK, RESTOCK, SALE, RETURN, ADJUSTMENT
    changed_by        VARCHAR(255),
    created_at        TIMESTAMP
);

CREATE TABLE wishlist_items (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT NOT NULL REFERENCES users(id),
    product_id BIGINT NOT NULL REFERENCES products(id),
    added_at   TIMESTAMP,
    UNIQUE (user_id, product_id)
);

CREATE TABLE carts (
    id       BIGSERIAL PRIMARY KEY,
    user_id  BIGINT NOT NULL UNIQUE REFERENCES users(id)
);

CREATE TABLE cart_items (
    id          BIGSERIAL PRIMARY KEY,
    cart_id     BIGINT NOT NULL REFERENCES carts(id),
    product_id  BIGINT NOT NULL REFERENCES products(id),
    quantity    INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE orders (
    id                   BIGSERIAL PRIMARY KEY,
    order_number         VARCHAR(50) NOT NULL UNIQUE,
    user_id              BIGINT NOT NULL REFERENCES users(id),
    shipping_address_id  BIGINT REFERENCES addresses(id),
    subtotal             NUMERIC(12,2) NOT NULL,
    discount_amount      NUMERIC(12,2) DEFAULT 0,
    shipping_fee         NUMERIC(12,2) DEFAULT 0,
    total_amount         NUMERIC(12,2) NOT NULL,
    coupon_code          VARCHAR(50),
    status               VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    -- PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, RETURNED, REFUNDED
    created_at           TIMESTAMP,
    updated_at           TIMESTAMP
);

CREATE TABLE order_items (
    id                     BIGSERIAL PRIMARY KEY,
    order_id               BIGINT NOT NULL REFERENCES orders(id),
    product_id             BIGINT NOT NULL REFERENCES products(id),
    vendor_id              BIGINT NOT NULL REFERENCES vendors(id),
    product_name_snapshot  VARCHAR(255),
    quantity               INTEGER NOT NULL,
    price_at_purchase      NUMERIC(12,2) NOT NULL
);

CREATE TABLE payments (
    id                   BIGSERIAL PRIMARY KEY,
    order_id             BIGINT NOT NULL UNIQUE REFERENCES orders(id),
    razorpay_order_id    VARCHAR(100),
    razorpay_payment_id  VARCHAR(100),
    razorpay_signature   VARCHAR(255),
    amount               NUMERIC(12,2) NOT NULL,
    currency             VARCHAR(10) DEFAULT 'INR',
    status               VARCHAR(20) NOT NULL DEFAULT 'CREATED', -- CREATED, PENDING, SUCCESS, FAILED, REFUNDED
    failure_reason       VARCHAR(500),
    created_at           TIMESTAMP,
    updated_at           TIMESTAMP
);

CREATE TABLE reviews (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id),
    product_id  BIGINT NOT NULL REFERENCES products(id),
    rating      INTEGER NOT NULL,   -- 1-5
    comment     VARCHAR(2000),
    created_at  TIMESTAMP,
    UNIQUE (user_id, product_id)
);
