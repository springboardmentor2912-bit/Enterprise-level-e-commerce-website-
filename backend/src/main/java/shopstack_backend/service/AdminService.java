package shopstack_backend.service;

import shopstack_backend.dto.*;
import shopstack_backend.entity.Order;
import shopstack_backend.entity.Role;
import shopstack_backend.entity.Vendor;
import shopstack_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class AdminService {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private ProductRepository productRepository;

    public AdminDashboardSummaryDTO getDashboardSummary() {
        List<Order> orders = orderRepository.findAll();

        // Cancelled and fully-refunded orders represent zero real revenue —
        // counting them here would overstate sales against what the
        // platform actually keeps (and against real payment-gateway
        // settlement figures an admin would compare this against).
        BigDecimal totalSales = orders.stream()
                .filter(o -> o.getTotalAmount() != null)
                .filter(o -> o.getStatus() != shopstack_backend.entity.OrderStatus.CANCELLED
                        && o.getStatus() != shopstack_backend.entity.OrderStatus.REFUNDED)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalOrders = orderRepository.count();
        long totalVendors = vendorRepository.count();
        long totalProducts = productRepository.count();

        long lowStockCount = productRepository.findAll().stream()
                .filter(p -> p.getStockQuantity() != null && p.getStockQuantity() <= 5)
                .count();

        return new AdminDashboardSummaryDTO(
                totalSales,
                totalOrders,
                totalVendors,
                totalProducts,
                lowStockCount
        );
    }

    public List<AdminVendorDTO> getAllVendors() {
        List<Vendor> vendors = vendorRepository.findAll();
        List<AdminVendorDTO> dtos = new ArrayList<>();
        for (Vendor v : vendors) {
            long productCount = v.getProducts() == null ? 0 : v.getProducts().size();
            AdminVendorDTO dto = new AdminVendorDTO(
                    v.getId(),
                    v.getName(),
                    v.getEmail(),
                    v.getPhone(),
                    v.getDescription(),
                    v.getStatus(),
                    productCount
            );

            dtos.add(dto);
        }

        return dtos;
    }

    // ---------------------------------------------------------------
    // Vendor approval workflow: a newly registered vendor (or a customer
    // who used "Become a Vendor") starts PENDING and can't list products
    // (see ProductService.addProduct's gate) until admin approves them.
    // ---------------------------------------------------------------

  public AdminVendorDTO approveVendor(Long vendorId) {
    Vendor vendor = vendorRepository.findById(vendorId)
            .orElseThrow(() ->
                    new IllegalArgumentException("Vendor not found."));

    vendor.setStatus("APPROVED");

    if (vendor.getUser() != null) {
        vendor.getUser().setRole(Role.VENDOR);
    }

    vendorRepository.save(vendor);

    return toVendorDTO(vendor);
}

   public AdminVendorDTO rejectVendor(Long vendorId) {
    Vendor vendor = vendorRepository.findById(vendorId)
            .orElseThrow(() ->
                    new IllegalArgumentException("Vendor not found."));

    vendor.setStatus("REJECTED");

    if (vendor.getUser() != null) {
        vendor.getUser().setRole(Role.CUSTOMER);
    }

    vendorRepository.save(vendor);

    return toVendorDTO(vendor);
}
    private AdminVendorDTO toVendorDTO(Vendor v) {
        long productCount = v.getProducts() == null ? 0 : v.getProducts().size();
        return new AdminVendorDTO(
                v.getId(),
                v.getName(),
                v.getEmail(),
                v.getPhone(),
                v.getDescription(),
                v.getStatus(),
                productCount
        );
    }

    public List<AdminVendorDTO> getAllVendors1() {
    List<Vendor> vendors = vendorRepository.findAll();
    List<AdminVendorDTO> dtos = new ArrayList<>();

    for (Vendor v : vendors) {
        long productCount = v.getProducts() == null ? 0 : v.getProducts().size();

        dtos.add(new AdminVendorDTO(
                v.getId(),
                v.getName(),
                v.getEmail(),
                v.getPhone(),
                v.getDescription(),
                v.getStatus(),
                productCount
        ));
    }

    return dtos;
}

public List<AdminOrderDTO> getAllOrders() {
    List<Order> orders = orderRepository.findAll();
    List<AdminOrderDTO> result = new ArrayList<>();

    for (Order order : orders) {
        String customerName = order.getUser() != null
                ? order.getUser().getFullName()
                : "Unknown";

        String customerEmail = order.getUser() != null
                ? order.getUser().getEmail()
                : "Unknown";

        int itemCount = order.getItems() != null
                ? order.getItems().size()
                : 0;

        AdminOrderDTO dto = new AdminOrderDTO(
                order.getId(),
                customerName,
                customerEmail,
                order.getTotalAmount(),
                order.getStatus() != null
                        ? order.getStatus().name()
                        : "UNKNOWN",
                order.getCreatedAt(),
                itemCount
        );

        List<AdminOrderItemDTO> itemDTOs = new ArrayList<>();
        if (order.getItems() != null) {
            for (var item : order.getItems()) {
                itemDTOs.add(new AdminOrderItemDTO(
                        item.getId(),
                        item.getProduct() != null ? item.getProduct().getId() : null,
                        item.getProductName(),
                        item.getQuantity(),
                        item.getPriceAtPurchase(),
                        item.getLineTotal(),
                        item.getStatus() != null ? item.getStatus().name() : "UNKNOWN"
                ));
            }
        }
        dto.setItems(itemDTOs);

        result.add(dto);
    }

    return result;
}
   public List<CommissionDTO> getCommissionInfo() {
    List<Vendor> vendors = vendorRepository.findAll();
    List<CommissionDTO> commissions = new ArrayList<>();
    double defaultCommissionRate = 10.0;
    for (Vendor vendor : vendors) {
        BigDecimal vendorSales = orderItemRepository.calculateVendorSales(vendor.getId());
        if (vendorSales == null) {
            vendorSales = BigDecimal.ZERO;
        }
        BigDecimal commission = vendorSales
                .multiply(BigDecimal.valueOf(defaultCommissionRate))
                .divide(BigDecimal.valueOf(100));
        commissions.add(new CommissionDTO(
                vendor.getId(),
                vendor.getName(),
                vendorSales,
                defaultCommissionRate,
                commission
        ));
    }
    return commissions;
}
    private String checkDatabaseStatus() {
        try (var connection = dataSource.getConnection()) {
            if (connection.isValid(2)) {
                return "CONNECTED";
            }
            return "DISCONNECTED";
        } catch (Exception e) {
            return "DISCONNECTED";
        }
    }
    public SystemStatusDTO getSystemStatus() {
        String databaseStatus = checkDatabaseStatus();
        String razorpayStatus = "CONFIGURED";
        return new SystemStatusDTO(
                "UP",
                databaseStatus,
                razorpayStatus,
                LocalDateTime.now().toString()
        );
    }
}