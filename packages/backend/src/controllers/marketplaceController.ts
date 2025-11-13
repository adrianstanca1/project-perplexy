import { Request, Response, NextFunction } from 'express'
import { marketplaceService } from '../services/marketplaceService.js'
import { ApiError } from '../utils/ApiError.js'

export const marketplaceController = {
  async getApps(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, search } = req.query
      const apps = await marketplaceService.getApps(
        category as string | undefined,
        search as string | undefined
      )
      res.json({ success: true, apps })
    } catch (error) {
      next(error)
    }
  },

  async getApp(req: Request, res: Response, next: NextFunction) {
    try {
      const { appId } = req.params
      const app = await marketplaceService.getApp(appId)
      if (!app) {
        throw new ApiError('App not found', 404)
      }
      res.json({ success: true, app })
    } catch (error) {
      next(error)
    }
  },

  async publishApp(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, code, language, category } = req.body
      const authorId = (req as any).user?.id || 'anonymous'
      const author = (req as any).user?.name || 'Anonymous'

      const app = await marketplaceService.publishApp(
        { name, description, code, language, category },
        authorId,
        author
      )
      res.json({ success: true, app, message: 'App published successfully. It will be reviewed before being available in the marketplace.' })
    } catch (error) {
      next(error)
    }
  },

  async installApp(req: Request, res: Response, next: NextFunction) {
    try {
      const { appId } = req.params
      const userId = (req as any).user?.id || 'anonymous'
      await marketplaceService.installApp(appId, userId)
      res.json({ success: true, message: 'App installed successfully' })
    } catch (error) {
      next(error)
    }
  },

  async uninstallApp(req: Request, res: Response, next: NextFunction) {
    try {
      const { appId } = req.params
      const userId = (req as any).user?.id || 'anonymous'
      await marketplaceService.uninstallApp(appId, userId)
      res.json({ success: true, message: 'App uninstalled successfully' })
    } catch (error) {
      next(error)
    }
  },

  async getInstalledApps(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id || 'anonymous'
      const apps = await marketplaceService.getInstalledApps(userId)
      res.json({ success: true, apps })
    } catch (error) {
      next(error)
    }
  },

  async getMyApps(req: Request, res: Response, next: NextFunction) {
    try {
      const authorId = (req as any).user?.id || 'anonymous'
      const apps = await marketplaceService.getMyApps(authorId)
      res.json({ success: true, apps })
    } catch (error) {
      next(error)
    }
  },
}

