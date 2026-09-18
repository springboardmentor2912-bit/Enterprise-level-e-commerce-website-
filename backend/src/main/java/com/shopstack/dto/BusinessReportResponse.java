package com.shopstack.dto;

import java.util.List;
import java.util.Map;

public class BusinessReportResponse {
    private String reportType;
    private String title;
    private String subtitle;
    private String generatedAt;
    private String dateRange;
    private Map<String, Object> summaryMetrics;
    private List<ReportColumn> columns;
    private List<Map<String, Object>> rows;

    public BusinessReportResponse() {}

    public BusinessReportResponse(String reportType, String title, String subtitle, String generatedAt,
                                  String dateRange, Map<String, Object> summaryMetrics,
                                  List<ReportColumn> columns, List<Map<String, Object>> rows) {
        this.reportType = reportType;
        this.title = title;
        this.subtitle = subtitle;
        this.generatedAt = generatedAt;
        this.dateRange = dateRange;
        this.summaryMetrics = summaryMetrics;
        this.columns = columns;
        this.rows = rows;
    }

    public String getReportType() { return reportType; }
    public void setReportType(String reportType) { this.reportType = reportType; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSubtitle() { return subtitle; }
    public void setSubtitle(String subtitle) { this.subtitle = subtitle; }

    public String getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(String generatedAt) { this.generatedAt = generatedAt; }

    public String getDateRange() { return dateRange; }
    public void setDateRange(String dateRange) { this.dateRange = dateRange; }

    public Map<String, Object> getSummaryMetrics() { return summaryMetrics; }
    public void setSummaryMetrics(Map<String, Object> summaryMetrics) { this.summaryMetrics = summaryMetrics; }

    public List<ReportColumn> getColumns() { return columns; }
    public void setColumns(List<ReportColumn> columns) { this.columns = columns; }

    public List<Map<String, Object>> getRows() { return rows; }
    public void setRows(List<Map<String, Object>> rows) { this.rows = rows; }

    public static class ReportColumn {
        private String key;
        private String label;
        private String type; // "text", "currency", "number", "badge", "date"

        public ReportColumn() {}
        public ReportColumn(String key, String label, String type) {
            this.key = key;
            this.label = label;
            this.type = type;
        }

        public String getKey() { return key; }
        public void setKey(String key) { this.key = key; }

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
    }
}
