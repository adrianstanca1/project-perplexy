import { Request, Response, NextFunction } from 'express'
import { v4 as uuidv4 } from 'uuid'
import prisma from '../config/database.js'
import { ApiError } from '../utils/ApiError.js'
import logger from '../config/logger.js'
import { getUsersByRole } from '../middleware/rbac.js'
import { io } from '../index.js'
import { ROLE_PERMISSIONS } from '../types/rbac.js'

export const taskController = {
  // Get tasks - filtered by role and scope
  async getTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const userData = (req as any).userData
      const scopeFilter = (req as any).scopeFilter || {}
      const { projectId, status, assignedTo } = req.query

      const where: any = {
        ...scopeFilter,
      }

      if (projectId) {
        where.projectId = projectId
      }

      if (status) {
        where.status = status
      }

      // Role-based filtering
      if (userData.role === 'OPERATIVE') {
        // Operatives can only see tasks assigned to them or their role
        where.OR = [
          { assignedTo: userData.id },
          { assignedToRoles: { has: userData.role } },
          { targetRoles: { has: userData.role } },
        ]
      } else if (userData.role === 'SUPERVISOR') {
        // Supervisors can see tasks in their projects
        if (assignedTo) {
          where.assignedTo = assignedTo
        }
      }

      const tasks = await prisma.task.findMany({
        where,
        include: {
          createdByUser: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          assignedToUser: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          project: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      res.json({ success: true, tasks })
    } catch (error) {
      next(error)
    }
  },

  // Get task by ID
  async getTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.params
      const userData = (req as any).userData
      const scopeFilter = (req as any).scopeFilter || {}

      const task = await prisma.task.findFirst({
        where: {
          id: taskId,
          ...scopeFilter,
        },
        include: {
          createdByUser: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          assignedToUser: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          project: {
            select: { id: true, name: true },
          },
        },
      })

      if (!task) {
        throw new ApiError('Task not found', 404)
      }

      // Check if user has access to this task
      if (userData.role === 'OPERATIVE') {
        const hasAccess =
          task.assignedTo === userData.id ||
          task.assignedToRoles.includes(userData.role) ||
          task.targetRoles.includes(userData.role)

        if (!hasAccess) {
          throw new ApiError('Forbidden - No access to this task', 403)
        }
      }

      res.json({ success: true, task })
    } catch (error) {
      next(error)
    }
  },

  // Create task
  async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const userData = (req as any).userData
      const scopeFilter = (req as any).scopeFilter || {}
      const {
        title,
        description,
        projectId,
        assignedTo,
        assignedToRoles,
        targetRoles,
        priority,
        dueDate,
        location,
        coordinates,
      } = req.body

      if (!title || !projectId) {
        throw new ApiError('Title and projectId are required', 400)
      }

      // Verify project access
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          ...scopeFilter,
        },
      })

      if (!project) {
        throw new ApiError('Project not found or access denied', 404)
      }

      // Create task
      const task = await prisma.task.create({
        data: {
          title,
          description,
          projectId,
          organizationId: project.organizationId,
          createdBy: userData.id,
          assignedTo: assignedTo || null,
          assignedToRoles: assignedToRoles || [],
          targetRoles: targetRoles || [],
          priority: priority || 'MEDIUM',
          dueDate: dueDate ? new Date(dueDate) : null,
          location,
          coordinates,
        },
        include: {
          createdByUser: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          assignedToUser: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          project: {
            select: { id: true, name: true },
          },
        },
      })

      // If assigned to roles, get all users with those roles and send notifications
      if (assignedToRoles && assignedToRoles.length > 0) {
        const users = await getUsersByRole(assignedToRoles[0], userData.organizationId, projectId)
        
        // Send notifications via Socket.IO
        users.forEach((user) => {
          io.to(`user:${user.id}`).emit('task:assigned', {
            taskId: task.id,
            title: task.title,
            createdBy: userData.name,
          })
        })
      }

      // If assigned to specific user, send notification
      if (assignedTo) {
        io.to(`user:${assignedTo}`).emit('task:assigned', {
          taskId: task.id,
          title: task.title,
          createdBy: userData.name,
        })
      }

      logger.info(`Task created: ${task.id} by ${userData.email}`)

      res.status(201).json({ success: true, task })
    } catch (error) {
      next(error)
    }
  },

  // Update task
  async updateTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.params
      const userData = (req as any).userData
      const scopeFilter = (req as any).scopeFilter || {}
      const updates = req.body

      const task = await prisma.task.findFirst({
        where: {
          id: taskId,
          ...scopeFilter,
        },
      })

      if (!task) {
        throw new ApiError('Task not found', 404)
      }

      // Check permissions
      const permissions = ROLE_PERMISSIONS[userData.role as keyof typeof ROLE_PERMISSIONS]
      if (!permissions.canEditTask) {
        // Operatives can only update their own assigned tasks
        if (userData.role === 'OPERATIVE' && task.assignedTo !== userData.id) {
          throw new ApiError('Forbidden - Can only update assigned tasks', 403)
        }
      }

      // Update task
      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
          ...updates,
          updatedAt: new Date(),
        },
        include: {
          createdByUser: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          assignedToUser: {
            select: { id: true, name: true, email: true, avatar: true },
          },
          project: {
            select: { id: true, name: true },
          },
        },
      })

      // Notify assigned user if status changed
      if (updates.status && updatedTask.assignedTo) {
        io.to(`user:${updatedTask.assignedTo}`).emit('task:updated', {
          taskId: updatedTask.id,
          status: updatedTask.status,
        })
      }

      res.json({ success: true, task: updatedTask })
    } catch (error) {
      next(error)
    }
  },

  // Delete task
  async deleteTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.params
      const scopeFilter = (req as any).scopeFilter || {}

      const task = await prisma.task.findFirst({
        where: {
          id: taskId,
          ...scopeFilter,
        },
      })

      if (!task) {
        throw new ApiError('Task not found', 404)
      }

      await prisma.task.delete({
        where: { id: taskId },
      })

      res.json({ success: true, message: 'Task deleted successfully' })
    } catch (error) {
      next(error)
    }
  },

  // Assign task to users/roles
  async assignTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.params
      const userData = (req as any).userData
      const { assignedTo, assignedToRoles } = req.body
      const scopeFilter = (req as any).scopeFilter || {}

      const task = await prisma.task.findFirst({
        where: {
          id: taskId,
          ...scopeFilter,
        },
      })

      if (!task) {
        throw new ApiError('Task not found', 404)
      }

      const updateData: any = {}

      if (assignedTo) {
        updateData.assignedTo = assignedTo
        updateData.assignedToRoles = []
      }

      if (assignedToRoles && assignedToRoles.length > 0) {
        updateData.assignedToRoles = assignedToRoles
        updateData.assignedTo = null
      }

      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: updateData,
        include: {
          assignedToUser: {
            select: { id: true, name: true, email: true, avatar: true },
          },
        },
      })

      // Send notifications
      if (assignedTo) {
        io.to(`user:${assignedTo}`).emit('task:assigned', {
          taskId: updatedTask.id,
          title: updatedTask.title,
          assignedBy: userData.name,
        })
      }

      if (assignedToRoles && assignedToRoles.length > 0) {
        const users = await getUsersByRole(assignedToRoles[0], userData.organizationId, task.projectId)
        users.forEach((user) => {
          io.to(`user:${user.id}`).emit('task:assigned', {
            taskId: updatedTask.id,
            title: updatedTask.title,
            assignedBy: userData.name,
          })
        })
      }

      res.json({ success: true, task: updatedTask })
    } catch (error) {
      next(error)
    }
  },

  // Submit task update
  async submitTaskUpdate(req: Request, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.params
      const userData = (req as any).userData
      const { update, attachments, timeLog } = req.body
      const scopeFilter = (req as any).scopeFilter || {}

      const task = await prisma.task.findFirst({
        where: {
          id: taskId,
          ...scopeFilter,
        },
      })

      if (!task) {
        throw new ApiError('Task not found', 404)
      }

      // Check if user is assigned to this task
      if (userData.role === 'OPERATIVE') {
        const isAssigned =
          task.assignedTo === userData.id ||
          task.assignedToRoles.includes(userData.role) ||
          task.targetRoles.includes(userData.role)

        if (!isAssigned) {
          throw new ApiError('Forbidden - Not assigned to this task', 403)
        }
      }

      // Update task with new information
      const updateData: any = {
        updatedAt: new Date(),
      }

      if (update) {
        updateData.description = task.description ? `${task.description}\n\n${update}` : update
      }

      if (attachments && attachments.length > 0) {
        updateData.attachments = [...(task.attachments || []), ...attachments]
      }

      if (timeLog) {
        const timeLogs = Array.isArray(task.timeLogs) ? task.timeLogs : []
        timeLogs.push({
          userId: userData.id,
          userName: userData.name,
          date: new Date().toISOString(),
          hours: timeLog.hours,
          notes: timeLog.notes,
        })
        updateData.timeLogs = timeLogs
      }

      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: updateData,
      })

      // Notify supervisor/company admin
      const supervisors = await getUsersByRole('SUPERVISOR', userData.organizationId, task.projectId)
      supervisors.forEach((supervisor) => {
        io.to(`user:${supervisor.id}`).emit('task:updated', {
          taskId: updatedTask.id,
          title: updatedTask.title,
          updatedBy: userData.name,
        })
      })

      res.json({ success: true, task: updatedTask })
    } catch (error) {
      next(error)
    }
  },

  // Approve timesheet
  async approveTimesheet(req: Request, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.params
      const userData = (req as any).userData
      const { approved } = req.body
      const scopeFilter = (req as any).scopeFilter || {}

      const task = await prisma.task.findFirst({
        where: {
          id: taskId,
          ...scopeFilter,
        },
      })

      if (!task) {
        throw new ApiError('Task not found', 404)
      }

      const updateData: any = {
        approvedBy: approved ? userData.id : null,
        approvedAt: approved ? new Date() : null,
      }

      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: updateData,
      })

      // Notify assigned user
      if (updatedTask.assignedTo) {
        io.to(`user:${updatedTask.assignedTo}`).emit('timesheet:approved', {
          taskId: updatedTask.id,
          approved: approved,
          approvedBy: userData.name,
        })
      }

      res.json({ success: true, task: updatedTask })
    } catch (error) {
      next(error)
    }
  },

  // Report safety issue
  async reportSafetyIssue(req: Request, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.params
      const userData = (req as any).userData
      const { description, images, severity } = req.body
      const scopeFilter = (req as any).scopeFilter || {}

      const task = await prisma.task.findFirst({
        where: {
          id: taskId,
          ...scopeFilter,
        },
      })

      if (!task) {
        throw new ApiError('Task not found', 404)
      }

      const safetyData = {
        reportedBy: userData.id,
        reportedByName: userData.name,
        description,
        images: images || [],
        severity: severity || 'medium',
        reportedAt: new Date().toISOString(),
      }

      const incidents = Array.isArray(task.incidents) ? task.incidents : []
      incidents.push(safetyData)

      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
          isSafetyIssue: true,
          safetyImages: [...(task.safetyImages || []), ...(images || [])],
          observations: task.observations
            ? `${task.observations}\n\nSafety Issue: ${description}`
            : `Safety Issue: ${description}`,
          incidents,
        },
      })

      // Notify supervisors and company admins
      const supervisors = await getUsersByRole('SUPERVISOR', userData.organizationId, task.projectId)
      const admins = await getUsersByRole('COMPANY_ADMIN', userData.organizationId)

      ;[...supervisors, ...admins].forEach((user) => {
        io.to(`user:${user.id}`).emit('safety:reported', {
          taskId: updatedTask.id,
          title: updatedTask.title,
          reportedBy: userData.name,
          severity,
        })
      })

      res.json({ success: true, task: updatedTask })
    } catch (error) {
      next(error)
    }
  },

  // Get users for task assignment
  async getUsersForAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      const userData = (req as any).userData
      const { projectId, role } = req.query

      if (role) {
        const users = await getUsersByRole(role as string, userData.organizationId, projectId as string)
        res.json({ success: true, users })
      } else {
        // Get all users in organization/project
        const where: any = {
          organizationId: userData.organizationId,
        }

        if (projectId) {
          where.projectIds = { has: projectId }
        }

        const users = await prisma.user.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        })

        res.json({ success: true, users })
      }
    } catch (error) {
      next(error)
    }
  },
}

