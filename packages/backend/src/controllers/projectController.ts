import { Request, Response, NextFunction } from 'express'
import { projectService } from '../services/projectService.js'
import { ApiError } from '../utils/ApiError.js'

export const projectController = {
  async getProjects(_req: Request, res: Response, next: NextFunction) {
    try {
      const projects = await projectService.getAllProjects()
      res.json({
        success: true,
        projects,
      })
    } catch (error) {
      next(error)
    }
  },

  async getProject(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params
      const project = await projectService.getProject(projectId)

      if (!project) {
        throw new ApiError('Project not found', 404)
      }

      res.json({
        success: true,
        project,
      })
    } catch (error) {
      next(error)
    }
  },

  async createProject(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description } = req.body
      const project = await projectService.createProject({ name, description })
      res.status(201).json({
        success: true,
        project,
      })
    } catch (error) {
      next(error)
    }
  },

  async updateProject(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params
      const { name, description } = req.body
      const project = await projectService.updateProject(projectId, { name, description })

      if (!project) {
        throw new ApiError('Project not found', 404)
      }

      res.json({
        success: true,
        project,
      })
    } catch (error) {
      next(error)
    }
  },

  async deleteProject(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params
      const deleted = await projectService.deleteProject(projectId)

      if (!deleted) {
        throw new ApiError('Project not found or cannot be deleted', 404)
      }

      res.json({
        success: true,
        message: 'Project deleted successfully',
      })
    } catch (error) {
      next(error)
    }
  },

  async getProjectStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params
      const stats = await projectService.getProjectStats(projectId)

      if (!stats) {
        throw new ApiError('Project not found', 404)
      }

      res.json({
        success: true,
        stats,
      })
    } catch (error) {
      next(error)
    }
  },

  async getAllProjectStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await projectService.getAllProjectStats()
      res.json({
        success: true,
        stats,
      })
    } catch (error) {
      next(error)
    }
  },
}

