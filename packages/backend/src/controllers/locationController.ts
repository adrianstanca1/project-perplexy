import { Request, Response, NextFunction } from 'express'
import { locationService } from '../services/locationService.js'
import { ApiError } from '../utils/ApiError.js'

export const locationController = {
  async updateLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id || req.body.userId || 'anonymous'
      const { coordinates, role, projectId, userName } = req.body

      const location = await locationService.updateLocation(
        userId,
        coordinates,
        role,
        projectId,
        userName
      )

      res.json({
        success: true,
        location,
      })
    } catch (error) {
      next(error)
    }
  },

  async getActiveUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = req.query.projectId as string | undefined
      const users = await locationService.getActiveUsers(projectId)

      res.json({
        success: true,
        users: users.map((user) => ({
          ...user,
          color: locationService.getRoleColor(user.role),
        })),
      })
    } catch (error) {
      next(error)
    }
  },

  async getUserLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params
      const location = await locationService.getUserLocation(userId)

      if (!location) {
        throw new ApiError('User location not found', 404)
      }

      res.json({
        success: true,
        location: {
          ...location,
          color: locationService.getRoleColor(location.role),
        },
      })
    } catch (error) {
      next(error)
    }
  },

  async getUsersByRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { role } = req.params

      if (!['manager', 'foreman', 'labour'].includes(role)) {
        throw new ApiError('Invalid role', 400)
      }

      const users = await locationService.getUsersByRole(role as 'manager' | 'foreman' | 'labour')

      res.json({
        success: true,
        users: users.map((user) => ({
          ...user,
          color: locationService.getRoleColor(user.role),
        })),
      })
    } catch (error) {
      next(error)
    }
  },
}

