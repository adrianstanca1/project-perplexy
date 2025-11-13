import { useState, useEffect, useCallback } from 'react'
import { Activity, Folder, Map, Users, FileText, TrendingUp, Clock } from 'lucide-react'
import { projectService, Project } from '../services/projectService'
import { locationService } from '../services/locationService'
import { fileService } from '../services/fileService'
import { mapService } from '../services/mapService'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

interface DashboardStats {
    totalProjects: number
    activeUsers: number
    totalFiles: number
    totalDrawings: number
    recentProjects: Project[]
}

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalProjects: 0,
        activeUsers: 0,
        totalFiles: 0,
        totalDrawings: 0,
        recentProjects: [],
    })
    const [loading, setLoading] = useState(true)

    const loadDashboardData = useCallback(async () => {
        try {
            setLoading(true)
            const [projects, users, drawings, fileStats] = await Promise.all([
                projectService.getProjects(),
                locationService.getActiveUsers(),
                mapService.getAllDrawingMaps().catch(() => []),
                fileService.getFileStats().catch(() => ({ totalFiles: 0, totalSize: 0, totalDirectories: 0, fileTypes: {} })),
            ])

            setStats({
                totalProjects: projects.length,
                activeUsers: users.length,
                totalFiles: fileStats.totalFiles,
                totalDrawings: drawings.length,
                recentProjects: projects.slice(0, 5),
            })
        } catch (error) {
            console.error('Failed to load dashboard data:', error)
            toast.error('Failed to load dashboard data')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadDashboardData()

        // Refresh dashboard data every 30 seconds for real-time updates
        const interval = setInterval(() => {
            loadDashboardData()
        }, 30000)

        return () => clearInterval(interval)
    }, [loadDashboardData])

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
                    <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                    <p className="text-gray-400">Overview of your construction projects and activities</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Projects */}
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-primary-500 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-primary-500 bg-opacity-20 rounded-lg">
                                <Folder className="w-6 h-6 text-primary-400" />
                            </div>
                            <TrendingUp className="w-5 h-5 text-green-400" />
                        </div>
                        <h3 className="text-2xl font-bold mb-1">{stats.totalProjects}</h3>
                        <p className="text-gray-400 text-sm">Total Projects</p>
                    </div>

                    {/* Active Users */}
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-primary-500 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-500 bg-opacity-20 rounded-lg">
                                <Users className="w-6 h-6 text-green-400" />
                            </div>
                            <Activity className="w-5 h-5 text-green-400" />
                        </div>
                        <h3 className="text-2xl font-bold mb-1">{stats.activeUsers}</h3>
                        <p className="text-gray-400 text-sm">Active Users</p>
                    </div>

                    {/* Total Files */}
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-primary-500 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-500 bg-opacity-20 rounded-lg">
                                <FileText className="w-6 h-6 text-blue-400" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold mb-1">{stats.totalFiles}</h3>
                        <p className="text-gray-400 text-sm">Total Files</p>
                    </div>

                    {/* Total Drawings */}
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-primary-500 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-orange-500 bg-opacity-20 rounded-lg">
                                <Map className="w-6 h-6 text-orange-400" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold mb-1">{stats.totalDrawings}</h3>
                        <p className="text-gray-400 text-sm">Construction Drawings</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Link
                        to="/map"
                        className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-primary-500 transition-colors group"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-primary-500 bg-opacity-20 rounded-lg group-hover:bg-primary-500 transition-colors">
                                <Map className="w-6 h-6 text-primary-400 group-hover:text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-1">Live Project Map</h3>
                                <p className="text-gray-400 text-sm">View real-time project tracking</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/files"
                        className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-primary-500 transition-colors group"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-blue-500 bg-opacity-20 rounded-lg group-hover:bg-blue-500 transition-colors">
                                <Folder className="w-6 h-6 text-blue-400 group-hover:text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-1">File Manager</h3>
                                <p className="text-gray-400 text-sm">Manage project files</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/projects"
                        className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-primary-500 transition-colors group"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-green-500 bg-opacity-20 rounded-lg group-hover:bg-green-500 transition-colors">
                                <Activity className="w-6 h-6 text-green-400 group-hover:text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-1">Projects</h3>
                                <p className="text-gray-400 text-sm">Manage construction projects</p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Recent Projects */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold">Recent Projects</h2>
                        <Link
                            to="/projects"
                            className="text-primary-400 hover:text-primary-300 text-sm font-medium"
                        >
                            View All
                        </Link>
                    </div>

                    {stats.recentProjects.length > 0 ? (
                        <div className="space-y-4">
                            {stats.recentProjects.map((project) => (
                                <Link
                                    key={project.id}
                                    to={`/projects/${project.id}`}
                                    className="block p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold mb-1">{project.name}</h3>
                                            {project.description && (
                                                <p className="text-sm text-gray-400 mb-2">{project.description}</p>
                                            )}
                                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                <div className="flex items-center space-x-1">
                                                    <Clock className="w-3 h-3" />
                                                    <span>
                                                        Created {project.createdAt?.toLocaleDateString() || 'Unknown'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <Map className="w-5 h-5 text-primary-400" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <Folder className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No projects yet</p>
                            <Link
                                to="/projects"
                                className="text-primary-400 hover:text-primary-300 text-sm font-medium mt-2 inline-block"
                            >
                                Create your first project
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

