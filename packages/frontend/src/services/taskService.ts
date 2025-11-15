import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export interface Task {
  id: string
  title: string
  description?: string
  projectId: string
  organizationId: string
  createdBy: string
  assignedTo?: string
  assignedToRoles?: string[]
  targetRoles?: string[]
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  dueDate?: string
  location?: string
  coordinates?: { lat: number; lng: number }
  attachments?: string[]
  isSafetyIssue?: boolean
  safetyImages?: string[]
  observations?: string
  incidents?: any[]
  timeLogs?: any[]
  approvedBy?: string
  approvedAt?: string
  createdAt: string
  updatedAt: string
  createdByUser?: { id: string; name: string; email: string; avatar?: string }
  assignedToUser?: { id: string; name: string; email: string; avatar?: string }
  project?: { id: string; name: string }
}

export interface CreateTaskRequest {
  title: string
  description?: string
  projectId: string
  assignedTo?: string
  assignedToRoles?: string[]
  targetRoles?: string[]
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  dueDate?: string
  location?: string
  coordinates?: { lat: number; lng: number }
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  status?: string
  priority?: string
  dueDate?: string
  location?: string
  coordinates?: { lat: number; lng: number }
}

export const taskService = {
  async getTasks(params?: { status?: string; projectId?: string }): Promise<Task[]> {
    const response = await axios.get(`${API_URL}/api/tasks`, { params })
    return response.data.tasks || []
  },

  async getTask(taskId: string): Promise<Task> {
    const response = await axios.get(`${API_URL}/api/tasks/${taskId}`)
    return response.data.task
  },

  async createTask(task: CreateTaskRequest): Promise<Task> {
    const response = await axios.post(`${API_URL}/api/tasks`, task)
    return response.data.task
  },

  async updateTask(taskId: string, updates: UpdateTaskRequest): Promise<Task> {
    const response = await axios.put(`${API_URL}/api/tasks/${taskId}`, updates)
    return response.data.task
  },

  async deleteTask(taskId: string): Promise<void> {
    await axios.delete(`${API_URL}/api/tasks/${taskId}`)
  },

  async assignTask(taskId: string, assignedTo?: string, assignedToRoles?: string[]): Promise<Task> {
    const response = await axios.post(`${API_URL}/api/tasks/${taskId}/assign`, {
      assignedTo,
      assignedToRoles,
    })
    return response.data.task
  },

  async submitTaskUpdate(taskId: string, update: string, timeLog?: { hours: number; notes: string }): Promise<Task> {
    const response = await axios.post(`${API_URL}/api/tasks/${taskId}/update`, {
      update,
      timeLog,
    })
    return response.data.task
  },

  async approveTimesheet(taskId: string, approved: boolean): Promise<Task> {
    const response = await axios.post(`${API_URL}/api/tasks/${taskId}/timesheet/approve`, {
      approved,
    })
    return response.data.task
  },

  async reportSafetyIssue(taskId: string, description: string, images?: string[], severity?: string): Promise<Task> {
    const response = await axios.post(`${API_URL}/api/tasks/${taskId}/safety`, {
      description,
      images,
      severity,
    })
    return response.data.task
  },

  async getUsersForAssignment(projectId?: string, role?: string): Promise<any[]> {
    const params: any = {}
    if (projectId) params.projectId = projectId
    if (role) params.role = role
    const response = await axios.get(`${API_URL}/api/tasks/assignment/users`, { params })
    return response.data.users || []
  },
}

