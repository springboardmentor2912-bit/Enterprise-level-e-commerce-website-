# Frontend Environment Profiles

This directory stores environment-specific configuration templates for the Obsidian Luxury frontend:

- `development.env`: Local development configuration connecting to local Spring Boot (`http://localhost:8080/api`).
- `production.env.example`: Template for staging / production deployments.

### How to Use

Vite loads variables from `.env` in the `frontend` root.
To activate a specific profile, copy it to `frontend/.env`:

```bash
# Example for local development
cp env/development.env .env
```

All environment variables used in the application must be prefixed with `VITE_` to be exposed to client-side code via `import.meta.env`.
Centralized access is handled through `src/config/env.js`.
