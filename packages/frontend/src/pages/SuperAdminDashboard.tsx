import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  Shield, Users, Building2, Folder, BarChart3, Settings, 
  FileText, AlertTriangle, Database, Activity, TrendingUp 
} from 'lucide-react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function SuperAdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrganizations: 0,
    totalProjects: 0,
    totalTasks: 0,
    platformHealth: 'healthy',
    activeSessions: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Fetch platform-wide statistics
      const [usersRes, orgsRes, projectsRes, tasksRes] = await Promise.all([
        axios.get(`${API_URL}/api/users/stats`).catch(() => ({ data: { total: 0 } })),
        axios.get(`${API_URL}/api/organizations/stats`).catch(() => ({ data: { total: 0 } })),
        axios.get(`${API_URL}/api/projects/stats`).catch(() => ({ data: { total: 0 } })),
        axios.get(`${API_URL}/api/tasks/stats`).catch(() => ({ data: { total: 0 } })),
      ])

      setStats({
        totalUsers: usersRes.data.total || 0,
        totalOrganizations: orgsRes.data.total || 0,
        totalProjects: projectsRes.data.total || 0,
        totalTasks: tasksRes.data.total || 0,
        platformHealth: 'healthy',
        activeSessions: 0,
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
                <Shield className="w-8 h-8 text-yellow-400" />
                Super Admin Dashboard
              </h1>
              <p className="text-gray-400">Platform-level control and monitoring</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-yellow-500 bg-opacity-20 rounded-lg border border-yellow-500">
                <span className="text-yellow-400 font-semibold">SUPER ADMIN</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-primary-500 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500 bg-opacity-20 rounded-lg">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">{stats.totalUsers}</h3>
            <p className="text-gray-400 text-sm">Total Users</p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-primary-500 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500 bg-opacity-20 rounded-lg">
                <Building2 className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">{stats.totalOrganizations}</h3>
            <p className="text-gray-400 text-sm">Organizations</p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-primary-500 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500 bg-opacity-20 rounded-lg">
                <Folder className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">{stats.totalProjects}</h3>
            <p className="text-gray-400 text-sm">Total Projects</p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-primary-500 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-500 bg-opacity-20 rounded-lg">
                <FileText className="w-6 h-6 text-orange-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">{stats.totalTasks}</h3>
            <p className="text-gray-400 text-sm">Total Tasks</p>
          </div>
        </div>

        {/* Platform Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-400" />
              Platform Health
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Status</span>
                <span className="px-3 py-1 bg-green-500 bg-opacity-20 text-green-400 rounded-lg text-sm font-semibold">
                  {stats.platformHealth.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Active Sessions</span>
                <span className="text-white font-semibold">{stats.activeSessions}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-400" />
              System Management
            </h2>
            <div className="space-y-3">
              <Link
                to="/admin/users"
                className="block p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span>Manage Users</span>
                  <Users className="w-4 h-4 text-gray-400" />
                </div>
              </Link>
              <Link
                to="/admin/organizations"
                className="block p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span>Manage Organizations</span>
                  <Building2 className="w-4 h-4 text-gray-400" />
                </div>
              </Link>
              <Link
                to="/admin/audit-logs"
                className="block p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span>Audit Logs</span>
                  <FileText className="w-4 h-4 text-gray-400" />
                </div>
              </Link>
              <Link
                to="/admin/settings"
                className="block p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span>System Settings</span>
                  <Settings className="w-4 h-4 text-gray-400" />
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/admin/backup"
              className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-center"
            >
              <Database className="w-8 h-8 mx-auto mb-2 text-blue-400" />
              <span className="text-sm">Trigger Backup</span>
            </Link>
            <Link
              to="/admin/analytics"
              className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-center"
            >
              <BarChart3 className="w-8 h-8 mx-auto mb-2 text-purple-400" />
              <span className="text-sm">Platform Analytics</span>
            </Link>
            <Link
              to="/admin/alerts"
              className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-center"
            >
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-400" />
              <span className="text-sm">System Alerts</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

