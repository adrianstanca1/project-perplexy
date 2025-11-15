// RBAC Types and Interfaces

export type UserRole = 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'SUPERVISOR' | 'OPERATIVE'

export interface RolePermissions {
  // Project Management
  canCreateProject: boolean
  canEditProject: boolean
  canDeleteProject: boolean
  canViewAllProjects: boolean

  // Task Management
  canCreateTask: boolean
  canEditTask: boolean
  canDeleteTask: boolean
  canAssignTask: boolean
  canViewAllTasks: boolean
  canSubmitTaskUpdate: boolean

  // File Management
  canUploadDrawing: boolean
  canUploadFile: boolean
  canDeleteFile: boolean
  canViewAllFiles: boolean

  // Timesheet Management
  canSubmitTimesheet: boolean
  canApproveTimesheet: boolean
  canViewAllTimesheets: boolean

  // Map & Location
  canViewLiveMap: boolean
  canViewTeamLocation: boolean
  canViewAllLocations: boolean

  // AI & Tools
  canUseAISandbox: boolean
  canModifyAIData: boolean
  canViewAIRecommendations: boolean

  // Reports & Analytics
  canViewReports: boolean
  canViewCompanyAnalytics: boolean
  canViewPlatformAnalytics: boolean

  // User Management
  canManageUsers: boolean
  canCreateUsers: boolean
  canEditUsers: boolean
  canDeleteUsers: boolean

  // Safety & Compliance
  canReportSafetyIssue: boolean
  canViewSafetyReports: boolean
  canApproveSafetyReports: boolean

  // System Administration
  canAccessAuditLogs: boolean
  canManageSystemSettings: boolean
  canTriggerBackups: boolean
  canOverridePermissions: boolean
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  SUPER_ADMIN: {
    canCreateProject: true,
    canEditProject: true,
    canDeleteProject: true,
    canViewAllProjects: true,
    canCreateTask: true,
    canEditTask: true,
    canDeleteTask: true,
    canAssignTask: true,
    canViewAllTasks: true,
    canSubmitTaskUpdate: true,
    canUploadDrawing: true,
    canUploadFile: true,
    canDeleteFile: true,
    canViewAllFiles: true,
    canSubmitTimesheet: true,
    canApproveTimesheet: true,
    canViewAllTimesheets: true,
    canViewLiveMap: true,
    canViewTeamLocation: true,
    canViewAllLocations: true,
    canUseAISandbox: true,
    canModifyAIData: true,
    canViewAIRecommendations: true,
    canViewReports: true,
    canViewCompanyAnalytics: true,
    canViewPlatformAnalytics: true,
    canManageUsers: true,
    canCreateUsers: true,
    canEditUsers: true,
    canDeleteUsers: true,
    canReportSafetyIssue: true,
    canViewSafetyReports: true,
    canApproveSafetyReports: true,
    canAccessAuditLogs: true,
    canManageSystemSettings: true,
    canTriggerBackups: true,
    canOverridePermissions: true,
  },
  COMPANY_ADMIN: {
    canCreateProject: true,
    canEditProject: true,
    canDeleteProject: true,
    canViewAllProjects: true, // Within their organization
    canCreateTask: true,
    canEditTask: true,
    canDeleteTask: true,
    canAssignTask: true,
    canViewAllTasks: true, // Within their organization
    canSubmitTaskUpdate: false,
    canUploadDrawing: true,
    canUploadFile: true,
    canDeleteFile: true,
    canViewAllFiles: true, // Within their organization
    canSubmitTimesheet: false,
    canApproveTimesheet: true,
    canViewAllTimesheets: true, // Within their organization
    canViewLiveMap: true,
    canViewTeamLocation: true,
    canViewAllLocations: true, // Within their organization
    canUseAISandbox: true,
    canModifyAIData: true,
    canViewAIRecommendations: true,
    canViewReports: true,
    canViewCompanyAnalytics: true,
    canViewPlatformAnalytics: false,
    canManageUsers: true, // Within their organization
    canCreateUsers: true,
    canEditUsers: true,
    canDeleteUsers: true,
    canReportSafetyIssue: true,
    canViewSafetyReports: true,
    canApproveSafetyReports: true,
    canAccessAuditLogs: false,
    canManageSystemSettings: false,
    canTriggerBackups: false,
    canOverridePermissions: false,
  },
  SUPERVISOR: {
    canCreateProject: false,
    canEditProject: false,
    canDeleteProject: false,
    canViewAllProjects: true, // Assigned projects
    canCreateTask: true,
    canEditTask: true,
    canDeleteTask: false,
    canAssignTask: true,
    canViewAllTasks: true, // In their projects
    canSubmitTaskUpdate: true,
    canUploadDrawing: true,
    canUploadFile: true,
    canDeleteFile: false,
    canViewAllFiles: true, // In their projects
    canSubmitTimesheet: false,
    canApproveTimesheet: true, // Forward to company admin
    canViewAllTimesheets: true, // In their projects
    canViewLiveMap: true,
    canViewTeamLocation: true,
    canViewAllLocations: false, // Only team members
    canUseAISandbox: true,
    canModifyAIData: false,
    canViewAIRecommendations: true,
    canViewReports: true, // Limited scope
    canViewCompanyAnalytics: false,
    canViewPlatformAnalytics: false,
    canManageUsers: false,
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canReportSafetyIssue: true,
    canViewSafetyReports: true,
    canApproveSafetyReports: false,
    canAccessAuditLogs: false,
    canManageSystemSettings: false,
    canTriggerBackups: false,
    canOverridePermissions: false,
  },
  OPERATIVE: {
    canCreateProject: false,
    canEditProject: false,
    canDeleteProject: false,
    canViewAllProjects: false, // Only assigned projects
    canCreateTask: false,
    canEditTask: false,
    canDeleteTask: false,
    canAssignTask: false,
    canViewAllTasks: false, // Only assigned tasks
    canSubmitTaskUpdate: true,
    canUploadDrawing: false,
    canUploadFile: true, // Task-related only
    canDeleteFile: false,
    canViewAllFiles: false, // Only task-related
    canSubmitTimesheet: true,
    canApproveTimesheet: false,
    canViewAllTimesheets: false, // Only own
    canViewLiveMap: true,
    canViewTeamLocation: false, // Only self
    canViewAllLocations: false,
    canUseAISandbox: true,
    canModifyAIData: false,
    canViewAIRecommendations: true, // Read-only guidance
    canViewReports: false,
    canViewCompanyAnalytics: false,
    canViewPlatformAnalytics: false,
    canManageUsers: false,
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canReportSafetyIssue: true,
    canViewSafetyReports: false, // Only own
    canApproveSafetyReports: false,
    canAccessAuditLogs: false,
    canManageSystemSettings: false,
    canTriggerBackups: false,
    canOverridePermissions: false,
  },
}

export interface TaskAssignment {
  assignedTo?: string // Specific user ID
  assignedToRoles?: string[] // Roles to assign to
  targetRoles?: string[] // Roles that can see this task
}

export interface DashboardConfig {
  role: UserRole
  widgets: string[]
  layout: 'grid' | 'list'
  defaultView: string
}

