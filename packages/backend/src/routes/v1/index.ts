/**
 * API v1 Routes
 * Production-grade API with versioning
 */

import { Router } from 'express'
import { authRouter } from './authRoutes.js'
import { projectRouter } from './projectRoutes.js'
import { fieldRouter } from './fieldRoutes.js'
import { documentRouter } from './documentRoutes.js'
import { complianceRouter } from './complianceRoutes.js'
import { safetyRouter } from './safetyRoutes.js'
import { procurementRouter } from './procurementRoutes.js'
import { schedulingRouter } from './schedulingRoutes.js'
import { analyticsRouter } from './analyticsRoutes.js'
import { aiAgentRouter } from './aiAgentRoutes.js'
import { webhookRouter } from './webhookRoutes.js'

const router: Router = Router()

// API v1 routes
router.use('/auth', authRouter)
router.use('/projects', projectRouter)
router.use('/field', fieldRouter)
router.use('/documents', documentRouter)
router.use('/compliance', complianceRouter)
router.use('/safety', safetyRouter)
router.use('/procurement', procurementRouter)
router.use('/scheduling', schedulingRouter)
router.use('/analytics', analyticsRouter)
router.use('/ai-agents', aiAgentRouter)
router.use('/webhooks', webhookRouter)

export { router as v1Router }

