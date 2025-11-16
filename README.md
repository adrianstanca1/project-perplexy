# ConstructAI - Production-Grade Construction Intelligence Platform

A comprehensive, multi-tenant construction management platform with AI-driven automation, real-time synchronization, and offline-capable field operations.

## 🚀 Features

### Core Platform
- **Multi-Tenant Architecture**: Complete data isolation with organization-level scoping
- **Role-Based Access Control**: Four distinct user roles (Super Admin, Company Admin, Supervisor, Operative)
- **Real-Time Synchronization**: Socket.IO for bidirectional communication
- **Offline-First PWA**: Field operations work offline with automatic sync

### AI Agents (9 Specialized Agents)
1. **Procurement Agent**: Automated vendor selection, bid analysis, PO generation
2. **Compliance Agent**: Real-time regulation monitoring, violation detection
3. **Safety Agent**: Incident prediction, hazard analysis, protocol enforcement
4. **Resource Agent**: Workforce optimization, equipment scheduling
5. **Document Agent**: OCR processing, automatic categorization, routing
6. **Decision Agent**: Risk assessment, scenario modeling, recommendations
7. **Communication Agent**: NLP, sentiment analysis, automated notifications
8. **Due Diligence Agent**: Vendor verification, insurance validation
9. **Scheduling Agent**: Timeline optimization, critical path analysis

### Field Operations
- GPS-enhanced location services
- Camera integration for photo documentation
- Voice-to-text for hands-free data entry
- Offline queue with conflict resolution
- Emergency alert system
- Barcode/QR code scanning support

### Office Dashboard
- Predictive analytics for timeline and budget risks
- Safety risk prediction
- Resource bottleneck identification
- Real-time metrics and KPIs
- Customizable dashboards

### Communication Suite
- Real-time chat with threading
- Project context preservation
- Typing indicators
- File attachments
- Read receipts

### Developer Ecosystem
- Plugin architecture with SDK
- Webhook system for integrations
- Event-driven hooks
- API documentation

## 📁 Project Structure

```
project-perplexy/
├── packages/
│   ├── backend/          # Node.js/Express API
│   │   ├── src/
│   │   │   ├── services/
│   │   │   │   └── aiAgents/  # 9 AI agents
│   │   │   ├── routes/v1/     # Versioned API routes
│   │   │   ├── controllers/   # Request handlers
│   │   │   └── middleware/    # Auth, validation, RBAC
│   │   └── prisma/            # Database schema
│   ├── frontend/         # React 19 + TypeScript
│   │   ├── src/
│   │   │   ├── pages/         # 34+ page components
│   │   │   ├── services/      # API clients
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   └── contexts/      # Auth, state management
│   │   └── public/
│   │       ├── sw.js          # Service worker (PWA)
│   │       └── manifest.json  # PWA manifest
│   └── shared/
│       └── sdk/               # Developer SDK
├── docker-compose.yml    # Local development
├── .github/workflows/    # CI/CD pipelines
└── README.md
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 20
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Prisma ORM
- **Cache**: Redis
- **Real-Time**: Socket.IO
- **Authentication**: JWT + Passport.js (OAuth2)
- **Validation**: Zod
- **Testing**: Vitest

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Routing**: React Router DOM
- **Charts**: Recharts
- **Maps**: Leaflet/React-Leaflet
- **PWA**: Service Worker + Manifest

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- MongoDB (or use Docker)
- Redis (or use Docker)

### Local Development

1. **Clone and install**:
```bash
git clone <repository-url>
cd project-perplexy
npm install
```

2. **Start services**:
```bash
docker-compose up -d mongodb redis
```

3. **Setup database**:
```bash
cd packages/backend
npm run prisma:generate
npm run prisma:migrate
```

4. **Start backend**:
```bash
cd packages/backend
npm run dev
```

5. **Start frontend**:
```bash
cd packages/frontend
npm run dev
```

6. **Access application**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Docs: http://localhost:3001/api-docs

### Docker Deployment

```bash
docker-compose up -d
```

## 📚 API Documentation

### Versioned API (v1)

All production endpoints are under `/api/v1/`:

- `/api/v1/auth/*` - Authentication
- `/api/v1/projects/*` - Project management
- `/api/v1/field/*` - Field operations
- `/api/v1/documents/*` - Document management
- `/api/v1/compliance/*` - Compliance monitoring
- `/api/v1/safety/*` - Safety incident management
- `/api/v1/procurement/*` - Procurement & vendors
- `/api/v1/scheduling/*` - Schedule optimization
- `/api/v1/analytics/*` - Analytics & reporting
- `/api/v1/ai-agents/*` - AI agent execution
- `/api/v1/webhooks/*` - Webhook management

## 🧪 Testing

```bash
# Backend tests
cd packages/backend
npm test

# Frontend tests
cd packages/frontend
npm test

# Coverage
npm run test:coverage
```

## 📦 Deployment

### Quick Deployment

For quick deployment, use the automated script:

```bash
./deploy-production.sh
```

This script will guide you through:
- Prerequisites check
- Environment setup
- Building the application
- Choosing deployment method (Docker, PM2, or standalone)

### Deployment Guides

- **Quick Start:** [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) - Fast deployment reference
- **Complete Guide:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Detailed deployment instructions
- **CI/CD:** GitHub Actions workflow in `.github/workflows/deploy.yml`

### Deployment Options

1. **Docker Compose (Recommended)**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

2. **Vercel (Frontend)**
   ```bash
   cd packages/frontend
   vercel --prod
   ```

3. **Node.js with PM2**
   ```bash
   pnpm build:production
   pm2 start packages/backend/dist/index.js
   ```

### Production Checklist

- [ ] Set environment variables (use `.env.production.example` as template)
- [ ] Configure database connection (MongoDB)
- [ ] Set up Redis
- [ ] Configure JWT secrets (CHANGE defaults!)
- [ ] Set up OAuth2 credentials (Google)
- [ ] Configure CORS origins
- [ ] Set up SSL/TLS
- [ ] Configure file storage (Google Cloud Storage)
- [ ] Set up monitoring and logging (Sentry)
- [ ] Configure backups

### Environment Variables

See `.env.example` for development and `.env.production.example` for production required variables.

## 🔒 Security

- JWT authentication with refresh tokens
- Role-based access control (RBAC)
- Multi-tenant data isolation
- Input validation with Zod
- Rate limiting
- CORS configuration
- Helmet.js security headers
- SQL injection prevention (Prisma)
- XSS protection

## 📊 Statistics

- **143** Backend TypeScript files
- **88** Frontend files (TSX/TS)
- **34** Page components
- **25** Service modules
- **11** API route modules
- **9** AI agents
- **28** Backend services
- **20+** Database models

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

[Your License Here]

## 🆘 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ for the construction industry
