# Multi-stage Dockerfile for NutriVerify Spring Boot Backend
FROM maven:3.9.9-eclipse-temurin-17-alpine AS builder

WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests -B

# Production Runtime Image
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Non-root user for production security
RUN addgroup -S nutriverify && adduser -S nutriverify -G nutriverify
USER nutriverify:nutriverify

COPY --from=builder /app/target/*.jar app.jar

ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=prod

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/api/v1/health || exit 1

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
