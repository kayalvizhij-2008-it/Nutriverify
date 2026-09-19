package com.nutriverify.dto;

public class ClaimDto {
    private String type;
    private String displayText;

    public ClaimDto() {}

    public ClaimDto(String type, String displayText) {
        this.type = type;
        this.displayText = displayText;
    }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getDisplayText() { return displayText; }
    public void setDisplayText(String displayText) { this.displayText = displayText; }
}
