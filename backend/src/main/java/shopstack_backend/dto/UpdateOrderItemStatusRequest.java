package shopstack_backend.dto;

public class UpdateOrderItemStatusRequest {

    private String status;

    public UpdateOrderItemStatusRequest() {}

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}