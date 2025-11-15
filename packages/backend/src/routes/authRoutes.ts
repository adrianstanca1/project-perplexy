import { Router } from 'express'
import passport from '../config/auth.js'
import { authController } from '../controllers/authController.js'
import { authLimiter } from '../middleware/rateLimit.js'

const router: Router = Router()

// Google OAuth2 routes
router.get('/google', authLimiter, passport.authenticate('google', { scope: ['profile', 'email'] }))
router.get('/google/callback', passport.authenticate('google', { session: false }), authController.googleCallback)

// Local authentication routes
router.post('/register', authLimiter, authController.register)
router.post('/login', authLimiter, authController.login)
router.post('/refresh', authController.refreshToken)
router.post('/logout', authController.logout)

// Password reset routes
router.post('/forgot-password', authLimiter, authController.forgotPassword)
router.post('/reset-password', authLimiter, authController.resetPassword)

// Email verification routes
router.post('/verify-email', authLimiter, authController.verifyEmail)
router.post('/resend-verification', authLimiter, authController.resendVerification)

export { router as authRouter }

