/**
 * Authentication API Routes (Legacy - /api/auth)
 * Maintains backward compatibility with frontend
 * Enhanced with validation, rate limiting, and OAuth support
 */

import { Router } from 'express'
import { authController } from '../controllers/authController.js'
import { authenticate } from '../middleware/auth.js'
import passport from '../config/auth.js'
import { authLimiter } from '../middleware/rateLimit.js'
import { validateRequest } from '../middleware/validation.js'
import { z } from 'zod'

const router: Router = Router()

// Public routes with validation and rate limiting
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

// Support both /refresh and /refresh-token for compatibility
router.post('/refresh', authController.refreshToken)
router.post('/refresh-token', authController.refreshToken)

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

// Email verification - support both POST and GET for compatibility
router.post('/verify-email', authController.verifyEmail)
router.get('/verify-email/:token', authController.verifyEmail)
router.post('/resend-verification', authController.resendVerification)

// Protected routes
router.post('/logout', authenticate, authController.logout)

// Ping endpoint for smoke testing
router.get('/_ping', (_req, res) => {
  res.json({ message: 'auth routes active', route: '/api/auth' })
})

export { router as authRouter }

