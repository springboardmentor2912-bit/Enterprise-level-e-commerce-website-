package shopstack_backend.dto;

public class UpdateCommissionStatusRequest {

    // Expected: "CONFIRMED", "PAID", or "CANCELLED"
    private String status;

    public UpdateCommissionStatusRequest() {
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}