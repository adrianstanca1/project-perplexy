import express, { Router } from 'express'
import multer from 'multer'
import { fileController } from '../controllers/fileController.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { z } from 'zod'

const router: Router = express.Router()
const upload = multer({ dest: './storage/uploads/' })

// File validation schemas
const createFileSchema = z.object({
  name: z.string().min(1),
  content: z.string().optional(),
  path: z.string().optional(),
})

const updateFileSchema = z.object({
  path: z.string().min(1),
  content: z.string(),
})

// Routes
router.get('/', fileController.listFiles)
router.get('/stats', fileController.getFileStats)
router.get('/content', fileController.getFileContent)
router.post('/', validateRequest(createFileSchema), fileController.createFile)
router.put('/', validateRequest(updateFileSchema), fileController.updateFile)
router.delete('/', fileController.deleteFile)
router.post('/upload', upload.single('file'), fileController.uploadFile)

export { router as fileRouter }

