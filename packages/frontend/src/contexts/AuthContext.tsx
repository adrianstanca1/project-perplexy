import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface User {
  id: string
  email: string
  name: string
  role: 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'SUPERVISOR' | 'OPERATIVE'
  avatar?: string
  organizationId?: string
  projectIds?: string[]
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => void
  logout: () => void
  refreshToken: () => Promise<void>
  hasPermission: (permission: string) => boolean
  getDashboardRoute: () => string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Role permissions mapping
const ROLE_PERMISSIONS: Record<string, Record<string, boolean>> = {
  SUPER_ADMIN: {
    'create:project': true,
    'edit:project': true,
    'delete:project': true,
    'assign:task': true,
    'create:task': true,
    'edit:task': true,
    'upload:drawing': true,
    'approve:timesheet': true,
    'view:reports': true,
    'view:all:map': true,
    'view:company:analytics': true,
    'manage:users': true,
    'platform:admin': true,
  },
  COMPANY_ADMIN: {
    'create:project': true,
    'edit:project': true,
    'delete:project': true,
    'assign:task': true,
    'create:task': true,
    'edit:task': true,
    'upload:drawing': true,
    'approve:timesheet': true,
    'view:reports': true,
    'view:all:map': true,
    'view:company:analytics': true,
    'manage:users': true,
    'platform:admin': false,
  },
  SUPERVISOR: {
    'create:project': false,
    'edit:project': false,
    'delete:project': false,
    'assign:task': true,
    'create:task': true,
    'edit:task': true,
    'upload:drawing': true,
    'approve:timesheet': true,
    'view:reports': true,
    'view:all:map': true,
    'view:company:analytics': false,
    'manage:users': false,
    'platform:admin': false,
  },
  OPERATIVE: {
    'create:project': false,
    'edit:project': false,
    'delete:project': false,
    'assign:task': false,
    'create:task': false,
    'edit:task': false,
    'upload:drawing': false,
    'approve:timesheet': false,
    'view:reports': false,
    'view:all:map': false,
    'view:company:analytics': false,
    'manage:users': false,
    'platform:admin': false,
  },
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const storedUser = localStorage.getItem('user')

    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
      }
    }

    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      })

      const { user: userData, accessToken, refreshToken, dashboardRoute } = response.data

      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(userData))

      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`

      setUser(userData)
      toast.success(`Welcome back, ${userData.name}!`)

      // Navigate to role-specific dashboard
      navigate(dashboardRoute || '/dashboard')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      throw error
    }
  }

  const loginWithGoogle = () => {
    window.location.href = `${API_URL}/api/auth/google`
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
    navigate('/login')
    toast.success('Logged out successfully')
  }

  const refreshToken = async () => {
    try {
      const storedRefreshToken = localStorage.getItem('refreshToken')
      if (!storedRefreshToken) {
        throw new Error('No refresh token')
      }

      const response = await axios.post(`${API_URL}/api/auth/refresh`, {
        refreshToken: storedRefreshToken,
      })

      const { accessToken, refreshToken: newRefreshToken } = response.data

      localStorage.setItem('accessToken', accessToken)
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken)
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
    } catch (error) {
      logout()
      throw error
    }
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    const rolePermissions = ROLE_PERMISSIONS[user.role] || {}
    return rolePermissions[permission] || false
  }

  const getDashboardRoute = (): string => {
    if (!user) return '/dashboard'
    switch (user.role) {
      case 'SUPER_ADMIN':
        return '/super-admin-dashboard'
      case 'COMPANY_ADMIN':
        return '/company-dashboard'
      case 'SUPERVISOR':
        return '/supervisor-dashboard'
      case 'OPERATIVE':
        return '/operative-dashboard'
      default:
        return '/dashboard'
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGoogle,
        logout,
        refreshToken,
        hasPermission,
        getDashboardRoute,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

