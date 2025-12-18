# CI/CD Setup Guide - GitHub Actions

Panduan lengkap untuk setup CI/CD pipeline menggunakan GitHub Actions.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│              GitHub Actions Workflow                │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │   Build &    │→ │ Build Docker │→ │  Deploy   │ │
│  │     Test     │  │    Images    │  │ to Server │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
└─────────────────────────────────────────────────────┘
                           │
                           ↓
              ┌─────────────────────────┐
              │ GitHub Container Registry│
              │  (ghcr.io)               │
              └─────────────────────────┘
                           │
                           ↓
              ┌─────────────────────────┐
              │   Production Server     │
              │   - Pull images         │
              │   - Run migrations      │
              │   - Deploy containers   │
              └─────────────────────────┘
```

## 📋 Workflows

### 1. Production Pipeline (`production.yml`)
- **Trigger**: Push/PR to `main` branch
- **Steps**:
  1. Build & Test (lint, type-check, unit tests)
  2. Build Docker images (frontend + backend)
  3. Push to GitHub Container Registry
  4. Deploy to production server via SSH
  5. Run database migrations
  6. Send Slack notification

### 2. Staging Pipeline (`staging.yml`)
- **Trigger**: Push/PR to `develop` branch
- **Steps**: Same as production but deploys to staging server

### 3. PR Checks (`pr-checks.yml`)
- **Trigger**: Pull requests to `main` or `develop`
- **Steps**:
  1. Code linting
  2. Type checking
  3. Unit tests
  4. Docker build verification
  5. Security vulnerability scanning

## 🔐 Required GitHub Secrets

Setup secrets di: `Settings` → `Secrets and variables` → `Actions`

### Production Server Secrets
```
PROD_SERVER_HOST          # Production server IP/hostname
PROD_SERVER_USER          # SSH username
PROD_SERVER_SSH_KEY       # Private SSH key for authentication
PROD_SERVER_PORT          # SSH port (default: 22)
PROD_DEPLOY_PATH          # App directory path (e.g., /var/www/semindo)
```

### Staging Server Secrets
```
STAGING_SERVER_HOST       # Staging server IP/hostname
STAGING_SERVER_USER       # SSH username
STAGING_SERVER_SSH_KEY    # Private SSH key for authentication
STAGING_SERVER_PORT       # SSH port (default: 22)
STAGING_DEPLOY_PATH       # App directory path (e.g., /var/www/semindo-staging)
```

### API & Environment Secrets
```
VITE_API_URL_PROD         # Production API URL (e.g., https://api.semindo.com/api/v1)
VITE_API_URL_STAGING      # Staging API URL (e.g., https://staging-api.semindo.com/api/v1)
```

### Optional Secrets
```
SLACK_WEBHOOK_URL         # Slack webhook for deployment notifications
```

## 🚀 Setup Instructions

### 1. Setup SSH Access

```bash
# On your local machine, generate SSH key pair
ssh-keygen -t ed25519 -C "github-actions@semindo" -f ~/.ssh/github_actions_semindo

# Copy public key to server
ssh-copy-id -i ~/.ssh/github_actions_semindo.pub user@your-server.com

# Copy private key content for GitHub Secret
cat ~/.ssh/github_actions_semindo
# Copy output and paste into PROD_SERVER_SSH_KEY secret
```

### 2. Prepare Server

```bash
# SSH to your server
ssh user@your-server.com

# Install Docker & Docker Compose
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Create deployment directory
sudo mkdir -p /var/www/semindo
sudo chown $USER:$USER /var/www/semindo

# Clone repository
cd /var/www/semindo
git clone https://github.com/your-org/semindo.git .

# Setup .env file
cp .env.example .env
nano .env  # Configure for production

# For Docker: change DATABASE_URL to use 'db' hostname
# DATABASE_URL=postgresql://user:pass@db:5432/semindo_db
```

### 3. Configure GitHub Secrets

1. Go to repository → `Settings` → `Secrets and variables` → `Actions`
2. Click `New repository secret`
3. Add all required secrets listed above

### 4. Enable GitHub Container Registry

```bash
# Create Personal Access Token (PAT)
# Go to: Settings → Developer settings → Personal access tokens → Tokens (classic)
# Generate with: write:packages, read:packages, delete:packages

# On server, login to GHCR
echo YOUR_PAT | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

### 5. Test Deployment

```bash
# Push to develop branch for staging
git checkout develop
git push origin develop
# Check Actions tab for workflow progress

# Push to main branch for production
git checkout main
git merge develop
git push origin main
# Check Actions tab for workflow progress
```

## 📊 Monitoring Deployments

### View Workflow Status
1. Go to repository → `Actions` tab
2. Select workflow run
3. View logs for each job

