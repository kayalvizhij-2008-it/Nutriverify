package com.nutriverify.exception;

/**
 * Base unchecked runtime exception for NutriVerify application failures.
 */
public class NutriVerifyException extends RuntimeException {
    public NutriVerifyException(String message) {
        super(message);
    }

    public NutriVerifyException(String message, Throwable cause) {
        super(message, cause);
    }
}
