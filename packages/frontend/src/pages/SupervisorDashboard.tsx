import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  ClipboardList, Users, Map, FileText, Clock, AlertTriangle, 
  CheckCircle, Plus, Upload, MessageSquare 
} from 'lucide-react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function SupervisorDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    myTasks: 0,
    teamTasks: 0,
    pendingApprovals: 0,
    safetyIssues: 0,
  })
  const [recentTasks, setRecentTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [tasksRes] = await Promise.all([
        axios.get(`${API_URL}/api/tasks`).catch(() => ({ data: { tasks: [] } })),
      ])

      const tasks = tasksRes.data.tasks || []
      setRecentTasks(tasks.slice(0, 5))
      setStats({
        myTasks: tasks.filter((t: any) => t.assignedTo === user?.id).length,
        teamTasks: tasks.length,
        pendingApprovals: tasks.filter((t: any) => !t.approvedAt).length,
        safetyIssues: tasks.filter((t: any) => t.isSafetyIssue).length,
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
                <ClipboardList className="w-8 h-8 text-orange-400" />
                Supervisor Dashboard
              </h1>
              <p className="text-gray-400">Manage field operations and team tasks</p>
            </div>
            <div className="px-4 py-2 bg-orange-500 bg-opacity-20 rounded-lg border border-orange-500">
              <span className="text-orange-400 font-semibold">SUPERVISOR</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-500 bg-opacity-20 rounded-lg">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">{stats.myTasks}</h3>
            <p className="text-gray-400 text-xs">My Tasks</p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-500 bg-opacity-20 rounded-lg">
                <Users className="w-5 h-5 text-green-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">{stats.teamTasks}</h3>
            <p className="text-gray-400 text-xs">Team Tasks</p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-yellow-500 bg-opacity-20 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">{stats.pendingApprovals}</h3>
            <p className="text-gray-400 text-xs">Pending Approvals</p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-red-500 bg-opacity-20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">{stats.safetyIssues}</h3>
            <p className="text-gray-400 text-xs">Safety Issues</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            to="/tasks/new"
            className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-primary-500 transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-500 bg-opacity-20 rounded-lg group-hover:bg-primary-500 transition-colors">
                <Plus className="w-5 h-5 text-primary-400 group-hover:text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Create Task</h3>
                <p className="text-xs text-gray-400">Assign to team</p>
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
            to="/files"
            className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-green-500 transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500 bg-opacity-20 rounded-lg group-hover:bg-green-500 transition-colors">
                <Upload className="w-5 h-5 text-green-400 group-hover:text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Upload Drawings</h3>
                <p className="text-xs text-gray-400">Add files</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Tasks */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-400" />
              Recent Tasks
            </h2>
            <Link
              to="/tasks"
              className="text-primary-400 hover:text-primary-300 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentTasks.length > 0 ? (
              recentTasks.map((task) => (
                <Link
                  key={task.id}
                  to={`/tasks/${task.id}`}
                  className="block p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{task.title}</h3>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="capitalize">{task.status?.toLowerCase()}</span>
                        {task.assignedToUser && (
                          <span>Assigned to: {task.assignedToUser.name}</span>
                        )}
                      </div>
                    </div>
                    {task.status === 'COMPLETED' && (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No tasks yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

