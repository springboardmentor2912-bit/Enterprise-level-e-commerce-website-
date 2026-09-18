package com.infosys.auth.config;

import com.infosys.auth.model.Coupon;
import com.infosys.auth.model.Product;
import com.infosys.auth.model.User;
import com.infosys.auth.model.VendorProfile;
import com.infosys.auth.repository.CouponRepository;
import com.infosys.auth.repository.ProductRepository;
import com.infosys.auth.repository.UserRepository;
import com.infosys.auth.repository.VendorProfileRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final VendorProfileRepository vendorProfileRepository;
    private final CouponRepository couponRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    public DataInitializer(ProductRepository productRepository,
                           UserRepository userRepository,
                           VendorProfileRepository vendorProfileRepository,
                           CouponRepository couponRepository,
                           PasswordEncoder passwordEncoder,
                           JdbcTemplate jdbcTemplate) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.vendorProfileRepository = vendorProfileRepository;
        this.couponRepository = couponRepository;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        // Drop outdated PostgreSQL check constraint on role column if present
        try {
            jdbcTemplate.execute("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
        } catch (Exception e) {
            System.err.println("Could not drop users_role_check constraint: " + e.getMessage());
        }

        // Seed default Admin if not exists
        if (!userRepository.existsByEmail("admin@shopnova.com")) {
            User admin = User.builder()
                    .username("admin")
                    .email("admin@shopnova.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(User.Role.ADMIN)
                    .fullName("Obsidian Executive Admin")
                    .build();
            userRepository.save(admin);
        }

        // Seed default Vendor if not exists
        User vendorUser;
        if (!userRepository.existsByEmail("vendor@shopnova.com")) {
            vendorUser = User.builder()
                    .username("vendor")
                    .email("vendor@shopnova.com")
                    .password(passwordEncoder.encode("vendor123"))
                    .role(User.Role.VENDOR)
                    .fullName("Aura Fine Goods")
                    .build();
            vendorUser = userRepository.save(vendorUser);
        } else {
            vendorUser = userRepository.findByEmail("vendor@shopnova.com").orElse(null);
        }

        // Seed Vendor profile
        if (vendorUser != null && vendorProfileRepository.findByUserId(vendorUser.getId()).isEmpty()) {
            VendorProfile profile = new VendorProfile(
                    vendorUser.getId(),
                    "Aura Fine Atelier",
                    "Handcrafted luxury timepieces, leather goods, and premium audio equipment.",
                    "vendor@shopnova.com",
                    "+1 (800) 928-4011",
                    "740 Fifth Avenue, New York, NY",
                    "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&q=80"
            );
            vendorProfileRepository.save(profile);
        }

        // Seed default Customer if not exists
        if (!userRepository.existsByEmail("customer@shopnova.com")) {
            User customer = User.builder()
                    .username("customer")
                    .email("customer@shopnova.com")
                    .password(passwordEncoder.encode("customer123"))
                    .role(User.Role.CUSTOMER)
                    .fullName("Alexander Wright")
                    .build();
            userRepository.save(customer);
        }

        // Seed default Warehouse Staff if not exists
        if (!userRepository.existsByEmail("staff@shopnova.com")) {
            User staff = User.builder()
                    .username("staff")
                    .email("staff@shopnova.com")
                    .password(passwordEncoder.encode("staff123"))
                    .role(User.Role.WAREHOUSE_STAFF)
                    .fullName("Rajesh Kumar (BLR Logistics)")
                    .build();
            staff.setAssignedWarehouseId(1L);
            staff.setAssignedWarehouseName("Bangalore Central Hub");
            userRepository.save(staff);
        }

        // Seed initial Products if empty
        if (productRepository.count() == 0) {
            Long vId = (vendorUser != null) ? vendorUser.getId() : 1L;

            productRepository.save(new Product(
                    null,
                    "Obsidian Chronograph Executive",
                    "Hand-assembled matte ceramic case with Swiss automatic precision movement and sapphire crystal glass.",
                    new BigDecimal("4999.00"),
                    "Watches",
                    12,
                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
                    "OBS-W-01",
                    4.9,
                    vId,
                    "Aura Fine Atelier",
                    new BigDecimal("10.00"),
                    true
            ));

            productRepository.save(new Product(
                    null,
                    "Aura Acoustic Wireless Headphones",
                    "Active noise cancellation, titanium diaphragms, and bespoke Italian leather ear cushions.",
                    new BigDecimal("799.00"),
                    "Electronics",
                    25,
                    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
                    "AUR-H-02",
                    4.8,
                    vId,
                    "Aura Fine Atelier",
                    BigDecimal.ZERO,
                    true
            ));

            productRepository.save(new Product(
                    null,
                    "Midnight Onyx Leather Briefcase",
                    "Full-grain calfskin leather with polished brass hardware and suede-lined interior sleeve.",
                    new BigDecimal("1250.00"),
                    "Fashion",
                    8,
                    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80",
                    "ONY-B-03",
                    5.0,
                    vId,
                    "Aura Fine Atelier",
                    BigDecimal.ZERO,
                    true
            ));

            productRepository.save(new Product(
                    null,
                    "Solstice Gold Edition Smart Ring",
                    "Biometric health tracking in 18K solid gold inlay with 7-day battery life and water resistance.",
                    new BigDecimal("599.00"),
                    "Electronics",
                    30,
                    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80",
                    "SOL-R-04",
                    4.7,
                    vId,
                    "Aura Fine Atelier",
                    new BigDecimal("15.00"),
                    true
            ));

            productRepository.save(new Product(
                    null,
                    "Velvet Noir Eau de Parfum",
                    "Rich amber, rare oud wood, and bergamot infusion presented in an obsidian glass bottle.",
                    new BigDecimal("320.00"),
                    "Fragrance",
                    45,
                    "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80",
                    "VEL-P-05",
                    4.9,
                    vId,
                    "Aura Fine Atelier",
                    BigDecimal.ZERO,
                    true
            ));
        }

        // Seed sample coupons
        seedCoupons();
    }

    private void seedCoupons() {
        if (couponRepository.count() > 0) {
            return;
        }

        Coupon save20 = new Coupon();
        save20.setCode("SAVE20");
        save20.setDescription("Get 20% off on orders above ₹1,000");
        save20.setDiscountType("PERCENTAGE");
        save20.setDiscountValue(new BigDecimal("20"));
        save20.setMinOrderAmount(new BigDecimal("1000"));
        save20.setMaxDiscountAmount(new BigDecimal("500"));
        save20.setStartDate(LocalDateTime.now().minusDays(1));
        save20.setExpiryDate(LocalDateTime.of(2026, 8, 30, 23, 59, 59));
        save20.setUsageLimit(100);
        save20.setUsedCount(0);
        save20.setActive(true);
        couponRepository.save(save20);

        Coupon flat200 = new Coupon();
        flat200.setCode("FLAT200");
        flat200.setDescription("Flat ₹200 off on orders above ₹1,500");
        flat200.setDiscountType("FLAT_AMOUNT");
        flat200.setDiscountValue(new BigDecimal("200"));
        flat200.setMinOrderAmount(new BigDecimal("1500"));
        flat200.setMaxDiscountAmount(null);
        flat200.setStartDate(LocalDateTime.now().minusDays(1));
        flat200.setExpiryDate(LocalDateTime.of(2026, 12, 31, 23, 59, 59));
        flat200.setUsageLimit(50);
        flat200.setUsedCount(0);
        flat200.setActive(true);
        couponRepository.save(flat200);

        Coupon welcome10 = new Coupon();
        welcome10.setCode("WELCOME10");
        welcome10.setDescription("Welcome offer: 10% off for new customers");
        welcome10.setDiscountType("PERCENTAGE");
        welcome10.setDiscountValue(new BigDecimal("10"));
        welcome10.setMinOrderAmount(BigDecimal.ZERO);
        welcome10.setMaxDiscountAmount(new BigDecimal("250"));
        welcome10.setStartDate(LocalDateTime.now().minusDays(7));
        welcome10.setExpiryDate(LocalDateTime.of(2027, 1, 1, 0, 0, 0));
        welcome10.setUsageLimit(500);
        welcome10.setUsedCount(0);
        welcome10.setActive(true);
        couponRepository.save(welcome10);

        System.out.println("Seeded 3 sample coupons: SAVE20, FLAT200, WELCOME10");
    }
}
