/**
 * Authentication API Routes (Legacy - /api/auth)
 * Maintains backward compatibility with frontend
 * Enhanced with validation, rate limiting, and OAuth support
 */

import { Router } from 'express'
import { authController } from '../controllers/authController.js'
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

// NOTE: Endpoint naming inconsistency: legacy route uses '/refresh', but v1 uses '/refresh-token'.
// Both are provided for backward compatibility, as frontend (AuthContext.tsx line 169) calls '/api/auth/refresh'.
// See PR description for rationale.
router.post(
  '/refresh',
  validateRequest({
    body: z.object({
      refreshToken: z.string(),
    }),
  }),
  authController.refreshToken
)
router.post('/refresh-token', authController.refreshToken)

router.post(
  '/logout',
  validateRequest({
    body: z.object({}),
  }),
  authController.logout
)

// OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  authController.googleCallback
)

// Password reset with validation and rate limiting
router.post(
  '/forgot-password',
  authLimiter,
  validateRequest({
    body: z.object({
      email: z.string().email(),
    }),
  }),
  authController.forgotPassword
)
router.post(
  '/reset-password',
  authLimiter,
  validateRequest({
    body: z.object({
      token: z.string(),
      password: z.string().min(8),
    }),
  }),
  authController.resetPassword
)

/**
 * Legacy email verification route.
 * Note: This route uses POST with the token in the request body for backward compatibility.
 * The v1 API uses GET /verify-email/:token with the token as a URL parameter.
 * This difference is intentional and required for legacy frontend clients.
 * See v1 auth routes for the current RESTful pattern.
 */
router.post(
  '/verify-email',
  validateRequest({
    body: z.object({
      token: z.string().min(1),
    }),
  }),
  authController.verifyEmail
)
router.post(
  '/resend-verification',
  validateRequest({
    body: z.object({
      email: z.string().email(),
    }),
  }),
  authController.resendVerification
)

// Ping endpoint for smoke testing
router.get('/_ping', (_req, res) => {
  res.json({ message: 'auth routes active', route: '/api/auth' })
})

export { router as authRouter }

