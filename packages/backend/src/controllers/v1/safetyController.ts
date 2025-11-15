/**
 * Safety Controller (v1)
 */

import { Request, Response } from 'express'
import { safetyService } from '../../services/safetyService.js'
import { safetyAgent } from '../../services/aiAgents/safetyAgent.js'
import { ApiError } from '../../utils/errors.js'
import logger from '../../config/logger.js'

export const safetyController = {
  async getIncidents(req: Request, res: Response) {
    try {
      const { projectId, severity, status, type } = req.query
      const scopeFilter = req.scopeFilter || {}

      const incidents = await safetyService.getIncidents({
        ...scopeFilter,
        projectId: projectId as string,
        severity: severity as string,
        status: status as string,
        type: type as string,
      })

      res.json({ success: true, incidents })
    } catch (error: any) {
      logger.error('Get incidents failed', { error: error.message })
      throw new ApiError(500, 'Failed to fetch incidents')
    }
  },

  async getIncidentById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const scopeFilter = req.scopeFilter || {}

      const incident = await safetyService.getIncidentById(id, scopeFilter)

      if (!incident) {
        throw new ApiError(404, 'Incident not found')
      }

      res.json({ success: true, incident })
    } catch (error: any) {
      logger.error('Get incident by ID failed', { error: error.message })
      throw error
    }
  },

  async createIncident(req: Request, res: Response) {
    try {
      const userData = req.userData!
      const scopeFilter = req.scopeFilter || {}

      const incident = await safetyService.createIncident({
        ...req.body,
        organizationId: scopeFilter.organizationId,
        reportedBy: userData.id,
        occurredAt: new Date(req.body.occurredAt),
      })

      res.status(201).json({ success: true, incident })
    } catch (error: any) {
      logger.error('Create incident failed', { error: error.message })
      throw new ApiError(500, 'Failed to create incident')
    }
  },

  async updateIncident(req: Request, res: Response) {
    try {
      const { id } = req.params
      const scopeFilter = req.scopeFilter || {}

      const incident = await safetyService.updateIncident(id, req.body, scopeFilter)

      res.json({ success: true, incident })
    } catch (error: any) {
      logger.error('Update incident failed', { error: error.message })
      throw error
    }
  },

  async deleteIncident(req: Request, res: Response) {
    try {
      const { id } = req.params
      const scopeFilter = req.scopeFilter || {}

      await safetyService.deleteIncident(id, scopeFilter)

      res.json({ success: true, message: 'Incident deleted' })
    } catch (error: any) {
      logger.error('Delete incident failed', { error: error.message })
      throw error
    }
  },

  async analyzeIncident(req: Request, res: Response) {
    try {
      const { id } = req.params
      const scopeFilter = req.scopeFilter || {}

      const result = await safetyAgent.execute(
        { action: 'analyze_incident', incidentId: id },
        scopeFilter
      )

      res.json({ success: true, result })
    } catch (error: any) {
      logger.error('Analyze incident failed', { error: error.message })
      throw new ApiError(500, 'Incident analysis failed')
    }
  },

  async predictRisks(req: Request, res: Response) {
    try {
      const scopeFilter = req.scopeFilter || {}

      const result = await safetyAgent.execute(
        { action: 'predict_risks' },
        scopeFilter
      )

      res.json({ success: true, result })
    } catch (error: any) {
      logger.error('Predict risks failed', { error: error.message })
      throw new ApiError(500, 'Risk prediction failed')
    }
  },

  async analyzeHazard(req: Request, res: Response) {
    try {
      const { hazardData } = req.body
      const scopeFilter = req.scopeFilter || {}

      const result = await safetyAgent.execute(
        { action: 'analyze_hazard', hazardData },
        scopeFilter
      )

      res.json({ success: true, result })
    } catch (error: any) {
      logger.error('Analyze hazard failed', { error: error.message })
      throw new ApiError(500, 'Hazard analysis failed')
    }
  },

  async startInvestigation(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { notes } = req.body
      const scopeFilter = req.scopeFilter || {}

      const incident = await safetyService.startInvestigation(id, notes, scopeFilter)

      res.json({ success: true, incident })
    } catch (error: any) {
      logger.error('Start investigation failed', { error: error.message })
      throw new ApiError(500, 'Failed to start investigation')
    }
  },

  async updateInvestigation(req: Request, res: Response) {
    try {
      const { id } = req.params
      const { notes, rootCause, correctiveActions, preventiveActions } = req.body
      const scopeFilter = req.scopeFilter || {}

      const incident = await safetyService.updateInvestigation(
        id,
        { notes, rootCause, correctiveActions, preventiveActions },
        scopeFilter
      )

      res.json({ success: true, incident })
    } catch (error: any) {
      logger.error('Update investigation failed', { error: error.message })
      throw new ApiError(500, 'Failed to update investigation')
    }
  },

  async resolveIncident(req: Request, res: Response) {
    try {
      const { id } = req.params
      const scopeFilter = req.scopeFilter || {}

      const incident = await safetyService.resolveIncident(id, scopeFilter)

      res.json({ success: true, incident })
    } catch (error: any) {
      logger.error('Resolve incident failed', { error: error.message })
      throw new ApiError(500, 'Failed to resolve incident')
    }
  },
}

