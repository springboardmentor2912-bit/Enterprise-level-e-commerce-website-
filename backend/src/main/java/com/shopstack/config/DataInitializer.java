package com.shopstack.config;

import com.shopstack.model.*;
import com.shopstack.repository.*;
import com.shopstack.service.CommissionService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final VendorProfileRepository vendorProfileRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final CommissionService commissionService;
    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;
    private final WarehouseRepository warehouseRepository;
    private final WarehouseInventoryRepository warehouseInventoryRepository;
    private final OrderWarehouseAllocationRepository allocationRepository;
    private final StockMovementRepository stockMovementRepository;
    private final ReturnRequestRepository returnRequestRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           VendorProfileRepository vendorProfileRepository,
                           CategoryRepository categoryRepository,
                           ProductRepository productRepository,
                           ReviewRepository reviewRepository,
                           OrderRepository orderRepository,
                           PaymentRepository paymentRepository,
                           CommissionService commissionService,
                           CouponRepository couponRepository,
                           CouponUsageRepository couponUsageRepository,
                           WarehouseRepository warehouseRepository,
                           WarehouseInventoryRepository warehouseInventoryRepository,
                           OrderWarehouseAllocationRepository allocationRepository,
                           StockMovementRepository stockMovementRepository,
                           ReturnRequestRepository returnRequestRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.vendorProfileRepository = vendorProfileRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.reviewRepository = reviewRepository;
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.commissionService = commissionService;
        this.couponRepository = couponRepository;
        this.couponUsageRepository = couponUsageRepository;
        this.warehouseRepository = warehouseRepository;
        this.warehouseInventoryRepository = warehouseInventoryRepository;
        this.allocationRepository = allocationRepository;
        this.stockMovementRepository = stockMovementRepository;
        this.returnRequestRepository = returnRequestRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return;
        }

        // 1. Create Default Users
        User admin = User.builder()
                .email("admin@shopstack.com")
                .password(passwordEncoder.encode("admin123"))
                .fullName("System Administrator")
                .phoneNumber("+1 555-0100")
                .role(Role.ADMIN)
                .enabled(true)
                .build();

        User vendorUser1 = User.builder()
                .email("techstore@shopstack.com")
                .password(passwordEncoder.encode("vendor123"))
                .fullName("Nexus Tech Innovations")
                .phoneNumber("+1 555-0101")
                .role(Role.VENDOR)
                .enabled(true)
                .build();

        User vendorUser2 = User.builder()
                .email("apparel@shopstack.com")
                .password(passwordEncoder.encode("vendor123"))
                .fullName("Urban Thread Co.")
                .phoneNumber("+1 555-0102")
                .role(Role.VENDOR)
                .enabled(true)
                .build();

        User customer1 = User.builder()
                .email("customer@shopstack.com")
                .password(passwordEncoder.encode("customer123"))
                .fullName("Chiru")
                .phoneNumber("+1 555-0103")
                .role(Role.CUSTOMER)
                .enabled(true)
                .build();

        User customer2 = User.builder()
                .email("alex.miller@gmail.com")
                .password(passwordEncoder.encode("customer123"))
                .fullName("Alex Miller")
                .phoneNumber("+1 555-0104")
                .role(Role.CUSTOMER)
                .enabled(true)
                .build();

        userRepository.saveAll(List.of(admin, vendorUser1, vendorUser2, customer1, customer2));

        // 2. Create Vendor Profiles
        VendorProfile vendor1 = VendorProfile.builder()
                .user(vendorUser1)
                .storeName("Nexus Electronics")
                .description("Premier vendor for flagship smartphones, audio gear, and modern accessories.")
                .logoUrl("https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=80")
                .status(VendorStatus.APPROVED)
                .commissionRate(10.0)
                .rating(4.9)
                .build();

        VendorProfile vendor2 = VendorProfile.builder()
                .user(vendorUser2)
                .storeName("Aura Fashion House")
                .description("Luxury sustainable fashion, footwear, and designer everyday wear.")
                .logoUrl("https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&auto=format&fit=crop&q=80")
                .status(VendorStatus.APPROVED)
                .commissionRate(10.0)
                .rating(4.7)
                .build();

        vendorProfileRepository.saveAll(List.of(vendor1, vendor2));

        // 3. Create Categories
        Category catElectronics = Category.builder()
                .name("Electronics & Gadgets")
                .slug("electronics")
                .description("Smartphones, audio, laptops and smart accessories")
                .icon("Cpu")
                .build();

        Category catFashion = Category.builder()
                .name("Fashion & Lifestyle")
                .slug("fashion")
                .description("Trendy clothing, shoes, watches, and streetwear")
                .icon("Shirt")
                .build();

        Category catHome = Category.builder()
                .name("Home & Living")
                .slug("home-living")
                .description("Modern home decor, kitchenware, and smart appliances")
                .icon("Home")
                .build();

        Category catFitness = Category.builder()
                .name("Fitness & Outdoors")
                .slug("fitness")
                .description("Gym equipment, sportswear, and outdoor gear")
                .icon("Activity")
                .build();

        categoryRepository.saveAll(List.of(catElectronics, catFashion, catHome, catFitness));

        // 4. Create Products
        Product p1 = Product.builder()
                .title("Aura Wireless Noise-Canceling Headphones")
                .description("High-fidelity audio with spatial sound, 40-hour battery life, and ultra-soft memory foam ear cushions.")
                .brand("Nexus Sound")
                .sku("NEX-AUD-001")
                .price(299.99)
                .discountPrice(249.99)
                .stockQuantity(45)
                .imageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80")
                .category(catElectronics)
                .vendorProfile(vendor1)
                .status(ProductStatus.ACTIVE)
                .featured(true)
                .rating(4.9)
                .reviewCount(28)
                .build();

        Product p2 = Product.builder()
                .title("ProBook Ultra 15 Slate Gray Edition")
                .description("Powered by 14th Gen Intel i9, 32GB RAM, 1TB NVMe SSD with 120Hz OLED Display for professionals.")
                .brand("Nexus Tech")
                .sku("NEX-LAP-009")
                .price(1499.00)
                .discountPrice(1399.00)
                .stockQuantity(12)
                .imageUrl("https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80")
                .category(catElectronics)
                .vendorProfile(vendor1)
                .status(ProductStatus.ACTIVE)
                .featured(true)
                .rating(4.8)
                .reviewCount(14)
                .build();

        Product p3 = Product.builder()
                .title("Organic Cotton Minimalist Hoodie")
                .description("Crafted from 100% heavy organic French terry cotton. Pre-shrunk relaxed fit.")
                .brand("Aura Wear")
                .sku("AUR-CLO-102")
                .price(89.00)
                .discountPrice(69.99)
                .stockQuantity(80)
                .imageUrl("https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80")
                .category(catFashion)
                .vendorProfile(vendor2)
                .status(ProductStatus.ACTIVE)
                .featured(true)
                .rating(4.7)
                .reviewCount(35)
                .build();

        Product p4 = Product.builder()
                .title("Chrono Steel Executive Watch")
                .description("Water-resistant up to 100m, sapphire crystal glass with Japanese quartz movement.")
                .brand("Aura Time")
                .sku("AUR-WTC-501")
                .price(350.00)
                .discountPrice(295.00)
                .stockQuantity(25)
                .imageUrl("https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80")
                .category(catFashion)
                .vendorProfile(vendor2)
                .status(ProductStatus.ACTIVE)
                .featured(false)
                .rating(4.9)
                .reviewCount(9)
                .build();

        Product p5 = Product.builder()
                .title("Ergonomic Smart Desk Lamp with Wireless Charging")
                .description("Adjustable color temperature, auto-dimming sensor, and 15W Qi fast charging base.")
                .brand("Nexus Home")
                .sku("NEX-HOM-088")
                .price(79.99)
                .discountPrice(59.99)
                .stockQuantity(60)
                .imageUrl("https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80")
                .category(catHome)
                .vendorProfile(vendor1)
                .status(ProductStatus.ACTIVE)
                .featured(true)
                .rating(4.6)
                .reviewCount(18)
                .build();

        productRepository.saveAll(List.of(p1, p2, p3, p4, p5));

        // 5. Create Reviews
        Review r1 = Review.builder()
                .product(p1)
                .user(customer1)
                .rating(5)
                .comment("Incredible noise cancellation and battery life! Tested on a long-haul flight and it performed flawlessly.")
                .build();

        Review r2 = Review.builder()
                .product(p3)
                .user(customer1)
                .rating(5)
                .comment("Super soft fabric and fits perfectly. Highly recommend Aura Fashion House!")
                .build();

        reviewRepository.saveAll(List.of(r1, r2));

        // 6. Create Seed Orders & Payments across past days
        LocalDateTime now = LocalDateTime.now();

        // Order 1: Delivered electronics order
        Order order1 = Order.builder()
                .orderNumber("ORD-2026-0814-101")
                .customer(customer1)
                .vendorProfile(vendor1)
                .totalAmount(249.99)
                .status(OrderStatus.DELIVERED)
                .shippingAddress("742 Evergreen Terrace, Springfield, OR 97477")
                .createdAt(now.minusDays(5))
                .build();
        order1.setPaymentMethod(PaymentMethod.CARD);
        order1.setPaymentStatus(PaymentStatus.PAID);

        OrderItem item1 = OrderItem.builder()
                .order(order1)
                .product(p1)
                .quantity(1)
                .unitPrice(249.99)
                .subtotal(249.99)
                .build();
        order1.setItems(new ArrayList<>(List.of(item1)));

        // Order 2: Shipped Laptop order
        Order order2 = Order.builder()
                .orderNumber("ORD-2026-0816-102")
                .customer(customer2)
                .vendorProfile(vendor1)
                .totalAmount(1399.00)
                .status(OrderStatus.SHIPPED)
                .shippingAddress("100 Market Street, Suite 400, San Francisco, CA 94105")
                .createdAt(now.minusDays(3))
                .build();
        order2.setPaymentMethod(PaymentMethod.UPI);
        order2.setPaymentStatus(PaymentStatus.PAID);

        OrderItem item2 = OrderItem.builder()
                .order(order2)
                .product(p2)
                .quantity(1)
                .unitPrice(1399.00)
                .subtotal(1399.00)
                .build();
        order2.setItems(new ArrayList<>(List.of(item2)));

        // Order 3: Delivered Fashion order
        Order order3 = Order.builder()
                .orderNumber("ORD-2026-0817-103")
                .customer(customer1)
                .vendorProfile(vendor2)
                .totalAmount(364.99)
                .status(OrderStatus.DELIVERED)
                .shippingAddress("742 Evergreen Terrace, Springfield, OR 97477")
                .createdAt(now.minusDays(2))
                .build();
        order3.setPaymentMethod(PaymentMethod.NETBANKING);
        order3.setPaymentStatus(PaymentStatus.PAID);

        OrderItem item3a = OrderItem.builder()
                .order(order3)
                .product(p3)
                .quantity(1)
                .unitPrice(69.99)
                .subtotal(69.99)
                .build();
        OrderItem item3b = OrderItem.builder()
                .order(order3)
                .product(p4)
                .quantity(1)
                .unitPrice(295.00)
                .subtotal(295.00)
                .build();
        order3.setItems(new ArrayList<>(List.of(item3a, item3b)));

        // Order 4: Processing Home order
        Order order4 = Order.builder()
                .orderNumber("ORD-2026-0818-104")
                .customer(customer2)
                .vendorProfile(vendor1)
                .totalAmount(119.98)
                .status(OrderStatus.PROCESSING)
                .shippingAddress("100 Market Street, Suite 400, San Francisco, CA 94105")
                .createdAt(now.minusDays(1))
                .build();
        order4.setPaymentMethod(PaymentMethod.CARD);
        order4.setPaymentStatus(PaymentStatus.PAID);

        OrderItem item4 = OrderItem.builder()
                .order(order4)
                .product(p5)
                .quantity(2)
                .unitPrice(59.99)
                .subtotal(119.98)
                .build();
        order4.setItems(new ArrayList<>(List.of(item4)));

        // Order 5: Confirmed Fashion order
        Order order5 = Order.builder()
                .orderNumber("ORD-2026-0819-105")
                .customer(customer1)
                .vendorProfile(vendor2)
                .totalAmount(139.98)
                .status(OrderStatus.CONFIRMED)
                .shippingAddress("742 Evergreen Terrace, Springfield, OR 97477")
                .createdAt(now.minusHours(4))
                .build();
        order5.setPaymentMethod(PaymentMethod.UPI);
        order5.setPaymentStatus(PaymentStatus.PAID);

        OrderItem item5 = OrderItem.builder()
                .order(order5)
                .product(p3)
                .quantity(2)
                .unitPrice(69.99)
                .subtotal(139.98)
                .build();
        order5.setItems(new ArrayList<>(List.of(item5)));

        orderRepository.saveAll(List.of(order1, order2, order3, order4, order5));

        // 7. Create Corresponding Payment Records
        Payment pay1 = Payment.builder()
                .razorpayOrderId("order_rzp_mock_101")
                .razorpayPaymentId("pay_rzp_mock_101")
                .razorpaySignature("sig_mock_101")
                .amount(249.99)
                .currency("INR")
                .status(PaymentStatus.PAID)
                .paymentMethod(PaymentMethod.CARD)
                .customer(customer1)
                .orderIdsJson(String.valueOf(order1.getId()))
                .createdAt(now.minusDays(5))
                .updatedAt(now.minusDays(5))
                .build();

        Payment pay2 = Payment.builder()
                .razorpayOrderId("order_rzp_mock_102")
                .razorpayPaymentId("pay_rzp_mock_102")
                .razorpaySignature("sig_mock_102")
                .amount(1399.00)
                .currency("INR")
                .status(PaymentStatus.PAID)
                .paymentMethod(PaymentMethod.UPI)
                .customer(customer2)
                .orderIdsJson(String.valueOf(order2.getId()))
                .createdAt(now.minusDays(3))
                .updatedAt(now.minusDays(3))
                .build();

        Payment pay3 = Payment.builder()
                .razorpayOrderId("order_rzp_mock_103")
                .razorpayPaymentId("pay_rzp_mock_103")
                .razorpaySignature("sig_mock_103")
                .amount(364.99)
                .currency("INR")
                .status(PaymentStatus.PAID)
                .paymentMethod(PaymentMethod.NETBANKING)
                .customer(customer1)
                .orderIdsJson(String.valueOf(order3.getId()))
                .createdAt(now.minusDays(2))
                .updatedAt(now.minusDays(2))
                .build();

        Payment pay4 = Payment.builder()
                .razorpayOrderId("order_rzp_mock_104")
                .razorpayPaymentId("pay_rzp_mock_104")
                .razorpaySignature("sig_mock_104")
                .amount(119.98)
                .currency("INR")
                .status(PaymentStatus.PAID)
                .paymentMethod(PaymentMethod.CARD)
                .customer(customer2)
                .orderIdsJson(String.valueOf(order4.getId()))
                .createdAt(now.minusDays(1))
                .updatedAt(now.minusDays(1))
                .build();

        Payment pay5 = Payment.builder()
                .razorpayOrderId("order_rzp_mock_105")
                .razorpayPaymentId("pay_rzp_mock_105")
                .razorpaySignature("sig_mock_105")
                .amount(139.98)
                .currency("INR")
                .status(PaymentStatus.PAID)
                .paymentMethod(PaymentMethod.UPI)
                .customer(customer1)
                .orderIdsJson(String.valueOf(order5.getId()))
                .createdAt(now.minusHours(4))
                .updatedAt(now.minusHours(4))
                .build();

        paymentRepository.saveAll(List.of(pay1, pay2, pay3, pay4, pay5));

        // 8. Create Corresponding Commission Records for seeded orders
        commissionService.createOrUpdateCommissionForOrder(order1);
        commissionService.createOrUpdateCommissionForOrder(order2);
        commissionService.createOrUpdateCommissionForOrder(order3);
        commissionService.createOrUpdateCommissionForOrder(order4);
        commissionService.createOrUpdateCommissionForOrder(order5);

        // 9. Seed Promotional Coupons
        Coupon save20 = Coupon.builder()
                .code("SAVE20")
                .description("Get 20% discount on orders above ₹1,000 (Max discount ₹1,000).")
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(20.0)
                .minOrderAmount(1000.0)
                .maxDiscountAmount(1000.0)
                .startDate(now.minusDays(10))
                .expiryDate(now.plusDays(60))
                .usageLimit(500)
                .userUsageLimit(2)
                .usageCount(3)
                .active(true)
                .build();

        Coupon welcome50 = Coupon.builder()
                .code("WELCOME50")
                .description("Flat ₹50 discount on your order above ₹200.")
                .discountType(DiscountType.FIXED_AMOUNT)
                .discountValue(50.0)
                .minOrderAmount(200.0)
                .startDate(now.minusDays(30))
                .expiryDate(now.plusDays(90))
                .usageLimit(1000)
                .userUsageLimit(1)
                .usageCount(5)
                .active(true)
                .build();

        Coupon festive500 = Coupon.builder()
                .code("FESTIVE500")
                .description("Festive special offer: Flat ₹500 off on purchases of ₹2,500 or more.")
                .discountType(DiscountType.FIXED_AMOUNT)
                .discountValue(500.0)
                .minOrderAmount(2500.0)
                .startDate(now.minusDays(5))
                .expiryDate(now.plusDays(45))
                .usageLimit(200)
                .userUsageLimit(3)
                .usageCount(2)
                .active(true)
                .build();

        Coupon flat10 = Coupon.builder()
                .code("FLAT10")
                .description("Special 10% discount on all orders above ₹500.")
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(10.0)
                .minOrderAmount(500.0)
                .maxDiscountAmount(500.0)
                .startDate(now.minusDays(15))
                .expiryDate(now.plusDays(30))
                .usageLimit(300)
                .userUsageLimit(3)
                .usageCount(1)
                .active(true)
                .build();

        Coupon expired15 = Coupon.builder()
                .code("EXPIRED15")
                .description("Flash weekend 15% discount (Expired for testing validation).")
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(15.0)
                .minOrderAmount(100.0)
                .startDate(now.minusDays(20))
                .expiryDate(now.minusDays(5))
                .usageLimit(100)
                .userUsageLimit(1)
                .usageCount(8)
                .active(true)
                .build();

        couponRepository.saveAll(List.of(save20, welcome50, festive500, flat10, expired15));

        // 10. Seed Sample Coupon Usages
        CouponUsage usage1 = CouponUsage.builder()
                .coupon(save20)
                .user(customer1)
                .order(order1)
                .orderAmount(2000.0)
                .discountAmount(400.0)
                .finalAmount(1600.0)
                .usedAt(now.minusDays(5))
                .build();

        CouponUsage usage2 = CouponUsage.builder()
                .coupon(welcome50)
                .user(customer2)
                .order(order2)
                .orderAmount(450.0)
                .discountAmount(50.0)
                .finalAmount(400.0)
                .usedAt(now.minusDays(3))
                .build();

        CouponUsage usage3 = CouponUsage.builder()
                .coupon(festive500)
                .user(customer1)
                .order(order3)
                .orderAmount(3200.0)
                .discountAmount(500.0)
                .finalAmount(2700.0)
                .usedAt(now.minusDays(2))
                .build();

        couponUsageRepository.saveAll(List.of(usage1, usage2, usage3));

        // 11. Seed Warehouses
        Warehouse whHyd = Warehouse.builder()
                .code("WH-HYD-01")
                .name("Central Metro Fulfillment Hub")
                .address("Logistics Park Plot 44, Gachibowli Outer Ring Rd")
                .city("Hyderabad")
                .state("Telangana")
                .country("India")
                .pincode("500032")
                .contactPhone("+91 40 4829 1100")
                .contactEmail("hyd-hub@shopstack.com")
                .capacity(65000)
                .active(true)
                .build();

        Warehouse whMum = Warehouse.builder()
                .code("WH-MUM-01")
                .name("Western Express Logistics Hub")
                .address("Bhiwandi Integrated Warehousing Zone, Sector 8")
                .city("Mumbai")
                .state("Maharashtra")
                .country("India")
                .pincode("421302")
                .contactPhone("+91 22 6194 2200")
                .contactEmail("mum-hub@shopstack.com")
                .capacity(85000)
                .active(true)
                .build();

        Warehouse whBlr = Warehouse.builder()
                .code("WH-BLR-01")
                .name("Southern Distribution Center")
                .address("Electronic City Phase 2, Industrial Cluster")
                .city("Bengaluru")
                .state("Karnataka")
                .country("India")
                .pincode("560100")
                .contactPhone("+91 80 4392 3300")
                .contactEmail("blr-hub@shopstack.com")
                .capacity(70000)
                .active(true)
                .build();

        Warehouse whDel = Warehouse.builder()
                .code("WH-DEL-01")
                .name("Northern Capital Depot")
                .address("Okhla Industrial Area Phase 3, Cargo Block D")
                .city("New Delhi")
                .state("Delhi")
                .country("India")
                .pincode("110020")
                .contactPhone("+91 11 4102 4400")
                .contactEmail("del-hub@shopstack.com")
                .capacity(50000)
                .active(true)
                .build();

        Warehouse whKol = Warehouse.builder()
                .code("WH-KOL-01")
                .name("Eastern Regional Logistics Depot")
                .address("Taratala Logistics Park, Dock 4")
                .city("Kolkata")
                .state("West Bengal")
                .country("India")
                .pincode("700088")
                .contactPhone("+91 33 2490 5500")
                .contactEmail("kol-hub@shopstack.com")
                .capacity(55000)
                .active(true)
                .build();

        warehouseRepository.saveAll(List.of(whHyd, whMum, whBlr, whDel, whKol));

        // 11b. Seed Warehouse Staff Users assigned to regional hubs
        User staffHyd = User.builder()
                .email("staff@shopstack.com")
                .password(passwordEncoder.encode("staff123"))
                .fullName("Vikram Rao (Hyderabad Staff)")
                .phoneNumber("+91 40 4402 1100")
                .role(Role.WAREHOUSE_STAFF)
                .assignedWarehouse(whHyd)
                .enabled(true)
                .build();

        User staffBlr = User.builder()
                .email("staff.blr@shopstack.com")
                .password(passwordEncoder.encode("staff123"))
                .fullName("Anita Sharma (Bengaluru Staff)")
                .phoneNumber("+91 80 4392 1100")
                .role(Role.WAREHOUSE_STAFF)
                .assignedWarehouse(whBlr)
                .enabled(true)
                .build();

        User staffMum = User.builder()
                .email("staff.mum@shopstack.com")
                .password(passwordEncoder.encode("staff123"))
                .fullName("Rahul Desai (Mumbai Staff)")
                .phoneNumber("+91 22 6194 1100")
                .role(Role.WAREHOUSE_STAFF)
                .assignedWarehouse(whMum)
                .enabled(true)
                .build();

        User staffDel = User.builder()
                .email("staff.del@shopstack.com")
                .password(passwordEncoder.encode("staff123"))
                .fullName("Sunil Kumar (Delhi Staff)")
                .phoneNumber("+91 11 4102 1100")
                .role(Role.WAREHOUSE_STAFF)
                .assignedWarehouse(whDel)
                .enabled(true)
                .build();

        User staffKol = User.builder()
                .email("staff.kol@shopstack.com")
                .password(passwordEncoder.encode("staff123"))
                .fullName("Subhash Ghosh (Kolkata Staff)")
                .phoneNumber("+91 33 2490 1100")
                .role(Role.WAREHOUSE_STAFF)
                .assignedWarehouse(whKol)
                .enabled(true)
                .build();

        userRepository.saveAll(List.of(staffHyd, staffBlr, staffMum, staffDel, staffKol));

        // 12. Seed Warehouse Inventories for Catalog Products
        WarehouseInventory invP1Hyd = WarehouseInventory.builder()
                .warehouse(whHyd).product(p1).totalStock(25).allocatedStock(0).availableStock(25).damagedStock(2).aisleLocation("Aisle 02, Bay B-04").minThreshold(8).lastRestockedAt(now.minusDays(7)).build();
        WarehouseInventory invP1Mum = WarehouseInventory.builder()
                .warehouse(whMum).product(p1).totalStock(20).allocatedStock(0).availableStock(20).damagedStock(0).aisleLocation("Aisle 01, Bay A-11").minThreshold(5).lastRestockedAt(now.minusDays(6)).build();
        WarehouseInventory invP1Kol = WarehouseInventory.builder()
                .warehouse(whKol).product(p1).totalStock(15).allocatedStock(0).availableStock(15).damagedStock(0).aisleLocation("Aisle 03, Bay C-02").minThreshold(5).lastRestockedAt(now.minusDays(5)).build();

        WarehouseInventory invP2Hyd = WarehouseInventory.builder()
                .warehouse(whHyd).product(p2).totalStock(8).allocatedStock(0).availableStock(8).damagedStock(0).aisleLocation("Aisle 04, Secure Vault 2").minThreshold(3).lastRestockedAt(now.minusDays(10)).build();
        WarehouseInventory invP2Del = WarehouseInventory.builder()
                .warehouse(whDel).product(p2).totalStock(4).allocatedStock(0).availableStock(4).damagedStock(0).aisleLocation("Aisle 02, Secure Vault 1").minThreshold(2).lastRestockedAt(now.minusDays(8)).build();

        WarehouseInventory invP3Blr = WarehouseInventory.builder()
                .warehouse(whBlr).product(p3).totalStock(50).allocatedStock(2).availableStock(48).damagedStock(1).aisleLocation("Aisle 06, Rack C-09").minThreshold(15).lastRestockedAt(now.minusDays(4)).build();
        WarehouseInventory invP3Mum = WarehouseInventory.builder()
                .warehouse(whMum).product(p3).totalStock(30).allocatedStock(0).availableStock(30).damagedStock(0).aisleLocation("Aisle 05, Rack D-02").minThreshold(10).lastRestockedAt(now.minusDays(5)).build();

        WarehouseInventory invP4Hyd = WarehouseInventory.builder()
                .warehouse(whHyd).product(p4).totalStock(15).allocatedStock(0).availableStock(15).damagedStock(0).aisleLocation("Aisle 03, Glass Bay G-01").minThreshold(5).lastRestockedAt(now.minusDays(12)).build();
        WarehouseInventory invP4Blr = WarehouseInventory.builder()
                .warehouse(whBlr).product(p4).totalStock(10).allocatedStock(0).availableStock(10).damagedStock(0).aisleLocation("Aisle 03, Glass Bay G-04").minThreshold(4).lastRestockedAt(now.minusDays(9)).build();
        WarehouseInventory invP4Kol = WarehouseInventory.builder()
                .warehouse(whKol).product(p4).totalStock(12).allocatedStock(0).availableStock(12).damagedStock(0).aisleLocation("Aisle 02, Glass Bay G-02").minThreshold(4).lastRestockedAt(now.minusDays(7)).build();

        WarehouseInventory invP5Mum = WarehouseInventory.builder()
                .warehouse(whMum).product(p5).totalStock(40).allocatedStock(0).availableStock(40).damagedStock(0).aisleLocation("Aisle 08, Rack E-14").minThreshold(12).lastRestockedAt(now.minusDays(3)).build();
        WarehouseInventory invP5Del = WarehouseInventory.builder()
                .warehouse(whDel).product(p5).totalStock(20).allocatedStock(0).availableStock(20).damagedStock(0).aisleLocation("Aisle 07, Rack F-05").minThreshold(6).lastRestockedAt(now.minusDays(4)).build();

        warehouseInventoryRepository.saveAll(List.of(
                invP1Hyd, invP1Mum, invP1Kol, invP2Hyd, invP2Del, invP3Blr, invP3Mum, invP4Hyd, invP4Blr, invP4Kol, invP5Mum, invP5Del
        ));

        // 13. Seed Order Warehouse Allocations across fulfillment stages
        // Order 1 (Delivered -> Dispatched/Shipped stage)
        OrderWarehouseAllocation alloc1 = OrderWarehouseAllocation.builder()
                .order(order1)
                .orderItem(item1)
                .warehouse(whHyd)
                .allocatedQuantity(1)
                .stage(StockMovementStage.SHIPPED)
                .aisleLocation("Aisle 02, Bay B-04")
                .pickerName("Vikram Rao")
                .pickedAt(now.minusDays(5).plusHours(1))
                .packerName("Anita Sharma")
                .packedAt(now.minusDays(5).plusHours(2))
                .packageWeightKg(0.75)
                .boxDimension("25x18x12 cm")
                .boxType("Electro-Shield Box E1")
                .packingSlipNumber("PS-HYD-9011")
                .carrier("BlueDart Express")
                .trackingNumber("TRK-BLD-778291")
                .readyForShipmentAt(now.minusDays(5).plusHours(3))
                .dispatchedAt(now.minusDays(5).plusHours(4))
                .notes("Standard priority express shipment")
                .createdAt(now.minusDays(5))
                .build();

        // Order 2 (Shipped)
        OrderWarehouseAllocation alloc2 = OrderWarehouseAllocation.builder()
                .order(order2)
                .orderItem(item2)
                .warehouse(whHyd)
                .allocatedQuantity(1)
                .stage(StockMovementStage.SHIPPED)
                .aisleLocation("Aisle 04, Secure Vault 2")
                .pickerName("Vikram Rao")
                .pickedAt(now.minusDays(3).plusHours(1))
                .packerName("Anita Sharma")
                .packedAt(now.minusDays(3).plusHours(2))
                .packageWeightKg(2.4)
                .boxDimension("40x30x10 cm")
                .boxType("Reinforced Heavy Laptop Carton #3")
                .packingSlipNumber("PS-HYD-9022")
                .carrier("FedEx SupplyChain")
                .trackingNumber("TRK-FDX-382910")
                .readyForShipmentAt(now.minusDays(3).plusHours(3))
                .dispatchedAt(now.minusDays(3).plusHours(4))
                .notes("Fragile electronics - bubble wrapped with tamper-evident seal")
                .createdAt(now.minusDays(3))
                .build();

        // Order 3 (Items 3a & 3b -> Ready for Shipment)
        OrderWarehouseAllocation alloc3a = OrderWarehouseAllocation.builder()
                .order(order3)
                .orderItem(item3a)
                .warehouse(whBlr)
                .allocatedQuantity(1)
                .stage(StockMovementStage.READY_FOR_SHIPMENT)
                .aisleLocation("Aisle 06, Rack C-09")
                .pickerName("Ramesh Kumar")
                .pickedAt(now.minusDays(2).plusHours(1))
                .packerName("Pooja Nair")
                .packedAt(now.minusDays(2).plusHours(2))
                .packageWeightKg(0.6)
                .boxDimension("30x25x10 cm")
                .boxType("Eco Apparel Pouch #2")
                .packingSlipNumber("PS-BLR-8812")
                .carrier("Delhivery Air")
                .trackingNumber("TRK-DLV-554190")
                .readyForShipmentAt(now.minusDays(2).plusHours(3))
                .notes("Apparel fold-packed in sealed waterproof bag")
                .createdAt(now.minusDays(2))
                .build();

        OrderWarehouseAllocation alloc3b = OrderWarehouseAllocation.builder()
                .order(order3)
                .orderItem(item3b)
                .warehouse(whHyd)
                .allocatedQuantity(1)
                .stage(StockMovementStage.READY_FOR_SHIPMENT)
                .aisleLocation("Aisle 03, Glass Bay G-01")
                .pickerName("Vikram Rao")
                .pickedAt(now.minusDays(2).plusHours(1))
                .packerName("Anita Sharma")
                .packedAt(now.minusDays(2).plusHours(2))
                .packageWeightKg(0.4)
                .boxDimension("15x15x12 cm")
                .boxType("Luxury Velvet Box #1")
                .packingSlipNumber("PS-HYD-9033")
                .carrier("BlueDart Express")
                .trackingNumber("TRK-BLD-662914")
                .readyForShipmentAt(now.minusDays(2).plusHours(3))
                .notes("Premium watch in cushioned jewelry box")
                .createdAt(now.minusDays(2))
                .build();

        // Order 4 (Processing -> Packed stage)
        OrderWarehouseAllocation alloc4 = OrderWarehouseAllocation.builder()
                .order(order4)
                .orderItem(item4)
                .warehouse(whMum)
                .allocatedQuantity(2)
                .stage(StockMovementStage.PACKED)
                .aisleLocation("Aisle 08, Rack E-14")
                .pickerName("Sanjay Patel")
                .pickedAt(now.minusDays(1).plusHours(2))
                .packerName("Deepa Joshi")
                .packedAt(now.minusDays(1).plusHours(3))
                .packageWeightKg(1.8)
                .boxDimension("35x25x20 cm")
                .boxType("Corrugated Home Goods Box #4")
                .packingSlipNumber("PS-MUM-7714")
                .notes("Desk lamps packed with foam end-caps")
                .createdAt(now.minusDays(1))
                .build();

        // Order 5 (Confirmed -> Allocated stage)
        OrderWarehouseAllocation alloc5 = OrderWarehouseAllocation.builder()
                .order(order5)
                .orderItem(item5)
                .warehouse(whBlr)
                .allocatedQuantity(2)
                .stage(StockMovementStage.ALLOCATED)
                .aisleLocation("Aisle 06, Rack C-09")
                .notes("Order confirmed; awaiting warehouse pick wave")
                .createdAt(now.minusHours(4))
                .build();

        allocationRepository.saveAll(List.of(alloc1, alloc2, alloc3a, alloc3b, alloc4, alloc5));

        // 14. Seed Stock Movement History Logs
        StockMovement mov1 = StockMovement.builder()
                .warehouse(whHyd).product(p1).order(order1).orderItem(item1)
                .movementType(StockMovementType.ORDER_ALLOCATION).stage(StockMovementStage.ALLOCATED)
                .quantity(1).previousAvailableStock(26).newAvailableStock(25)
                .previousAllocatedStock(0).newAllocatedStock(1)
                .previousTotalStock(26).newTotalStock(26)
                .referenceNumber("ORD-2026-0814-101").notes("Stock allocated for order ORD-2026-0814-101")
                .performedBy("System Auto-Allocation Engine").createdAt(now.minusDays(5)).build();

        StockMovement mov2 = StockMovement.builder()
                .warehouse(whHyd).product(p1).order(order1).orderItem(item1)
                .movementType(StockMovementType.PICK_CONFIRMED).stage(StockMovementStage.PICKED)
                .quantity(1).previousAvailableStock(25).newAvailableStock(25)
                .previousAllocatedStock(1).newAllocatedStock(1)
                .previousTotalStock(26).newTotalStock(26)
                .referenceNumber("ORD-2026-0814-101").notes("Item picked from Aisle 02 by Vikram Rao")
                .performedBy("Vikram Rao").createdAt(now.minusDays(5).plusHours(1)).build();

        StockMovement mov3 = StockMovement.builder()
                .warehouse(whHyd).product(p1).order(order1).orderItem(item1)
                .movementType(StockMovementType.PACK_VERIFIED).stage(StockMovementStage.PACKED)
                .quantity(1).previousAvailableStock(25).newAvailableStock(25)
                .previousAllocatedStock(1).newAllocatedStock(1)
                .previousTotalStock(26).newTotalStock(26)
                .referenceNumber("ORD-2026-0814-101").notes("Packed in Electro-Shield Box E1 by Anita Sharma")
                .performedBy("Anita Sharma").createdAt(now.minusDays(5).plusHours(2)).build();

        StockMovement mov4 = StockMovement.builder()
                .warehouse(whHyd).product(p1).order(order1).orderItem(item1)
                .movementType(StockMovementType.SHIPMENT_PREPARED).stage(StockMovementStage.READY_FOR_SHIPMENT)
                .quantity(1).previousAvailableStock(25).newAvailableStock(25)
                .previousAllocatedStock(1).newAllocatedStock(0)
                .previousTotalStock(26).newTotalStock(25)
                .referenceNumber("TRK-BLD-778291").notes("Shipment ready via BlueDart Express (TRK-BLD-778291)")
                .performedBy("Shipping Dispatcher").createdAt(now.minusDays(5).plusHours(3)).build();

        StockMovement mov5 = StockMovement.builder()
                .warehouse(whHyd).product(p1).order(order1).orderItem(item1)
                .movementType(StockMovementType.SHIPMENT_DISPATCH).stage(StockMovementStage.SHIPPED)
                .quantity(1).previousAvailableStock(25).newAvailableStock(25)
                .previousAllocatedStock(0).newAllocatedStock(0)
                .previousTotalStock(25).newTotalStock(25)
                .referenceNumber("TRK-BLD-778291").notes("Handed over to carrier for customer delivery")
                .performedBy("Logistics Coordinator").createdAt(now.minusDays(5).plusHours(4)).build();

        StockMovement mov6 = StockMovement.builder()
                .warehouse(whBlr).product(p3).order(order5).orderItem(item5)
                .movementType(StockMovementType.ORDER_ALLOCATION).stage(StockMovementStage.ALLOCATED)
                .quantity(2).previousAvailableStock(50).newAvailableStock(48)
                .previousAllocatedStock(0).newAllocatedStock(2)
                .previousTotalStock(50).newTotalStock(50)
                .referenceNumber("ORD-2026-0819-105").notes("Stock allocated for order ORD-2026-0819-105")
                .performedBy("System Auto-Allocation Engine").createdAt(now.minusHours(4)).build();

        stockMovementRepository.saveAll(List.of(mov1, mov2, mov3, mov4, mov5, mov6));

        // 15. Seed Sample Customer Return Requests for Review & QC Workflow
        ReturnRequest ret1 = ReturnRequest.builder()
                .order(order1)
                .orderItem(item1)
                .customer(customer1)
                .warehouse(whHyd)
                .reason("Defective power button on headphones")
                .returnReasonType("DEFECTIVE")
                .customerComments("The left active noise cancellation toggle is unresponsive out of the box.")
                .status("RECEIVED_AT_WAREHOUSE")
                .refundAmount(order1.getTotalAmount())
                .adminNotes("Approved return. Item received at Hyderabad fulfillment hub for QC.")
                .inspectedBy("Vikram Rao (Hyderabad Staff)")
                .createdAt(now.minusDays(1))
                .build();

        ReturnRequest ret2 = ReturnRequest.builder()
                .order(order2)
                .orderItem(item2)
                .customer(customer2)
                .warehouse(whHyd)
                .reason("Wrong technical specification received")
                .returnReasonType("WRONG_ITEM")
                .customerComments("Received 16GB RAM model instead of ordered 32GB RAM variant.")
                .status("PENDING_REVIEW")
                .refundAmount(order2.getTotalAmount())
                .createdAt(now.minusHours(6))
                .build();

        returnRequestRepository.saveAll(List.of(ret1, ret2));

        System.out.println(">>> [ShopStack DataInitializer] Successfully initialized demo marketplace dataset with live orders, payments, commissions, promotional coupons, regional warehouse fulfillment network & returns QC pipeline.");
    }
}
