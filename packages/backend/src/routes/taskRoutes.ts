import { Router } from 'express'
import { taskController } from '../controllers/taskController.js'
import { authenticate } from '../middleware/auth.js'
import { checkRole, scopeFilter } from '../middleware/rbac.js'

const router: Router = Router()

// All task routes require authentication
router.use(authenticate)

// Get tasks - filtered by role and scope
router.get('/', scopeFilter, taskController.getTasks)

// Get task by ID
router.get('/:taskId', scopeFilter, taskController.getTask)

// Create task - requires supervisor or higher
router.post('/', checkRole('SUPERVISOR', 'COMPANY_ADMIN', 'SUPER_ADMIN'), scopeFilter, taskController.createTask)

// Update task - requires supervisor or higher (or assigned operative for updates)
router.put('/:taskId', scopeFilter, taskController.updateTask)

// Delete task - requires company admin or higher
router.delete('/:taskId', checkRole('COMPANY_ADMIN', 'SUPER_ADMIN'), scopeFilter, taskController.deleteTask)

// Assign task to users/roles
router.post('/:taskId/assign', checkRole('SUPERVISOR', 'COMPANY_ADMIN', 'SUPER_ADMIN'), scopeFilter, taskController.assignTask)

// Submit task update - operative and supervisor
router.post('/:taskId/update', checkRole('OPERATIVE', 'SUPERVISOR', 'COMPANY_ADMIN', 'SUPER_ADMIN'), scopeFilter, taskController.submitTaskUpdate)

// Approve timesheet - supervisor or higher
router.post('/:taskId/timesheet/approve', checkRole('SUPERVISOR', 'COMPANY_ADMIN', 'SUPER_ADMIN'), scopeFilter, taskController.approveTimesheet)

// Report safety issue - all roles
router.post('/:taskId/safety', authenticate, scopeFilter, taskController.reportSafetyIssue)

// Get users by role for task assignment
router.get('/assignment/users', checkRole('SUPERVISOR', 'COMPANY_ADMIN', 'SUPER_ADMIN'), scopeFilter, taskController.getUsersForAssignment)

export { router as taskRouter }

