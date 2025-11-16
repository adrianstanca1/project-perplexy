import { Router } from 'express'
import { authController } from '../controllers/authController.js'
import { authenticate } from '../middleware/auth.js'

const router: Router = Router()

// Public routes
router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/refresh', authController.refreshToken)
router.post('/forgot-password', authController.forgotPassword)
router.post('/reset-password', authController.resetPassword)
router.post('/verify-email', authController.verifyEmail)
router.post('/resend-verification', authController.resendVerification)

// Protected routes
router.post('/logout', authenticate, authController.logout)

// Ping endpoint for smoke testing
router.get('/_ping', (_req, res) => {
  res.json({ message: 'auth routes active', route: '/api/auth' })
})

export { router as authRouter }

