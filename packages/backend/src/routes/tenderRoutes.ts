import express, { Router } from 'express'
import { tenderController } from '../controllers/tenderController.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { z } from 'zod'

const router: Router = express.Router()

// Validation schemas
const createTenderSchema = z.object({
  title: z.string().min(1),
  client: z.string().min(1),
  value: z.number().min(0),
  deadline: z.string().min(1),
  assignedTo: z.string().optional(),
  category: z.string().optional(),
  requirements: z.array(z.string()).optional(),
})

const updateTenderSchema = z.object({
  title: z.string().min(1).optional(),
  client: z.string().min(1).optional(),
  value: z.number().min(0).optional(),
  deadline: z.string().optional(),
  status: z.enum(['draft', 'active', 'submitted', 'won', 'lost']).optional(),
  winProbability: z.number().min(0).max(100).optional(),
  submissionDate: z.string().optional(),
  assignedTo: z.string().optional(),
  category: z.string().optional(),
  requirements: z.array(z.string()).optional(),
  progress: z.number().min(0).max(100).optional(),
})

// Routes
router.get('/stats', tenderController.getTenderStats)
router.get('/', tenderController.getTenders)
router.get('/:tenderId', tenderController.getTender)
router.post('/', validateRequest(createTenderSchema), tenderController.createTender)
router.put('/:tenderId', validateRequest(updateTenderSchema), tenderController.updateTender)
router.delete('/:tenderId', tenderController.deleteTender)

export { router as tenderRouter }

