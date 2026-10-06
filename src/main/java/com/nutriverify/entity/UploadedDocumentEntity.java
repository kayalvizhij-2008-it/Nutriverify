package com.nutriverify.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * JPA entity for uploaded documents (images/PDFs).
 */
@Entity
@Table(name = "uploaded_documents")
public class UploadedDocumentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 36)
    private String userId;

    @Column(nullable = false, length = 200)
    private String originalFilename;

    @Column(length = 100)
    private String contentType;

    private long fileSize;

    @Column(length = 500)
    private String filePath;

    @Column(length = 50)
    private String status; // RECEIVED, PROCESSING, COMPLETED, FAILED

    @Column(columnDefinition = "TEXT")
    private String extractedText;

    @Column(columnDefinition = "TEXT")
    private String extractedData; // JSON - the OCR/vision extracted structured data

    private double imageQualityScore;

    @Column(length = 200)
    private String imageQualityNotes;

    @Column(nullable = false)
    private LocalDateTime uploadedAt;

    private LocalDateTime processedAt;

    public UploadedDocumentEntity() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getOriginalFilename() { return originalFilename; }
    public void setOriginalFilename(String originalFilename) { this.originalFilename = originalFilename; }
    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }
    public long getFileSize() { return fileSize; }
    public void setFileSize(long fileSize) { this.fileSize = fileSize; }
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getExtractedText() { return extractedText; }
    public void setExtractedText(String extractedText) { this.extractedText = extractedText; }
    public String getExtractedData() { return extractedData; }
    public void setExtractedData(String extractedData) { this.extractedData = extractedData; }
    public double getImageQualityScore() { return imageQualityScore; }
    public void setImageQualityScore(double imageQualityScore) { this.imageQualityScore = imageQualityScore; }
    public String getImageQualityNotes() { return imageQualityNotes; }
    public void setImageQualityNotes(String imageQualityNotes) { this.imageQualityNotes = imageQualityNotes; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
    public LocalDateTime getProcessedAt() { return processedAt; }
    public void setProcessedAt(LocalDateTime processedAt) { this.processedAt = processedAt; }
}
