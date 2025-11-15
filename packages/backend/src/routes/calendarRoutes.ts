import express, { Router } from 'express'
import { calendarController } from '../controllers/calendarController.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { z } from 'zod'

const router: Router = express.Router()

// Validation schemas
const createEventSchema = z.object({
  title: z.string().min(1),
  date: z.string().min(1),
  type: z.enum(['deadline', 'meeting', 'renewal', 'milestone']),
  tenderId: z.string().optional(),
  contractId: z.string().optional(),
  projectId: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  attendees: z.array(z.string()).optional(),
})

const updateEventSchema = z.object({
  title: z.string().min(1).optional(),
  date: z.string().optional(),
  type: z.enum(['deadline', 'meeting', 'renewal', 'milestone']).optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  attendees: z.array(z.string()).optional(),
})

// Routes
router.get('/upcoming', calendarController.getUpcomingEvents)
router.get('/', calendarController.getEvents)
router.get('/:eventId', calendarController.getEvent)
router.post('/', validateRequest(createEventSchema), calendarController.createEvent)
router.put('/:eventId', validateRequest(updateEventSchema), calendarController.updateEvent)
router.delete('/:eventId', calendarController.deleteEvent)

export { router as calendarRouter }

