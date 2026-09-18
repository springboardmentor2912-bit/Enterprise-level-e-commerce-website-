# Stage 1: Build (Updated to Java 21)
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# 1. Copy pom.xml and pre-fetch dependencies
COPY pom.xml .
RUN mvn dependency:resolve -B -Dmaven.wagon.http.retryHandler.count=5 -Dhttp.keepAlive=false

# 2. Copy source code and package application
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Run (Updated to Java 21 JRE)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]