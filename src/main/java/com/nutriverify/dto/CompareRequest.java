package com.nutriverify.dto;

import jakarta.validation.constraints.NotNull;

/**
 * DTO for product comparison request.
 */
public class CompareRequest {
    @NotNull(message = "First analysis ID is required")
    private Long firstHistoryId;

    @NotNull(message = "Second analysis ID is required")
    private Long secondHistoryId;

    public Long getFirstHistoryId() { return firstHistoryId; }
    public void setFirstHistoryId(Long firstHistoryId) { this.firstHistoryId = firstHistoryId; }
    public Long getSecondHistoryId() { return secondHistoryId; }
    public void setSecondHistoryId(Long secondHistoryId) { this.secondHistoryId = secondHistoryId; }
}
