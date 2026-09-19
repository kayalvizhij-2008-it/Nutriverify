package com.nutriverify.exception;

/**
 * Raised when bundled datasets or data files cannot be loaded.
 */
public class DatasetLoadException extends NutriVerifyException {
    public DatasetLoadException(String message) {
        super(message);
    }

    public DatasetLoadException(String message, Throwable cause) {
        super(message, cause);
    }
}
