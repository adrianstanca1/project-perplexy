/**
 * Webhook Controller (v1)
 */

import { Request, Response } from 'express'
import { webhookService } from '../../services/webhookService.js'
import { ApiError } from '../../utils/errors.js'
import logger from '../../config/logger.js'

export const webhookController = {
  async getWebhooks(req: Request, res: Response) {
    try {
      const scopeFilter = req.scopeFilter || {}
      const webhooks = await webhookService.getWebhooks(scopeFilter)
      res.json({ success: true, webhooks })
    } catch (error: any) {
      logger.error('Get webhooks failed', { error: error.message })
      throw new ApiError(500, 'Failed to fetch webhooks')
    }
  },

  async getWebhookById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const scopeFilter = req.scopeFilter || {}
      const webhook = await webhookService.getWebhookById(id, scopeFilter)
      
      if (!webhook) {
        throw new ApiError(404, 'Webhook not found')
      }
      
      res.json({ success: true, webhook })
    } catch (error: any) {
      logger.error('Get webhook by ID failed', { error: error.message })
      throw error
    }
  },

  async createWebhook(req: Request, res: Response) {
    try {
      const scopeFilter = req.scopeFilter || {}
      const webhook = await webhookService.createWebhook({
        ...req.body,
        organizationId: scopeFilter.organizationId,
      })
      res.status(201).json({ success: true, webhook })
    } catch (error: any) {
      logger.error('Create webhook failed', { error: error.message })
      throw new ApiError(500, 'Failed to create webhook')
    }
  },

  async updateWebhook(req: Request, res: Response) {
    try {
      const { id } = req.params
      const scopeFilter = req.scopeFilter || {}
      const webhook = await webhookService.updateWebhook(id, req.body, scopeFilter)
      res.json({ success: true, webhook })
    } catch (error: any) {
      logger.error('Update webhook failed', { error: error.message })
      throw error
    }
  },

  async deleteWebhook(req: Request, res: Response) {
    try {
      const { id } = req.params
      const scopeFilter = req.scopeFilter || {}
      await webhookService.deleteWebhook(id, scopeFilter)
      res.json({ success: true, message: 'Webhook deleted' })
    } catch (error: any) {
      logger.error('Delete webhook failed', { error: error.message })
      throw error
    }
  },

  async testWebhook(req: Request, res: Response) {
    try {
      const { id } = req.params
      const scopeFilter = req.scopeFilter || {}
      const result = await webhookService.testWebhook(id, scopeFilter)
      res.json({ success: true, result })
    } catch (error: any) {
      logger.error('Test webhook failed', { error: error.message })
      throw new ApiError(500, 'Webhook test failed')
    }
  },

  async getWebhookDeliveries(req: Request, res: Response) {
    try {
      const { id } = req.params
      const scopeFilter = req.scopeFilter || {}
      const deliveries = await webhookService.getWebhookDeliveries(id, scopeFilter)
      res.json({ success: true, deliveries })
    } catch (error: any) {
      logger.error('Get webhook deliveries failed', { error: error.message })
      throw new ApiError(500, 'Failed to fetch webhook deliveries')
    }
  },
}

