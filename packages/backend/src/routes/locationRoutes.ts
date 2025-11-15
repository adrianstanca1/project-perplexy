import express, { Router } from 'express'
import { locationController } from '../controllers/locationController.js'
import { authenticate } from '../middleware/auth.js'
import { scopeFilter } from '../middleware/rbac.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { z } from 'zod'

const router: Router = express.Router()

// All location routes require authentication
router.use(authenticate)
router.use(scopeFilter)

// Validation schemas
const updateLocationSchema = z.object({
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  role: z.enum(['manager', 'foreman', 'labour']).optional(),
  projectId: z.string().optional(),
  userName: z.string().optional(),
})

// Routes
router.post('/update', validateRequest(updateLocationSchema), locationController.updateLocation)
router.get('/active-users', locationController.getActiveUsers)
router.get('/user/:userId', locationController.getUserLocation)
router.get('/by-role/:role', locationController.getUsersByRole)

export { router as locationRouter }

