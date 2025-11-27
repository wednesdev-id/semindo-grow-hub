# Deployment & Scaling Strategy

## Overview
Dokumentasi ini menjelaskan strategi deployment dan scaling untuk Semindo Core Project, dari modular monolithic hingga microservices architecture.

## Current Architecture: Modular Monolithic

### Deployment Strategy

#### 1. Single Application Deployment
```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://backend:3001/api
      - VITE_ENVIRONMENT=production
    depends_on:
      - backend
      - database

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@database:5432/semindo
      - JWT_SECRET=your-jwt-secret
    depends_on:
      - database
      - redis

  database:
    image: postgres:15
    environment:
      - POSTGRES_DB=semindo
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend

volumes:
  postgres_data:
```

#### 2. Environment Configuration
```bash
# .env.production
# Frontend Configuration
VITE_API_URL=https://api.semindo.id
VITE_ENVIRONMENT=production
VITE_SENTRY_DSN=https://your-sentry-dsn
VITE_GA_TRACKING_ID=G-XXXXXXXXXX

# Backend Configuration
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@localhost:5432/semindo
JWT_SECRET=your-super-secure-jwt-secret
JWT_EXPIRATION=3600
ENCRYPTION_KEY=your-encryption-key

# Redis Configuration
REDIS_URL=redis://localhost:6379

# File Storage
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=semindo-storage

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@semindo.id
SMTP_PASS=your-email-password

# Notification Service
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
```

### 3. Nginx Configuration
```nginx
# nginx.conf
upstream frontend {
    server frontend:3000;
}

upstream backend {
    server backend:3001;
}

server {
    listen 80;
    server_name semindo.id www.semindo.id;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name semindo.id www.semindo.id;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API
    location /api {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Rate limiting
        limit_req zone=api burst=20 nodelay;
        
        # CORS
        add_header Access-Control-Allow-Origin "*";
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Authorization, Content-Type";
    }

    # Static files
    location /static {
        alias /app/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

## CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Run linting
      run: npm run lint
    
    - name: Run type checking
      run: npm run type-check

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Log in to Container Registry
      uses: docker/login-action@v2
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v4
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v4
      with:
        context: .
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /opt/semindo
          docker-compose pull
          docker-compose up -d
          
          # Health check
          sleep 30
          curl -f http://localhost/health || exit 1
          
          # Cleanup old images
          docker system prune -f
```

## Scaling Strategy

### Phase 1: Vertical Scaling

#### 1. Application-Level Optimization
```typescript
// Caching strategy
const cacheConfig = {
  assessment: {
    ttl: 30 * 60 * 1000, // 30 minutes
    maxSize: 1000,
    strategy: 'LRU'
  },
  userProfile: {
    ttl: 60 * 60 * 1000, // 1 hour
    maxSize: 500,
    strategy: 'FIFO'
  },
  courseContent: {
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    maxSize: 200,
    strategy: 'LFU'
  }
};

// Connection pooling
const dbConfig = {
  maxConnections: 20,
  idleTimeout: 30000,
  connectionTimeout: 2000,
  acquireTimeout: 60000,
  evict: 1000
};

// Rate limiting
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
};
```

#### 2. Database Optimization
```sql
-- Index optimization
CREATE INDEX idx_assessments_user_id ON assessments(user_id);
CREATE INDEX idx_assessments_created_at ON assessments(created_at DESC);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_level ON courses(level);

-- Composite indexes
CREATE INDEX idx_assessments_user_status ON assessments(user_id, status);
CREATE INDEX idx_learning_progress_user_course ON learning_progress(user_id, course_id);

-- Full-text search indexes
CREATE INDEX idx_courses_title_fts ON courses USING gin(to_tsvector('indonesian', title));
CREATE INDEX idx_courses_description_fts ON courses USING gin(to_tsvector('indonesian', description));
```

### Phase 2: Horizontal Scaling

#### 1. Load Balancing Configuration
```yaml
# docker-compose.scale.yml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
    environment:
      - VITE_API_URL=http://backend:3001/api
    networks:
      - frontend-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    deploy:
      replicas: 5
      update_config:
        parallelism: 2
        delay: 10s
      restart_policy:
        condition: on-failure
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@postgres-primary:5432/semindo
      - REDIS_URL=redis://redis-cluster:6379
    networks:
      - backend-network
      - frontend-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - frontend
      - backend
    deploy:
      replicas: 2
      placement:
        constraints:
          - node.role == manager
    networks:
      - frontend-network

networks:
  frontend-network:
    driver: overlay
  backend-network:
    driver: overlay
```

