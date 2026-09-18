package com.javaenterprise.warehouse.service;

import com.javaenterprise.order.entity.FulfillmentStatus;
import com.javaenterprise.order.entity.Order;
import com.javaenterprise.order.entity.OrderItem;
import com.javaenterprise.order.entity.OrderStatus;
import com.javaenterprise.order.repository.OrderItemRepository;
import com.javaenterprise.order.repository.OrderRepository; // 🆕 Added
import com.javaenterprise.user.entity.User;
import com.javaenterprise.user.repository.UserRepository;
import com.javaenterprise.warehouse.entity.WarehouseInventory;
import com.javaenterprise.warehouse.repository.WarehouseInventoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class WarehouseFulfillmentService {

    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final WarehouseInventoryRepository inventoryRepository;
    private final OrderRepository orderRepository; // 🆕 Added

    @Transactional
    public OrderItem pickItem(Long orderItemId, Authentication auth) {
        User staff = userRepository.findByEmail(auth.getName()).orElseThrow();
        OrderItem item = getOrderItemAndVerifyWarehouse(orderItemId, staff);

        if (item.getFulfillmentStatus() != FulfillmentStatus.ALLOCATED) {
            throw new RuntimeException("Item must be in ALLOCATED status to be picked.");
        }
        item.setFulfillmentStatus(FulfillmentStatus.PICKED);
        return orderItemRepository.save(item);
    }

    @Transactional
    public OrderItem packItem(Long orderItemId, Authentication auth) {
        User staff = userRepository.findByEmail(auth.getName()).orElseThrow();
        OrderItem item = getOrderItemAndVerifyWarehouse(orderItemId, staff);

        if (item.getFulfillmentStatus() != FulfillmentStatus.PICKED) {
            throw new RuntimeException("Item must be in PICKED status to be packed.");
        }

        // Deduct from physical inventory when packed
        WarehouseInventory inv = inventoryRepository.findByProductIdAndWarehouseId(
                item.getProduct().getId(), item.getWarehouse().getId()).orElseThrow();
        inv.setTotalStock(inv.getTotalStock() - item.getQuantity());
        inv.setAllocatedStock(inv.getAllocatedStock() - item.getQuantity());
        inventoryRepository.save(inv);

        item.setFulfillmentStatus(FulfillmentStatus.PACKED);
        return orderItemRepository.save(item);
    }

    @Transactional
    public OrderItem readyForShipment(Long orderItemId, Authentication auth) {
        User staff = userRepository.findByEmail(auth.getName()).orElseThrow();
        OrderItem item = getOrderItemAndVerifyWarehouse(orderItemId, staff);

        if (item.getFulfillmentStatus() != FulfillmentStatus.PACKED) {
            throw new RuntimeException("Item must be in PACKED status to be marked ready.");
        }

        item.setFulfillmentStatus(FulfillmentStatus.READY_FOR_SHIPMENT);
        orderItemRepository.save(item);

        // 🆕 Also update the main Order status to SHIPPED so the Vendor sees it!
        Order order = item.getOrder();
        order.setStatus(OrderStatus.SHIPPED);
        orderRepository.save(order);

        return item;
    }

    private OrderItem getOrderItemAndVerifyWarehouse(Long orderItemId, User staff) {
        OrderItem item = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new RuntimeException("Order item not found"));

        if (staff.getWarehouse() == null || !staff.getWarehouse().getId().equals(item.getWarehouse().getId())) {
            throw new RuntimeException("Access denied: This item is not in your warehouse.");
        }
        return item;
    }
}