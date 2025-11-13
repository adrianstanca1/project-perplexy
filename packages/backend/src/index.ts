import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { fileRouter } from './routes/fileRoutes.js'
import { executeRouter } from './routes/executeRoutes.js'
import { executionHistoryRouter } from './routes/executionHistoryRoutes.js'
import { locationRouter } from './routes/locationRoutes.js'
import { mapRouter } from './routes/mapRoutes.js'
import { projectRouter } from './routes/projectRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'
import { websocketService } from './services/websocketService.js'

dotenv.config()

const app = express()
const server = createServer(app)
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(cors())
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Routes
app.use('/api/files', fileRouter)
app.use('/api/execute', executeRouter)
app.use('/api/execution-history', executionHistoryRouter)
app.use('/api/location', locationRouter)
app.use('/api/maps', mapRouter)
app.use('/api/projects', projectRouter)

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handler
app.use(errorHandler)

// Initialize WebSocket server
websocketService.initialize(server)

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📡 API available at http://localhost:${PORT}/api`)
  console.log(`🔌 WebSocket available at ws://localhost:${PORT}/ws`)
})

