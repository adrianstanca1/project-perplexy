/**
 * Scheduling API Routes (v1)
 * Timeline and resource management
 */

import { Router } from 'express'
import { authenticate, scopeFilter } from '../../middleware/auth.js'
import { schedulingController } from '../../controllers/v1/schedulingController.js'
import { validateRequest } from '../../middleware/validation.js'
import { z } from 'zod'

const router: Router = Router()

// All routes require authentication
router.use(authenticate)
router.use(scopeFilter)

// Schedules
router.get('/', schedulingController.getSchedules)
router.get('/:id', schedulingController.getScheduleById)
router.post(
  '/',
  validateRequest({
    body: z.object({
      projectId: z.string(),
      name: z.string(),
      description: z.string().optional(),
      startDate: z.string().datetime(),
      endDate: z.string().datetime(),
    }),
  }),
  schedulingController.createSchedule
)
router.put('/:id', schedulingController.updateSchedule)
router.delete('/:id', schedulingController.deleteSchedule)

// AI optimization
router.post('/:id/optimize', schedulingController.optimizeTimeline)
router.post('/:id/analyze-critical-path', schedulingController.analyzeCriticalPath)
router.post('/:id/resolve-conflicts', schedulingController.resolveConflicts)
router.post('/generate', schedulingController.generateSchedule)

export { router as schedulingRouter }

