package shopstack_backend.dto;

public class QualityCheckRequestDTO {

    // "ACCEPTED" or "DAMAGED"
    private String result;
    private String note;

    public QualityCheckRequestDTO() {}

    public String getResult() { return result; }
    public void setResult(String result) { this.result = result; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}