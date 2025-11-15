import express, { Router } from 'express'
import { analyticsController } from '../controllers/analyticsController.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { z } from 'zod'

const router: Router = express.Router()

// Validation schemas
const createDashboardSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  widgets: z
    .array(
      z.object({
        id: z.string(),
        type: z.enum(['chart', 'table', 'metric', 'map']),
        title: z.string(),
        config: z.record(z.any()),
        data: z.any(),
      })
    )
    .optional(),
})

const updateDashboardSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  widgets: z
    .array(
      z.object({
        id: z.string(),
        type: z.enum(['chart', 'table', 'metric', 'map']),
        title: z.string(),
        config: z.record(z.any()),
        data: z.any(),
      })
    )
    .optional(),
})

const generateReportSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['tender', 'contract', 'project', 'team', 'financial']),
  filters: z.record(z.any()).optional(),
  dateRange: z
    .object({
      start: z.string(),
      end: z.string(),
    })
    .optional(),
})

// Routes
router.get('/stats', analyticsController.getAnalyticsStats)
router.get('/metrics', analyticsController.getMetrics)
router.get('/reports', analyticsController.getReports)
router.get('/reports/:reportId', analyticsController.getReport)
router.post('/reports/generate', validateRequest(generateReportSchema), analyticsController.generateReport)
router.get('/dashboards', analyticsController.getDashboards)
router.get('/dashboards/:dashboardId', analyticsController.getDashboard)
router.post('/dashboards', validateRequest(createDashboardSchema), analyticsController.createDashboard)
router.put('/dashboards/:dashboardId', validateRequest(updateDashboardSchema), analyticsController.updateDashboard)
router.delete('/dashboards/:dashboardId', analyticsController.deleteDashboard)

export { router as analyticsRouter }

