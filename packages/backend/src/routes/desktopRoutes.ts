import express, { Router } from 'express'
import { desktopController } from '../controllers/desktopController.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { z } from 'zod'

const router: Router = express.Router()

// Validation schemas
const installAppSchema = z.object({
  appId: z.string().min(1),
  name: z.string().min(1),
  code: z.string().min(1),
  language: z.string().min(1),
})

const sendMessageSchema = z.object({
  from: z.string().optional(),
  to: z.string().min(1),
  subject: z.string().min(1),
  content: z.string().min(1),
})

// Routes
router.get('/apps', desktopController.getApps)
router.post('/apps/install', validateRequest(installAppSchema), desktopController.installApp)
router.delete('/apps/:appId', desktopController.uninstallApp)
router.put('/apps/:appId/window', desktopController.updateWindowState)
router.post('/apps/:appId/execute', desktopController.executeApp)
router.get('/messages', desktopController.getMessages)
router.post('/messages', validateRequest(sendMessageSchema), desktopController.sendMessage)
router.put('/messages/:messageId/read', desktopController.markMessageAsRead)

export { router as desktopRouter }

