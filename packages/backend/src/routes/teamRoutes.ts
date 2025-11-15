import express, { Router } from 'express'
import { teamController } from '../controllers/teamController.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { z } from 'zod'

const router: Router = express.Router()

// Validation schemas
const createTeamMemberSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  rate: z.number().min(0),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  skills: z.array(z.string()).optional(),
})

const updateTeamMemberSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  rate: z.number().min(0).optional(),
  efficiency: z.number().min(0).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  status: z.enum(['active', 'away', 'offline']).optional(),
  skills: z.array(z.string()).optional(),
})

// Routes
router.get('/stats', teamController.getTeamStats)
router.get('/', teamController.getTeamMembers)
router.get('/:memberId', teamController.getTeamMember)
router.post('/', validateRequest(createTeamMemberSchema), teamController.createTeamMember)
router.put('/:memberId', validateRequest(updateTeamMemberSchema), teamController.updateTeamMember)
router.delete('/:memberId', teamController.deleteTeamMember)

export { router as teamRouter }

