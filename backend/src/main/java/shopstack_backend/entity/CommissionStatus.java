package shopstack_backend.entity;

public enum CommissionStatus {
    // Order confirmed, commission recognized but not yet paid out to vendor
    CONFIRMED,

    // Vendor has been paid out for this commission (admin marks manually)
    PAID,
    CANCELLED
}