#### 2. Database Replication
```yaml
# docker-compose.db.yml
version: '3.8'

services:
  postgres-primary:
    image: postgres:15
    environment:
      - POSTGRES_DB=semindo
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_PRIMARY_HOST=postgres-primary
    volumes:
      - postgres_primary_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - db-network

  postgres-replica-1:
    image: postgres:15
    environment:
      - PGUSER=replica_user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_PRIMARY_HOST=postgres-primary
    command: |
      bash -c "
      pg_basebackup -h postgres-primary -D /var/lib/postgresql/data -U replica_user -v -P -W
      echo 'standby_mode = on' >> /var/lib/postgresql/data/recovery.conf
      echo 'primary_conninfo = ''host=postgres-primary port=5432 user=replica_user''' >> /var/lib/postgresql/data/recovery.conf
      postgres
      "
    volumes:
      - postgres_replica1_data:/var/lib/postgresql/data
    ports:
      - "5433:5432"
    depends_on:
      - postgres-primary
    networks:
      - db-network

  postgres-replica-2:
    image: postgres:15
    environment:
      - PGUSER=replica_user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_PRIMARY_HOST=postgres-primary
    command: |
      bash -c "
      pg_basebackup -h postgres-primary -D /var/lib/postgresql/data -U replica_user -v -P -W
      echo 'standby_mode = on' >> /var/lib/postgresql/data/recovery.conf
      echo 'primary_conninfo = ''host=postgres-primary port=5432 user=replica_user''' >> /var/lib/postgresql/data/recovery.conf
      postgres
      "
    volumes:
      - postgres_replica2_data:/var/lib/postgresql/data
    ports:
      - "5434:5432"
    depends_on:
      - postgres-primary
    networks:
      - db-network

  redis-cluster:
    image: redis:7-alpine
    command: redis-server --cluster-enabled yes --cluster-config-file nodes.conf --cluster-node-timeout 5000 --appendonly yes
    ports:
      - "6379-6384:6379-6384"
    volumes:
      - redis_cluster_data:/data
    networks:
      - db-network

volumes:
  postgres_primary_data:
  postgres_replica1_data:
  postgres_replica2_data:
  redis_cluster_data:

networks:
  db-network:
    driver: overlay
```

### Phase 3: Microservices Architecture

#### 1. Service Decomposition
```yaml
# docker-compose.microservices.yml
version: '3.8'

services:
  # API Gateway
  api-gateway:
    build:
      context: ./services/api-gateway
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - AUTH_SERVICE_URL=http://auth-service:3001
      - ASSESSMENT_SERVICE_URL=http://assessment-service:3002
      - LEARNING_SERVICE_URL=http://learning-service:3003
      - CONSULTATION_SERVICE_URL=http://consultation-service:3004
    depends_on:
      - auth-service
      - assessment-service
      - learning-service
      - consultation-service
    networks:
      - service-network

  # Auth Service
  auth-service:
    build:
      context: ./services/auth
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@auth-db:5432/auth_db
      - JWT_SECRET=your-jwt-secret
      - REDIS_URL=redis://redis-cluster:6379
    depends_on:
      - auth-db
      - redis-cluster
    networks:
      - service-network
      - auth-network

  # Assessment Service
  assessment-service:
    build:
      context: ./services/assessment
      dockerfile: Dockerfile
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@assessment-db:5432/assessment_db
      - REDIS_URL=redis://redis-cluster:6379
      - AI_SERVICE_URL=http://ai-service:5000
    depends_on:
      - assessment-db
      - redis-cluster
    networks:
      - service-network
      - assessment-network

  # Learning Service
  learning-service:
    build:
      context: ./services/learning
      dockerfile: Dockerfile
    ports:
      - "3003:3003"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@learning-db:5432/learning_db
      - REDIS_URL=redis://redis-cluster:6379
      - STORAGE_SERVICE_URL=http://storage-service:9000
    depends_on:
      - learning-db
      - redis-cluster
    networks:
      - service-network
      - learning-network

  # Service Databases
  auth-db:
    image: postgres:15
    environment:
      - POSTGRES_DB=auth_db
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - auth_db_data:/var/lib/postgresql/data
    networks:
      - auth-network

  assessment-db:
    image: postgres:15
    environment:
      - POSTGRES_DB=assessment_db
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - assessment_db_data:/var/lib/postgresql/data
    networks:
      - assessment-network

  learning-db:
    image: postgres:15
    environment:
      - POSTGRES_DB=learning_db
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - learning_db_data:/var/lib/postgresql/data
    networks:
      - learning-network

  # Message Queue
  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      - RABBITMQ_DEFAULT_USER=admin
      - RABBITMQ_DEFAULT_PASS=admin
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    networks:
      - service-network

  # Service Discovery
  consul:
    image: consul:latest
    ports:
      - "8500:8500"
    command: consul agent -server -bootstrap-expect=1 -ui -client=0.0.0.0
    volumes:
      - consul_data:/consul/data
    networks:
      - service-network

volumes:
  auth_db_data:
  assessment_db_data:
  learning_db_data:
  rabbitmq_data:
  consul_data:

networks:
  service-network:
    driver: overlay
  auth-network:
    driver: overlay
  assessment-network:
    driver: overlay
  learning-network:
    driver: overlay
```

