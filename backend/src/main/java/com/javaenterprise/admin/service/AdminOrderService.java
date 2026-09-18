package com.javaenterprise.admin.service;

import com.javaenterprise.order.entity.Order;
import com.javaenterprise.order.entity.OrderItem;
import com.javaenterprise.order.entity.OrderStatus;
import com.javaenterprise.order.entity.FulfillmentStatus;
import com.javaenterprise.order.repository.OrderRepository;
import com.javaenterprise.warehouse.entity.Warehouse;
import com.javaenterprise.warehouse.entity.WarehouseInventory;
import com.javaenterprise.warehouse.repository.WarehouseInventoryRepository;
import com.javaenterprise.warehouse.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminOrderService {

    private final OrderRepository orderRepository;
    private final WarehouseRepository warehouseRepository;
    private final WarehouseInventoryRepository warehouseInventoryRepository;

    public List<Map<String, Object>> getAllOrdersForAdmin() {
        List<Order> orders = orderRepository.findAllByOrderByOrderDateDesc();

        return orders.stream().map(order -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", order.getId());
            map.put("customerName", order.getUser().getName());
            map.put("totalAmount", order.getTotalAmount());
            map.put("status", order.getStatus().name());

            List<Map<String, Object>> itemsList = order.getItems().stream().map(item -> {
                Map<String, Object> itemMap = new HashMap<>();
                itemMap.put("id", item.getId());
                itemMap.put("productName", item.getProduct().getName());
                itemMap.put("quantity", item.getQuantity());
                itemMap.put("price", item.getPrice());
                itemMap.put("subtotal", item.getSubtotal());
                itemMap.put("fulfillmentStatus", item.getFulfillmentStatus() != null ? item.getFulfillmentStatus().name() : null);
                return itemMap;
            }).collect(Collectors.toList());

            map.put("items", itemsList);

            if (order.getItems() != null && !order.getItems().isEmpty()) {
                OrderItem firstItem = order.getItems().iterator().next();
                if (firstItem.getWarehouse() != null) {
                    Map<String, Object> wh = new HashMap<>();
                    wh.put("id", firstItem.getWarehouse().getId());
                    wh.put("name", firstItem.getWarehouse().getName());
                    map.put("warehouse", wh);
                } else {
                    map.put("warehouse", null);
                }
            } else {
                map.put("warehouse", null);
            }

            return map;
        }).collect(Collectors.toList());
    }

    @Transactional
    public void allocateOrderToWarehouse(Long orderId, Long warehouseId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Only PENDING orders can be allocated to a warehouse.");
        }

        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new RuntimeException("Warehouse not found"));

        for (OrderItem item : order.getItems()) {
            // 🆕 1. Try to find existing inventory, but DON'T throw an error if it's missing
            WarehouseInventory inventory = warehouseInventoryRepository
                    .findByProductIdAndWarehouseId(item.getProduct().getId(), warehouseId)
                    .orElse(null);

            // 🆕 2. If it doesn't exist, AUTO-CREATE it using the product's current stock!
            if (inventory == null) {
                inventory = new WarehouseInventory();
                inventory.setProduct(item.getProduct());
                inventory.setWarehouse(warehouse);
                inventory.setTotalStock(item.getProduct().getStock()); // Sync with product stock
                inventory.setAllocatedStock(0);
            }

            // 3. Check available stock
            int availableStock = inventory.getTotalStock() - inventory.getAllocatedStock();
            if (availableStock < item.getQuantity()) {
                throw new RuntimeException("Insufficient available stock in the selected warehouse for: " + item.getProduct().getName());
            }

            // 4. Assign warehouse and update status
            item.setWarehouse(warehouse);
            item.setFulfillmentStatus(FulfillmentStatus.ALLOCATED);

            // 5. Reserve the stock
            inventory.setAllocatedStock(inventory.getAllocatedStock() + item.getQuantity());
            warehouseInventoryRepository.save(inventory);
        }

        // 6. Move order to CONFIRMED
        order.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);
    }
}