import express, { Router } from 'express'
import { costEstimatorController } from '../controllers/costEstimatorController.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { z } from 'zod'

const router: Router = express.Router()

// Validation schemas
const costItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  quantity: z.number().min(0),
  unit: z.string().min(1),
  unitCost: z.number().min(0),
  totalCost: z.number().min(0),
  notes: z.string().optional(),
})

const costCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  items: z.array(costItemSchema),
  subtotal: z.number().min(0),
})

const createCostEstimateSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  projectId: z.string().optional(),
  tenderId: z.string().optional(),
  categories: z.array(costCategorySchema),
  markup: z.number().min(0).optional(),
})

const updateCostEstimateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  categories: z.array(costCategorySchema).optional(),
  markup: z.number().min(0).optional(),
  status: z.enum(['draft', 'pending', 'approved', 'rejected']).optional(),
})

// Routes
router.get('/stats', costEstimatorController.getCostEstimatorStats)
router.get('/templates', costEstimatorController.getTemplates)
router.get('/templates/:templateId', costEstimatorController.getTemplate)
router.get('/', costEstimatorController.getCostEstimates)
router.get('/:estimateId', costEstimatorController.getCostEstimate)
router.post('/', validateRequest(createCostEstimateSchema), costEstimatorController.createCostEstimate)
router.put('/:estimateId', validateRequest(updateCostEstimateSchema), costEstimatorController.updateCostEstimate)
router.delete('/:estimateId', costEstimatorController.deleteCostEstimate)

export { router as costEstimatorRouter }

