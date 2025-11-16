import { Router } from 'express'
import { projectController } from '../controllers/projectController.js'
import { authenticate } from '../middleware/auth.js'
import { scopeFilter } from '../middleware/rbac.js'

const router: Router = Router()

// All project routes require authentication
router.use(authenticate)
router.use(scopeFilter)

// Project CRUD routes
router.get('/', projectController.getProjects)
router.post('/', projectController.createProject)
router.get('/:projectId', projectController.getProject)
router.put('/:projectId', projectController.updateProject)
router.delete('/:projectId', projectController.deleteProject)

// Project stats
router.get('/:projectId/stats', projectController.getProjectStats)

// Ping endpoint for smoke testing
router.get('/_ping', (_req, res) => {
  res.json({ message: 'project routes active', route: '/api/projects' })
})

export { router as projectRouter }

