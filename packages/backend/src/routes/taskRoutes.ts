import { Router } from 'express'
import { taskController } from '../controllers/taskController.js'
import { authenticate } from '../middleware/auth.js'
import { scopeFilter } from '../middleware/rbac.js'

const router: Router = Router()

// All task routes require authentication
router.use(authenticate)
router.use(scopeFilter)

// Task CRUD routes
router.get('/', taskController.getTasks)
router.post('/', taskController.createTask)
router.get('/:taskId', taskController.getTask)
router.put('/:taskId', taskController.updateTask)
router.delete('/:taskId', taskController.deleteTask)

// Task assignment and approval
router.post('/:taskId/assign', taskController.assignTask)
router.post('/:taskId/submit', taskController.submitTaskUpdate)
router.post('/:taskId/approve-timesheet', taskController.approveTimesheet)
router.post('/:taskId/safety-issue', taskController.reportSafetyIssue)

// Get users for task assignment
router.get('/users/assignment', taskController.getUsersForAssignment)

// Ping endpoint for smoke testing
router.get('/_ping', (_req, res) => {
  res.json({ message: 'task routes active', route: '/api/tasks' })
})

export { router as taskRouter }

