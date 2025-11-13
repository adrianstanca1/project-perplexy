import axios from 'axios'

// Use relative URL when VITE_API_URL is empty (for Docker/nginx proxying)
// If VITE_API_URL is explicitly set to empty string, use relative URLs
// Otherwise, default to localhost for development
const API_URL = import.meta.env.VITE_API_URL === '' ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:3001')

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
    const response = await axios.get(`${API_URL}/api/projects`)
    const projects = response.data.projects || []
    return projects.map(parseProject)
  },

  async getProject(projectId: string): Promise<Project> {
    const response = await axios.get(`${API_URL}/api/projects/${projectId}`)
    return parseProject(response.data.project)
  },

  async createProject(name: string, description?: string): Promise<Project> {
    const response = await axios.post(`${API_URL}/api/projects`, {
      name,
      description,
    })
    return parseProject(response.data.project)
  },

  async updateProject(projectId: string, name?: string, description?: string): Promise<Project> {
    const response = await axios.put(`${API_URL}/api/projects/${projectId}`, {
      name,
      description,
    })
    return parseProject(response.data.project)
  },

  async deleteProject(projectId: string): Promise<void> {
    await axios.delete(`${API_URL}/api/projects/${projectId}`)
  },
}

