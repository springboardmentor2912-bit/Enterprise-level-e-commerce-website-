package shopstack_backend.dto;

public class PlaceCodOrderRequest {

    private Long addressId;
    private String couponCode; // nullable

    public PlaceCodOrderRequest() {}

    public Long getAddressId() {
        return addressId;
    }

    public void setAddressId(Long addressId) {
        this.addressId = addressId;
    }

    public String getCouponCode() {
        return couponCode;
    }

    public void setCouponCode(String couponCode) {
        this.couponCode = couponCode;
    }
}