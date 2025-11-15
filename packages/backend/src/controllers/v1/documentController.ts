/**
 * Document Controller (v1)
 */

import { Request, Response } from 'express'
import { documentService } from '../../services/documentService.js'
import { documentAgent } from '../../services/aiAgents/documentAgent.js'
import { ApiError } from '../../utils/errors.js'
import logger from '../../config/logger.js'

export const documentController = {
  async getDocuments(req: Request, res: Response) {
    try {
      const { projectId, type, category } = req.query
      const scopeFilter = req.scopeFilter || {}

      const documents = await documentService.getDocuments({
        ...scopeFilter,
        projectId: projectId as string,
        type: type as string,
        category: category as string,
      })

      res.json({ success: true, documents })
    } catch (error: any) {
      logger.error('Get documents failed', { error: error.message })
      throw new ApiError(500, 'Failed to fetch documents')
    }
  },

  async getDocumentById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const scopeFilter = req.scopeFilter || {}

      const document = await documentService.getDocumentById(id, scopeFilter)

      if (!document) {
        throw new ApiError(404, 'Document not found')
      }

      res.json({ success: true, document })
    } catch (error: any) {
      logger.error('Get document by ID failed', { error: error.message })
      throw error
    }
  },

  async createDocument(req: Request, res: Response) {
    try {
      const file = req.file
      if (!file) {
        throw new ApiError(400, 'File is required')
      }

      const scopeFilter = req.scopeFilter || {}
      const document = await documentService.createDocument({
        ...req.body,
        file,
        organizationId: scopeFilter.organizationId,
      })

      res.status(201).json({ success: true, document })
    } catch (error: any) {
      logger.error('Create document failed', { error: error.message })
      throw error
    }
  },

  async updateDocument(req: Request, res: Response) {
    try {
      const { id } = req.params
      const scopeFilter = req.scopeFilter || {}

      const document = await documentService.updateDocument(id, req.body, scopeFilter)

      res.json({ success: true, document })
    } catch (error: any) {
      logger.error('Update document failed', { error: error.message })
      throw error
    }
  },

  async deleteDocument(req: Request, res: Response) {
    try {
      const { id } = req.params
      const scopeFilter = req.scopeFilter || {}

      await documentService.deleteDocument(id, scopeFilter)

      res.json({ success: true, message: 'Document deleted' })
    } catch (error: any) {
      logger.error('Delete document failed', { error: error.message })
      throw error
    }
  },

  async processOCR(req: Request, res: Response) {
    try {
      const { id } = req.params
      const scopeFilter = req.scopeFilter || {}

      const result = await documentAgent.execute(
        { action: 'process_ocr', documentId: id },
        scopeFilter
      )

      res.json({ success: true, result })
    } catch (error: any) {
      logger.error('OCR processing failed', { error: error.message })
      throw new ApiError(500, 'OCR processing failed')
    }
  },

  async categorizeDocument(req: Request, res: Response) {
    try {
      const { id } = req.params
      const scopeFilter = req.scopeFilter || {}

      const result = await documentAgent.execute(
        { action: 'categorize', documentId: id },
        scopeFilter
      )

      res.json({ success: true, result })
    } catch (error: any) {
      logger.error('Categorization failed', { error: error.message })
      throw new ApiError(500, 'Categorization failed')
    }
  },

  async routeDocument(req: Request, res: Response) {
    try {
      const { id } = req.params
      const scopeFilter = req.scopeFilter || {}

      const result = await documentAgent.execute(
        { action: 'route', documentId: id },
        scopeFilter
      )

      res.json({ success: true, result })
    } catch (error: any) {
      logger.error('Document routing failed', { error: error.message })
      throw new ApiError(500, 'Document routing failed')
    }
  },

  async extractMetadata(req: Request, res: Response) {
    try {
      const { id } = req.params
      const scopeFilter = req.scopeFilter || {}

      const result = await documentAgent.execute(
        { action: 'extract_metadata', documentId: id },
        scopeFilter
      )

      res.json({ success: true, result })
    } catch (error: any) {
      logger.error('Metadata extraction failed', { error: error.message })
      throw new ApiError(500, 'Metadata extraction failed')
    }
  },

  async getVersions(req: Request, res: Response) {
    try {
      const { id } = req.params
      const versions = await documentService.getVersions(id)

      res.json({ success: true, versions })
    } catch (error: any) {
      logger.error('Get versions failed', { error: error.message })
      throw new ApiError(500, 'Failed to fetch versions')
    }
  },

  async createVersion(req: Request, res: Response) {
    try {
      const { id } = req.params
      const file = req.file
      if (!file) {
        throw new ApiError(400, 'File is required')
      }

      const version = await documentService.createVersion(id, file)

      res.status(201).json({ success: true, version })
    } catch (error: any) {
      logger.error('Create version failed', { error: error.message })
      throw error
    }
  },
}

