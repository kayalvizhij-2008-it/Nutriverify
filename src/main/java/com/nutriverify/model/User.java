package com.nutriverify.model;

import java.time.LocalDateTime;

/**
 * Domain model representing an authenticated user in NutriVerify.
 */
public class User {
    private final String id;
    private final String username;
    private String passwordHash;
    private final LocalDateTime createdAt;
    private UserProfile profile;

    public User(String id, String username, String passwordHash, LocalDateTime createdAt, UserProfile profile) {
        this.id = id;
        this.username = username;
        this.passwordHash = passwordHash;
        this.createdAt = createdAt;
        this.profile = profile != null ? profile : new UserProfile(username);
    }

    public String getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public UserProfile getProfile() {
        return profile;
    }

    public void setProfile(UserProfile profile) {
        this.profile = profile;
    }

    @Override
    public String toString() {
        return "User{" +
                "id='" + id + '\'' +
                ", username='" + username + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}
