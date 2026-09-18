package shopstack_backend.dto;

public class RazorpayOrderResponseDTO {

    private String razorpayOrderId;
    private String keyId;      // public key, safe to send to frontend
    private long amountInPaise;
    private String currency;

    public RazorpayOrderResponseDTO() {}

    public RazorpayOrderResponseDTO(String razorpayOrderId, String keyId, long amountInPaise, String currency) {
        this.razorpayOrderId = razorpayOrderId;
        this.keyId = keyId;
        this.amountInPaise = amountInPaise;
        this.currency = currency;
    }

    public String getRazorpayOrderId() {
        return razorpayOrderId;
    }

    public void setRazorpayOrderId(String razorpayOrderId) {
        this.razorpayOrderId = razorpayOrderId;
    }

    public String getKeyId() {
        return keyId;
    }

    public void setKeyId(String keyId) {
        this.keyId = keyId;
    }

    public long getAmountInPaise() {
        return amountInPaise;
    }

    public void setAmountInPaise(long amountInPaise) {
        this.amountInPaise = amountInPaise;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }
}