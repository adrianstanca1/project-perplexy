/**
 * Compliance Controller (v1)
 */

import { Request, Response } from 'express'
import { complianceService } from '../../services/complianceService.js'
import { complianceAgent } from '../../services/aiAgents/complianceAgent.js'
import { ApiError } from '../../utils/errors.js'
import logger from '../../config/logger.js'

const getScopeFilter = (req: Request) => req.scopeFilter || {}

export const complianceController = {
  async getComplianceRecords(req: Request, res: Response) {
    try {
      const { projectId, status, isViolation } = req.query
      const scopeFilter = getScopeFilter(req)

      const records = await complianceService.getComplianceRecords({
        ...scopeFilter,
        projectId: projectId as string,
        status: status as string,
        isViolation: isViolation === 'true',
      })

      res.json({ success: true, records })
    } catch (error: any) {
      logger.error('Get compliance records failed', { error: error.message })
      throw new ApiError(500, 'Failed to fetch compliance records')
    }
  },

  async getComplianceRecordById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const scopeFilter = getScopeFilter(req)

      const record = await complianceService.getComplianceRecordById(id, scopeFilter)

      if (!record) {
        throw new ApiError(404, 'Compliance record not found')
      }

      res.json({ success: true, record })
    } catch (error: any) {
      logger.error('Get compliance record by ID failed', { error: error.message })
      throw error
    }
  },

  async createComplianceRecord(req: Request, res: Response) {
    try {
      const scopeFilter = getScopeFilter(req)

      const record = await complianceService.createComplianceRecord({
        ...req.body,
        organizationId: scopeFilter.organizationId,
      })

      res.status(201).json({ success: true, record })
    } catch (error: any) {
      logger.error('Create compliance record failed', { error: error.message })
      throw new ApiError(500, 'Failed to create compliance record')
    }
  },

  async updateComplianceRecord(req: Request, res: Response) {
    try {
      const { id } = req.params
      const scopeFilter = getScopeFilter(req)

      const record = await complianceService.updateComplianceRecord(id, req.body, scopeFilter)

      res.json({ success: true, record })
    } catch (error: any) {
      logger.error('Update compliance record failed', { error: error.message })
      throw error
    }
  },

  async deleteComplianceRecord(req: Request, res: Response) {
    try {
      const { id } = req.params
      const scopeFilter = getScopeFilter(req)

      await complianceService.deleteComplianceRecord(id, scopeFilter)

      res.json({ success: true, message: 'Compliance record deleted' })
    } catch (error: any) {
      logger.error('Delete compliance record failed', { error: error.message })
      throw error
    }
  },

  async monitorCompliance(req: Request, res: Response) {
    try {
      const scopeFilter = getScopeFilter(req)

      const result = await complianceAgent.execute(
        { action: 'monitor' },
        scopeFilter
      )

      res.json({ success: true, result })
    } catch (error: any) {
      logger.error('Compliance monitoring failed', { error: error.message })
      throw new ApiError(500, 'Compliance monitoring failed')
    }
  },

  async getViolations(req: Request, res: Response) {
    try {
      const { regulation } = req.query
      const scopeFilter = getScopeFilter(req)

      const result = await complianceAgent.execute(
        { action: 'check_violation', regulation: regulation as string },
        scopeFilter
      )

      res.json({ success: true, result })
    } catch (error: any) {
      logger.error('Get violations failed', { error: error.message })
      throw new ApiError(500, 'Failed to fetch violations')
    }
  },

  async performAudit(req: Request, res: Response) {
    try {
      const scopeFilter = getScopeFilter(req)

      const result = await complianceAgent.execute(
        { action: 'audit' },
        scopeFilter
      )

      res.json({ success: true, result })
    } catch (error: any) {
      logger.error('Perform audit failed', { error: error.message })
      throw new ApiError(500, 'Audit failed')
    }
  },

  async startRemediation(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { plan, deadline } = req.body
      const scopeFilter = getScopeFilter(req)

      const record = await complianceService.startRemediation(id, { plan, deadline }, scopeFilter)

      res.json({ success: true, record })
    } catch (error: any) {
      logger.error('Start remediation failed', { error: error.message })
      throw new ApiError(500, 'Failed to start remediation')
    }
  },

  async updateRemediationStatus(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { status, completedAt } = req.body
      const scopeFilter = getScopeFilter(req)

      const record = await complianceService.updateRemediationStatus(
        id,
        { status, completedAt },
        scopeFilter
      )

      res.json({ success: true, record })
    } catch (error: any) {
      logger.error('Update remediation status failed', { error: error.message })
      throw new ApiError(500, 'Failed to update remediation status')
    }
  },
}

