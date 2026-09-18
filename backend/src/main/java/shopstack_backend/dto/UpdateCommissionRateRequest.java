package shopstack_backend.dto;

public class UpdateCommissionRateRequest {

    // Percentage, 0-100. Null/absent clears the vendor override
    // and falls back to the platform default rate.
    private Double rate;

    public UpdateCommissionRateRequest() {
    }

    public Double getRate() {
        return rate;
    }

    public void setRate(Double rate) {
        this.rate = rate;
    }
}