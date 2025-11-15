import { Request, Response, NextFunction } from 'express'
import { ApiError } from '../utils/ApiError.js'
import prisma from '../config/database.js'
import logger from '../config/logger.js'

// Role hierarchy - higher roles have access to lower role permissions
export const ROLE_HIERARCHY: Record<string, number> = {
  SUPER_ADMIN: 4,
  COMPANY_ADMIN: 3,
  SUPERVISOR: 2,
  OPERATIVE: 1,
}

// Role-based access control middleware
export const checkRole = (...allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new ApiError('Unauthorized', 401)
      }

      const userRole = req.user.role.toUpperCase()
      const userRoleLevel = ROLE_HIERARCHY[userRole] || 0

      // Check if user's role is in allowed roles or has higher privilege
      const hasAccess = allowedRoles.some((role) => {
        const allowedRole = role.toUpperCase()
        const allowedRoleLevel = ROLE_HIERARCHY[allowedRole] || 0
        return userRole === allowedRole || userRoleLevel > allowedRoleLevel
      })

      if (!hasAccess) {
        throw new ApiError('Forbidden - Insufficient permissions', 403)
      }

      // Fetch full user data for scope filtering
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: { organization: true },
      })

      if (!user) {
        throw new ApiError('User not found', 404)
      }

      // Attach user data to request for use in controllers
      ;(req as any).userData = user

      next()
    } catch (error) {
      next(error)
    }
  }
}

// Scope filtering - ensures users only see data from their organization/project
export const scopeFilter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userData = (req as any).userData
    if (!userData) {
      return next()
    }

    // Super admin can see everything
    if (userData.role === 'SUPER_ADMIN') {
      ;(req as any).scopeFilter = {}
      return next()
    }

    // Company admin can see everything in their organization
    if (userData.role === 'COMPANY_ADMIN') {
      ;(req as any).scopeFilter = {
        organizationId: userData.organizationId,
      }
      return next()
    }

    // Supervisor and Operative are scoped to their organization and assigned projects
    const scopeFilter: any = {
      organizationId: userData.organizationId,
    }

    // If projectId is in query/params, verify user has access
    const projectId = req.params.projectId || req.query.projectId
    if (projectId) {
      if (userData.role === 'SUPERVISOR' || userData.role === 'OPERATIVE') {
        // Check if user has access to this project
        const hasAccess =
          userData.projectIds.includes(projectId as string) ||
          userData.role === 'SUPERVISOR' // Supervisors can see all projects in their org

        if (!hasAccess) {
          throw new ApiError('Forbidden - No access to this project', 403)
        }
      }
      scopeFilter.projectId = projectId
    } else if (userData.role === 'OPERATIVE') {
      // Operatives can only see their assigned projects
      scopeFilter.projectId = { in: userData.projectIds }
    }

    ;(req as any).scopeFilter = scopeFilter
    next()
  } catch (error) {
    next(error)
  }
}

// Permission checker helper
export const hasPermission = (userRole: string, requiredPermission: string): boolean => {
  const roleLevel = ROLE_HIERARCHY[userRole.toUpperCase()] || 0

  // Define permission requirements
  const permissionMap: Record<string, number> = {
    'create:project': ROLE_HIERARCHY.COMPANY_ADMIN,
    'edit:project': ROLE_HIERARCHY.COMPANY_ADMIN,
    'delete:project': ROLE_HIERARCHY.COMPANY_ADMIN,
    'assign:task': ROLE_HIERARCHY.SUPERVISOR,
    'create:task': ROLE_HIERARCHY.SUPERVISOR,
    'edit:task': ROLE_HIERARCHY.SUPERVISOR,
    'upload:drawing': ROLE_HIERARCHY.SUPERVISOR,
    'approve:timesheet': ROLE_HIERARCHY.SUPERVISOR,
    'view:reports': ROLE_HIERARCHY.SUPERVISOR,
    'view:all:map': ROLE_HIERARCHY.SUPERVISOR,
    'view:company:analytics': ROLE_HIERARCHY.COMPANY_ADMIN,
    'manage:users': ROLE_HIERARCHY.COMPANY_ADMIN,
    'platform:admin': ROLE_HIERARCHY.SUPER_ADMIN,
  }

  const requiredLevel = permissionMap[requiredPermission] || 999
  return roleLevel >= requiredLevel
}

// Check if user can access resource
export const canAccess = (userRole: string, resourceRole: string, userOrgId: string, resourceOrgId: string): boolean => {
  // Super admin can access everything
  if (userRole === 'SUPER_ADMIN') {
    return true
  }

  // Must be in same organization
  if (userOrgId !== resourceOrgId) {
    return false
  }

  const userLevel = ROLE_HIERARCHY[userRole] || 0
  const resourceLevel = ROLE_HIERARCHY[resourceRole] || 0

  // Higher roles can access lower role resources
  return userLevel >= resourceLevel
}

// Get accessible projects for user
export const getAccessibleProjects = async (userId: string, userRole: string, organizationId: string | null) => {
  if (userRole === 'SUPER_ADMIN') {
    return prisma.project.findMany()
  }

  if (userRole === 'COMPANY_ADMIN') {
    return prisma.project.findMany({
      where: { organizationId: organizationId || undefined },
    })
  }

  // Supervisor and Operative - get their assigned projects
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { projectIds: true },
  })

  if (!user || !user.projectIds.length) {
    return []
  }

  return prisma.project.findMany({
    where: {
      id: { in: user.projectIds },
      organizationId: organizationId || undefined,
    },
  })
}

// Get users by role in organization/project
export const getUsersByRole = async (
  role: string,
  organizationId: string | null,
  projectId?: string
): Promise<any[]> => {
  const where: any = {
    role: role.toUpperCase(),
  }

  if (organizationId) {
    where.organizationId = organizationId
  }

  if (projectId) {
    where.projectIds = { has: projectId }
  }

  return prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      role: true,
    },
  })
}

