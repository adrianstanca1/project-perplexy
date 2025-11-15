import type { UserRole } from '@prisma/client'

declare global {
  namespace Express {
    interface User {
      userId: string
      email: string
      role: UserRole | string
    }

    interface UserData {
      id: string
      permissions: string[]
      organizationId?: string
      projectIds: string[]
      lastLoginAt?: Date
      preferences?: Record<string, any>
    }

    interface ScopeFilter {
      organizationId?: string
      projectId?: string
      userRole?: string
      userId?: string
      dateRange?: {
        start: Date
        end: Date
      }
      filters?: Record<string, any>
    }

    interface Request {
      user?: User
      userData?: UserData
      scopeFilter?: ScopeFilter
    }
  }
}

export {}
