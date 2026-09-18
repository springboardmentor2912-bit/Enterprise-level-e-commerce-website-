package shopstack_backend.entity;

public enum OrderStatus {
    PENDING,
    CONFIRMED,
    PROCESSING,
    SHIPPED,
    DELIVERED,
    CANCELLED,
    RETURNED,
    REFUNDED;

    void recomputeOrderStatus(Order order) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'recomputeOrderStatus'");
    }
}