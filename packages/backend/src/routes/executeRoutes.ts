import express, { Router } from 'express'
import { executeController } from '../controllers/executeController.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { z } from 'zod'

const router: Router = express.Router()

// Execution validation schema
const executeSchema = z.object({
  code: z.string().min(1),
  filePath: z.string().optional(),
  language: z.enum(['python', 'javascript', 'typescript']).optional(),
})

// Routes
router.post('/', validateRequest(executeSchema), executeController.executeCode)
router.post('/stop', executeController.stopExecution)

export { router as executeRouter }

