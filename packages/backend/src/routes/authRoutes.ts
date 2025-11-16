/**
 * Authentication API Routes (Legacy)
 * Provides backward compatibility with frontend
 */

import { Router } from 'express'
import { authController } from '../controllers/authController.js'
import passport from 'passport'
import { authLimiter } from '../middleware/rateLimit.js'
import { validateRequest } from '../middleware/validation.js'
import { z } from 'zod'

const router: Router = Router()

// Public routes
router.post(
  '/register',
  authLimiter,
  validateRequest({
    body: z.object({
      email: z.string().email(),
      password: z.string().min(8),
      name: z.string().min(2),
      organizationId: z.string().optional(),
    }),
  }),
  authController.register
)

router.post(
  '/login',
  authLimiter,
  validateRequest({
    body: z.object({
      email: z.string().email(),
      password: z.string(),
    }),
  }),
  authController.login
)

router.post('/refresh', authController.refreshToken)
router.post('/logout', authController.logout)

// OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  authController.googleCallback
)

// Password reset
router.post('/forgot-password', authController.forgotPassword)
router.post('/reset-password', authController.resetPassword)

// Email verification
router.post('/verify-email', authController.verifyEmail)
router.post('/resend-verification', authController.resendVerification)

// Ping endpoint for smoke testing
router.get('/_ping', (_req, res) => {
  res.json({ message: 'auth routes active', route: '/api/auth' })
})

export { router as authRouter }

