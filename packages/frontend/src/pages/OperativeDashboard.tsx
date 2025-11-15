import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  ClipboardCheck, Map, Clock, Upload, AlertTriangle, 
  CheckCircle, XCircle, FileText 
} from 'lucide-react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function OperativeDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    assignedTasks: 0,
    completedToday: 0,
    pendingTasks: 0,
    hoursLogged: 0,
  })
  const [myTasks, setMyTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [tasksRes] = await Promise.all([
        axios.get(`${API_URL}/api/tasks`).catch(() => ({ data: { tasks: [] } })),
      ])

      const allTasks = tasksRes.data.tasks || []
      const assigned = allTasks.filter(
        (t: any) =>
          t.assignedTo === user?.id ||
          (t.assignedToRoles && t.assignedToRoles.includes(user?.role)) ||
          (t.targetRoles && t.targetRoles.includes(user?.role))
      )

      setMyTasks(assigned.slice(0, 5))
      setStats({
        assignedTasks: assigned.length,
        completedToday: assigned.filter((t: any) => t.status === 'COMPLETED').length,
        pendingTasks: assigned.filter((t: any) => t.status === 'PENDING' || t.status === 'IN_PROGRESS').length,
        hoursLogged: 0, // Calculate from timeLogs
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
                <ClipboardCheck className="w-8 h-8 text-green-400" />
                My Tasks
              </h1>
              <p className="text-gray-400">View and update your assigned tasks</p>
            </div>
            <div className="px-4 py-2 bg-green-500 bg-opacity-20 rounded-lg border border-green-500">
              <span className="text-green-400 font-semibold">OPERATIVE</span>
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
            <h3 className="text-2xl font-bold mb-1">{stats.assignedTasks}</h3>
            <p className="text-gray-400 text-xs">Assigned Tasks</p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-500 bg-opacity-20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">{stats.completedToday}</h3>
            <p className="text-gray-400 text-xs">Completed</p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-yellow-500 bg-opacity-20 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">{stats.pendingTasks}</h3>
            <p className="text-gray-400 text-xs">Pending</p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-500 bg-opacity-20 rounded-lg">
                <Clock className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-1">{stats.hoursLogged}h</h3>
            <p className="text-gray-400 text-xs">Hours Logged</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            to="/tasks"
            className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-primary-500 transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-500 bg-opacity-20 rounded-lg group-hover:bg-primary-500 transition-colors">
                <ClipboardCheck className="w-5 h-5 text-primary-400 group-hover:text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">View All Tasks</h3>
                <p className="text-xs text-gray-400">See assignments</p>
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
                <h3 className="text-sm font-semibold">My Location</h3>
                <p className="text-xs text-gray-400">View on map</p>
              </div>
            </div>
          </Link>

          <Link
            to="/tasks?filter=safety"
            className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-red-500 transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-500 bg-opacity-20 rounded-lg group-hover:bg-red-500 transition-colors">
                <AlertTriangle className="w-5 h-5 text-red-400 group-hover:text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Report Safety Issue</h3>
                <p className="text-xs text-gray-400">Submit report</p>
              </div>
            </div>
          </Link>
        </div>

        {/* My Tasks */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-green-400" />
              My Assigned Tasks
            </h2>
            <Link
              to="/tasks"
              className="text-primary-400 hover:text-primary-300 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {myTasks.length > 0 ? (
              myTasks.map((task) => (
                <Link
                  key={task.id}
                  to={`/tasks/${task.id}`}
                  className="block p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{task.title}</h3>
                      {task.description && (
                        <p className="text-sm text-gray-400 mb-2 line-clamp-2">{task.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className={`px-2 py-1 rounded ${
                          task.status === 'COMPLETED' ? 'bg-green-500 bg-opacity-20 text-green-400' :
                          task.status === 'IN_PROGRESS' ? 'bg-blue-500 bg-opacity-20 text-blue-400' :
                          'bg-yellow-500 bg-opacity-20 text-yellow-400'
                        }`}>
                          {task.status?.replace('_', ' ')}
                        </span>
                        {task.dueDate && (
                          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      {task.status === 'COMPLETED' ? (
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      ) : (
                        <XCircle className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <ClipboardCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No tasks assigned yet</p>
                <p className="text-sm mt-2">Tasks assigned to you will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

