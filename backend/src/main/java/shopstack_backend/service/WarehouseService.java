package shopstack_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import shopstack_backend.dto.*;
import shopstack_backend.entity.*;
import shopstack_backend.repository.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
public class WarehouseService {

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private WarehouseStockRepository warehouseStockRepository;

    @Autowired
    private StockAllocationRepository stockAllocationRepository;

    @Autowired
    private StockMovementRepository stockMovementRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired(required = false)
    private ProductService productService;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private OrderStatusService orderStatusService;
    @Autowired
private OrderRepository orderRepository;

  

    @Transactional
    public WarehouseResponseDTO createWarehouse(WarehouseRequestDTO request) {
        validateRequest(request, null);
        Warehouse warehouse = new Warehouse();
        applyRequest(warehouse, request);
        return toResponseDTO(warehouseRepository.save(warehouse));
    }

    @Transactional
    public WarehouseResponseDTO updateWarehouse(Long id, WarehouseRequestDTO request) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Warehouse not found."));
        validateRequest(request, id);
        applyRequest(warehouse, request);
        return toResponseDTO(warehouseRepository.save(warehouse));
    }

    @Transactional
    public void deleteWarehouse(Long id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Warehouse not found."));
        boolean hasActiveWork =
                !stockAllocationRepository.findByWarehouse_IdAndStatusOrderByAllocatedAtAsc(id, AllocationStatus.ALLOCATED).isEmpty()
                || !stockAllocationRepository.findByWarehouse_IdAndStatusOrderByAllocatedAtAsc(id, AllocationStatus.PICKED).isEmpty()
                || !stockAllocationRepository.findByWarehouse_IdAndStatusOrderByAllocatedAtAsc(id, AllocationStatus.PACKED).isEmpty();
        if (hasActiveWork) {
            throw new IllegalStateException(
                    "This warehouse has orders still in progress (allocated/picked/packed). " +
                    "Deactivate it instead of deleting, or finish fulfilling those orders first.");
        }
        warehouseRepository.delete(warehouse);
    }

    @Transactional(readOnly = true)
    public List<WarehouseResponseDTO> getAllWarehouses() {
        return warehouseRepository.findAllByOrderByNameAsc().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    private void validateRequest(WarehouseRequestDTO request, Long selfId) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new IllegalArgumentException("Warehouse name is required.");
        }
        if (request.getLocation() == null || request.getLocation().isBlank()) {
            throw new IllegalArgumentException("Warehouse location is required.");
        }
        warehouseRepository.findAllByOrderByNameAsc().stream()
                .filter(w -> w.getName().equalsIgnoreCase(request.getName().trim()))
                .findFirst()
                .ifPresent(existing -> {
                    if (selfId == null || !existing.getId().equals(selfId)) {
                        throw new IllegalArgumentException(
                                "A warehouse named \"" + request.getName().trim() + "\" already exists.");
                    }
                });
    }

    private void applyRequest(Warehouse warehouse, WarehouseRequestDTO request) {
        warehouse.setName(request.getName().trim());
        warehouse.setLocation(request.getLocation().trim());
        warehouse.setContactPerson(request.getContactPerson());
        warehouse.setPhone(request.getPhone());
        warehouse.setActive(request.getActive() == null || request.getActive());
    }

    // ---------------------------------------------------------------
    // 2. Receiving stock into a warehouse
    // ---------------------------------------------------------------

    /**
     * Distributes stock FROM a vendor's undistributed pool (Product.stockQuantity)
     * INTO a warehouse (WarehouseStock.availableQuantity) — a real transfer,
     * not an addition to both. This is the step that makes stock orderable:
     * a customer can only buy what's actually sitting in a warehouse, not
     * whatever a vendor merely claims to have on hand.
     */
    @Transactional
    public WarehouseStockResponseDTO receiveStock(Long warehouseId, WarehouseStockRequestDTO request) {
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero.");
        }
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new IllegalArgumentException("Warehouse not found."));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found."));

        int vendorPool = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
        if (request.getQuantity() > vendorPool) {
            throw new IllegalArgumentException(
                    "The vendor only has " + vendorPool + " unit(s) of \"" + product.getName() +
                    "\" available to distribute — can't send " + request.getQuantity() + ".");
        }

        WarehouseStock stock = warehouseStockRepository
                .findByWarehouse_IdAndProduct_Id(warehouseId, product.getId())
                .orElseGet(() -> {
                    WarehouseStock s = new WarehouseStock();
                    s.setWarehouse(warehouse);
                    s.setProduct(product);
                    return s;
                });
        stock.setAvailableQuantity(stock.getAvailableQuantity() + request.getQuantity());
        WarehouseStock saved = warehouseStockRepository.save(stock);

        // Take it out of the vendor's undistributed pool — this is a
        // transfer, not new stock being created from nowhere.
        product.setStockQuantity(vendorPool - request.getQuantity());
        productRepository.save(product);
        if (productService != null) {
            productService.recordStockChange(
                    product, vendorPool, product.getStockQuantity(),
                    "Distributed to " + warehouse.getName());
        }

        logMovement(warehouse, product, null, null, "AVAILABLE", request.getQuantity(),
                "Distributed from vendor stock to " + warehouse.getName());

        return toStockDTO(saved);
    }

    // Total sellable stock for a product, summed across every active
    // warehouse, MINUS units already sold but not yet manually allocated
    // to any warehouse. That second part matters: under manual-only
    // allocation, a freshly placed order doesn't touch WarehouseStock at
    // all until admin allocates it — so without subtracting pending
    // unallocated orders here, this number would overstate what's truly
    // still purchasable, and two customers could both order the same
    // last unit before either gets allocated.
    @Transactional(readOnly = true)
    public int getTotalAvailableStock(Long productId) {
        int warehouseAvailable = warehouseStockRepository.findByProduct_Id(productId).stream()
                .filter(s -> s.getWarehouse().isActive())
                .mapToInt(WarehouseStock::getAvailableQuantity)
                .sum();

        int pendingUnallocated = orderItemRepository != null
                ? orderItemRepository.sumPendingUnallocatedQuantity(productId)
                : 0;

        return Math.max(0, warehouseAvailable - pendingUnallocated);
    }

    @Transactional(readOnly = true)
    public List<WarehouseStockResponseDTO> getWarehouseStock(Long warehouseId) {
        return warehouseStockRepository.findByWarehouse_IdOrderByProduct_NameAsc(warehouseId).stream()
                .map(this::toStockDTO)
                .collect(Collectors.toList());
    }

    // ---------------------------------------------------------------
    // Allocation — the ONLY way an order item ends up assigned to a
    // warehouse. An admin picks the warehouse and quantity by hand; there
    // is no automatic/algorithmic path anywhere else in this class.
    // ---------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<WarehouseStockResponseDTO> getStockForProduct(Long productId) {
        if (productId == null) {
            throw new IllegalArgumentException("Product ID is required.");
        }
        return warehouseStockRepository.findByProduct_Id(productId).stream()
                .map(this::toStockDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public StockAllocationResponseDTO manuallyAllocate(Long orderItemId, Long warehouseId, Integer requestedQuantity) {
        if (orderItemId == null) {
            throw new IllegalArgumentException("Order item ID is required.");
        }
        if (warehouseId == null) {
            throw new IllegalArgumentException("A warehouse must be selected.");
        }

        OrderItem item = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new IllegalArgumentException("Order item not found."));
        if (item.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalStateException("This item has been cancelled and can't be allocated.");
        }
        Product product = item.getProduct();
        if (product == null) {
            throw new IllegalStateException("This item has no product on record.");
        }

        int alreadyAllocated = stockAllocationRepository.findByOrderItem_Id(item.getId()).stream()
                .filter(a -> a.getStatus() != AllocationStatus.CANCELLED)
                .mapToInt(StockAllocation::getQuantity)
                .sum();
        int remaining = (item.getQuantity() != null ? item.getQuantity() : 0) - alreadyAllocated;
        if (remaining <= 0) {
            throw new IllegalStateException("This item is already fully allocated.");
        }

        int quantity = requestedQuantity != null ? requestedQuantity : remaining;
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero.");
        }
        if (quantity > remaining) {
            throw new IllegalArgumentException(
                    "Only " + remaining + " unit(s) of this item still need allocating — can't allocate " + quantity + ".");
        }

        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new IllegalArgumentException("Warehouse not found."));
        if (!warehouse.isActive()) {
            throw new IllegalArgumentException("\"" + warehouse.getName() + "\" is inactive and can't receive allocations.");
        }

        WarehouseStock stock = warehouseStockRepository
                .findByWarehouse_IdAndProduct_Id(warehouseId, product.getId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "\"" + warehouse.getName() + "\" has no stock of \"" + product.getName() + "\" on record."));
        if (stock.getAvailableQuantity() < quantity) {
            throw new IllegalArgumentException(
                    "\"" + warehouse.getName() + "\" only has " + stock.getAvailableQuantity() +
                    " unit(s) of \"" + product.getName() + "\" available — can't allocate " + quantity + ".");
        }

        stock.setAvailableQuantity(stock.getAvailableQuantity() - quantity);
        stock.setAllocatedQuantity(stock.getAllocatedQuantity() + quantity);
        warehouseStockRepository.save(stock);

        StockAllocation allocation = new StockAllocation();
        allocation.setOrderItem(item);
        allocation.setWarehouse(warehouse);
        allocation.setQuantity(quantity);
        allocation.setStatus(AllocationStatus.ALLOCATED);
        allocation.setAllocatedAt(LocalDateTime.now());
        StockAllocation saved = stockAllocationRepository.save(allocation);

        logMovement(warehouse, product, item, "AVAILABLE", "ALLOCATED", quantity,
                "Manually allocated by admin for Order #" + item.getOrder().getId());

        if (item.getStatus() == OrderStatus.CONFIRMED) {
            item.setStatus(OrderStatus.PROCESSING);
            orderItemRepository.save(item);
        }
        orderStatusService.recomputeOrderStatus(item.getOrder());

        return toAllocationDTO(saved);
    }

    @Transactional
    public void releaseAllocationsForItem(OrderItem item) {
        if (item == null || item.getId() == null) return;
        List<StockAllocation> allocations = stockAllocationRepository.findByOrderItem_Id(item.getId());
        for (StockAllocation allocation : allocations) {
            if (allocation.getStatus() == AllocationStatus.CANCELLED
                    || allocation.getStatus() == AllocationStatus.READY_FOR_SHIPMENT) {
                continue; // already released, or already shipped — nothing to undo
            }
            warehouseStockRepository
                    .findByWarehouse_IdAndProduct_Id(allocation.getWarehouse().getId(), item.getProduct().getId())
                    .ifPresent(stock -> {
                        stock.setAllocatedQuantity(Math.max(0, stock.getAllocatedQuantity() - allocation.getQuantity()));
                        stock.setAvailableQuantity(stock.getAvailableQuantity() + allocation.getQuantity());
                        warehouseStockRepository.save(stock);
                    });

            String previousStage = allocation.getStatus().name();
            allocation.setStatus(AllocationStatus.CANCELLED);
            allocation.setCancelledAt(LocalDateTime.now());
            stockAllocationRepository.save(allocation);

            logMovement(allocation.getWarehouse(), item.getProduct(), item, previousStage, "CANCELLED",
                    allocation.getQuantity(), "Order item cancelled — stock returned to available");
        }
    }

    @Transactional
    public StockAllocationResponseDTO pick(Long allocationId) {
        StockAllocation allocation = getAllocationOrThrow(allocationId);
        requireStatus(allocation, AllocationStatus.ALLOCATED, "picked");
        allocation.setStatus(AllocationStatus.PICKED);
        allocation.setPickedAt(LocalDateTime.now());
        stockAllocationRepository.save(allocation);
        logMovement(allocation.getWarehouse(), allocation.getOrderItem().getProduct(), allocation.getOrderItem(),
                "ALLOCATED", "PICKED", allocation.getQuantity(), "Picked from shelf");
        return toAllocationDTO(allocation);
    }

    @Transactional
    public StockAllocationResponseDTO pack(Long allocationId) {
        StockAllocation allocation = getAllocationOrThrow(allocationId);
        requireStatus(allocation, AllocationStatus.PICKED, "packed");
        allocation.setStatus(AllocationStatus.PACKED);
        allocation.setPackedAt(LocalDateTime.now());
        stockAllocationRepository.save(allocation);
        logMovement(allocation.getWarehouse(), allocation.getOrderItem().getProduct(), allocation.getOrderItem(),
                "PICKED", "PACKED", allocation.getQuantity(), "Packed and verified");
        return toAllocationDTO(allocation);
    }

    @Transactional
    public StockAllocationResponseDTO markReadyForShipment(Long allocationId) {
        StockAllocation allocation = getAllocationOrThrow(allocationId);
        requireStatus(allocation, AllocationStatus.PACKED, "marked ready for shipment");
        allocation.setStatus(AllocationStatus.READY_FOR_SHIPMENT);
        allocation.setReadyAt(LocalDateTime.now());
        stockAllocationRepository.save(allocation);

        // Stock has now physically left the warehouse's holding area.
        warehouseStockRepository
                .findByWarehouse_IdAndProduct_Id(allocation.getWarehouse().getId(), allocation.getOrderItem().getProduct().getId())
                .ifPresent(stock -> {
                    stock.setAllocatedQuantity(Math.max(0, stock.getAllocatedQuantity() - allocation.getQuantity()));
                    warehouseStockRepository.save(stock);
                });

        logMovement(allocation.getWarehouse(), allocation.getOrderItem().getProduct(), allocation.getOrderItem(),
                "PACKED", "READY_FOR_SHIPMENT", allocation.getQuantity(), "Ready for shipment");

        // If an item was split across multiple warehouses, only flip it to
        // SHIPPED once every chunk has shipped — not the first one to finish.
        OrderItem item = allocation.getOrderItem();
        List<StockAllocation> siblings = stockAllocationRepository.findByOrderItem_Id(item.getId());
        boolean fullyShipped = siblings.stream().allMatch(
                a -> a.getStatus() == AllocationStatus.READY_FOR_SHIPMENT || a.getStatus() == AllocationStatus.CANCELLED);
        if (fullyShipped && item.getStatus() == OrderStatus.PROCESSING) {
            item.setStatus(OrderStatus.SHIPPED);
            orderItemRepository.save(item);
            orderStatusService.recomputeOrderStatus(item.getOrder());
        }

        return toAllocationDTO(allocation);
    }
  