### Check Deployment on Server

```bash
# SSH to server
ssh user@your-server.com

# Navigate to app directory
cd /var/www/semindo

# Check running containers
docker-compose ps

# View logs
docker-compose logs -f

# Check app health
curl http://localhost:3000/api/v1/health
curl http://localhost:8080
```

## 🔄 Branching Strategy

```
main (production)
  ↑
  │ PR + merge
  │
develop (staging)
  ↑
  │ PR + merge
  │
feature/xxx
bugfix/xxx
```

### Workflow:
1. Create feature branch from `develop`
2. Make changes and commit
3. Create PR to `develop` → triggers PR checks
4. After review, merge to `develop` → deploys to staging
5. Test on staging
6. Create PR from `develop` to `main` → triggers PR checks
7. After review, merge to `main` → deploys to production

## 🛠️ Customization

### Change Docker Registry

Edit workflow files to use Docker Hub instead of GHCR:

```yaml
env:
  REGISTRY: docker.io
  IMAGE_NAME_FRONTEND: your-dockerhub-username/semindo-frontend
  IMAGE_NAME_BACKEND: your-dockerhub-username/semindo-backend
```

Add Docker Hub secrets:
```
DOCKERHUB_USERNAME
DOCKERHUB_TOKEN
```

### Add Database Backup Before Deploy

Add to deployment step:

```yaml
- name: Backup Database
  uses: appleboy/ssh-action@v1.0.0
  with:
    host: ${{ secrets.PROD_SERVER_HOST }}
    username: ${{ secrets.PROD_SERVER_USER }}
    key: ${{ secrets.PROD_SERVER_SSH_KEY }}
    script: |
      cd ${{ secrets.PROD_DEPLOY_PATH }}
      mkdir -p backups
      docker-compose exec -T db pg_dump -U semindo semindo_db > backups/backup_$(date +%Y%m%d_%H%M%S).sql
```

### Add Rollback Capability

Create manual workflow for rollback:

```yaml
name: Rollback
on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to rollback to'
        required: true

jobs:
  rollback:
    runs-on: ubuntu-latest
    steps:
      - name: Rollback Deployment
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.PROD_SERVER_HOST }}
          username: ${{ secrets.PROD_SERVER_USER }}
          key: ${{ secrets.PROD_SERVER_SSH_KEY }}
          script: |
            cd ${{ secrets.PROD_DEPLOY_PATH }}
            git checkout ${{ github.event.inputs.version }}
            docker-compose --profile prod up -d
```

## 🧪 Testing CI/CD

### Test Locally with Act

```bash
# Install act (GitHub Actions local runner)
brew install act  # macOS
# or
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Run workflow locally
act -j build-and-test

# Run with secrets
act -j build-and-test --secret-file .secrets
```

## 📈 Performance Optimization

### Enable Build Cache

Already configured in workflows using:
- GitHub Actions cache for dependency caching
- Docker layer caching with registry

### Parallel Jobs

Workflows already run multiple jobs in parallel:
- Build & Test (parallel with image builds)
- Frontend & Backend images (sequential for resource efficiency)

## 🔒 Security Best Practices

1. ✅ Use SSH keys, not passwords
2. ✅ Store secrets in GitHub Secrets (encrypted)
3. ✅ Use least-privilege principle for server access
4. ✅ Enable 2FA on GitHub account
5. ✅ Regularly rotate SSH keys and tokens
6. ✅ Use vulnerability scanning (Trivy)
7. ✅ Review security advisories regularly

## 📝 Troubleshooting

### Build Fails

```bash
# Check GitHub Actions logs
# Common issues:
# - Missing dependencies: npm ci failed
# - TypeScript errors: npx tsc errors
# - Docker build errors: check Dockerfile syntax
```

### Deployment Fails

```bash
# SSH to server manually
ssh user@your-server.com

# Check Docker status
docker ps
docker-compose ps

# Check logs
docker-compose logs

# Verify .env variables
cat .env

# Check disk space
df -h

# Check Docker images
docker images
```

### Database Migration Fails

```bash
# SSH to server
ssh user@your-server.com
cd /var/www/semindo

# Run migrations manually
docker-compose exec backend npx prisma migrate deploy

# Check migration status
docker-compose exec backend npx prisma migrate status

# Rollback if needed
docker-compose exec backend npx prisma migrate reset
```

## 🎯 Next Steps

1. Setup production and staging servers
2. Configure all GitHub Secrets
3. Test deployment to staging first
4. Monitor first production deployment closely
5. Setup Slack notifications
6. Configure database backups
7. Setup monitoring (optional: Sentry, DataDog)

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [SSH Action Documentation](https://github.com/appleboy/ssh-action)
- [Container Registry Guide](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
