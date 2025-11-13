import express, { Router } from 'express'
import { projectController } from '../controllers/projectController.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { z } from 'zod'

const router: Router = express.Router()

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
})

const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
})

// Routes
router.get('/stats', projectController.getAllProjectStats)
router.get('/', projectController.getProjects)
router.get('/:projectId', projectController.getProject)
router.get('/:projectId/stats', projectController.getProjectStats)
router.post('/', validateRequest(createProjectSchema), projectController.createProject)
router.put('/:projectId', validateRequest(updateProjectSchema), projectController.updateProject)
router.delete('/:projectId', projectController.deleteProject)

export { router as projectRouter }

