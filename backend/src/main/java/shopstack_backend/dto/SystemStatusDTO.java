package shopstack_backend.dto;

public class SystemStatusDTO {
    private String backendStatus;
    private String databaseStatus;
    private String razorpayStatus;
    private String activeTimestamp;

    public SystemStatusDTO() {}

    public SystemStatusDTO(String backendStatus, String databaseStatus, String razorpayStatus, String activeTimestamp) {
        this.backendStatus = backendStatus;
        this.databaseStatus = databaseStatus;
        this.razorpayStatus = razorpayStatus;
        this.activeTimestamp = activeTimestamp;
    }

    public String getBackendStatus() { return backendStatus; }
    public void setBackendStatus(String backendStatus) { this.backendStatus = backendStatus; }

    public String getDatabaseStatus() { return databaseStatus; }
    public void setDatabaseStatus(String databaseStatus) { this.databaseStatus = databaseStatus; }

    public String getRazorpayStatus() { return razorpayStatus; }
    public void setRazorpayStatus(String razorpayStatus) { this.razorpayStatus = razorpayStatus; }

    public String getActiveTimestamp() { return activeTimestamp; }
    public void setActiveTimestamp(String activeTimestamp) { this.activeTimestamp = activeTimestamp; }
}
