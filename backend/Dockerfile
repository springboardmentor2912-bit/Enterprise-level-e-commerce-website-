# ===================================================
# Stage 1: Build Stage (Maven + OpenJDK 21)
# ===================================================
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# Copy dependency definition first to leverage Docker layer caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy application source code and package executable JAR
COPY src ./src
RUN mvn clean package -DskipTests -B

# ===================================================
# Stage 2: Production Runtime Stage (Eclipse Temurin JRE 21)
# ===================================================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Install curl for container healthcheck
RUN apk add --no-cache curl tzdata

# Set timezone
ENV TZ=UTC

# Create directory for persistent product image uploads
RUN mkdir -p /app/uploads/products && chmod -R 777 /app/uploads

# Copy packaged JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Expose Spring Boot default port
EXPOSE 8080

# Configure JVM flags optimized for container environments
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

# Healthcheck configuration
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || curl -f http://localhost:8080/api/products || exit 1

# Start the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
