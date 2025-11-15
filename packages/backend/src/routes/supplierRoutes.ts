import express, { Router } from 'express'
import { supplierController } from '../controllers/supplierController.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { z } from 'zod'

const router: Router = express.Router()

// Validation schemas
const createSupplierSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  contact: z.object({
    email: z.string().email(),
    phone: z.string().min(1),
    address: z.string().min(1),
  }),
  qualifications: z.array(z.string()).optional(),
})

const updateSupplierSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  rating: z.number().min(0).max(5).optional(),
  status: z.enum(['verified', 'active', 'pending']).optional(),
  contact: z
    .object({
      email: z.string().email().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
    })
    .optional(),
  qualifications: z.array(z.string()).optional(),
})

// Routes
router.get('/stats', supplierController.getSupplierStats)
router.get('/', supplierController.getSuppliers)
router.get('/:supplierId', supplierController.getSupplier)
router.post('/', validateRequest(createSupplierSchema), supplierController.createSupplier)
router.put('/:supplierId', validateRequest(updateSupplierSchema), supplierController.updateSupplier)
router.delete('/:supplierId', supplierController.deleteSupplier)

export { router as supplierRouter }

