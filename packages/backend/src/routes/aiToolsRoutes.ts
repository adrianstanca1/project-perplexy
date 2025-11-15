import express, { Router } from 'express'
import { aiToolsController } from '../controllers/aiToolsController.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { z } from 'zod'

const router: Router = express.Router()

// Validation schemas
const createAIToolSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(['text', 'image', 'code', 'analysis', 'automation']),
})

const updateAIToolSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  category: z.enum(['text', 'image', 'code', 'analysis', 'automation']).optional(),
  status: z.enum(['active', 'inactive', 'pending']).optional(),
})

const executeAIToolSchema = z.object({
  toolId: z.string().min(1),
  input: z.string().min(1),
  options: z.record(z.any()).optional(),
})

// Routes
router.get('/stats', aiToolsController.getAIToolStats)
router.get('/', aiToolsController.getAITools)
router.get('/:toolId', aiToolsController.getAITool)
router.post('/', validateRequest(createAIToolSchema), aiToolsController.createAITool)
router.put('/:toolId', validateRequest(updateAIToolSchema), aiToolsController.updateAITool)
router.delete('/:toolId', aiToolsController.deleteAITool)
router.post('/execute', validateRequest(executeAIToolSchema), aiToolsController.executeAITool)

export { router as aiToolsRouter }

