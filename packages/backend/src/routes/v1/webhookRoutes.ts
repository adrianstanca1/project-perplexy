/**
 * Webhook API Routes (v1)
 * Third-party integration and data synchronization
 */

import { Router } from 'express'
import { authenticate, scopeFilter } from '../../middleware/auth.js'
import { webhookController } from '../../controllers/v1/webhookController.js'
import { validateRequest } from '../../middleware/validation.js'
import { z } from 'zod'

const router: Router = Router()

// All routes require authentication
router.use(authenticate)
router.use(scopeFilter)

// Webhook management
router.get('/', webhookController.getWebhooks)
router.get('/:id', webhookController.getWebhookById)
router.post(
  '/',
  validateRequest({
    body: z.object({
      url: z.string().url(),
      events: z.array(z.string()),
      secret: z.string().optional(),
      active: z.boolean().optional(),
    }),
  }),
  webhookController.createWebhook
)
router.put('/:id', webhookController.updateWebhook)
router.delete('/:id', webhookController.deleteWebhook)

// Webhook testing
router.post('/:id/test', webhookController.testWebhook)

// Webhook delivery history
router.get('/:id/deliveries', webhookController.getWebhookDeliveries)

export { router as webhookRouter }

