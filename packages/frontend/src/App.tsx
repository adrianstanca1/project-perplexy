import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { PrivateRoute } from './components/auth/PrivateRoute'
import MainLayout from './components/layout/MainLayout'
import Dashboard from './pages/Dashboard'
import SuperAdminDashboard from './pages/SuperAdminDashboard'
import CompanyAdminDashboard from './pages/CompanyAdminDashboard'
import SupervisorDashboard from './pages/SupervisorDashboard'
import OperativeDashboard from './pages/OperativeDashboard'
import CodeInterpreter from './pages/CodeInterpreter'
import FileManager from './pages/FileManager'
import ProjectsPage from './pages/ProjectsPage'
import ProjectDetailsPage from './pages/ProjectDetailsPage'
import LiveMapPage from './pages/LiveMapPage'
import SettingsPage from './pages/SettingsPage'
import ExecutionHistoryPage from './pages/ExecutionHistoryPage'
import DeveloperSandboxPage from './pages/DeveloperSandboxPage'
import MarketplacePage from './pages/MarketplacePage'
import MyAppDesktopPage from './pages/MyAppDesktopPage'
import TendersPage from './pages/TendersPage'
import SuppliersPage from './pages/SuppliersPage'
import ContractsPage from './pages/ContractsPage'
import MessagesPage from './pages/MessagesPage'
import CalendarPage from './pages/CalendarPage'
import TeamManagementPage from './pages/TeamManagementPage'
import AIToolsPage from './pages/AIToolsPage'
import CollaborationHubPage from './pages/CollaborationHubPage'
import WorkflowAutomationPage from './pages/WorkflowAutomationPage'
import AdvancedAnalyticsPage from './pages/AdvancedAnalyticsPage'
import CostEstimatorPage from './pages/CostEstimatorPage'
import IntegrationsCenterPage from './pages/IntegrationsCenterPage'
import TasksPage from './pages/TasksPage'
import TaskDetailsPage from './pages/TaskDetailsPage'
import TaskCreatePage from './pages/TaskCreatePage'
import LoginPage from './pages/LoginPage'
import FieldOperationsPage from './pages/FieldOperationsPage'
import OfficeDashboardPage from './pages/OfficeDashboardPage'
import CommunicationPage from './pages/CommunicationPage'
import OnboardingPage from './pages/OnboardingPage'

// Role-based dashboard redirect
function DashboardRedirect() {
  const { user, getDashboardRoute } = useAuth()
  const dashboardRoute = getDashboardRoute()
  return <Navigate to={dashboardRoute} replace />
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<MainLayout />}>
              <Route index element={<DashboardRedirect />} />
              <Route path="dashboard" element={<DashboardRedirect />} />
              <Route path="super-admin-dashboard" element={<PrivateRoute requiredRole={['SUPER_ADMIN']}><SuperAdminDashboard /></PrivateRoute>} />
              <Route path="company-dashboard" element={<PrivateRoute requiredRole={['COMPANY_ADMIN']}><CompanyAdminDashboard /></PrivateRoute>} />
              <Route path="supervisor-dashboard" element={<PrivateRoute requiredRole={['SUPERVISOR']}><SupervisorDashboard /></PrivateRoute>} />
              <Route path="operative-dashboard" element={<PrivateRoute requiredRole={['OPERATIVE']}><OperativeDashboard /></PrivateRoute>} />
              <Route path="interpreter" element={<PrivateRoute><CodeInterpreter /></PrivateRoute>} />
              <Route path="files" element={<PrivateRoute><FileManager /></PrivateRoute>} />
              <Route path="projects" element={<PrivateRoute requiredPermission="view:all:projects"><ProjectsPage /></PrivateRoute>} />
              <Route path="projects/:projectId" element={<PrivateRoute><ProjectDetailsPage /></PrivateRoute>} />
              <Route path="tasks" element={<PrivateRoute><TasksPage /></PrivateRoute>} />
              <Route path="tasks/new" element={<PrivateRoute requiredPermission="create:task"><TaskCreatePage /></PrivateRoute>} />
              <Route path="tasks/:taskId" element={<PrivateRoute><TaskDetailsPage /></PrivateRoute>} />
              <Route path="map" element={<PrivateRoute><LiveMapPage /></PrivateRoute>} />
              <Route path="history" element={<PrivateRoute><ExecutionHistoryPage /></PrivateRoute>} />
              <Route path="settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
              <Route path="sandbox" element={<PrivateRoute><DeveloperSandboxPage /></PrivateRoute>} />
              <Route path="marketplace" element={<PrivateRoute><MarketplacePage /></PrivateRoute>} />
              <Route path="desktop" element={<PrivateRoute><MyAppDesktopPage /></PrivateRoute>} />
              <Route path="tenders" element={<PrivateRoute requiredPermission="view:reports"><TendersPage /></PrivateRoute>} />
              <Route path="suppliers" element={<PrivateRoute requiredPermission="view:reports"><SuppliersPage /></PrivateRoute>} />
              <Route path="contracts" element={<PrivateRoute requiredPermission="view:reports"><ContractsPage /></PrivateRoute>} />
              <Route path="messages" element={<PrivateRoute><MessagesPage /></PrivateRoute>} />
              <Route path="calendar" element={<PrivateRoute><CalendarPage /></PrivateRoute>} />
              <Route path="team" element={<PrivateRoute requiredPermission="manage:users"><TeamManagementPage /></PrivateRoute>} />
              <Route path="ai-tools" element={<PrivateRoute><AIToolsPage /></PrivateRoute>} />
              <Route path="collaboration" element={<PrivateRoute><CollaborationHubPage /></PrivateRoute>} />
              <Route path="workflows" element={<PrivateRoute requiredPermission="view:reports"><WorkflowAutomationPage /></PrivateRoute>} />
              <Route path="analytics" element={<PrivateRoute requiredPermission="view:company:analytics"><AdvancedAnalyticsPage /></PrivateRoute>} />
              <Route path="cost-estimator" element={<PrivateRoute requiredPermission="view:reports"><CostEstimatorPage /></PrivateRoute>} />
              <Route path="integrations" element={<PrivateRoute requiredPermission="view:reports"><IntegrationsCenterPage /></PrivateRoute>} />
              <Route path="field" element={<PrivateRoute><FieldOperationsPage /></PrivateRoute>} />
              <Route path="office-dashboard" element={<PrivateRoute requiredPermission="view:company:analytics"><OfficeDashboardPage /></PrivateRoute>} />
              <Route path="communication" element={<PrivateRoute><CommunicationPage /></PrivateRoute>} />
              <Route path="onboarding" element={<OnboardingPage />} />
            </Route>
          </Routes>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e1e1e',
                color: '#fff',
                border: '1px solid #333',
              },
            }}
          />
        </div>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
