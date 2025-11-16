import { Request, Response, NextFunction } from 'express'
import { generateToken, generateRefreshToken, hashPassword, comparePassword } from '../config/auth.js'
import prisma from '../config/database.js'
import { ApiError } from '../utils/ApiError.js'
import logger from '../config/logger.js'
import { cache } from '../config/redis.js'
import crypto from 'crypto'
// TODO: Import email service when implemented
// import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService.js'

// Get dashboard route based on user role
function getDashboardRoute(role: string): string {
  switch (role.toUpperCase()) {
    case 'SUPER_ADMIN':
      return '/super-admin-dashboard'
    case 'COMPANY_ADMIN':
      return '/company-dashboard'
    case 'SUPERVISOR':
      return '/supervisor-dashboard'
    case 'OPERATIVE':
      return '/operative-dashboard'
    default:
      return '/dashboard'
  }
}

export const authController = {
  // Google OAuth2 callback
  async googleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as any

      if (!user) {
        throw new ApiError('Authentication failed', 401)
      }

      // Generate tokens
      const accessToken = generateToken(user.id, user.email, user.role)
      const refreshToken = generateRefreshToken(user.id)

      // Store refresh token in Redis
      await cache.set(`refresh_token:${user.id}`, refreshToken, 7 * 24 * 60 * 60) // 7 days

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
          organizationId: user.organizationId,
          projectIds: user.projectIds || [],
        },
        accessToken,
        refreshToken,
        dashboardRoute: getDashboardRoute(user.role),
      })
    } catch (error) {
      next(error)
    }
  },

  // Register new user
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name, organizationId } = req.body

      if (!email || !password || !name) {
        throw new ApiError('Missing required fields', 400)
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        throw new ApiError('User already exists', 409)
      }

      // Hash password
      const hashedPassword = await hashPassword(password)

      // Generate email verification token
      const emailVerificationToken = crypto.randomBytes(32).toString('hex')
      const emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          organizationId,
          emailVerificationToken,
          emailVerificationExpiry,
          role: 'OPERATIVE', // Default role
        },
      })

      // TODO: Send verification email
      // await sendVerificationEmail(user.email, emailVerificationToken)

      // Generate tokens
      const accessToken = generateToken(user.id, user.email, user.role)
      const refreshToken = generateRefreshToken(user.id)

      // Store refresh token in Redis
      await cache.set(`refresh_token:${user.id}`, refreshToken, 7 * 24 * 60 * 60) // 7 days

      logger.info(`User registered: ${user.email}`)

      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please verify your email.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId,
          projectIds: user.projectIds || [],
        },
        accessToken,
        refreshToken,
        dashboardRoute: getDashboardRoute(user.role),
      })
    } catch (error) {
      next(error)
    }
  },

  // Login user
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body

      if (!email || !password) {
        throw new ApiError('Missing email or password', 400)
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      })

      if (!user) {
        throw new ApiError('Invalid credentials', 401)
      }

      // Check password
      if (!user.password) {
        throw new ApiError('Please use Google login for this account', 401)
      }

      const isPasswordValid = await comparePassword(password, user.password)

      if (!isPasswordValid) {
        throw new ApiError('Invalid credentials', 401)
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      })

      // Generate tokens
      const accessToken = generateToken(user.id, user.email, user.role)
      const refreshToken = generateRefreshToken(user.id)

      // Store refresh token in Redis
      await cache.set(`refresh_token:${user.id}`, refreshToken, 7 * 24 * 60 * 60) // 7 days

      logger.info(`User logged in: ${user.email}`)

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
          organizationId: user.organizationId,
          projectIds: user.projectIds || [],
        },
        accessToken,
        refreshToken,
        dashboardRoute: getDashboardRoute(user.role),
      })
    } catch (error) {
      next(error)
    }
  },

  // Refresh access token
  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body

      if (!refreshToken) {
        throw new ApiError('Refresh token required', 400)
      }

      // Verify refresh token
      const { verifyRefreshToken } = await import('../config/auth.js')
      const decoded = verifyRefreshToken(refreshToken) as { userId: string }

      // Check if refresh token exists in Redis
      const storedToken = await cache.get(`refresh_token:${decoded.userId}`)

      if (!storedToken || storedToken !== refreshToken) {
        throw new ApiError('Invalid refresh token', 401)
      }

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      })

      if (!user) {
        throw new ApiError('User not found', 404)
      }

      // Generate new tokens
      const newAccessToken = generateToken(user.id, user.email, user.role)
      const newRefreshToken = generateRefreshToken(user.id)

      // Update refresh token in Redis
      await cache.set(`refresh_token:${user.id}`, newRefreshToken, 7 * 24 * 60 * 60) // 7 days

      res.json({
        success: true,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      })
    } catch (error) {
      next(error)
    }
  },

  // Logout user
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId

      if (userId) {
        // Delete refresh token from Redis
        await cache.del(`refresh_token:${userId}`)
      }

      res.json({
        success: true,
        message: 'Logged out successfully',
      })
    } catch (error) {
      next(error)
    }
  },

  // Forgot password
  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body

      if (!email) {
        throw new ApiError('Email required', 400)
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      })

      // Don't reveal if user exists or not (security best practice)
      if (user) {
        // Generate password reset token
        const passwordResetToken = crypto.randomBytes(32).toString('hex')
        const passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

        // Update user
        await prisma.user.update({
          where: { id: user.id },
          data: {
            passwordResetToken,
            passwordResetExpiry,
          },
        })

        // TODO: Send password reset email
        // await sendPasswordResetEmail(user.email, passwordResetToken)

        logger.info(`Password reset requested for: ${user.email}`)
      }

      res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      })
    } catch (error) {
      next(error)
    }
  },

  // Reset password
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body

      if (!token || !password) {
        throw new ApiError('Token and password required', 400)
      }

      // Find user with valid reset token
      const user = await prisma.user.findFirst({
        where: {
          passwordResetToken: token,
          passwordResetExpiry: {
            gt: new Date(),
          },
        },
      })

      if (!user) {
        throw new ApiError('Invalid or expired reset token', 400)
      }

      // Hash new password
      const hashedPassword = await hashPassword(password)

      // Update user
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetExpiry: null,
        },
      })

      logger.info(`Password reset for: ${user.email}`)

      res.json({
        success: true,
        message: 'Password reset successfully',
      })
    } catch (error) {
      next(error)
    }
  },

  // Verify email
  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      // Support both POST body and GET params for compatibility
      const token = req.body.token || req.params.token

      if (!token) {
        throw new ApiError('Verification token required', 400)
      }

      // Find user with valid verification token
      const user = await prisma.user.findFirst({
        where: {
          emailVerificationToken: token,
          emailVerificationExpiry: {
            gt: new Date(),
          },
        },
      })

      if (!user) {
        throw new ApiError('Invalid or expired verification token', 400)
      }

      // Update user
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpiry: null,
        },
      })

      logger.info(`Email verified for: ${user.email}`)

      res.json({
        success: true,
        message: 'Email verified successfully',
      })
    } catch (error) {
      next(error)
    }
  },

  // Resend verification email
  async resendVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body

      if (!email) {
        throw new ApiError('Email required', 400)
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      })

      if (!user) {
        throw new ApiError('User not found', 404)
      }

      if (user.emailVerified) {
        throw new ApiError('Email already verified', 400)
      }

      // Generate new verification token
      const emailVerificationToken = crypto.randomBytes(32).toString('hex')
      const emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      // Update user
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerificationToken,
          emailVerificationExpiry,
        },
      })

      // TODO: Send verification email
      // await sendVerificationEmail(user.email, emailVerificationToken)

      logger.info(`Verification email resent for: ${user.email}`)

      res.json({
        success: true,
        message: 'Verification email sent',
      })
    } catch (error) {
      next(error)
    }
  },
}

