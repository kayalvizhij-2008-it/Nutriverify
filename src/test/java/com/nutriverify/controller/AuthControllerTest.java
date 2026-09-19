package com.nutriverify.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nutriverify.dto.AuthRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testRegisterSuccess() throws Exception {
        AuthRequest request = new AuthRequest("testuser_" + System.currentTimeMillis(), "pass1234");
        request.setFullName("Test User");

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.username").value(request.getUsername()));
    }

    @Test
    void testRegisterDuplicateUsername() throws Exception {
        String username = "dupuser_" + System.currentTimeMillis();
        AuthRequest request = new AuthRequest(username, "pass1234");
        request.setFullName("Test User");

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testLoginSuccess() throws Exception {
        String username = "logintest_" + System.currentTimeMillis();
        AuthRequest registerReq = new AuthRequest(username, "pass1234");
        registerReq.setFullName("Login Test");
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerReq)));

        AuthRequest loginReq = new AuthRequest(username, "pass1234");
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    void testLoginInvalidCredentials() throws Exception {
        AuthRequest request = new AuthRequest("nonexistent_user_" + System.currentTimeMillis(), "wrongpass");
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andReturn();
        int status = result.getResponse().getStatus();
        assertTrue(status == 401 || status == 400, "Expected 401 or 400 but got " + status);
    }

    @Test
    void testRegisterValidationTooShortUsername() throws Exception {
        AuthRequest request = new AuthRequest("ab", "pass1234");
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testRegisterValidationEmptyPassword() throws Exception {
        AuthRequest request = new AuthRequest("validuser_" + System.currentTimeMillis(), "");
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testLogout() throws Exception {
        mockMvc.perform(post("/api/v1/auth/logout"))
                .andExpect(status().isOk());
    }

    @Test
    void testHealthCheck() throws Exception {
        mockMvc.perform(get("/api/v1/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.application").value("NutriVerify"));
    }

    @Test
    void testProtectedEndpointWithoutToken() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/v1/profile"))
                .andReturn();
        int status = result.getResponse().getStatus();
        assertTrue(status == 401 || status == 403, "Expected 401 or 403 but got " + status);
    }

    @Test
    void testAnalyzeEndpointWithoutToken() throws Exception {
        String analyzeJson = """
                {
                    "productName": "Test Product",
                    "brand": "Test Brand",
                    "servingSize": "100g",
                    "calories": 200,
                    "fat": 5,
                    "sugar": 10,
                    "sodium": 200,
                    "protein": 8,
                    "carbs": 30,
                    "fiber": 2
                }
                """;

        MvcResult result = mockMvc.perform(post("/api/v1/analyze")
                .contentType(MediaType.APPLICATION_JSON)
                .content(analyzeJson))
                .andReturn();
        int status = result.getResponse().getStatus();
        assertTrue(status == 401 || status == 403, "Expected 401 or 403 but got " + status);
    }
}
