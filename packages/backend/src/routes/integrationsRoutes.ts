import express, { Router } from 'express'
import { integrationsController } from '../controllers/integrationsController.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { z } from 'zod'

const router: Router = express.Router()

// Validation schemas
const createIntegrationSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(['api', 'webhook', 'oauth', 'sdk']),
  provider: z.string().min(1),
  config: z.record(z.any()),
})

const updateIntegrationSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  status: z.enum(['active', 'inactive', 'error']).optional(),
  config: z.record(z.any()).optional(),
})

// Routes
router.get('/stats', integrationsController.getIntegrationsStats)
router.get('/providers', integrationsController.getProviders)
router.get('/providers/:providerId', integrationsController.getProvider)
router.get('/syncs', integrationsController.getIntegrationSyncs)
router.get('/', integrationsController.getIntegrations)
router.get('/:integrationId', integrationsController.getIntegration)
router.post('/', validateRequest(createIntegrationSchema), integrationsController.createIntegration)
router.put('/:integrationId', validateRequest(updateIntegrationSchema), integrationsController.updateIntegration)
router.delete('/:integrationId', integrationsController.deleteIntegration)
router.post('/:integrationId/sync', integrationsController.syncIntegration)

export { router as integrationsRouter }

