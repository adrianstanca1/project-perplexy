import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import session from 'express-session'
import passport from './config/auth.js'
import logger from './config/logger.js'
import { apiLimiter } from './middleware/rateLimit.js'
import { fileRouter } from './routes/fileRoutes.js'
import { executeRouter } from './routes/executeRoutes.js'
import { executionHistoryRouter } from './routes/executionHistoryRoutes.js'
import { locationRouter } from './routes/locationRoutes.js'
import { mapRouter } from './routes/mapRoutes.js'
import { projectRouter } from './routes/projectRoutes.js'
import { marketplaceRouter } from './routes/marketplaceRoutes.js'
import { desktopRouter } from './routes/desktopRoutes.js'
import { tenderRouter } from './routes/tenderRoutes.js'
import { supplierRouter } from './routes/supplierRoutes.js'
import { contractRouter } from './routes/contractRoutes.js'
import { messageRouter } from './routes/messageRoutes.js'
import { calendarRouter } from './routes/calendarRoutes.js'
import { teamRouter } from './routes/teamRoutes.js'
import { aiToolsRouter } from './routes/aiToolsRoutes.js'
import { collaborationRouter } from './routes/collaborationRoutes.js'
import { workflowRouter } from './routes/workflowRoutes.js'
import { analyticsRouter } from './routes/analyticsRoutes.js'
import { costEstimatorRouter } from './routes/costEstimatorRoutes.js'
import { integrationsRouter } from './routes/integrationsRoutes.js'
import { authRouter } from './routes/authRoutes.js'
import { taskRouter } from './routes/taskRoutes.js'
import { v1Router } from './routes/v1/index.js'
import { errorHandler } from './middleware/errorHandler.js'

dotenv.config()

const app = express()
const server = createServer(app)
const PORT = process.env.PORT || 3001

// Initialize Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

// Session configuration (for OAuth2)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'change-this-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
)

// Initialize Passport
app.use(passport.initialize())
app.use(passport.session())

// Middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
)
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Rate limiting
app.use('/api', apiLimiter)

// API Routes
// Versioned API
app.use('/api/v1', v1Router)

// Legacy routes (for backward compatibility)
app.use('/api/auth', authRouter)
app.use('/api/tasks', taskRouter)
app.use('/api/files', fileRouter)
app.use('/api/execute', executeRouter)
app.use('/api/execution-history', executionHistoryRouter)
app.use('/api/location', locationRouter)
app.use('/api/maps', mapRouter)
app.use('/api/projects', projectRouter)
app.use('/api/marketplace', marketplaceRouter)
app.use('/api/desktop', desktopRouter)
app.use('/api/tenders', tenderRouter)
app.use('/api/suppliers', supplierRouter)
app.use('/api/contracts', contractRouter)
app.use('/api/messages', messageRouter)
app.use('/api/calendar', calendarRouter)
app.use('/api/team', teamRouter)
app.use('/api/ai-tools', aiToolsRouter)
app.use('/api/collaboration', collaborationRouter)
app.use('/api/workflows', workflowRouter)
app.use('/api/analytics', analyticsRouter)
app.use('/api/cost-estimator', costEstimatorRouter)
app.use('/api/integrations', integrationsRouter)

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handler
app.use(errorHandler)

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`)

  // Join user room
  socket.on('join', (userId: string) => {
    socket.join(`user:${userId}`)
    logger.info(`User ${userId} joined room`)
  })

  // Leave user room
  socket.on('leave', (userId: string) => {
    socket.leave(`user:${userId}`)
    logger.info(`User ${userId} left room`)
  })

  // Handle disconnection
  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`)
  })
})

// Export Socket.IO instance for use in other modules
export { io }

// Start server
server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`)
  logger.info(`📡 API available at http://localhost:${PORT}/api`)
  logger.info(`🔌 Socket.IO available at ws://localhost:${PORT}`)
})

