import { Outlet, Link, useLocation } from 'react-router-dom'
import { Folder, Play, Map, LayoutDashboard, Settings, Building2, History, Code, Package, Desktop } from 'lucide-react'

export default function MainLayout() {
  const location = useLocation()

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/sandbox', icon: Code, label: 'Developer Sandbox' },
    { to: '/marketplace', icon: Package, label: 'Marketplace' },
    { to: '/desktop', icon: Desktop, label: 'myAppDesktop' },
    { to: '/interpreter', icon: Play, label: 'Interpreter' },
    { to: '/files', icon: Folder, label: 'Files' },
    { to: '/projects', icon: Building2, label: 'Projects' },
    { to: '/map', icon: Map, label: 'Live Map' },
    { to: '/history', icon: History, label: 'History' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold text-primary-400">Code Interpreter</h1>
          <p className="text-xs text-gray-400 mt-1">UK Construction</p>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              location.pathname === item.to ||
              (item.to === '/' && location.pathname === '/') ||
              (item.to === '/interpreter' && location.pathname === '/interpreter')
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}

