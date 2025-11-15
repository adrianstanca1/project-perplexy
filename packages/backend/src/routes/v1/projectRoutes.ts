/**
 * Projects API Routes (v1)
 */

import { Router } from 'express'
import { projectController } from '../../controllers/projectController.js'
import { authenticate, scopeFilter } from '../../middleware/auth.js'
import { validateRequest } from '../../middleware/validation.js'
import { z } from 'zod'

const router: Router = Router()

// All routes require authentication
router.use(authenticate)
router.use(scopeFilter)

// Project CRUD
router.get('/', projectController.getProjects)
router.get('/:projectId', projectController.getProject)
router.post(
  '/',
  validateRequest({
    body: z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).optional(),
      budget: z.number().optional(),
      currency: z.string().optional(),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
      location: z.string().optional(),
      coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
    }),
  }),
  projectController.createProject
)
router.put('/:projectId', projectController.updateProject)
router.delete('/:projectId', projectController.deleteProject)

// Project statistics
router.get('/:projectId/stats', projectController.getProjectStats)
router.get('/stats/all', projectController.getAllProjectStats)

export { router as projectRouter }

