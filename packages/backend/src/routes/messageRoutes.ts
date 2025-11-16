import { Router } from 'express'

const router: Router = Router()

// Placeholder route - returns 501 Not Implemented
router.get('/', (_req, res) => {
  res.status(501).json({ error: 'Not Implemented', message: 'This route is a placeholder and will be implemented later' })
})

// Ping endpoint for smoke testing
router.get('/_ping', (_req, res) => {
  res.json({ message: 'placeholder', route: '/api/messages' })
})

export { router as messageRouter }

