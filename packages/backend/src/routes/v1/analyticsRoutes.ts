/**
 * Analytics API Routes (v1)
 * Business intelligence and reporting
 */

import { Router } from 'express'
import { authenticate, scopeFilter } from '../../middleware/auth.js'
import { analyticsController } from '../../controllers/v1/analyticsController.js'
import { validateRequest } from '../../middleware/validation.js'
import { z } from 'zod'

const router: Router = Router()

// All routes require authentication
router.use(authenticate)
router.use(scopeFilter)

// Dashboards
router.get('/dashboards', analyticsController.getDashboards)
router.get('/dashboards/:id', analyticsController.getDashboardById)
router.post(
  '/dashboards',
  validateRequest({
    body: z.object({
      name: z.string(),
      description: z.string().optional(),
      widgets: z.array(z.any()).optional(),
      layout: z.any().optional(),
      isDefault: z.boolean().optional(),
      isPublic: z.boolean().optional(),
    }),
  }),
  analyticsController.createDashboard
)
router.put('/dashboards/:id', analyticsController.updateDashboard)
router.delete('/dashboards/:id', analyticsController.deleteDashboard)

// Metrics
router.get('/metrics', analyticsController.getMetrics)
router.get('/metrics/:type', analyticsController.getMetricByType)

// Reports
router.get('/reports', analyticsController.getReports)
router.get('/reports/:id', analyticsController.getReportById)
router.post(
  '/reports/generate',
  validateRequest({
    body: z.object({
      type: z.enum([
        'PROJECT_STATUS',
        'FINANCIAL',
        'SAFETY',
        'COMPLIANCE',
        'RESOURCE_UTILIZATION',
        'VENDOR_PERFORMANCE',
        'CUSTOM',
      ]),
      projectId: z.string().optional(),
      template: z.string().optional(),
      filters: z.any().optional(),
    }),
  }),
  analyticsController.generateReport
)
router.post('/reports/:id/distribute', analyticsController.distributeReport)

export { router as analyticsRouter }

