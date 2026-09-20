# Azure Student deployment

This project is prepared for a split deployment:

- Django REST API: Azure App Service for Linux
- PostgreSQL: Azure Database for PostgreSQL Flexible Server
- React/Vite frontend: Azure Static Web Apps

## Before deployment

1. Rotate every credential currently present in `backend/.env`. The file contains a Django secret, payment credentials, a Gemini key, and a database password.
2. Push the repository without `backend/.env`; `.gitignore` already excludes it.
3. Choose one Azure region available to your Student subscription. Basic App Service and Burstable PostgreSQL are used by `infra/main.bicep` to keep the starting cost small.

## Provision infrastructure

Create an Azure resource group, open `infra/main.bicep` in the Azure portal deployment editor, and provide:

- `appName`: lowercase unique prefix, for example `doctorappt123`
- `postgresPassword`
- `djangoSecretKey`
- `geminiApiKey`
- SSLCOMMERZ values, or leave sandbox values empty and configure them later

The template creates the PostgreSQL server/database, Linux App Service, and Free Static Web App. It does not put secrets in git.

## Deploy the backend

In the Django App Service deployment configuration:

- Runtime: Python 3.10
- Source: this repository
- Working directory: repository root
- Startup command: `gunicorn --chdir backend --bind=0.0.0.0 --timeout 600 config.wsgi:application`
- Build automation: enabled

After the code is deployed, run these commands from the App Service SSH console or deployment pipeline:

```text
python manage.py migrate
python manage.py collectstatic --noinput
```

Verify `https://<backend-app>.azurewebsites.net/health/` returns `{"status":"ok"}`.

## Deploy the frontend

Configure the Static Web App build:

- App location: `frontend`
- Output location: `dist`
- Build command: `npm run build`
- Node version: 20 or newer

Set this build-time environment variable in Static Web Apps/GitHub Actions:

```text
VITE_API_BASE_URL=https://<backend-app>.azurewebsites.net/api/
VITE_BACKEND_URL=https://<backend-app>.azurewebsites.net
```

The frontend no longer contains hardcoded local API URLs.

## Backend App Service settings

If the Bicep template was not used, add the variables from `backend/.env.example` in App Service > Environment variables. At minimum configure `SECRET_KEY`, `DEBUG=False`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`, all PostgreSQL values, `POSTGRES_SSLMODE=require`, and the server-side `GEMINI_API_KEY`.

Local development uses SQLite with `USE_POSTGRES=False`, so the app can start even when the local PostgreSQL driver/server is unavailable. The Azure Bicep template sets `USE_POSTGRES=True`; never disable it in the deployed backend.

Set `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS` to the final Static Web App URL. Keep Gemini and SSLCOMMERZ secrets only in App Service settings or GitHub/Azure secret storage; never expose them through `VITE_` variables.

## Important production notes

- App Service local disk is not durable for user-uploaded media. For production medical reports and profile images, move `MEDIA_ROOT` to a private Azure Blob Storage container before going live.
- Keep SSLCOMMERZ sandbox enabled until callback URLs and payment flows are verified.
- The current frontend build succeeds. Vite reports a bundle-size warning only; it is not a deployment failure.

## GitHub Actions deployment

The repository includes these workflows:

- `.github/workflows/backend-deploy.yml`: compiles and deploys the repository root to App Service.
- `.github/workflows/frontend-deploy.yml`: builds and deploys `frontend/` to Static Web Apps.

In GitHub, open **Settings > Secrets and variables > Actions > New repository secret** and add:

| Secret | Value |
| --- | --- |
| `AZURE_BACKEND_APP_NAME` | The exact backend App Service name |
| `AZURE_BACKEND_PUBLISH_PROFILE` | Downloaded from App Service > Overview > Get publish profile |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Static Web App > Manage deployment token |
| `VITE_API_BASE_URL` | `https://<backend-app>.azurewebsites.net/api/` |
| `VITE_BACKEND_URL` | `https://<backend-app>.azurewebsites.net` |

Push to `main` after adding the secrets. Backend and frontend deploy independently based on changed paths. The first backend deployment does not run database migrations from GitHub because database credentials should not be copied into the runner. Run migrations once from App Service SSH:

```text
cd /home/site/wwwroot
python manage.py migrate
python manage.py collectstatic --noinput
```

After deployment, verify the backend health URL and then open the Static Web App URL. If the frontend reports CORS errors, update `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS` in App Service settings with the final Static Web App URL, then restart the backend.

## Handoff checklist

Give the next assistant this order:

1. Rotate the exposed local credentials and configure new App Service environment variables.
2. Create the resource group and run `infra/main.bicep` with secure parameters.
3. Configure PostgreSQL firewall/network access and confirm the generated hostname.
4. Add the five GitHub Actions secrets above.
5. Push to `main` and inspect both workflow logs.
6. Run migrations and collectstatic from App Service SSH.
7. Test `/health/`, login/register, uploads, payment sandbox callback, and Gemini feature.
8. Move media uploads to private Azure Blob Storage before production use because App Service local disk is not durable.

## Files kept out of GitHub

The root `.gitignore` and app-level ignore files exclude local secrets and generated/private data:

- `.env` files, except the safe `.env.example` templates
- SQLite databases and database backups
- `backend/media/` uploaded profile images and medical reports
- `backend/staticfiles/`
- Python virtual environments and cache files
- `frontend/node_modules/` and `frontend/dist/`
- logs, editor files, and local backup bundles

Previously tracked local database and media files were removed from the Git index without deleting the local copies. Their removal will appear in the next commit so GitHub will stop receiving them.
