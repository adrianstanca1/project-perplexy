import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL === '' ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:3001')

export interface TeamMember {
  id: string
  name: string
  role: string
  rate: number
  efficiency: number
  email?: string
  phone?: string
  status: 'active' | 'away' | 'offline'
  skills?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface CreateTeamMemberRequest {
  name: string
  role: string
  rate: number
  email?: string
  phone?: string
  skills?: string[]
}

export interface UpdateTeamMemberRequest {
  name?: string
  role?: string
  rate?: number
  efficiency?: number
  email?: string
  phone?: string
  status?: 'active' | 'away' | 'offline'
  skills?: string[]
}

export interface TeamStats {
  total: number
  averageEfficiency: number
  averageRate: number
  activeProjects: number
}

function parseTeamMember(member: any): TeamMember {
  return {
    ...member,
    createdAt: new Date(member.createdAt),
    updatedAt: new Date(member.updatedAt),
  }
}

export const teamService = {
  async getTeamMembers(): Promise<TeamMember[]> {
    const response = await axios.get(`${API_URL}/api/team`)
    return response.data.members.map(parseTeamMember)
  },

  async getTeamMember(memberId: string): Promise<TeamMember> {
    const response = await axios.get(`${API_URL}/api/team/${memberId}`)
    return parseTeamMember(response.data.member)
  },

  async createTeamMember(member: CreateTeamMemberRequest): Promise<TeamMember> {
    const response = await axios.post(`${API_URL}/api/team`, member)
    return parseTeamMember(response.data.member)
  },

  async updateTeamMember(memberId: string, updates: UpdateTeamMemberRequest): Promise<TeamMember> {
    const response = await axios.put(`${API_URL}/api/team/${memberId}`, updates)
    return parseTeamMember(response.data.member)
  },

  async deleteTeamMember(memberId: string): Promise<void> {
    await axios.delete(`${API_URL}/api/team/${memberId}`)
  },

  async getTeamStats(): Promise<TeamStats> {
    const response = await axios.get(`${API_URL}/api/team/stats`)
    return response.data.stats
  },
}

