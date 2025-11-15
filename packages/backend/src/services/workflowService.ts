import { v4 as uuidv4 } from 'uuid'
import {
  Workflow,
  CreateWorkflowRequest,
  UpdateWorkflowRequest,
  WorkflowExecution,
} from '../types/workflow.js'
import { ApiError } from '../utils/ApiError.js'

// In-memory storage for demo (replace with database in production)
// Initialize with sample data
const workflows: Workflow[] = [
  {
    id: 'workflow-1',
    name: 'Tender Deadline Reminder',
    description: 'Send reminder emails before tender deadlines',
    status: 'active',
    triggers: [
      {
        type: 'schedule',
        config: { schedule: '0 9 * * *', timezone: 'Europe/London' },
      },
    ],
    actions: [
      {
        type: 'email',
        config: { to: 'team@example.com', subject: 'Tender Deadline Reminder', template: 'tender-reminder' },
        order: 1,
      },
    ],
    lastRun: new Date('2025-10-14'),
    runCount: 45,
    createdAt: new Date('2025-08-01'),
    updatedAt: new Date('2025-10-14'),
  },
  {
    id: 'workflow-2',
    name: 'Contract Renewal Alert',
    description: 'Alert team when contracts are due for renewal',
    status: 'active',
    triggers: [
      {
        type: 'event',
        config: { event: 'contract.renewal.due', daysBefore: 30 },
      },
    ],
    actions: [
      {
        type: 'notification',
        config: { channel: 'slack', message: 'Contract renewal due in 30 days' },
        order: 1,
      },
      {
        type: 'email',
        config: { to: 'admin@example.com', subject: 'Contract Renewal Alert', template: 'contract-renewal' },
        order: 2,
      },
    ],
    lastRun: new Date('2025-10-13'),
    runCount: 12,
    createdAt: new Date('2025-09-01'),
    updatedAt: new Date('2025-10-13'),
  },
]

const workflowExecutions: WorkflowExecution[] = []

export const workflowService = {
  async getWorkflows(): Promise<Workflow[]> {
    return workflows.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  },

  async getWorkflow(workflowId: string): Promise<Workflow | null> {
    return workflows.find((w) => w.id === workflowId) || null
  },

  async createWorkflow(workflow: CreateWorkflowRequest): Promise<Workflow> {
    if (!workflow.name || !workflow.description || !workflow.triggers || !workflow.actions) {
      throw new ApiError('Missing required fields', 400)
    }

    const newWorkflow: Workflow = {
      id: uuidv4(),
      name: workflow.name,
      description: workflow.description,
      status: 'draft',
      triggers: workflow.triggers,
      actions: workflow.actions,
      runCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    workflows.push(newWorkflow)
    return newWorkflow
  },

  async updateWorkflow(workflowId: string, updates: UpdateWorkflowRequest): Promise<Workflow> {
    const workflow = workflows.find((w) => w.id === workflowId)
    if (!workflow) {
      throw new ApiError('Workflow not found', 404)
    }

    if (updates.name) workflow.name = updates.name
    if (updates.description) workflow.description = updates.description
    if (updates.status) workflow.status = updates.status
    if (updates.triggers) workflow.triggers = updates.triggers
    if (updates.actions) workflow.actions = updates.actions

    workflow.updatedAt = new Date()
    return workflow
  },

  async deleteWorkflow(workflowId: string): Promise<void> {
    const index = workflows.findIndex((w) => w.id === workflowId)
    if (index === -1) {
      throw new ApiError('Workflow not found', 404)
    }
    workflows.splice(index, 1)
    // Also delete all executions for this workflow
    const executionIndices = workflowExecutions
      .map((e, i) => (e.workflowId === workflowId ? i : -1))
      .filter((i) => i !== -1)
      .reverse()
    executionIndices.forEach((i) => workflowExecutions.splice(i, 1))
  },

  async executeWorkflow(workflowId: string): Promise<WorkflowExecution> {
    const workflow = workflows.find((w) => w.id === workflowId)
    if (!workflow) {
      throw new ApiError('Workflow not found', 404)
    }

    if (workflow.status !== 'active') {
      throw new ApiError('Workflow is not active', 400)
    }

    const execution: WorkflowExecution = {
      id: uuidv4(),
      workflowId,
      status: 'running',
      startedAt: new Date(),
      logs: [],
    }

    workflowExecutions.push(execution)

    try {
      // Simulate workflow execution
      execution.logs.push(`Starting workflow: ${workflow.name}`)
      
      for (const action of workflow.actions.sort((a, b) => a.order - b.order)) {
        execution.logs.push(`Executing action: ${action.type}`)
        // Placeholder for actual action execution
      }

      execution.status = 'success'
      execution.completedAt = new Date()
      execution.logs.push('Workflow completed successfully')

      workflow.runCount++
      workflow.lastRun = new Date()
    } catch (error) {
      execution.status = 'error'
      execution.error = error instanceof Error ? error.message : 'Unknown error'
      execution.completedAt = new Date()
      execution.logs.push(`Error: ${execution.error}`)
    }

    return execution
  },

  async getWorkflowExecutions(workflowId?: string): Promise<WorkflowExecution[]> {
    let filteredExecutions = workflowExecutions
    if (workflowId) {
      filteredExecutions = workflowExecutions.filter((e) => e.workflowId === workflowId)
    }
    return filteredExecutions.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
  },

  async getWorkflowStats(): Promise<{
    total: number
    active: number
    totalRuns: number
    successRate: number
  }> {
    const total = workflows.length
    const active = workflows.filter((w) => w.status === 'active').length
    const totalRuns = workflows.reduce((sum, w) => sum + w.runCount, 0)
    const successfulRuns = workflowExecutions.filter((e) => e.status === 'success').length
    const successRate = workflowExecutions.length > 0 ? (successfulRuns / workflowExecutions.length) * 100 : 0

    return {
      total,
      active,
      totalRuns,
      successRate,
    }
  },
}