#### 2. Kubernetes Deployment
```yaml
# k8s/assessment-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: assessment-service
  namespace: semindo
spec:
  replicas: 3
  selector:
    matchLabels:
      app: assessment-service
  template:
    metadata:
      labels:
        app: assessment-service
    spec:
      containers:
      - name: assessment-service
        image: ghcr.io/semindo/assessment-service:latest
        ports:
        - containerPort: 3002
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: assessment-db-secret
              key: url
        - name: REDIS_URL
          valueFrom:
            configMapKeyRef:
              name: redis-config
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3002
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3002
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: assessment-service
  namespace: semindo
spec:
  selector:
    app: assessment-service
  ports:
  - protocol: TCP
    port: 3002
    targetPort: 3002
  type: ClusterIP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: assessment-service-hpa
  namespace: semindo
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: assessment-service
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## Monitoring and Observability

### 1. Application Monitoring
```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false

  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "16686:16686"
      - "14268:14268"
    environment:
      - COLLECTOR_OTLP_ENABLED=true

  elasticsearch:
    image: elasticsearch:8.5.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

  kibana:
    image: kibana:8.5.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch

  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    volumes:
      - ./loki-config.yml:/etc/loki/local-config.yaml
    command: -config.file=/etc/loki/local-config.yaml

volumes:
  prometheus_data:
  grafana_data:
  elasticsearch_data:
```

### 2. Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']

  - job_name: 'auth-service'
    static_configs:
      - targets: ['auth-service:3001']
    metrics_path: /metrics
    scrape_interval: 30s

  - job_name: 'assessment-service'
    static_configs:
      - targets: ['assessment-service:3002']
    metrics_path: /metrics
    scrape_interval: 30s

  - job_name: 'learning-service'
    static_configs:
      - targets: ['learning-service:3003']
    metrics_path: /metrics
    scrape_interval: 30s
```

### 3. Application Metrics
```typescript
// src/core/monitoring/metrics.ts
import { register, Counter, Histogram, Gauge } from 'prom-client';

// Request metrics
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Business metrics
export const assessmentCompletedTotal = new Counter({
  name: 'assessments_completed_total',
  help: 'Total number of completed assessments',
  labelNames: ['category', 'level']
});

export const activeUsers = new Gauge({
  name: 'active_users',
  help: 'Number of active users',
  labelNames: ['role']
});

// Performance metrics
export const databaseQueryDuration = new Histogram({
  name: 'database_query_duration_seconds',
  help: 'Database query duration',
  labelNames: ['operation', 'table'],
  buckets: [0.001, 0.01, 0.1, 0.5, 1, 2, 5]
});

// Register metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(assessmentCompletedTotal);
register.registerMetric(activeUsers);
register.registerMetric(databaseQueryDuration);

// Metrics endpoint
export const metricsEndpoint = async (req: Request, res: Response) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
};
```

## Security Configuration

### 1. Network Security
```yaml
# docker-compose.security.yml
version: '3.8'

services:
  vault:
    image: vault:latest
    ports:
      - "8200:8200"
    environment:
      - VAULT_DEV_ROOT_TOKEN_ID=myroot
      - VAULT_DEV_LISTEN_ADDRESS=0.0.0.0:8200
    cap_add:
      - IPC_LOCK
    volumes:
      - vault_data:/vault/data

  waf:
    image: owasp/modsecurity-crs:nginx
    ports:
      - "8000:80"
    environment:
      - PARANOIA=1
      - ANOMALY_INBOUND=5
      - ANOMALY_OUTBOUND=4
    volumes:
      - ./modsecurity.conf:/etc/modsecurity.d/owasp-crs/modsecurity.conf
      - ./crs-setup.conf:/etc/modsecurity.d/owasp-crs/crs-setup.conf

  fail2ban:
    image: crazymax/fail2ban:latest
    volumes:
      - ./fail2ban-data:/data
      - /var/log:/var/log:ro
    environment:
      - F2B_LOG_LEVEL=INFO
      - F2B_DB_PURGE_AGE=1d

volumes:
  vault_data:
  fail2ban_data:
```

