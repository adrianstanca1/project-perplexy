import express, { Router } from 'express'
import { messageController } from '../controllers/messageController.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { z } from 'zod'

const router: Router = express.Router()

// Validation schemas
const createMessageSchema = z.object({
  from: z.string().optional(),
  to: z.string().min(1),
  subject: z.string().min(1),
  content: z.string().min(1),
  tenderId: z.string().optional(),
  contractId: z.string().optional(),
  projectId: z.string().optional(),
})

// Routes
router.get('/stats', messageController.getMessageStats)
router.get('/', messageController.getMessages)
router.get('/:messageId', messageController.getMessage)
router.post('/', validateRequest(createMessageSchema), messageController.createMessage)
router.put('/:messageId/read', messageController.markAsRead)
router.delete('/:messageId', messageController.deleteMessage)

export { router as messageRouter }

