package com.shopstack.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class DatabaseConfig {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${spring.datasource.url}")
    private String rawUrl;

    @Value("${spring.datasource.username}")
    private String username;

    @Value("${spring.datasource.password}")
    private String password;

    @Value("${spring.datasource.driver-class-name:org.postgresql.Driver}")
    private String driverClassName;

    @Bean
    public DataSource dataSource() {
        String url = rawUrl != null ? rawUrl.trim() : "";

        // 1. Normalize Render / Neon URI schemes (postgres:// or postgresql:// -> jdbc:postgresql://)
        if (url.startsWith("postgres://")) {
            url = "jdbc:postgresql://" + url.substring("postgres://".length());
        } else if (url.startsWith("postgresql://")) {
            url = "jdbc:postgresql://" + url.substring("postgresql://".length());
        }

        // 2. Ensure cloud connections (Neon / Render Postgres) include sslmode=require if not specified
        if (!url.contains("localhost") && !url.contains("127.0.0.1") && !url.contains("sslmode=")) {
            url += (url.contains("?") ? "&" : "?") + "sslmode=require";
        }

        logger.info("Configured DataSource with JDBC URL: {}", sanitizeUrlForLogging(url));

        HikariConfig hikariConfig = new HikariConfig();
        hikariConfig.setJdbcUrl(url);
        hikariConfig.setUsername(username);
        hikariConfig.setPassword(password);
        hikariConfig.setDriverClassName(driverClassName);
        hikariConfig.setConnectionInitSql("SELECT 1");

        return new HikariDataSource(hikariConfig);
    }

    private String sanitizeUrlForLogging(String url) {
        if (url == null) return "";
        return url.replaceAll(":[^/@]+@", ":****@");
    }
}
