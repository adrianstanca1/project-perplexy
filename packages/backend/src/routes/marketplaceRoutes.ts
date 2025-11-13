import express, { Router } from 'express'
import { marketplaceController } from '../controllers/marketplaceController.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { z } from 'zod'

const router: Router = express.Router()

// Validation schemas
const publishAppSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  code: z.string().min(1),
  language: z.enum(['python', 'javascript', 'typescript', 'html', 'css']),
  category: z.string().min(1),
})

// Routes
router.get('/apps', marketplaceController.getApps)
router.get('/apps/:appId', marketplaceController.getApp)
router.post('/apps', validateRequest(publishAppSchema), marketplaceController.publishApp)
router.post('/apps/:appId/install', marketplaceController.installApp)
router.delete('/apps/:appId/install', marketplaceController.uninstallApp)
router.get('/installed', marketplaceController.getInstalledApps)
router.get('/my-apps', marketplaceController.getMyApps)

export { router as marketplaceRouter }

