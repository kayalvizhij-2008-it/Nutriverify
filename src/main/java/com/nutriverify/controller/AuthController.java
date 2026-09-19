package com.nutriverify.controller;

import com.nutriverify.dto.AuthRequest;
import com.nutriverify.dto.AuthResponse;
import com.nutriverify.service.WebAuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication controller for registration and login.
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final WebAuthService authService;

    public AuthController(WebAuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        // JWT is stateless - client discards token
        return ResponseEntity.ok().build();
    }
}
