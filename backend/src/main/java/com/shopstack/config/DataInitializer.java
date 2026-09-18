package com.shopstack.config;

import com.shopstack.entity.*;
import com.shopstack.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.jdbc.core.JdbcTemplate;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final VendorRepository vendorRepository;
    private final CustomerRepository customerRepository;
    private final CouponRepository couponRepository;
    private final InventoryHistoryRepository inventoryHistoryRepository;
    private final WarehouseRepository warehouseRepository;
    private final WarehouseInventoryRepository warehouseInventoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    public DataInitializer(CategoryRepository categoryRepository,
                           ProductRepository productRepository,
                           VendorRepository vendorRepository,
                           CustomerRepository customerRepository,
                           CouponRepository couponRepository,
                           InventoryHistoryRepository inventoryHistoryRepository,
                           WarehouseRepository warehouseRepository,
                           WarehouseInventoryRepository warehouseInventoryRepository,
                           PasswordEncoder passwordEncoder,
                           JdbcTemplate jdbcTemplate) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.vendorRepository = vendorRepository;
        this.customerRepository = customerRepository;
        this.couponRepository = couponRepository;
        this.inventoryHistoryRepository = inventoryHistoryRepository;
        this.warehouseRepository = warehouseRepository;
        this.warehouseInventoryRepository = warehouseInventoryRepository;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Drop outdated DB check constraints on enum fields to allow WAREHOUSE_ALLOCATED and READY_FOR_SHIPPING
        fixDatabaseCheckConstraints();
        // Always ensure Admin User exists
        createAdminIfMissing();

        // Always ensure Warehouse Staff User exists
        createWarehouseStaffIfMissing();

        // Always ensure Sample Coupons exist
        createCouponsIfMissing();

        // Ensure Warehouses exist
        createWarehousesIfMissing();

        if (categoryRepository.count() > 0 && productRepository.count() > 0) {
            return; // Seed product data already present
        }

        // 1. Create Default Seed Vendors
        Vendor vendorTech = createVendorIfMissing("tech@shopstack.com", "TechWorld Electronics", "123 Tech Lane, Silicon Valley");
        Vendor vendorFashion = createVendorIfMissing("fashion@shopstack.com", "Vogue & Style Hub", "456 Fashion Ave, New York");
        Vendor vendorHome = createVendorIfMissing("home@shopstack.com", "HomeCraft Comforts", "789 Design Blvd, Chicago");
        Vendor vendorSports = createVendorIfMissing("sports@shopstack.com", "SportsPro Athletic", "101 Stadium Way, Los Angeles");

        // 2. Create 8 Categories
        Category catElectronics = saveCategory("Electronics", "Gadgets, smartphones, audio devices, and high-tech accessories.", "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&auto=format&fit=crop&q=80");
        Category catFashion = saveCategory("Fashion", "Trending apparel, footwear, street wear, and designer outfits.", "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&auto=format&fit=crop&q=80");
        Category catHome = saveCategory("Home", "Smart appliances, luxury bedding, room decor, and home essentials.", "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80");
        Category catSports = saveCategory("Sports", "Fitness gear, outdoor equipment, athletic wear, and training supplies.", "https://images.unsplash.com/photo-1517649763962-0c6232661a0b?w=600&auto=format&fit=crop&q=80");
        Category catBooks = saveCategory("Books", "Best-selling novels, educational textbooks, literature, and sci-fi.", "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&auto=format&fit=crop&q=80");
        Category catBeauty = saveCategory("Beauty", "Skincare, cosmetics, perfumes, self-care products, and grooming.", "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80");
        Category catAccessories = saveCategory("Accessories", "Watches, jewelry, sunglasses, leather bags, and wallets.", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80");
        Category catFurniture = saveCategory("Furniture", "Ergonomic chairs, wooden tables, modern sofas, and storage.", "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80");

        // 3. Create Sample Products for Each Category (6 per category = 48 total)
        
        // ELECTRONICS
        createProduct("Pro Wireless Active Noise Canceling Headphones", "AudioTech", "Immersive spatial audio with dynamic head tracking and ANC.", new BigDecimal("249.99"), 25, catElectronics, vendorTech, 4.8, 142, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80");
        createProduct("UltraSlim OLED 4K Smart Monitor 32-inch", "ScreenMax", "Crystal-clear 4K HDR display with 144Hz refresh rate and USB-C hub.", new BigDecimal("599.00"), 12, catElectronics, vendorTech, 4.9, 89, "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80");
        createProduct("Smartwatch Series X Titanium", "WristPulse", "Advanced health monitoring, ECG, GPS tracking, and 5-day battery life.", new BigDecimal("329.50"), 18, catElectronics, vendorTech, 4.7, 210, "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80");
        createProduct("Mechanical RGB Wireless Keyboard", "KeyPro", "Hot-swappable switches, tactile feel, and aluminum chassis.", new BigDecimal("129.99"), 30, catElectronics, vendorTech, 4.6, 95, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80");
        createProduct("Portable Bluetooth Waterproof Speaker", "SoundWave", "360-degree deep bass sound with 24-hour continuous playtime.", new BigDecimal("89.95"), 40, catElectronics, vendorTech, 4.5, 310, "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop&q=80");
        createProduct("4K Drone Quadcopter with Gimbal Camera", "SkyEye", "3-axis motorized gimbal, 30-min flight time, and obstacle sensing.", new BigDecimal("499.00"), 0, catElectronics, vendorTech, 4.4, 45, "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=600&auto=format&fit=crop&q=80");

        // FASHION
        createProduct("Classic Slim Fit Denim Jacket", "UrbanStitch", "Premium heavyweight cotton denim with vintage wash aesthetic.", new BigDecimal("79.99"), 35, catFashion, vendorFashion, 4.6, 78, "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80");
        createProduct("Breathable Performance Running Shoes", "AeroStride", "Ultra-lightweight mesh sneakers with foam cushion responsive midsole.", new BigDecimal("119.95"), 22, catFashion, vendorFashion, 4.8, 164, "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80");
        createProduct("Tailored Charcoal Wool Blend Blazer", "Monarch", "Sophisticated single-breasted jacket suited for business and casual wear.", new BigDecimal("189.00"), 15, catFashion, vendorFashion, 4.7, 52, "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80");
        createProduct("Minimalist Organic Cotton Hoodie", "EcoThread", "Soft brushed fleece hoodie with relaxed drop-shoulder cut.", new BigDecimal("59.99"), 50, catFashion, vendorFashion, 4.5, 230, "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80");
        createProduct("Luxury Italian Leather Crossbody Bag", "LeatherCraft", "Handcrafted genuine leather shoulder bag with gold-tone hardware.", new BigDecimal("149.50"), 10, catFashion, vendorFashion, 4.9, 118, "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80");
        createProduct("Summer Linen Button-Down Shirt", "Breeze", "Lightweight pure linen shirt engineered for hot summer days.", new BigDecimal("49.99"), 0, catFashion, vendorFashion, 4.3, 39, "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80");

        // HOME
        createProduct("Smart Touch Espresso Machine & Grinder", "BaristaPro", "15-bar Italian pump pressure with integrated burr grinder and milk frother.", new BigDecimal("349.99"), 14, catHome, vendorHome, 4.9, 192, "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&auto=format&fit=crop&q=80");
        createProduct("Robotic Vacuum Cleaner with LiDAR Navigation", "CleanBot", "Automated multi-surface cleaning with smartphone app control.", new BigDecimal("279.00"), 20, catHome, vendorHome, 4.6, 88, "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&auto=format&fit=crop&q=80");
        createProduct("Air Purifier with True HEPA Filter", "PureBreeze", "Captures 99.97% of airborne dust, pollen, smoke, and odors.", new BigDecimal("129.95"), 28, catHome, vendorHome, 4.7, 145, "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&auto=format&fit=crop&q=80");
        createProduct("Ceramic Non-Stick 10-Piece Cookware Set", "CulinaryArt", "Eco-friendly non-toxic ceramic coating compatible with induction stovetops.", new BigDecimal("199.99"), 16, catHome, vendorHome, 4.8, 106, "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&auto=format&fit=crop&q=80");
        createProduct("Modern Minimalist LED Floor Lamp", "Lumina", "Dimmable warm ambient lighting with touch controls and remote.", new BigDecimal("79.50"), 30, catHome, vendorHome, 4.5, 67, "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80");
        createProduct("100% Egyptian Cotton 1000 Thread Count Sheets", "LuxeBedding", "Silky soft hotel-quality sheet set with deep pocket fitted sheet.", new BigDecimal("109.99"), 25, catHome, vendorHome, 4.9, 215, "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=600&auto=format&fit=crop&q=80");

        // SPORTS
        createProduct("Pro Adjustable Dumbbell Set (5-50 lbs)", "IronFit", "Fast weight selection dial replacing 10 pairs of traditional weights.", new BigDecimal("299.99"), 15, catSports, vendorSports, 4.9, 340, "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop&q=80");
        createProduct("Non-Slip Extra Thick Pilates & Yoga Mat", "ZenFlex", "High-density Eco TPE material with alignment marks and carrying strap.", new BigDecimal("39.99"), 45, catSports, vendorSports, 4.7, 180, "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&auto=format&fit=crop&q=80");
        createProduct("Waterproof 3-Person Camping Dome Tent", "Outbound", "Wind-resistant aluminum poles with rainfly cover and easy 5-min setup.", new BigDecimal("139.95"), 18, catSports, vendorSports, 4.6, 92, "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&auto=format&fit=crop&q=80");
        createProduct("Insulated Stainless Steel Sports Bottle 32oz", "HydroPeak", "Double-wall vacuum insulation keeps drinks cold for 24 hours.", new BigDecimal("24.99"), 60, catSports, vendorSports, 4.8, 410, "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80");
        createProduct("Foldable Indoor Treadmill with LCD Display", "CardioPro", "Quiet 2.5HP motor with incline presets and compact folding mechanism.", new BigDecimal("449.00"), 8, catSports, vendorSports, 4.5, 64, "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&auto=format&fit=crop&q=80");
        createProduct("High Precision Carbon Fiber Tennis Racket", "SmashCourt", "Lightweight frame offering maximum power and sweet spot control.", new BigDecimal("89.99"), 0, catSports, vendorSports, 4.4, 28, "https://images.unsplash.com/photo-1617083934555-ac7d4fed8814?w=600&auto=format&fit=crop&q=80");

        // BOOKS
        createProduct("The Enterprise Software Architecture Guide", "TechPress", "Master scalable microservices, DDD, and cloud native architectures.", new BigDecimal("44.99"), 40, catBooks, vendorTech, 4.9, 155, "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop&q=80");
        createProduct("Mastering Modern Web Development & React", "CodePublish", "In-depth guide to fullstack applications, state management, and performance.", new BigDecimal("39.95"), 35, catBooks, vendorTech, 4.8, 120, "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80");
        createProduct("Chronicles of Starlight: Epic Fantasy Novel", "StoryCraft", "A gripping bestseller of magic, empires, and courageous heroes.", new BigDecimal("19.99"), 50, catBooks, vendorFashion, 4.7, 280, "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80");
        createProduct("Mindful Living & Personal Growth Handbook", "LifeBalance", "Practical routines for mental clarity, productivity, and happiness.", new BigDecimal("22.50"), 30, catBooks, vendorHome, 4.6, 98, "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80");
        createProduct("Gourmet World Cuisine Cookbook", "CulinaryPress", "Over 150 authentic recipes from Italy, Japan, Mexico, and India.", new BigDecimal("29.99"), 25, catBooks, vendorHome, 4.9, 175, "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80");
        createProduct("The History of Art and Design Evolution", "ArtBooks", "Richly illustrated coffee table book documenting modern aesthetics.", new BigDecimal("49.99"), 15, catBooks, vendorFashion, 4.8, 42, "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&auto=format&fit=crop&q=80");

        // BEAUTY
        createProduct("Hydrating Hyaluronic Acid Serum 50ml", "GlowGoddess", "Deep moisture lock formula with vitamin B5 for radiant plump skin.", new BigDecimal("34.99"), 45, catBeauty, vendorFashion, 4.9, 310, "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80");
        createProduct("Organic Botanical Face Oil Restorative", "PureFlora", "Nourishing cold-pressed rosehip and jojoba botanical oil blend.", new BigDecimal("42.00"), 30, catBeauty, vendorFashion, 4.8, 140, "https://images.unsplash.com/photo-1608248597261-833258657640?w=600&auto=format&fit=crop&q=80");
        createProduct("Velvet Matte Lipstick Set - 4 Shades", "ChicCosmetics", "Long-wearing non-drying formula infused with shea butter.", new BigDecimal("28.50"), 50, catBeauty, vendorFashion, 4.7, 220, "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop&q=80");
        createProduct("Professional Ionic Hair Dryer 1800W", "StylistPro", "Ultra-fast drying with intelligent heat control and magnetic nozzles.", new BigDecimal("99.99"), 20, catBeauty, vendorTech, 4.6, 95, "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80");
        createProduct("Exfoliating Green Tea Body Scrub", "SpaNaturals", "Natural sea salt and green tea extract for velvety smooth skin.", new BigDecimal("19.99"), 40, catBeauty, vendorFashion, 4.5, 85, "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80");
        createProduct("Luxury Eau De Parfum Spray 100ml", "MaisonAroma", "Elegant oriental floral fragrance notes of jasmine and warm amber.", new BigDecimal("115.00"), 0, catBeauty, vendorFashion, 4.9, 76, "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&auto=format&fit=crop&q=80");

        // ACCESSORIES
        createProduct("Automatic Skeleton Mechanical Watch", "ChronoLux", "Self-winding mechanical movement with scratch-resistant sapphire crystal.", new BigDecimal("229.00"), 15, catAccessories, vendorFashion, 4.9, 130, "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80");
        createProduct("Polarized Aviator Sunglasses Titanium", "RayVision", "100% UV400 protection with durable ultra-lightweight titanium frame.", new BigDecimal("79.99"), 35, catAccessories, vendorFashion, 4.7, 190, "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80");
        createProduct("RFID Blocking Genuine Bifold Leather Wallet", "Heritage", "Slim design with quick card ejector slot and premium full-grain leather.", new BigDecimal("39.95"), 55, catAccessories, vendorFashion, 4.8, 260, "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80");
        createProduct("Sterling Silver Pendant Necklace", "JewelCraft", "Hand-polished solid 925 sterling silver chain with cubic zirconia.", new BigDecimal("65.00"), 25, catAccessories, vendorFashion, 4.6, 115, "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80");
        createProduct("Canvas Travel Duffle Bag with Shoe Compartment", "Voyager", "Water-resistant heavy-duty canvas bag designed for weekend trips.", new BigDecimal("85.00"), 20, catAccessories, vendorSports, 4.7, 88, "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80");
        createProduct("Smart Leather Key Organizer with Tracker", "KeySmart", "Eliminates key jingle and connects to smartphone via Bluetooth.", new BigDecimal("29.99"), 40, catAccessories, vendorTech, 4.4, 70, "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80");

        // FURNITURE
        createProduct("Ergonomic Mesh Office Chair with Lumbar Support", "WorkComfort", "Fully adjustable armrests, headrest, and breathable mesh backrest.", new BigDecimal("219.99"), 18, catFurniture, vendorHome, 4.8, 165, "https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?w=600&auto=format&fit=crop&q=80");
        createProduct("Solid Oak Dining Table for 6 People", "Craftwood", "Durable natural oak wood tabletop with industrial steel black legs.", new BigDecimal("499.00"), 8, catFurniture, vendorHome, 4.9, 54, "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=600&auto=format&fit=crop&q=80");
        createProduct("Velvet Modern Accent Sofa Lounge Chair", "UrbanLiving", "Plush velvet upholstery with gold metal legs for mid-century elegance.", new BigDecimal("279.50"), 12, catFurniture, vendorHome, 4.7, 82, "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80");
        createProduct("Electric Height Adjustable Standing Desk 55-inch", "FlexiSpace", "Dual motor frame with memory preset buttons and cable management.", new BigDecimal("349.99"), 15, catFurniture, vendorHome, 4.8, 142, "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&auto=format&fit=crop&q=80");
        createProduct("Scandinavian Modular Bookshelf Storage", "NordicDecor", "5-tier open shelving unit for books, indoor plants, and decor items.", new BigDecimal("139.00"), 22, catFurniture, vendorHome, 4.6, 90, "https://images.unsplash.com/photo-1594620302200-9a762244a156?w=600&auto=format&fit=crop&q=80");
        createProduct("Handwoven Jute Large Area Rug (8x10 ft)", "NaturalWeave", "Eco-friendly natural jute rug adding rustic warmth to living space.", new BigDecimal("169.99"), 0, catFurniture, vendorHome, 4.5, 48, "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=600&auto=format&fit=crop&q=80");
    }

    private Vendor createVendorIfMissing(String email, String businessName, String address) {
        return vendorRepository.findByEmail(email).orElseGet(() -> {
            Vendor v = new Vendor();
            v.setEmail(email);
            v.setPassword(passwordEncoder.encode("Vendor@123"));
            v.setBusinessName(businessName);
            v.setAddress(address);
            v.setPhone("555-0199");
            return vendorRepository.save(v);
        });
    }

    private Category saveCategory(String name, String description, String imageUrl) {
        return categoryRepository.findByName(name).orElseGet(() -> {
            Category cat = new Category();
            cat.setName(name);
            cat.setDescription(description);
            cat.setImageUrl(imageUrl);
            return categoryRepository.save(cat);
        });
    }

    private void createProduct(String name, String brand, String description, BigDecimal price,
                              int stock, Category category, Vendor vendor, double rating, int reviewCount, String imageUrl) {
        Product p = new Product();
        p.setName(name);
        p.setBrand(brand);
        p.setDescription(description);
        p.setPrice(price);
        p.setStockQuantity(stock);
        p.setCategory(category);
        p.setVendor(vendor);
        p.setRating(rating);
        p.setReviewCount(reviewCount);
        p.setApprovalStatus(ApprovalStatus.APPROVED);
        List<String> imgs = new ArrayList<>();
        imgs.add(imageUrl);
        p.setImages(imgs);

        Product savedProduct = productRepository.save(p);

        // Record initial inventory history
        InventoryHistory history = new InventoryHistory(
                savedProduct,
                stock,
                stock,
                "INITIAL_SEED_DATA"
        );
        inventoryHistoryRepository.save(history);
    }

    private void createAdminIfMissing() {
        if (!customerRepository.existsByEmail("admin@shopstack.com")) {
            Customer admin = new Customer();
            admin.setName("Platform Admin");
            admin.setEmail("admin@shopstack.com");
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setPhone("1800-SHOPSTACK");
            admin.setAddress("ShopStack HQ, Silicon Valley");
            admin.setRole(Role.ADMIN);
            customerRepository.save(admin);
        }
    }

    private void createWarehouseStaffIfMissing() {
        // Generic staff default
        if (!customerRepository.existsByEmail("staff@shopstack.com")) {
            Customer staff = new Customer();
            staff.setName("Warehouse Staff");
            staff.setEmail("staff@shopstack.com");
            staff.setPassword(passwordEncoder.encode("Staff@123"));
            staff.setPhone("1800-WAREHOUSE");
            staff.setAddress("ShopStack Logistics Hub");
            staff.setRole(Role.WAREHOUSE_STAFF);
            warehouseRepository.findByCode("WH-BLR").ifPresent(staff::setWarehouse);
            customerRepository.save(staff);
        }
    }

    private void createWarehousesIfMissing() {
        Warehouse blrWh = warehouseRepository.findByCode("WH-BLR").orElseGet(() -> {
            Warehouse w = new Warehouse();
            w.setName("Bangalore Central Warehouse");
            w.setCode("WH-BLR");
            w.setLocation("Electronics City, Bangalore, Karnataka");
            w.setContact("blr-manager@shopstack.com");
            w.setStatus(WarehouseStatus.ACTIVE);
            return warehouseRepository.save(w);
        });

        Warehouse hydWh = warehouseRepository.findByCode("WH-HYD").orElseGet(() -> {
            Warehouse w = new Warehouse();
            w.setName("Hyderabad Fulfillment Center");
            w.setCode("WH-HYD");
            w.setLocation("HITEC City, Hyderabad, Telangana");
            w.setContact("hyd-manager@shopstack.com");
            w.setStatus(WarehouseStatus.ACTIVE);
            return warehouseRepository.save(w);
        });

        Warehouse delWh = warehouseRepository.findByCode("WH-DEL").orElseGet(() -> {
            Warehouse w = new Warehouse();
            w.setName("Delhi NCR Logistics Hub");
            w.setCode("WH-DEL");
            w.setLocation("Gurugram, Delhi NCR");
            w.setContact("del-manager@shopstack.com");
            w.setStatus(WarehouseStatus.ACTIVE);
            return warehouseRepository.save(w);
        });

        Warehouse pneWh = warehouseRepository.findByCode("WH-PNE").orElseGet(() -> {
            Warehouse w = new Warehouse();
            w.setName("Pune Regional Warehouse");
            w.setCode("WH-PNE");
            w.setLocation("Hinjawadi IT Park, Pune, Maharashtra");
            w.setContact("pne-manager@shopstack.com");
            w.setStatus(WarehouseStatus.ACTIVE);
            return warehouseRepository.save(w);
        });

        // Ensure city-specific staff accounts exist
        createSpecificStaffIfMissing("blr@shopstack.com", "Bangalore Staff", blrWh);
        createSpecificStaffIfMissing("hyd@shopstack.com", "Hyderabad Staff", hydWh);
        createSpecificStaffIfMissing("del@shopstack.com", "Delhi Staff", delWh);
        createSpecificStaffIfMissing("pne@shopstack.com", "Pune Staff", pneWh);

        // Populate inventory for all products across active warehouses
        List<Product> products = productRepository.findAll();
        List<Warehouse> activeWarehouses = List.of(blrWh, hydWh, delWh, pneWh);
        for (Warehouse wh : activeWarehouses) {
            for (Product p : products) {
                if (warehouseInventoryRepository.findByWarehouseIdAndProductId(wh.getId(), p.getId()).isEmpty()) {
                    int qty = p.getStockQuantity() != null && p.getStockQuantity() > 0 ? p.getStockQuantity() : 15;
                    WarehouseInventory inv = new WarehouseInventory(wh, p, qty, 0);
                    warehouseInventoryRepository.save(inv);
                }
            }
        }
    }

    private void createSpecificStaffIfMissing(String email, String name, Warehouse warehouse) {
        if (!customerRepository.existsByEmail(email)) {
            Customer staff = new Customer();
            staff.setName(name);
            staff.setEmail(email);
            staff.setPassword(passwordEncoder.encode("Staff@123"));
            staff.setPhone("9876543210");
            staff.setAddress(warehouse.getLocation());
            staff.setRole(Role.WAREHOUSE_STAFF);
            staff.setWarehouse(warehouse);
            customerRepository.save(staff);
        }
    }

    private void createCouponsIfMissing() {
        if (!couponRepository.existsByCode("WELCOME10")) {
            Coupon c1 = new Coupon(
                    "WELCOME10",
                    "10% OFF on your first purchase!",
                    DiscountType.PERCENTAGE,
                    new BigDecimal("10.00"),
                    new BigDecimal("200.00"),
                    new BigDecimal("1000.00"),
                    java.time.LocalDateTime.now().minusDays(10),
                    java.time.LocalDateTime.now().plusYears(1),
                    500,
                    "Welcome Campaign"
            );
            couponRepository.save(c1);
        }

        if (!couponRepository.existsByCode("FESTIVE20")) {
            Coupon c2 = new Coupon(
                    "FESTIVE20",
                    "20% OFF festive special discount up to ₹500",
                    DiscountType.PERCENTAGE,
                    new BigDecimal("20.00"),
                    new BigDecimal("500.00"),
                    new BigDecimal("500.00"),
                    java.time.LocalDateTime.now().minusDays(5),
                    java.time.LocalDateTime.now().plusMonths(6),
                    200,
                    "Festive Sale 2026"
            );
            couponRepository.save(c2);
        }

        if (!couponRepository.existsByCode("SUPER500")) {
            Coupon c3 = new Coupon(
                    "SUPER500",
                    "Flat ₹500 OFF on orders above ₹2,000",
                    DiscountType.FIXED,
                    new BigDecimal("500.00"),
                    new BigDecimal("2000.00"),
                    null,
                    java.time.LocalDateTime.now().minusDays(1),
                    java.time.LocalDateTime.now().plusMonths(3),
                    100,
                    "Mega Saver"
            );
            couponRepository.save(c3);
        }
    }

    private void fixDatabaseCheckConstraints() {
        try {
            jdbcTemplate.execute("ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check");
            jdbcTemplate.execute("ALTER TABLE warehouse_order_allocations DROP CONSTRAINT IF EXISTS warehouse_order_allocations_status_check");
            jdbcTemplate.execute("ALTER TABLE stock_movement_logs DROP CONSTRAINT IF EXISTS stock_movement_logs_stage_check");
            jdbcTemplate.execute("ALTER TABLE shipments DROP CONSTRAINT IF EXISTS shipments_status_check");
        } catch (Exception e) {
            // Silently ignore if constraints don't exist or DB dialect doesn't support IF EXISTS
        }
    }
}
