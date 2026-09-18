# Backend Environment Profiles

This directory contains environment configuration profiles for the Spring Boot application:

- `development.env`: Local development configuration with local PostgreSQL (`authdb`) and test credentials.
- `production.env.example`: Template for staging and production servers.

### How to Use

The backend automatically loads `.env` located at `backend/.env` or the workspace root via the native `DotenvLoader` during application boot.

To activate a profile:

```bash
# Example for development
cp env/development.env .env
```

All environment variables populate both `System.getProperties()` and Spring's `application.properties` placeholders (`${SERVER_PORT}`, `${DB_URL}`, `${JWT_SECRET}`, `${CORS_ALLOWED_ORIGINS}`, etc.).
