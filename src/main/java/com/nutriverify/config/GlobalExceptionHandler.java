package com.nutriverify.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Global exception handler for consistent error responses.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, Object> error = new LinkedHashMap<>();
        error.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        error.put("status", 400);
        error.put("error", "Validation Failed");
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(fe.getField(), fe.getDefaultMessage());
        }
        error.put("fieldErrors", fieldErrors);
        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler({RuntimeException.class})
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        String message = mapExceptionMessage(ex.getMessage());
        Map<String, Object> error = new LinkedHashMap<>();
        error.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        error.put("status", 400);
        error.put("error", message);

        if (ex instanceof BadCredentialsException || ex instanceof UsernameNotFoundException) {
            error.put("status", 401);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneral(Exception ex) {
        Map<String, Object> error = new LinkedHashMap<>();
        error.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        error.put("status", 500);
        error.put("error", "An unexpected error occurred. Please try again.");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    private String mapExceptionMessage(String message) {
        if (message == null) return "An unexpected error occurred";
        if (message.contains("already taken")) return "This username is already registered";
        if (message.contains("Invalid username or password")) return "Invalid username or password";
        if (message.contains("not found")) return "The requested resource was not found";
        if (message.contains("Username")) return "Username must be at least 3 characters";
        if (message.contains("Password")) return "Password must be at least 4 characters";
        return message;
    }
}
