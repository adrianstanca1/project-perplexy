import express, { Router } from 'express'
import { contractController } from '../controllers/contractController.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { z } from 'zod'

const router: Router = express.Router()

// Validation schemas
const createContractSchema = z.object({
  title: z.string().min(1),
  supplier: z.string().min(1),
  value: z.number().min(0),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  type: z.string().optional(),
  renewalDate: z.string().min(1),
  keyTerms: z.array(z.string()).optional(),
})

const updateContractSchema = z.object({
  title: z.string().min(1).optional(),
  supplier: z.string().min(1).optional(),
  value: z.number().min(0).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['active', 'pending', 'expired', 'renewal']).optional(),
  progress: z.number().min(0).max(100).optional(),
  type: z.string().optional(),
  renewalDate: z.string().optional(),
  keyTerms: z.array(z.string()).optional(),
})

// Routes
router.get('/stats', contractController.getContractStats)
router.get('/', contractController.getContracts)
router.get('/:contractId', contractController.getContract)
router.post('/', validateRequest(createContractSchema), contractController.createContract)
router.put('/:contractId', validateRequest(updateContractSchema), contractController.updateContract)
router.delete('/:contractId', contractController.deleteContract)

export { router as contractRouter }

