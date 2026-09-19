package com.nutriverify.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * JPA entity for authenticated users.
 */
@Entity
@Table(name = "users")
public class UserEntity {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false, unique = true, length = 100)
    private String username;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    // Profile fields
    @Column(length = 200)
    private String fullName;

    private int totalScansPerformed;

    @ElementCollection
    @CollectionTable(name = "user_dietary_goals", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "goal")
    private List<String> dietaryGoals = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "user_allergens", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "allergen")
    private List<String> allergens = new ArrayList<>();

    @Column(length = 10)
    private String preferredLanguage = "en";

    @Column(length = 20)
    private String theme = "light";

    public UserEntity() {}

    public UserEntity(String id, String username, String passwordHash, LocalDateTime createdAt) {
        this.id = id;
        this.username = username;
        this.passwordHash = passwordHash;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public int getTotalScansPerformed() { return totalScansPerformed; }
    public void setTotalScansPerformed(int totalScansPerformed) { this.totalScansPerformed = totalScansPerformed; }
    public List<String> getDietaryGoals() { return dietaryGoals; }
    public void setDietaryGoals(List<String> dietaryGoals) { this.dietaryGoals = dietaryGoals; }
    public List<String> getAllergens() { return allergens; }
    public void setAllergens(List<String> allergens) { this.allergens = allergens; }
    public String getPreferredLanguage() { return preferredLanguage; }
    public void setPreferredLanguage(String preferredLanguage) { this.preferredLanguage = preferredLanguage; }
    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }
}