@Transactional
public void markAllocationsDelivered(OrderItem item) {

    if (item == null || item.getId() == null) {
        return;
    }

    List<StockAllocation> allocations =
            stockAllocationRepository.findByOrderItem_Id(item.getId());

    for (StockAllocation allocation : allocations) {

        // Already cancelled or delivered — nothing to do.
        if (allocation.getStatus() == AllocationStatus.CANCELLED
                || allocation.getStatus() == AllocationStatus.DELIVERED) {
            continue;
        }

        String previousStage = allocation.getStatus().name();

        allocation.setStatus(AllocationStatus.DELIVERED);
        allocation.setDeliveredAt(LocalDateTime.now());

        stockAllocationRepository.save(allocation);

        // NOTE: allocatedQuantity is NOT decremented here. It was already
        // correctly removed back when this allocation reached
        // READY_FOR_SHIPMENT (see markReadyForShipment above) — that's the
        // point these units physically left the warehouse's holding area.
        // Decrementing it again here would double-subtract the same units.

        logMovement(
                allocation.getWarehouse(),
                item.getProduct(),
                item,
                previousStage,
                "DELIVERED",
                allocation.getQuantity(),
                "Order delivered to customer"
        );
    }
}

    private StockAllocation getAllocationOrThrow(Long allocationId) {
        return stockAllocationRepository.findById(allocationId)
                .orElseThrow(() -> new IllegalArgumentException("Allocation not found."));
    }

    // ---------------------------------------------------------------
    // Warehouse-staff self-service support: confirms an allocation
    // actually belongs to the warehouse a staff member is scoped to,
    // before letting them pick/pack/ready it. Called by
    // WarehouseStaffService, never exposed to the client directly.
    // ---------------------------------------------------------------
    @Transactional(readOnly = true)
    public void assertWarehouseOwnsAllocation(Long allocationId, Long warehouseId) {
        StockAllocation allocation = getAllocationOrThrow(allocationId);
        if (allocation.getWarehouse() == null || warehouseId == null
                || !allocation.getWarehouse().getId().equals(warehouseId)) {
            throw new SecurityException("This item isn't assigned to your warehouse.");
        }
    }

    private void requireStatus(StockAllocation allocation, AllocationStatus required, String actionDescription) {
        if (allocation.getStatus() != required) {
            throw new IllegalStateException(
                    "This item is currently " + allocation.getStatus() +
                    " and can't be " + actionDescription + " from that state.");
        }
    }
   @Transactional(readOnly = true)
