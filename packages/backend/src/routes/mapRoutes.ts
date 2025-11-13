import express, { Router } from 'express'
import multer from 'multer'
import { mapController } from '../controllers/mapController.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { z } from 'zod'

const router: Router = express.Router()
const upload = multer({ dest: './storage/drawings/' })

// Validation schemas
const generateMapSchema = z.object({
  center: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  zoom: z.number().min(1).max(20).optional(),
})

// Routes
router.post('/upload-drawing', upload.single('drawing'), mapController.uploadDrawing)
router.get('/drawing/:projectId', mapController.getDrawingMap)
router.get('/drawings', mapController.getAllDrawingMaps)
router.delete('/drawing/:projectId', mapController.deleteDrawingMap)
router.post('/generate-real-map', validateRequest(generateMapSchema), mapController.generateRealWorldMap)
router.post('/reverse-geocode', validateRequest(generateMapSchema), mapController.reverseGeocode)

export { router as mapRouter }

