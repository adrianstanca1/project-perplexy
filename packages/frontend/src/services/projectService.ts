import { getApiClient } from './apiClient'

export interface Project {
  id: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

// Helper function to parse dates from API responses
const parseProject = (project: any): Project => {
  return {
    ...project,
    createdAt: project.createdAt ? new Date(project.createdAt) : new Date(),
    updatedAt: project.updatedAt ? new Date(project.updatedAt) : new Date(),
  }
}

export const projectService = {
  async getProjects(): Promise<Project[]> {
    const response = await getApiClient().get('/projects')
    const projects = response.data.projects || []
    return projects.map(parseProject)
  },

  async getProject(projectId: string): Promise<Project> {
    const response = await getApiClient().get(`/projects/${projectId}`)
    return parseProject(response.data.project)
  },

  async createProject(name: string, description?: string): Promise<Project> {
    const response = await getApiClient().post('/projects', {
      name,
      description,
    })
    return parseProject(response.data.project)
  },

  async updateProject(projectId: string, name?: string, description?: string): Promise<Project> {
    const response = await getApiClient().put(`/projects/${projectId}`, {
      name,
      description,
    })
    return parseProject(response.data.project)
  },

  async deleteProject(projectId: string): Promise<void> {
    await getApiClient().delete(`/projects/${projectId}`)
  },
}

