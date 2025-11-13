export interface FileNode {
  id: string
  name: string
  type: 'file' | 'directory'
  path: string
  children?: FileNode[]
  content?: string
  size?: number
  modified?: string
}

export interface ExecutionResult {
  output: string
  error?: string
  status: 'success' | 'error' | 'running'
  executionTime?: number
}

export interface ApiResponse<T = any> {
  status: 'success' | 'error'
  data?: T
  message?: string
  error?: string
}

