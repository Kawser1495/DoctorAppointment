# ChatGPT/Gemini deployment handoff

Copy the instruction below into ChatGPT, Gemini, or another deployment assistant after opening this repository.

```text
I am deploying this existing Django + React DoctorAppointment project to Azure App Service with Azure PostgreSQL and GitHub Actions.

Repository layout:
- backend/: Django project; WSGI module is config.wsgi:application
- frontend/: Vite React frontend
- infra/main.bicep: Azure PostgreSQL Flexible Server, App Service, and Static Web App
- .github/workflows/backend-deploy.yml: backend validation and App Service deployment
- .github/workflows/frontend-deploy.yml: frontend build and Static Web Apps deployment
- docs/AZURE_DEPLOYMENT.md: project deployment runbook

Deployment contract:
- Backend startup command: gunicorn --chdir backend --bind=0.0.0.0 --timeout 600 config.wsgi:application
- Backend is deployed from the repository root.
- Production database is Azure PostgreSQL through environment variables.
- Local development keeps SQLite with USE_POSTGRES=False.
- Frontend build variables are VITE_API_BASE_URL and VITE_BACKEND_URL.
- Do not rewrite business logic or change models unless a verified deployment blocker requires it.
- Do not run destructive database commands or automatically migrate local SQLite.
- Never ask me to paste secrets, publish profiles, API keys, or the full .env file. Use placeholders and tell me where each secret belongs.

Work in this order:
1. Inspect the existing files and current git status.
2. Audit Django settings, WSGI import, requirements, GitHub workflows, Bicep, CORS/CSRF, static files, and frontend API configuration.
3. Report blockers before editing. Make only minimal production fixes.
4. Validate Python syntax/imports, Django checks, Bicep diagnostics, and frontend build/lint.
5. Do not run migrations on local SQLite. For Azure PostgreSQL, run migrations only after confirming the production connection and after taking a backup.
6. Verify App Service settings, PostgreSQL firewall/network access, startup command, and frontend API URL.
7. At the end, list every changed file, remaining risks, exact GitHub secrets, exact deployment steps, and exact git commands. Do not commit or push automatically.

Required GitHub Actions secrets:
- AZURE_BACKEND_APP_NAME
- AZURE_BACKEND_PUBLISH_PROFILE
- AZURE_STATIC_WEB_APPS_API_TOKEN
- VITE_API_BASE_URL
- VITE_BACKEND_URL

Required backend App Service settings:
- DEBUG=False
- SECRET_KEY=<new rotated secret>
- USE_POSTGRES=True
- ALLOWED_HOSTS=<backend hostname>
- CORS_ALLOWED_ORIGINS=<frontend https URL>
- CSRF_TRUSTED_ORIGINS=<frontend https URL>,<backend https URL>
- POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST, POSTGRES_PORT=5432
- POSTGRES_SSLMODE=require
- GEMINI_API_KEY and SSLCOMMERZ values only as server-side settings

Do not claim deployment succeeded unless the Azure URL and /health/ endpoint are actually tested.
```

Never share the real local `.env` with any assistant. Rotate the credentials currently exposed in the local file before production deployment.
