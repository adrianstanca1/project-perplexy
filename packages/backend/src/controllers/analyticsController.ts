import { Request, Response, NextFunction } from 'express'
import { analyticsService } from '../services/analyticsService.js'
import { ApiError } from '../utils/ApiError.js'

const getScopeFromQuery = (req: Request) => ({
  organizationId: (req.query.organizationId as string) || undefined,
})

export const analyticsController = {
  async getDashboards(req: Request, res: Response, next: NextFunction) {
    try {
      const scope = getScopeFromQuery(req)
      const dashboards = await analyticsService.getDashboards({
        ...scope,
        userId: (req.query.userId as string) || undefined,
      })
      res.json({ success: true, dashboards })
    } catch (error) {
      next(error)
    }
  },

  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const { dashboardId } = req.params
      const dashboard = await analyticsService.getDashboardById(dashboardId, getScopeFromQuery(req))
      if (!dashboard) {
        throw new ApiError('Dashboard not found', 404)
      }
      res.json({ success: true, dashboard })
    } catch (error) {
      next(error)
    }
  },

  async createDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const dashboard = await analyticsService.createDashboard(req.body)
      res.json({ success: true, dashboard, msg: 'Dashboard created successfully' })
    } catch (error) {
      next(error)
    }
  },

  async updateDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const { dashboardId } = req.params
      const dashboard = await analyticsService.updateDashboard(dashboardId, req.body, getScopeFromQuery(req))
      res.json({ success: true, dashboard, msg: 'Dashboard updated successfully' })
    } catch (error) {
      next(error)
    }
  },

  async deleteDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const { dashboardId } = req.params
      await analyticsService.deleteDashboard(dashboardId, getScopeFromQuery(req))
      res.json({ success: true, message: 'Dashboard deleted successfully' })
    } catch (error) {
      next(error)
    }
  },

  async getMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const metrics = await analyticsService.getMetrics({
        ...getScopeFromQuery(req),
        projectId: (req.query.projectId as string) || undefined,
        type: (req.query.type as string) || undefined,
      })
      res.json({ success: true, metrics })
    } catch (error) {
      next(error)
    }
  },

  async generateReport(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await analyticsService.generateReport(req.body)
      res.json({ success: true, report, msg: 'Report generated successfully' })
    } catch (error) {
      next(error)
    }
  },

  async getReports(req: Request, res: Response, next: NextFunction) {
    try {
      const reports = await analyticsService.getReports({
        ...getScopeFromQuery(req),
        projectId: (req.query.projectId as string) || undefined,
        type: (req.query.type as string) || undefined,
      })
      res.json({ success: true, reports })
    } catch (error) {
      next(error)
    }
  },

  async getReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { reportId } = req.params
      const report = await analyticsService.getReportById(reportId, getScopeFromQuery(req))
      if (!report) {
        throw new ApiError('Report not found', 404)
      }
      res.json({ success: true, report })
    } catch (error) {
      next(error)
    }
  },

  async getAnalyticsStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await analyticsService.getAnalyticsStats(getScopeFromQuery(req))
      res.json({ success: true, stats })
    } catch (error) {
      next(error)
    }
  },
}