public List<StockAllocationResponseDTO> getWarehouseQueue(
        Long warehouseId, AllocationStatus status) {

    return stockAllocationRepository
            .findByWarehouse_IdAndStatusOrderByAllocatedAtAsc(
                    warehouseId, status)
            .stream()
            .filter(allocation ->
                    allocation.getOrderItem() == null
                    || allocation.getOrderItem().getStatus() != OrderStatus.DELIVERED)
            .map(this::toAllocationDTO)
            .collect(Collectors.toList());
}

   @Transactional(readOnly = true)
public List<StockAllocationResponseDTO> getAllocationsForOrder(Long orderId) {

    List<StockAllocation> allocations =
            stockAllocationRepository.findByOrderItem_Order_IdOrderByIdAsc(orderId);

    List<StockAllocationResponseDTO> result = allocations.stream()
            .map(this::toAllocationDTO)
            .collect(Collectors.toList());

    /*
     * Historical orders may have been created before warehouse allocation
     * was introduced. Such orders have no StockAllocation rows, but their
     * OrderItems still contain the real status.
     *
     * Add a read-only synthetic fulfillment row for those items so the
     * admin page can still display their actual status.
     */
    List<OrderItem> orderItems = orderItemRepository.findByOrder_Id(orderId);

    for (OrderItem item : orderItems) {

        boolean alreadyHasAllocation = allocations.stream()
                .anyMatch(a -> a.getOrderItem() != null
                        && a.getOrderItem().getId().equals(item.getId()));

        if (alreadyHasAllocation) {
            continue;
        }

        // CONFIRMED (and CANCELLED) items with no allocation aren't
        // "historical" data — under manual-only allocation, CONFIRMED
        // with nothing allocated yet is the normal, expected state for
        // every brand-new order. Only fabricate a synthetic row for
        // items that somehow progressed PAST that point (PROCESSING,
        // SHIPPED, DELIVERED, RETURNED, REFUNDED) without ever getting a
        // real StockAllocation — i.e. genuinely old orders placed before
        // the warehouse system existed.
        if (item.getStatus() == OrderStatus.CONFIRMED || item.getStatus() == OrderStatus.CANCELLED) {
            continue;
        }

        StockAllocationResponseDTO dto =
                toHistoricalAllocationDTO(item);

        result.add(dto);
    }

    return result;
}
private StockAllocationResponseDTO toHistoricalAllocationDTO(OrderItem item) {

    StockAllocationResponseDTO dto = new StockAllocationResponseDTO();

    dto.setId(null);
    dto.setOrderId(item.getOrder().getId());
    dto.setOrderItemId(item.getId());
    dto.setProductName(item.getProductName());
    dto.setQuantity(item.getQuantity());

    /*
     * There is no warehouse for these historical records because no
     * StockAllocation existed when the order was processed.
     */
    dto.setWarehouseId(null);
    dto.setWarehouseName("Historical Order");

    OrderStatus orderStatus = item.getStatus();

    if (orderStatus == null) {
        dto.setStatus("UNKNOWN");
    } else {
        switch (orderStatus) {

            case DELIVERED:
                dto.setStatus("DELIVERED");
                break;

            case SHIPPED:
                dto.setStatus("READY_FOR_SHIPMENT");
                break;

            case PROCESSING:
                dto.setStatus("ALLOCATED");
                break;

            case CONFIRMED:
                dto.setStatus("ALLOCATED");
                break;

            case CANCELLED:
                dto.setStatus("CANCELLED");
                break;

            default:
                dto.setStatus(orderStatus.name());
                break;
        }
    }

    return dto;
}
    @Transactional(readOnly = true)
    public boolean isWarehouseManaged(Long orderItemId) {
        return stockAllocationRepository.findByOrderItem_Id(orderItemId).stream()
                .anyMatch(a -> a.getStatus() != AllocationStatus.CANCELLED);
    }

    @Transactional(readOnly = true)
    public List<StockMovementResponseDTO> getWarehouseMovements(Long warehouseId) {
        return stockMovementRepository.findByWarehouse_IdOrderByMovedAtDesc(warehouseId).stream()
                .map(this::toMovementDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<StockMovementResponseDTO> getOrderItemMovements(Long orderItemId) {
        return stockMovementRepository.findByOrderItem_IdOrderByMovedAtAsc(orderItemId).stream()
                .map(this::toMovementDTO)
                .collect(Collectors.toList());
    }

    // ---------------------------------------------------------------
    // Mapping helpers
    // ---------------------------------------------------------------

    private void logMovement(Warehouse warehouse, Product product, OrderItem orderItem,
                              String fromStage, String toStage, int quantity, String note) {
        StockMovement movement = new StockMovement();
        movement.setWarehouse(warehouse);
        movement.setProduct(product);
        movement.setOrderItem(orderItem);
        movement.setFromStage(fromStage);
        movement.setToStage(toStage);
        movement.setQuantity(quantity);
        movement.setNote(note);
        stockMovementRepository.save(movement);
    }

    private WarehouseResponseDTO toResponseDTO(Warehouse warehouse) {
        WarehouseResponseDTO dto = new WarehouseResponseDTO();
        dto.setId(warehouse.getId());
        dto.setName(warehouse.getName());
        dto.setLocation(warehouse.getLocation());
        dto.setContactPerson(warehouse.getContactPerson());
        dto.setPhone(warehouse.getPhone());
        dto.setActive(warehouse.isActive());
        dto.setCreatedAt(warehouse.getCreatedAt());

        List<WarehouseStock> stocks = warehouseStockRepository.findByWarehouse_IdOrderByProduct_NameAsc(warehouse.getId());
        dto.setDistinctProductCount(stocks.size());
        dto.setTotalAvailableStock(stocks.stream().mapToLong(WarehouseStock::getAvailableQuantity).sum());
        dto.setTotalAllocatedStock(stocks.stream().mapToLong(WarehouseStock::getAllocatedQuantity).sum());

        dto.setPendingPickCount(stockAllocationRepository.countByWarehouse_IdAndStatus(warehouse.getId(), AllocationStatus.ALLOCATED));
        dto.setPendingPackCount(stockAllocationRepository.countByWarehouse_IdAndStatus(warehouse.getId(), AllocationStatus.PICKED));
        dto.setPendingShipCount(stockAllocationRepository.countByWarehouse_IdAndStatus(warehouse.getId(), AllocationStatus.PACKED));
        return dto;
    }

    private WarehouseStockResponseDTO toStockDTO(WarehouseStock stock) {
        WarehouseStockResponseDTO dto = new WarehouseStockResponseDTO();
        dto.setId(stock.getId());
        dto.setWarehouseId(stock.getWarehouse().getId());
        dto.setWarehouseName(stock.getWarehouse().getName());
        dto.setProductId(stock.getProduct().getId());
        dto.setProductName(stock.getProduct().getName());
        dto.setAvailableQuantity(stock.getAvailableQuantity());
        dto.setAllocatedQuantity(stock.getAllocatedQuantity());
        dto.setDamagedQuantity(stock.getDamagedQuantity());
        return dto;
    }

   private StockAllocationResponseDTO toAllocationDTO(StockAllocation allocation) {

    StockAllocationResponseDTO dto = new StockAllocationResponseDTO();

    dto.setId(allocation.getId());
    dto.setOrderId(allocation.getOrderItem().getOrder().getId());
    dto.setOrderItemId(allocation.getOrderItem().getId());
    dto.setProductName(allocation.getOrderItem().getProductName());
    dto.setQuantity(allocation.getQuantity());

    dto.setWarehouseId(allocation.getWarehouse().getId());
    dto.setWarehouseName(allocation.getWarehouse().getName());

    /*
     * OrderItem is the source of truth for the final delivery state.
     *
     * This fixes historical records where:
     *
     * OrderItem = DELIVERED
     * Allocation = READY_FOR_SHIPMENT
     */
    if (allocation.getOrderItem().getStatus() == OrderStatus.DELIVERED) {
        dto.setStatus(AllocationStatus.DELIVERED.name());
    } else {
        dto.setStatus(allocation.getStatus().name());
    }

    dto.setAllocatedAt(allocation.getAllocatedAt());
    dto.setPickedAt(allocation.getPickedAt());
    dto.setPackedAt(allocation.getPackedAt());
    dto.setReadyAt(allocation.getReadyAt());
    return dto;
}
    private StockMovementResponseDTO toMovementDTO(StockMovement movement) {
        StockMovementResponseDTO dto = new StockMovementResponseDTO();
        dto.setId(movement.getId());
        dto.setWarehouseName(movement.getWarehouse().getName());
        dto.setProductName(movement.getProduct().getName());
        if (movement.getOrderItem() != null) {
            dto.setOrderItemId(movement.getOrderItem().getId());
            dto.setOrderId(movement.getOrderItem().getOrder().getId());
        }
        dto.setFromStage(movement.getFromStage());
        dto.setToStage(movement.getToStage());
        dto.setQuantity(movement.getQuantity());
        dto.setNote(movement.getNote());
        dto.setMovedAt(movement.getMovedAt());
        return dto;
    }
}