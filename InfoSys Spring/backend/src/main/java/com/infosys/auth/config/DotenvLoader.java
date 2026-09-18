package com.infosys.auth.config;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * Lightweight, zero-dependency .env file loader for Spring Boot.
 * Reads KEY=VALUE pairs from .env and populates System.getProperties(),
 * making them immediately available to application.properties and @Value annotations.
 */
public class DotenvLoader {

    public static void load() {
        List<String> candidatePaths = Arrays.asList(
            ".env",
            "backend/.env",
            "../.env",
            "../backend/.env"
        );

        boolean loaded = false;
        for (String path : candidatePaths) {
            File file = new File(path);
            if (file.exists() && file.isFile()) {
                System.out.println("[DotenvLoader] Loading environment variables from: " + file.getAbsolutePath());
                loadFromFile(file);
                loaded = true;
                break;
            }
        }

        if (!loaded) {
            System.out.println("[DotenvLoader] No .env file found in standard locations. Using system environment / default properties.");
        }

        normalizeDatabaseUrl();
    }

    private static void normalizeDatabaseUrl() {
        String dbUrl = System.getProperty("DB_URL");
        if (dbUrl == null || dbUrl.isBlank()) {
            dbUrl = System.getenv("DB_URL");
        }
        if (dbUrl == null || dbUrl.isBlank()) {
            dbUrl = System.getProperty("DATABASE_URL");
            if (dbUrl == null || dbUrl.isBlank()) {
                dbUrl = System.getenv("DATABASE_URL");
            }
        }

        if (dbUrl == null || dbUrl.isBlank()) {
            return;
        }

        String url = dbUrl.trim();
        if (url.startsWith("postgres://") || url.startsWith("postgresql://") || url.startsWith("jdbc:postgresql://") || url.startsWith("jdbc:postgres://")) {
            String stripped = url;
            if (stripped.startsWith("jdbc:")) {
                stripped = stripped.substring(5);
            }

            int schemeIdx = stripped.indexOf("://");
            if (schemeIdx != -1) {
                String afterScheme = stripped.substring(schemeIdx + 3);
                int atIdx = afterScheme.indexOf('@');
                if (atIdx != -1) {
                    String userPass = afterScheme.substring(0, atIdx);
                    String hostAndRest = afterScheme.substring(atIdx + 1);

                    int colonIdx = userPass.indexOf(':');
                    if (colonIdx != -1) {
                        String user = userPass.substring(0, colonIdx);
                        String pass = userPass.substring(colonIdx + 1);
                        if (System.getProperty("DB_USERNAME") == null && System.getenv("DB_USERNAME") == null) {
                            System.setProperty("DB_USERNAME", user);
                        }
                        if (System.getProperty("DB_PASSWORD") == null && System.getenv("DB_PASSWORD") == null) {
                            System.setProperty("DB_PASSWORD", pass);
                        }
                    }

                    url = "jdbc:postgresql://" + hostAndRest;
                } else if (!url.startsWith("jdbc:")) {
                    url = "jdbc:postgresql://" + afterScheme;
                }
            }
        }

        System.setProperty("DB_URL", url);
    }

    private static void loadFromFile(File file) {
        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                // Ignore empty lines and comments
                if (line.isEmpty() || line.startsWith("#")) {
                    continue;
                }

                int sep = line.indexOf('=');
                if (sep > 0) {
                    String key = line.substring(0, sep).trim();
                    String val = line.substring(sep + 1).trim();

                    // Strip surrounding quotes if present
                    if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
                        if (val.length() >= 2) {
                            val = val.substring(1, val.length() - 1);
                        }
                    }

                    // Only set if not already set in System properties or OS environment
                    if (System.getProperty(key) == null && System.getenv(key) == null) {
                        System.setProperty(key, val);
                    }
                }
            }
        } catch (IOException e) {
            System.err.println("[DotenvLoader] Error reading .env file: " + e.getMessage());
        }
    }
}
