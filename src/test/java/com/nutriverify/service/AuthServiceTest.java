package com.nutriverify.service;

import com.nutriverify.exception.NutriVerifyException;
import com.nutriverify.model.User;
import com.nutriverify.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class AuthServiceTest {

    private AuthService authService;

    @BeforeEach
    public void setUp() {
        UserRepository userRepository = new UserRepository();
        authService = new AuthService(userRepository);
    }

    @Test
    public void testUserRegistrationAndLogin() {
        String testUser = "testuser_" + System.currentTimeMillis();
        User user = authService.register(testUser, "secret123", "Test User");

        assertNotNull(user);
        assertEquals(testUser, user.getUsername());
        assertTrue(authService.isAuthenticated());

        authService.logout();
        assertFalse(authService.isAuthenticated());

        User loggedIn = authService.login(testUser, "secret123");
        assertNotNull(loggedIn);
        assertTrue(authService.isAuthenticated());
    }

    @Test
    public void testInvalidPasswordRejection() {
        String testUser = "testuser_" + System.currentTimeMillis();
        authService.register(testUser, "correctPass", "Test User");
        authService.logout();

        assertThrows(NutriVerifyException.class, () -> {
            authService.login(testUser, "wrongPass");
        });
    }
}
