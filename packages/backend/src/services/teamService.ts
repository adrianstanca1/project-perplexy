import { v4 as uuidv4 } from 'uuid'
import { TeamMember, CreateTeamMemberRequest, UpdateTeamMemberRequest } from '../types/team.js'
import { ApiError } from '../utils/ApiError.js'

// In-memory storage for demo (replace with database in production)
// Initialize with sample data
const teamMembers: TeamMember[] = [
  {
    id: 'member-1',
    name: 'Sarah Mitchell',
    role: 'Project Manager',
    rate: 45,
    efficiency: 92,
    status: 'active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2025-10-14'),
  },
  {
    id: 'member-2',
    name: 'James Wilson',
    role: 'Site Supervisor',
    rate: 32,
    efficiency: 88,
    status: 'active',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2025-10-13'),
  },
  {
    id: 'member-3',
    name: 'Emma Thompson',
    role: 'Skilled Tradesman',
    rate: 25.5,
    efficiency: 95,
    status: 'active',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2025-10-12'),
  },
  {
    id: 'member-4',
    name: 'David Brown',
    role: 'General Laborer',
    rate: 18.75,
    efficiency: 85,
    status: 'active',
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2025-10-11'),
  },
]

export const teamService = {
  async getTeamMembers(): Promise<TeamMember[]> {
    return teamMembers.sort((a, b) => b.efficiency - a.efficiency)
  },

  async getTeamMember(memberId: string): Promise<TeamMember | null> {
    return teamMembers.find((m) => m.id === memberId) || null
  },

  async createTeamMember(member: CreateTeamMemberRequest): Promise<TeamMember> {
    if (!member.name || !member.role || member.rate === undefined) {
      throw new ApiError('Missing required fields', 400)
    }

    const newMember: TeamMember = {
      id: uuidv4(),
      name: member.name,
      role: member.role,
      rate: member.rate,
      efficiency: 0,
      email: member.email,
      phone: member.phone,
      status: 'active',
      skills: member.skills || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    teamMembers.push(newMember)
    return newMember
  },

  async updateTeamMember(memberId: string, updates: UpdateTeamMemberRequest): Promise<TeamMember> {
    const member = teamMembers.find((m) => m.id === memberId)
    if (!member) {
      throw new ApiError('Team member not found', 404)
    }

    if (updates.name) member.name = updates.name
    if (updates.role) member.role = updates.role
    if (updates.rate !== undefined) member.rate = updates.rate
    if (updates.efficiency !== undefined) member.efficiency = updates.efficiency
    if (updates.email) member.email = updates.email
    if (updates.phone) member.phone = updates.phone
    if (updates.status) member.status = updates.status
    if (updates.skills) member.skills = updates.skills

    member.updatedAt = new Date()
    return member
  },

  async deleteTeamMember(memberId: string): Promise<void> {
    const index = teamMembers.findIndex((m) => m.id === memberId)
    if (index === -1) {
      throw new ApiError('Team member not found', 404)
    }
    teamMembers.splice(index, 1)
  },

  async getTeamStats(): Promise<{
    total: number
    averageEfficiency: number
    averageRate: number
    activeProjects: number
  }> {
    const total = teamMembers.length
    const averageEfficiency =
      teamMembers.length > 0
        ? teamMembers.reduce((sum, m) => sum + m.efficiency, 0) / teamMembers.length
        : 0
    const averageRate =
      teamMembers.length > 0
        ? teamMembers.reduce((sum, m) => sum + m.rate, 0) / teamMembers.length
        : 0

    // In a real implementation, this would query the database for active projects
    // For now, return a placeholder value that would be calculated from project data
    const activeProjects = 0 // Would be calculated from actual project data in production
    
    return {
      total,
      averageEfficiency,
      averageRate,
      activeProjects,
    }
  },
}

