package com.nutriverify.service;

import com.nutriverify.exception.NutriVerifyException;
import com.nutriverify.model.User;
import com.nutriverify.model.UserProfile;
import com.nutriverify.repository.UserRepository;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

/**
 * Service managing user authentication, registration, and active session state.
 */
public class AuthService {
    private final UserRepository userRepository;
    private User currentUser;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User register(String username, String password, String fullName) {
        if (username == null || username.trim().length() < 3) {
            throw new NutriVerifyException("Username must be at least 3 characters long.");
        }
        if (password == null || password.length() < 4) {
            throw new NutriVerifyException("Password must be at least 4 characters long.");
        }
        if (userRepository.findByUsername(username.trim()).isPresent()) {
            throw new NutriVerifyException("Username '" + username + "' is already taken.");
        }

        String id = UUID.randomUUID().toString();
        String passHash = hashPassword(password);
        UserProfile profile = new UserProfile(fullName != null && !fullName.isBlank() ? fullName : username);
        User user = new User(id, username.trim(), passHash, LocalDateTime.now(), profile);
        
        userRepository.save(user);
        this.currentUser = user;
        return user;
    }

    public User login(String username, String password) {
        Optional<User> userOpt = userRepository.findByUsername(username.trim());
        if (userOpt.isEmpty()) {
            throw new NutriVerifyException("Invalid username or password.");
        }

        User user = userOpt.get();
        if (!user.getPasswordHash().equals(hashPassword(password))) {
            throw new NutriVerifyException("Invalid username or password.");
        }

        this.currentUser = user;
        return user;
    }

    public void logout() {
        this.currentUser = null;
    }

    public boolean isAuthenticated() {
        return currentUser != null;
    }

    public User getCurrentUser() {
        return currentUser;
    }

    public void updateUserProfile(UserProfile profile) {
        if (currentUser == null) {
            throw new NutriVerifyException("No active user session found.");
        }
        currentUser.setProfile(profile);
        userRepository.save(currentUser);
    }

    private String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new NutriVerifyException("Error securing password", e);
        }
    }
}
