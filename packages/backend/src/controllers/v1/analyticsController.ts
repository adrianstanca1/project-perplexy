/**
 * Analytics Controller (v1)
 */

import { Request, Response } from 'express'
import { analyticsService } from '../../services/analyticsService.js'
import { ApiError } from '../../utils/errors.js'
import logger from '../../config/logger.js'

const getScopeFilter = (req: Request) => req.scopeFilter || {}

export const analyticsController = {
  async getDashboards(req: Request, res: Response) {
    try {
      const scopeFilter = getScopeFilter(req)
      const userData = req.userData!

      const dashboards = await analyticsService.getDashboards({
        ...scopeFilter,
        userId: userData.id,
      })

      res.json({ success: true, dashboards })
    } catch (error: any) {
      logger.error('Get dashboards failed', { error: error.message })
      throw new ApiError(500, 'Failed to fetch dashboards')
    }
  },

  async getDashboardById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const scopeFilter = getScopeFilter(req)

      const dashboard = await analyticsService.getDashboardById(id, scopeFilter)

      if (!dashboard) {
        throw new ApiError(404, 'Dashboard not found')
      }

      res.json({ success: true, dashboard })
    } catch (error: any) {
      logger.error('Get dashboard by ID failed', { error: error.message })
      throw error
    }
  },

  async createDashboard(req: Request, res: Response) {
    try {
      const scopeFilter = getScopeFilter(req)
      const userData = req.userData!

      const dashboard = await analyticsService.createDashboard({
        ...req.body,
        organizationId: scopeFilter.organizationId,
        userId: userData.id,
      })

      res.status(201).json({ success: true, dashboard })
    } catch (error: any) {
      logger.error('Create dashboard failed', { error: error.message })
      throw new ApiError(500, 'Failed to create dashboard')
    }
  },

  async updateDashboard(req: Request, res: Response) {
    try {
      const { id } = req.params
      const scopeFilter = getScopeFilter(req)

      const dashboard = await analyticsService.updateDashboard(id, req.body, scopeFilter)

      res.json({ success: true, dashboard })
    } catch (error: any) {
      logger.error('Update dashboard failed', { error: error.message })
      throw error
    }
  },

  async deleteDashboard(req: Request, res: Response) {
    try {
      const { id } = req.params
      const scopeFilter = getScopeFilter(req)

      await analyticsService.deleteDashboard(id, scopeFilter)

      res.json({ success: true, message: 'Dashboard deleted' })
    } catch (error: any) {
      logger.error('Delete dashboard failed', { error: error.message })
      throw error
    }
  },

  async getMetrics(req: Request, res: Response) {
    try {
      const { projectId, type } = req.query
      const scopeFilter = getScopeFilter(req)

      const metrics = await analyticsService.getMetrics({
        ...scopeFilter,
        projectId: projectId as string,
        type: type as string,
      })

      res.json({ success: true, metrics })
    } catch (error: any) {
      logger.error('Get metrics failed', { error: error.message })
      throw new ApiError(500, 'Failed to fetch metrics')
    }
  },

  async getMetricByType(req: Request, res: Response) {
    try {
      const { type } = req.params
      const scopeFilter = getScopeFilter(req)

      const metric = await analyticsService.getMetricByType(type, scopeFilter)

      res.json({ success: true, metric })
    } catch (error: any) {
      logger.error('Get metric by type failed', { error: error.message })
      throw error
    }
  },

  async getReports(req: Request, res: Response) {
    try {
      const { projectId, type } = req.query
      const scopeFilter = getScopeFilter(req)

      const reports = await analyticsService.getReports({
        ...scopeFilter,
        projectId: projectId as string,
        type: type as string,
      })

      res.json({ success: true, reports })
    } catch (error: any) {
      logger.error('Get reports failed', { error: error.message })
      throw new ApiError(500, 'Failed to fetch reports')
    }
  },

  async getReportById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const scopeFilter = getScopeFilter(req)

      const report = await analyticsService.getReportById(id, scopeFilter)

      if (!report) {
        throw new ApiError(404, 'Report not found')
      }

      res.json({ success: true, report })
    } catch (error: any) {
      logger.error('Get report by ID failed', { error: error.message })
      throw error
    }
  },

  async generateReport(req: Request, res: Response) {
    try {
      const scopeFilter = getScopeFilter(req)

      const report = await analyticsService.generateReport({
        ...req.body,
        organizationId: scopeFilter.organizationId,
      })

      res.status(201).json({ success: true, report })
    } catch (error: any) {
      logger.error('Generate report failed', { error: error.message })
      throw new ApiError(500, 'Report generation failed')
    }
  },

  async distributeReport(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { distributionList } = req.body
      const scopeFilter = getScopeFilter(req)

      const report = await analyticsService.distributeReport(id, distributionList, scopeFilter)

      res.json({ success: true, report })
    } catch (error: any) {
      logger.error('Distribute report failed', { error: error.message })
      throw new ApiError(500, 'Report distribution failed')
    }
  },
}

