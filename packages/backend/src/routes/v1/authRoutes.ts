/**
 * Authentication API Routes (v1)
 */

import { Router } from 'express'
import { authController } from '../../controllers/authController.js'
import passport from 'passport'
import { authLimiter } from '../../middleware/rateLimit.js'
import { validateRequest } from '../../middleware/validation.js'
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

router.post('/refresh-token', authController.refreshToken)
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
router.get('/verify-email/:token', authController.verifyEmail)

export { router as authRouter }

