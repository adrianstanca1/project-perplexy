import express, { Router } from 'express'
import { workflowController } from '../controllers/workflowController.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { z } from 'zod'

const router: Router = express.Router()

// Validation schemas
const createWorkflowSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  triggers: z.array(
    z.object({
      type: z.enum(['schedule', 'event', 'webhook', 'manual']),
      config: z.record(z.any()),
    })
  ),
  actions: z.array(
    z.object({
      type: z.enum(['notification', 'email', 'webhook', 'database', 'api']),
      config: z.record(z.any()),
      order: z.number(),
    })
  ),
})

const updateWorkflowSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  status: z.enum(['active', 'inactive', 'draft']).optional(),
  triggers: z
    .array(
      z.object({
        type: z.enum(['schedule', 'event', 'webhook', 'manual']),
        config: z.record(z.any()),
      })
    )
    .optional(),
  actions: z
    .array(
      z.object({
        type: z.enum(['notification', 'email', 'webhook', 'database', 'api']),
        config: z.record(z.any()),
        order: z.number(),
      })
    )
    .optional(),
})

// Routes
router.get('/stats', workflowController.getWorkflowStats)
router.get('/executions', workflowController.getWorkflowExecutions)
router.get('/', workflowController.getWorkflows)
router.get('/:workflowId', workflowController.getWorkflow)
router.post('/', validateRequest(createWorkflowSchema), workflowController.createWorkflow)
router.put('/:workflowId', validateRequest(updateWorkflowSchema), workflowController.updateWorkflow)
router.delete('/:workflowId', workflowController.deleteWorkflow)
router.post('/:workflowId/execute', workflowController.executeWorkflow)

export { router as workflowRouter }

