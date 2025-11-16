import { Router } from 'express'
import { analyticsController } from '../controllers/analyticsController.js'
import { authenticate } from '../middleware/auth.js'
import { scopeFilter } from '../middleware/rbac.js'

const router: Router = Router()

// All analytics routes require authentication
router.use(authenticate)
router.use(scopeFilter)

// Analytics routes
router.get('/dashboards', analyticsController.getDashboards)
router.post('/dashboards', analyticsController.createDashboard)
router.get('/dashboards/:dashboardId', analyticsController.getDashboard)
router.put('/dashboards/:dashboardId', analyticsController.updateDashboard)
router.delete('/dashboards/:dashboardId', analyticsController.deleteDashboard)
router.get('/metrics', analyticsController.getMetrics)
router.get('/reports', analyticsController.getReports)
router.post('/reports', analyticsController.generateReport)
router.get('/reports/:reportId', analyticsController.getReport)
router.get('/stats', analyticsController.getAnalyticsStats)

// Ping endpoint for smoke testing
router.get('/_ping', (_req, res) => {
  res.json({ message: 'analytics routes active', route: '/api/analytics' })
})

export { router as analyticsRouter }