### 2. Application Security
```typescript
// src/core/security/securityMiddleware.ts
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';

// Rate limiting
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiting for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
});

// Security headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.semindo.id"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

// CORS configuration
export const corsConfig = cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://semindo.id',
      'https://www.semindo.id',
      'https://app.semindo.id',
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
});

// Input validation
export const validateInput = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.details[0].message,
        },
      });
    }
    next();
  };
};
```

## Disaster Recovery

### 1. Backup Strategy
```bash
#!/bin/bash
# backup.sh

# Database backup
pg_dump -h localhost -U user -d semindo > backup_$(date +%Y%m%d_%H%M%S).sql

# File storage backup
aws s3 sync s3://semindo-storage s3://semindo-backup/backup_$(date +%Y%m%d_%H%M%S)/

# Configuration backup
tar -czf config_backup_$(date +%Y%m%d_%H%M%S).tar.gz /opt/semindo/config/

# Upload to backup storage
aws s3 cp backup_*.sql s3://semindo-backups/database/
aws s3 cp config_backup_*.tar.gz s3://semindo-backups/config/

# Clean up old backups (keep last 30 days)
find . -name "backup_*.sql" -mtime +30 -delete
find . -name "config_backup_*.tar.gz" -mtime +30 -delete
```

### 2. Recovery Procedures
```yaml
# disaster-recovery.yml
apiVersion: v1
kind: ConfigMap
metadata:
  name: disaster-recovery-procedures
data:
  database-recovery.md: |
    # Database Recovery Procedure
    
    ## Step 1: Stop application services
    kubectl scale deployment --all --replicas=0 -n semindo
    
    ## Step 2: Restore database from backup
    kubectl exec -it postgres-primary-0 -n semindo -- psql -U user -d semindo < backup.sql
    
    ## Step 3: Verify data integrity
    kubectl exec -it postgres-primary-0 -n semindo -- psql -U user -d semindo -c "SELECT COUNT(*) FROM users;"
    
    ## Step 4: Restart services
    kubectl scale deployment --all --replicas=3 -n semindo
    
    ## Step 5: Perform health checks
    kubectl get pods -n semindo
    curl -f http://api.semindo.id/health
```

## Cost Optimization

### 1. Resource Optimization
```yaml
# resource-optimization.yml
apiVersion: v1
kind: ConfigMap
metadata:
  name: resource-optimization
data:
  optimization-strategies.md: |
    # Resource Optimization Strategies
    
    ## 1. Right-sizing
    - Analyze resource usage patterns
    - Adjust CPU/memory limits based on actual usage
    - Use vertical pod autoscaling for dynamic adjustment
    
    ## 2. Spot Instances
    - Use spot instances for non-critical workloads
    - Implement proper fallback mechanisms
    - Monitor spot instance availability
    
    ## 3. Multi-tenancy
    - Share resources across multiple customers
    - Implement proper resource isolation
    - Use namespace-based isolation
    
    ## 4. Caching
    - Implement aggressive caching strategies
    - Use CDN for static content
    - Cache database query results
```

### 2. Auto-scaling Configuration
```yaml
# k8s/cluster-autoscaler.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cluster-autoscaler
  namespace: kube-system
spec:
  replicas: 1
  selector:
    matchLabels:
      app: cluster-autoscaler
  template:
    metadata:
      labels:
        app: cluster-autoscaler
    spec:
      containers:
      - image: k8s.gcr.io/autoscaling/cluster-autoscaler:v1.25.0
        name: cluster-autoscaler
        command:
        - ./cluster-autoscaler
        - --v=4
        - --stderrthreshold=info
        - --cloud-provider=aws
        - --skip-nodes-with-local-storage=false
        - --expander=least-waste
        - --node-group-auto-discovery=asg:tag=k8s.io/cluster-autoscaler/enabled,k8s.io/cluster-autoscaler/semindo-cluster
        env:
        - name: AWS_REGION
          value: ap-southeast-1
```

## Conclusion

Strategi deployment dan scaling ini dirancang untuk:

1. **High Availability**: 99.9% uptime dengan proper redundancy
2. **Scalability**: Support hingga 100,000+ concurrent users
3. **Performance**: Response time < 200ms untuk API calls
4. **Security**: Banking-level security untuk data UMKM
5. **Cost Efficiency**: Optimal resource utilization
6. **Disaster Recovery**: < 1 hour recovery time

Dengan pendekatan phased migration dari modular monolithic ke microservices, Semindo dapat:
- Mulai dengan deployment sederhana dan biaya rendah
- Scaling secara gradual sesuai pertumbuhan user
- Meminimalkan risiko migration
- Memastikan business continuity

Next steps:
1. Implement monitoring dan alerting
2. Setup CI/CD pipeline
3. Configure auto-scaling
4. Test disaster recovery procedures
5. Optimize costs berdasarkan actual usage