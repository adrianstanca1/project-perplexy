import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  Building2, Users, Folder, FileText, Map, TrendingUp, 
  Calendar, MessageSquare, BarChart3, Settings, Plus 
} from 'lucide-react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function CompanyAdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTeamMembers: 0,
    activeTasks: 0,
    pendingApprovals: 0,
    companyValue: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Fetch company-wide statistics
      const [projectsRes, teamRes, tasksRes] = await Promise.all([
        axios.get(`${API_URL}/api/projects`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/api/team`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/api/tasks?status=IN_PROGRESS`).catch(() => ({ data: { tasks: [] } })),
      ])

      setStats({
        totalProjects: projectsRes.data.length || 0,
        totalTeamMembers: teamRes.data.length || 0,
        activeTasks: tasksRes.data.tasks?.length || 0,
        pendingApprovals: 0,
        companyValue: 0,
      })
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <Building2 className="w-8 h-8 text-primary-400" />
                Company Dashboard
              </h1>
              <p className="text-gray-400">Manage your company, projects, and team</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-primary-500 bg-opacity-20 rounded-lg border border-primary-500">
                <span className="text-primary-400 font-semibold">COMPANY ADMIN</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Link
            to="/projects"
            className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-primary-500 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-primary-500 bg-opacity-20 rounded-lg">
                <Folder className="w-5 h-5 text-primary-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">{stats.totalProjects}</h3>
            <p className="text-gray-400 text-xs">Projects</p>
          </Link>

          <Link
            to="/team"
            className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-green-500 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-500 bg-opacity-20 rounded-lg">
                <Users className="w-5 h-5 text-green-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">{stats.totalTeamMembers}</h3>
            <p className="text-gray-400 text-xs">Team Members</p>
          </Link>

          <Link
            to="/tasks"
            className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-orange-500 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-orange-500 bg-opacity-20 rounded-lg">
                <FileText className="w-5 h-5 text-orange-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">{stats.activeTasks}</h3>
            <p className="text-gray-400 text-xs">Active Tasks</p>
          </Link>

          <Link
            to="/tenders"
            className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-500 bg-opacity-20 rounded-lg">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">0</h3>
            <p className="text-gray-400 text-xs">Tenders</p>
          </Link>

          <Link
            to="/analytics"
            className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-purple-500 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-500 bg-opacity-20 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">£0</h3>
            <p className="text-gray-400 text-xs">Company Value</p>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            to="/projects/new"
            className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-primary-500 transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-500 bg-opacity-20 rounded-lg group-hover:bg-primary-500 transition-colors">
                <Plus className="w-5 h-5 text-primary-400 group-hover:text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Create Project</h3>
                <p className="text-xs text-gray-400">New project</p>
              </div>
            </div>
          </Link>

          <Link
            to="/team/new"
            className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-green-500 transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500 bg-opacity-20 rounded-lg group-hover:bg-green-500 transition-colors">
                <Users className="w-5 h-5 text-green-400 group-hover:text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Add Team Member</h3>
                <p className="text-xs text-gray-400">Invite user</p>
              </div>
            </div>
          </Link>

          <Link
            to="/map"
            className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 bg-opacity-20 rounded-lg group-hover:bg-blue-500 transition-colors">
                <Map className="w-5 h-5 text-blue-400 group-hover:text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Live Map</h3>
                <p className="text-xs text-gray-400">Track team</p>
              </div>
            </div>
          </Link>

          <Link
            to="/analytics"
            className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-purple-500 transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500 bg-opacity-20 rounded-lg group-hover:bg-purple-500 transition-colors">
                <BarChart3 className="w-5 h-5 text-purple-400 group-hover:text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Analytics</h3>
                <p className="text-xs text-gray-400">View reports</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-400" />
              Recent Tasks
            </h2>
            <div className="space-y-3">
              <p className="text-gray-400 text-sm">No recent tasks</p>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Company Performance
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Active Projects</span>
                <span className="text-white font-semibold">{stats.totalProjects}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Team Members</span>
                <span className="text-white font-semibold">{stats.totalTeamMembers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Tasks in Progress</span>
                <span className="text-white font-semibold">{stats.activeTasks}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

