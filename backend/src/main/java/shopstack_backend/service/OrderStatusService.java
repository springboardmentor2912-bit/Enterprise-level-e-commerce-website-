package shopstack_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import shopstack_backend.entity.Order;
import shopstack_backend.entity.OrderItem;
import shopstack_backend.entity.OrderStatus;
import shopstack_backend.repository.OrderRepository;

import java.util.Arrays;
import java.util.List;

/**
 * Recomputes an Order's overall status from its items' individual statuses.
 * Pulled out of OrderService into its own bean (depending on nothing but
 * OrderRepository) so that WarehouseService — which OrderService already
 * depends on — can also trigger a recompute after auto-advancing an item's
 * status (e.g. PROCESSING on allocation, SHIPPED on ready-for-shipment)
 * without creating a circular OrderService <-> WarehouseService dependency.
 */
@Service
public class OrderStatusService {

    private static final List<OrderStatus> PROGRESSION = Arrays.asList(
            OrderStatus.PENDING,
            OrderStatus.CONFIRMED,
            OrderStatus.PROCESSING,
            OrderStatus.SHIPPED,
            OrderStatus.DELIVERED
    );

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private EmailService emailService;

    @Transactional
    public void recomputeOrderStatus(Order order) {
        List<OrderItem> items = order.getItems();
        if (items == null || items.isEmpty()) return;
        // Captured before any setStatus() call below so we can tell whether
        // this recompute actually crossed into SHIPPED/DELIVERED for the
        // first time — recompute can be called repeatedly (e.g. once per
        // item update), and we only want one email per real transition.
        OrderStatus previousStatus = order.getStatus();
        OrderStatus least = null;
        for (OrderItem item : items) {
            OrderStatus s = item.getStatus();
            if (s == OrderStatus.CANCELLED || s == OrderStatus.RETURNED || s == OrderStatus.REFUNDED) {
                continue; // handled below, once every item has left the main progression
            }
            int idx = PROGRESSION.indexOf(s);
            if (idx == -1) continue;
            if (least == null || idx < PROGRESSION.indexOf(least)) {
                least = s;
            }
        }

        if (least != null) {
            // At least one item is still moving through the normal
            // PENDING -> DELIVERED progression — the order tracks that.
            order.setStatus(least);
            orderRepository.save(order);
            notifyOnTransition(order, previousStatus, least);
            return;
        }

        // Every item has left the normal progression: each one is now
        // CANCELLED, RETURNED, or REFUNDED. Reflect the overall outcome
        // on the order itself instead of leaving its status stale.
        boolean allCancelled = items.stream().allMatch(i -> i.getStatus() == OrderStatus.CANCELLED);
        if (allCancelled) {
            order.setStatus(OrderStatus.CANCELLED);
        } else {
            boolean anyReturnedOrRefunded = items.stream()
                    .anyMatch(i -> i.getStatus() == OrderStatus.RETURNED || i.getStatus() == OrderStatus.REFUNDED);
            if (anyReturnedOrRefunded) {
                // REFUNDED only once every non-cancelled item has actually
                // had its refund processed; otherwise RETURNED (goods are
                // back / QC'd, but at least one refund is still pending).
                boolean allRefundedOrCancelled = items.stream()
                        .allMatch(i -> i.getStatus() == OrderStatus.REFUNDED || i.getStatus() == OrderStatus.CANCELLED);
                order.setStatus(allRefundedOrCancelled ? OrderStatus.REFUNDED : OrderStatus.RETURNED);
            }
        }
        orderRepository.save(order);
    }

    // Sends the Order Shipped / Order Delivered emails, but only on the
    // actual PENDING/CONFIRMED/... -> SHIPPED/DELIVERED transition — not on
    // every recompute (this method can be called several times per item as
    // it moves through the pipeline, and would otherwise re-send).
    private void notifyOnTransition(Order order, OrderStatus previousStatus, OrderStatus newStatus) {
        if (previousStatus == newStatus) {
            return;
        }
        if (newStatus == OrderStatus.SHIPPED) {
            emailService.sendOrderShippedEmail(order);
        } else if (newStatus == OrderStatus.DELIVERED) {
            emailService.sendOrderDeliveredEmail(order);
        }
    }
}