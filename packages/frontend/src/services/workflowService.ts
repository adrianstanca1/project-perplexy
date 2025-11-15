import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL === '' ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:3001')

export interface WorkflowTrigger {
  type: 'schedule' | 'event' | 'webhook' | 'manual'
  config: Record<string, any>
}

export interface WorkflowAction {
  type: 'notification' | 'email' | 'webhook' | 'database' | 'api'
  config: Record<string, any>
  order: number
}

export interface Workflow {
  id: string
  name: string
  description: string
  status: 'active' | 'inactive' | 'draft'
  triggers: WorkflowTrigger[]
  actions: WorkflowAction[]
  lastRun?: Date
  runCount: number
  createdAt: Date
  updatedAt: Date
}

export interface CreateWorkflowRequest {
  name: string
  description: string
  triggers: WorkflowTrigger[]
  actions: WorkflowAction[]
}

export interface UpdateWorkflowRequest {
  name?: string
  description?: string
  status?: 'active' | 'inactive' | 'draft'
  triggers?: WorkflowTrigger[]
  actions?: WorkflowAction[]
}

export interface WorkflowExecution {
  id: string
  workflowId: string
  status: 'success' | 'error' | 'running'
  startedAt: Date
  completedAt?: Date
  error?: string
  logs: string[]
}

export interface WorkflowStats {
  total: number
  active: number
  totalRuns: number
  successRate: number
}

function parseWorkflow(workflow: any): Workflow {
  return {
    ...workflow,
    lastRun: workflow.lastRun ? new Date(workflow.lastRun) : undefined,
    createdAt: new Date(workflow.createdAt),
    updatedAt: new Date(workflow.updatedAt),
  }
}

function parseWorkflowExecution(execution: any): WorkflowExecution {
  return {
    ...execution,
    startedAt: new Date(execution.startedAt),
    completedAt: execution.completedAt ? new Date(execution.completedAt) : undefined,
  }
}

export const workflowService = {
  async getWorkflows(): Promise<Workflow[]> {
    const response = await axios.get(`${API_URL}/api/workflows`)
    return response.data.workflows.map(parseWorkflow)
  },

  async getWorkflow(workflowId: string): Promise<Workflow> {
    const response = await axios.get(`${API_URL}/api/workflows/${workflowId}`)
    return parseWorkflow(response.data.workflow)
  },

  async createWorkflow(workflow: CreateWorkflowRequest): Promise<Workflow> {
    const response = await axios.post(`${API_URL}/api/workflows`, workflow)
    return parseWorkflow(response.data.workflow)
  },

  async updateWorkflow(workflowId: string, updates: UpdateWorkflowRequest): Promise<Workflow> {
    const response = await axios.put(`${API_URL}/api/workflows/${workflowId}`, updates)
    return parseWorkflow(response.data.workflow)
  },

  async deleteWorkflow(workflowId: string): Promise<void> {
    await axios.delete(`${API_URL}/api/workflows/${workflowId}`)
  },

  async executeWorkflow(workflowId: string): Promise<WorkflowExecution> {
    const response = await axios.post(`${API_URL}/api/workflows/${workflowId}/execute`)
    return parseWorkflowExecution(response.data.execution)
  },

  async getWorkflowExecutions(workflowId?: string): Promise<WorkflowExecution[]> {
    const params = workflowId ? { workflowId } : {}
    const response = await axios.get(`${API_URL}/api/workflows/executions`, { params })
    return response.data.executions.map(parseWorkflowExecution)
  },

  async getWorkflowStats(): Promise<WorkflowStats> {
    const response = await axios.get(`${API_URL}/api/workflows/stats`)
    return response.data.stats
  },
}

