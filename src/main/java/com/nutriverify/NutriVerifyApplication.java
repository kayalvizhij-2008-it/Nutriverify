package com.nutriverify;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * Spring Boot application entry point for NutriVerify.
 * The legacy CLI entry point (com.nutriverify.Main) is preserved for development/testing.
 */
@SpringBootApplication
@EntityScan(basePackages = "com.nutriverify.entity")
@EnableJpaRepositories(basePackages = "com.nutriverify.data")
public class NutriVerifyApplication {

    public static void main(String[] args) {
        SpringApplication.run(NutriVerifyApplication.class, args);
    }
}
