import { Project, CreateProjectDto, UpdateProjectDto } from '../types/project.js'
import { v4 as uuidv4 } from 'uuid'

// In-memory storage for demo (replace with database in production)
const projects = new Map<string, Project>()

// Initialize with default project
const defaultProject: Project = {
  id: 'default-project',
  name: 'Default Project',
  description: 'Default construction project',
  createdAt: new Date(),
  updatedAt: new Date(),
}
projects.set('default-project', defaultProject)

export const projectService = {
  /**
   * Get all projects
   */
  async getAllProjects(): Promise<Project[]> {
    return Array.from(projects.values())
  },

  /**
   * Get project by ID
   */
  async getProject(projectId: string): Promise<Project | null> {
    return projects.get(projectId) || null
  },

  /**
   * Create project
   */
  async createProject(data: CreateProjectDto): Promise<Project> {
    const project: Project = {
      id: uuidv4(),
      name: data.name,
      description: data.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    projects.set(project.id, project)
    return project
  },

  /**
   * Update project
   */
  async updateProject(projectId: string, data: UpdateProjectDto): Promise<Project | null> {
    const project = projects.get(projectId)
    if (!project) {
      return null
    }

    const updatedProject: Project = {
      ...project,
      name: data.name ?? project.name,
      description: data.description ?? project.description,
      updatedAt: new Date(),
    }

    projects.set(projectId, updatedProject)
    return updatedProject
  },

  /**
   * Delete project
   */
  async deleteProject(projectId: string): Promise<boolean> {
    if (projectId === 'default-project') {
      return false // Cannot delete default project
    }

    return projects.delete(projectId)
  },

  /**
   * Get project statistics
   */
  async getProjectStats(projectId: string): Promise<{
    project: Project
    totalUsers: number
    totalDrawings: number
    createdAt: Date
    updatedAt: Date
  } | null> {
    const project = projects.get(projectId)
    if (!project) {
      return null
    }

    // In a real implementation, these would come from database queries
    return {
      project,
      totalUsers: 0, // Would query locationService
      totalDrawings: 0, // Would query drawingService
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }
  },

  /**
   * Get all project statistics
   */
  async getAllProjectStats(): Promise<{
    totalProjects: number
    totalUsers: number
    totalDrawings: number
    recentProjects: Project[]
  }> {
    const allProjects = Array.from(projects.values())
    return {
      totalProjects: allProjects.length,
      totalUsers: 0, // Would query locationService
      totalDrawings: 0, // Would query drawingService
      recentProjects: allProjects
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5),
    }
  },
}

