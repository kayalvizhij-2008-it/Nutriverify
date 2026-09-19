package com.nutriverify.repository;

import com.nutriverify.config.AppConfig;
import com.nutriverify.exception.DatasetLoadException;
import com.nutriverify.model.User;
import com.nutriverify.model.UserProfile;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * File-backed repository managing user persistence.
 */
public class UserRepository {
    private static final String USERS_FILE = "data/users.csv";
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    public UserRepository() {
        ensureDataFileExists();
    }

    private void ensureDataFileExists() {
        try {
            Path path = Paths.get(USERS_FILE);
            if (!Files.exists(path)) {
                if (path.getParent() != null) {
                    Files.createDirectories(path.getParent());
                }
                Files.createFile(path);
            }
        } catch (IOException e) {
            throw new DatasetLoadException("Failed to initialize user storage file: " + e.getMessage(), e);
        }
    }

    public List<User> findAll() {
        List<User> users = new ArrayList<>();
        Path path = Paths.get(USERS_FILE);
        if (!Files.exists(path)) {
            return users;
        }

        try (BufferedReader reader = Files.newBufferedReader(path, StandardCharsets.UTF_8)) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.isBlank() || line.startsWith("#")) continue;
                String[] parts = line.split(";", -1);
                if (parts.length >= 6) {
                    String id = parts[0];
                    String username = parts[1];
                    String passHash = parts[2];
                    LocalDateTime createdAt = LocalDateTime.parse(parts[3], FORMATTER);
                    String fullName = parts[4];
                    int scanCount = Integer.parseInt(parts[5]);
                    
                    List<String> goals = parts.length > 6 && !parts[6].isEmpty() ? Arrays.asList(parts[6].split(",")) : new ArrayList<>();
                    List<String> allergens = parts.length > 7 && !parts[7].isEmpty() ? Arrays.asList(parts[7].split(",")) : new ArrayList<>();

                    UserProfile profile = new UserProfile(fullName, goals, allergens, scanCount);
                    users.add(new User(id, username, passHash, createdAt, profile));
                }
            }
        } catch (IOException e) {
            throw new DatasetLoadException("Failed to load users from file: " + e.getMessage(), e);
        }
        return users;
    }

    public Optional<User> findByUsername(String username) {
        return findAll().stream()
                .filter(u -> u.getUsername().equalsIgnoreCase(username))
                .findFirst();
    }

    public User save(User user) {
        List<User> existing = findAll();
        boolean updated = false;
        for (int i = 0; i < existing.size(); i++) {
            if (existing.get(i).getUsername().equalsIgnoreCase(user.getUsername())) {
                existing.set(i, user);
                updated = true;
                break;
            }
        }
        if (!updated) {
            existing.add(user);
        }
        rewriteAll(existing);
        return user;
    }

    private void rewriteAll(List<User> users) {
        Path path = Paths.get(USERS_FILE);
        try (BufferedWriter writer = Files.newBufferedWriter(path, StandardCharsets.UTF_8, 
                StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING)) {
            for (User user : users) {
                UserProfile p = user.getProfile();
                String goalsStr = String.join(",", p.getDietaryGoals());
                String allergensStr = String.join(",", p.getAllergens());
                
                String line = String.join(";",
                        user.getId(),
                        user.getUsername(),
                        user.getPasswordHash(),
                        user.getCreatedAt().format(FORMATTER),
                        p.getFullName() != null ? p.getFullName() : user.getUsername(),
                        String.valueOf(p.getTotalScansPerformed()),
                        goalsStr,
                        allergensStr
                );
                writer.write(line);
                writer.newLine();
            }
        } catch (IOException e) {
            throw new DatasetLoadException("Failed to save user records: " + e.getMessage(), e);
        }
    }
}
