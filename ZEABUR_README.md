# Deploying Sinergi UMKM to Zeabur

This project is configured for deployment on [Zeabur](https://zeabur.com). A `zeabur.yml` file is provided to orchestrate the services.

## Services

1.  **db**: PostgreSQL Database
2.  **api**: Backend (Node.js/Express)
3.  **frontend**: Frontend (React/Vite)

## Deployment Steps

1.  **Push to GitHub**: Ensure this repository is pushed to your GitHub account.
2.  **Create Project in Zeabur**:
    *   Log in to Zeabur Dashboard.
    *   Click **Create Project**.
    *   Select region (e.g., Singapore).
3.  **Deploy Service**:
    *   Click **Deploy New Service**.
    *   Select **Git**.
    *   Choose this repository.
    *   Zeabur should automatically detect the `zeabur.yml` configuration.

## Environment Variables

The `zeabur.yml` attempts to link services automatically. However, verify the following in the **Settings > Environment Variables** section of each service if needed:

### API Service
*   `DATABASE_URL`: Should allow connection to the `db` service. Zeabur usually provides `${db.CONNECTION_URI}` or similar variables.
*   `JWT_SECRET`: Set a secure random string.

### Frontend Service
*   `VITE_API_URL`: This must be set **during build time**.
    *   If Zeabur deployment fails to link this automatically, you may need to:
        1.  Deploy API first.
        2.  Get the API domain (e.g., `https://api.zeabur.app`).
        3.  Go to Frontend settings -> Environment Variables.
        4.  Add `VITE_API_URL` = `https://api.zeabur.app/api/v1`.
        5.  Redeploy Frontend.

## Database Setup

After deployment:
1.  The `api` service build command includes `npx prisma generate` and `prisma migrate deploy` (via start command or manually if configured).
2.  Ensure migrations run successfully. You can verify this in the API service logs.
