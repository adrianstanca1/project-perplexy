import express, { Router } from 'express'
import { executionHistoryController } from '../controllers/executionHistoryController.js'

const router: Router = express.Router()

// Routes
router.get('/', executionHistoryController.getExecutionHistory)
router.get('/:id', executionHistoryController.getExecutionById)
router.delete('/', executionHistoryController.clearHistory)

export { router as executionHistoryRouter }

