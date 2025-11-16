# Cloud Deployment Guide - ConstructAI Platform

This guide provides step-by-step instructions for deploying ConstructAI on popular cloud platforms.

## Table of Contents

1. [Vercel + Railway](#vercel--railway-recommended)
2. [Render.com](#rendercom)
3. [AWS](#amazon-web-services-aws)
4. [Google Cloud Platform](#google-cloud-platform-gcp)
5. [Microsoft Azure](#microsoft-azure)
6. [DigitalOcean](#digitalocean)
7. [Heroku](#heroku)

---

## Vercel + Railway (Recommended)

**Best for:** Quick deployment with minimal configuration  
**Cost:** Free tier available  
**Difficulty:** ⭐ Easy

### Architecture
- **Vercel**: Frontend hosting (React PWA)
- **Railway**: Backend API + MongoDB + Redis

### Deployment Steps

#### Step 1: Deploy Backend to Railway

1. **Install Railway CLI:**
```bash
npm install -g railway
```

2. **Login to Railway:**
```bash
railway login
```

3. **Initialize project:**
```bash
railway init
```

4. **Add MongoDB:**
   - Go to Railway dashboard
   - Click "New" → "Database" → "MongoDB"
   - Copy connection string

5. **Add Redis:**
   - Click "New" → "Database" → "Redis"
   - Copy connection string

6. **Deploy backend:**
```bash
cd packages/backend
railway up
```

7. **Set environment variables in Railway dashboard:**
```env
NODE_ENV=production
DATABASE_URL=<mongodb-connection-string>
REDIS_URL=<redis-connection-string>
JWT_SECRET=<generate-secure-secret>
JWT_REFRESH_SECRET=<generate-secure-secret>
SESSION_SECRET=<generate-secure-secret>
FRONTEND_URL=https://your-app.vercel.app
```

8. **Run migrations:**
```bash
railway run npx prisma migrate deploy
```

#### Step 2: Deploy Frontend to Vercel

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy frontend:**
```bash
cd packages/frontend
vercel --prod
```

3. **Set environment variables in Vercel dashboard:**
```env
VITE_API_URL=https://your-backend.railway.app
```

4. **Redeploy after setting variables:**
```bash
vercel --prod
```

### Post-Deployment

- Frontend URL: `https://your-app.vercel.app`
- Backend URL: `https://your-backend.railway.app`
- Test health: `curl https://your-backend.railway.app/health`

---

## Render.com

**Best for:** All-in-one platform with managed services  
**Cost:** Free tier available  
**Difficulty:** ⭐⭐ Easy-Medium

### Architecture
- Web Service: Backend API
- Static Site: Frontend
- PostgreSQL/MongoDB: Database
- Redis: Caching

### Deployment Steps

#### Step 1: Create Render Account

Visit https://render.com and sign up

#### Step 2: Deploy Database

1. **Create MongoDB:**
   - Dashboard → New → MongoDB
   - Choose plan (free tier available)
   - Note the connection string

2. **Create Redis:**
   - Dashboard → New → Redis
   - Choose plan
   - Note the connection string

#### Step 3: Deploy Backend

1. **Create Web Service:**
   - Dashboard → New → Web Service
   - Connect GitHub repository
   - Set root directory: `packages/backend`
   - Build command: `pnpm install && pnpm build`
   - Start command: `node dist/index.js`

2. **Environment variables:**
```env
NODE_ENV=production
DATABASE_URL=<mongodb-internal-url>
REDIS_URL=<redis-internal-url>
JWT_SECRET=<generate>
JWT_REFRESH_SECRET=<generate>
SESSION_SECRET=<generate>
PORT=3001
```

3. **After deployment, run migrations:**
   - Use Render shell: `npx prisma migrate deploy`

#### Step 4: Deploy Frontend

1. **Create Static Site:**
   - Dashboard → New → Static Site
   - Connect GitHub repository
   - Set root directory: `packages/frontend`
   - Build command: `pnpm install && pnpm build`
   - Publish directory: `dist`

2. **Environment variables:**
```env
VITE_API_URL=https://your-backend.onrender.com
```

### Post-Deployment

- Frontend: `https://your-app.onrender.com`
- Backend: `https://your-backend.onrender.com`
- Free tier: Services sleep after inactivity

---

## Amazon Web Services (AWS)

**Best for:** Enterprise-scale, full control  
**Cost:** Pay-as-you-go  
**Difficulty:** ⭐⭐⭐⭐ Advanced

### Architecture
- **EC2** or **ECS**: Application hosting
- **DocumentDB**: MongoDB-compatible database
- **ElastiCache**: Redis
- **S3**: File storage
- **CloudFront**: CDN
- **Route 53**: DNS
- **ALB**: Load balancer

### Deployment Options

#### Option 1: ECS with Fargate (Recommended)

1. **Build Docker images:**
```bash
docker build -t constructai-backend:latest packages/backend
docker build -t constructai-frontend:latest packages/frontend
```

2. **Push to ECR:**
```bash
aws ecr create-repository --repository-name constructai-backend
aws ecr create-repository --repository-name constructai-frontend

# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Tag and push
docker tag constructai-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/constructai-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/constructai-backend:latest

docker tag constructai-frontend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/constructai-frontend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/constructai-frontend:latest
```

3. **Create ECS cluster:**
```bash
aws ecs create-cluster --cluster-name constructai-cluster
```

4. **Create task definitions** (JSON files for backend and frontend)

5. **Create services:**
```bash
aws ecs create-service \
  --cluster constructai-cluster \
  --service-name constructai-backend \
  --task-definition constructai-backend:1 \
  --desired-count 2 \
  --launch-type FARGATE
```

6. **Setup DocumentDB:**
```bash
aws docdb create-db-cluster \
  --db-cluster-identifier constructai-db \
  --engine docdb \
  --master-username admin \
  --master-user-password <secure-password>
```

7. **Setup ElastiCache:**
```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id constructai-redis \
  --engine redis \
  --cache-node-type cache.t3.micro \
  --num-cache-nodes 1
```

#### Option 2: EC2 with Docker Compose

1. **Launch EC2 instance** (Ubuntu 22.04, t3.medium or larger)

2. **Connect and install Docker:**
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

3. **Clone repository:**
```bash
git clone <your-repo> /home/ubuntu/constructai
cd /home/ubuntu/constructai
```

4. **Configure .env file**

5. **Deploy:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

6. **Setup nginx reverse proxy** for SSL/domain

### Post-Deployment AWS Checklist

- [ ] Configure security groups
- [ ] Setup SSL certificates (ACM)
- [ ] Configure ALB/CloudFront
- [ ] Setup Route 53 DNS
- [ ] Configure S3 for file uploads
- [ ] Setup CloudWatch logging
- [ ] Configure auto-scaling
- [ ] Setup backup strategies

---

## Google Cloud Platform (GCP)

**Best for:** Google ecosystem integration  
**Cost:** Free trial available  
**Difficulty:** ⭐⭐⭐⭐ Advanced

### Architecture
- **Cloud Run**: Container hosting
- **Cloud MongoDB Atlas**: Database
- **Memorystore**: Redis
- **Cloud Storage**: File uploads
- **Cloud CDN**: Frontend distribution

### Deployment Steps

#### Step 1: Setup GCP Project

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

#### Step 2: Build and Push Docker Images

```bash
# Enable Container Registry
gcloud services enable containerregistry.googleapis.com

# Build images
docker build -t gcr.io/YOUR_PROJECT_ID/constructai-backend packages/backend
docker build -t gcr.io/YOUR_PROJECT_ID/constructai-frontend packages/frontend

# Push to GCR
docker push gcr.io/YOUR_PROJECT_ID/constructai-backend
docker push gcr.io/YOUR_PROJECT_ID/constructai-frontend
```

#### Step 3: Setup MongoDB Atlas

1. Create cluster at cloud.mongodb.com
2. Whitelist GCP IP ranges
3. Get connection string

#### Step 4: Setup Redis (Memorystore)

```bash
gcloud redis instances create constructai-redis \
  --size=1 \
  --region=us-central1 \
  --redis-version=redis_7_0
```

#### Step 5: Deploy to Cloud Run

```bash
# Deploy backend
gcloud run deploy constructai-backend \
  --image gcr.io/YOUR_PROJECT_ID/constructai-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,DATABASE_URL=<mongodb-url>,REDIS_URL=<redis-url>"

# Deploy frontend
gcloud run deploy constructai-frontend \
  --image gcr.io/YOUR_PROJECT_ID/constructai-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## Microsoft Azure

**Best for:** Microsoft ecosystem  
**Cost:** Free trial available  
**Difficulty:** ⭐⭐⭐⭐ Advanced

### Architecture
- **App Service**: Application hosting
- **Cosmos DB**: MongoDB API
- **Azure Cache for Redis**: Caching
- **Blob Storage**: File storage
- **CDN**: Content delivery

### Deployment Steps

#### Step 1: Install Azure CLI

```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
az login
```

#### Step 2: Create Resource Group

```bash
az group create --name constructai-rg --location eastus
```

#### Step 3: Create Cosmos DB

```bash
az cosmosdb create \
  --name constructai-cosmos \
  --resource-group constructai-rg \
  --kind MongoDB \
  --server-version 6.0

# Get connection string
az cosmosdb keys list \
  --name constructai-cosmos \
  --resource-group constructai-rg \
  --type connection-strings
```

#### Step 4: Create Redis Cache

```bash
az redis create \
  --name constructai-redis \
  --resource-group constructai-rg \
  --location eastus \
  --sku Basic \
  --vm-size c0
```

#### Step 5: Deploy Web Apps

```bash
# Create App Service Plan
az appservice plan create \
  --name constructai-plan \
  --resource-group constructai-rg \
  --sku B1 \
  --is-linux

# Deploy backend
az webapp create \
  --resource-group constructai-rg \
  --plan constructai-plan \
  --name constructai-backend \
  --deployment-container-image-name <your-docker-hub>/constructai-backend

# Deploy frontend
az webapp create \
  --resource-group constructai-rg \
  --plan constructai-plan \
  --name constructai-frontend \
  --deployment-container-image-name <your-docker-hub>/constructai-frontend
```

#### Step 6: Configure Environment Variables

```bash
az webapp config appsettings set \
  --resource-group constructai-rg \
  --name constructai-backend \
  --settings NODE_ENV=production DATABASE_URL=<connection-string>
```

---

## DigitalOcean

**Best for:** Simple, affordable cloud hosting  
**Cost:** $5/month starting  
**Difficulty:** ⭐⭐ Easy-Medium

### Deployment Steps

#### Option 1: App Platform (PaaS)

1. **Connect GitHub repository**
2. **Configure services:**
   - Backend: Node.js app from `packages/backend`
   - Frontend: Static site from `packages/frontend`
   - MongoDB: Managed database
   - Redis: Managed cache

3. **Set environment variables in dashboard**

4. **Deploy with one click**

#### Option 2: Droplet (VPS)

1. **Create Droplet** (Ubuntu 22.04, 2GB RAM minimum)

2. **SSH into droplet:**
```bash
ssh root@your-droplet-ip
```

3. **Install Docker:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

4. **Clone and deploy:**
```bash
git clone <repo> /opt/constructai
cd /opt/constructai
cp .env.example .env
# Edit .env
docker-compose -f docker-compose.prod.yml up -d
```

5. **Setup nginx and SSL (Let's Encrypt)**

---

## Heroku

**Best for:** Simple deployments, legacy support  
**Cost:** Paid plans only (no free tier)  
**Difficulty:** ⭐⭐ Easy-Medium

### Deployment Steps

1. **Install Heroku CLI:**
```bash
curl https://cli-assets.heroku.com/install.sh | sh
heroku login
```

2. **Create apps:**
```bash
heroku create constructai-backend
heroku create constructai-frontend
```

3. **Add addons:**
```bash
# MongoDB
heroku addons:create mongolab:sandbox -a constructai-backend

# Redis
heroku addons:create heroku-redis:hobby-dev -a constructai-backend
```

4. **Deploy backend:**
```bash
cd packages/backend
git init
heroku git:remote -a constructai-backend
git add .
git commit -m "Deploy backend"
git push heroku main
```

5. **Deploy frontend:**
```bash
cd packages/frontend
git init
heroku git:remote -a constructai-frontend
git add .
git commit -m "Deploy frontend"
git push heroku main
```

6. **Set environment variables:**
```bash
heroku config:set NODE_ENV=production -a constructai-backend
heroku config:set JWT_SECRET=<secret> -a constructai-backend
```

---

## Cost Comparison

| Platform | Free Tier | Entry Paid | Best For |
|----------|-----------|------------|----------|
| Vercel + Railway | Yes | ~$10/mo | Quick start |
| Render | Yes | ~$7/mo | Simple apps |
| AWS | Limited | ~$50/mo | Enterprise |
| GCP | $300 credit | ~$40/mo | Google integration |
| Azure | $200 credit | ~$45/mo | Microsoft ecosystem |
| DigitalOcean | No | $5/mo | Budget-friendly |
| Heroku | No | ~$25/mo | Legacy apps |

---

## General Post-Deployment Checklist

- [ ] Test all endpoints
- [ ] Verify database connectivity
- [ ] Check Redis connection
- [ ] Test file uploads
- [ ] Configure custom domain
- [ ] Setup SSL/TLS
- [ ] Configure email service
- [ ] Setup monitoring
- [ ] Configure backups
- [ ] Test PWA offline functionality
- [ ] Load test the application
- [ ] Setup error tracking (Sentry)
- [ ] Configure CDN
- [ ] Update DNS records

---

## Support

For deployment issues:
- Check platform-specific documentation
- Review logs for errors
- Test locally first with `docker-compose`
- See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for general troubleshooting

---

**Last Updated**: November 2024
