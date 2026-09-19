package com.nutriverify.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class JwtTokenProviderTest {

    private JwtTokenProvider tokenProvider;

    @BeforeEach
    public void setUp() {
        tokenProvider = new JwtTokenProvider("testSecretKeyForTestingOnlyThatIsLongEnoughForHS256!!", 3600000);
    }

    @Test
    public void testGenerateAndValidateToken() {
        String token = tokenProvider.generateToken("user123", "testuser");
        assertNotNull(token);
        assertFalse(token.isEmpty());
        assertTrue(tokenProvider.validateToken(token));
    }

    @Test
    public void testExtractUsername() {
        String token = tokenProvider.generateToken("user123", "testuser");
        String username = tokenProvider.getUsernameFromToken(token);
        assertEquals("testuser", username);
    }

    @Test
    public void testExtractUserId() {
        String token = tokenProvider.generateToken("user123", "testuser");
        String userId = tokenProvider.getUserIdFromToken(token);
        assertEquals("user123", userId);
    }

    @Test
    public void testInvalidToken() {
        assertFalse(tokenProvider.validateToken("invalid.token.here"));
    }

    @Test
    public void testEmptyToken() {
        assertFalse(tokenProvider.validateToken(""));
    }

    @Test
    public void testNullToken() {
        assertFalse(tokenProvider.validateToken(null));
    }

    @Test
    public void testDifferentUsersDifferentTokens() {
        String token1 = tokenProvider.generateToken("user1", "alice");
        String token2 = tokenProvider.generateToken("user2", "bob");
        assertNotEquals(token1, token2);
        assertEquals("alice", tokenProvider.getUsernameFromToken(token1));
        assertEquals("bob", tokenProvider.getUsernameFromToken(token2));
    }

    @Test
    public void testTokenHasCorrectClaims() {
        String token = tokenProvider.generateToken("user42", "charlie");
        assertEquals("charlie", tokenProvider.getUsernameFromToken(token));
        assertEquals("user42", tokenProvider.getUserIdFromToken(token));
    }
}
