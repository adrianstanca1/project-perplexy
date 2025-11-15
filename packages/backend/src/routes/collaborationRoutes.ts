import express, { Router } from 'express'
import { collaborationController } from '../controllers/collaborationController.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { z } from 'zod'

const router: Router = express.Router()

// Validation schemas
const createRoomSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(['project', 'team', 'general']),
  projectId: z.string().optional(),
  members: z.array(z.string()).optional(),
})

const updateRoomSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  members: z.array(z.string()).optional(),
})

const createMessageSchema = z.object({
  roomId: z.string().min(1),
  userId: z.string().min(1),
  userName: z.string().min(1),
  content: z.string().min(1),
  type: z.enum(['message', 'file', 'system']).optional(),
  fileUrl: z.string().optional(),
})

// Routes
router.get('/stats', collaborationController.getCollaborationStats)
router.get('/rooms', collaborationController.getRooms)
router.get('/rooms/:roomId', collaborationController.getRoom)
router.post('/rooms', validateRequest(createRoomSchema), collaborationController.createRoom)
router.put('/rooms/:roomId', validateRequest(updateRoomSchema), collaborationController.updateRoom)
router.delete('/rooms/:roomId', collaborationController.deleteRoom)
router.get('/rooms/:roomId/messages', collaborationController.getMessages)
router.post('/messages', validateRequest(createMessageSchema), collaborationController.createMessage)

export { router as collaborationRouter }

