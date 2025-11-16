import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { PrivateRoute } from './components/auth/PrivateRoute'
import MainLayout from './components/layout/MainLayout'
import LoginPage from './pages/LoginPage'

// Lazy load pages for better code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'))
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdminDashboard'))
const CompanyAdminDashboard = lazy(() => import('./pages/CompanyAdminDashboard'))
const SupervisorDashboard = lazy(() => import('./pages/SupervisorDashboard'))
const OperativeDashboard = lazy(() => import('./pages/OperativeDashboard'))
const CodeInterpreter = lazy(() => import('./pages/CodeInterpreter'))
const FileManager = lazy(() => import('./pages/FileManager'))
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'))
const ProjectDetailsPage = lazy(() => import('./pages/ProjectDetailsPage'))
const LiveMapPage = lazy(() => import('./pages/LiveMapPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const ExecutionHistoryPage = lazy(() => import('./pages/ExecutionHistoryPage'))
const DeveloperSandboxPage = lazy(() => import('./pages/DeveloperSandboxPage'))
const MarketplacePage = lazy(() => import('./pages/MarketplacePage'))
const MyAppDesktopPage = lazy(() => import('./pages/MyAppDesktopPage'))
const TendersPage = lazy(() => import('./pages/TendersPage'))
const SuppliersPage = lazy(() => import('./pages/SuppliersPage'))
const ContractsPage = lazy(() => import('./pages/ContractsPage'))
const MessagesPage = lazy(() => import('./pages/MessagesPage'))
const CalendarPage = lazy(() => import('./pages/CalendarPage'))
const TeamManagementPage = lazy(() => import('./pages/TeamManagementPage'))
const AIToolsPage = lazy(() => import('./pages/AIToolsPage'))
const CollaborationHubPage = lazy(() => import('./pages/CollaborationHubPage'))
const WorkflowAutomationPage = lazy(() => import('./pages/WorkflowAutomationPage'))
const AdvancedAnalyticsPage = lazy(() => import('./pages/AdvancedAnalyticsPage'))
const CostEstimatorPage = lazy(() => import('./pages/CostEstimatorPage'))
const IntegrationsCenterPage = lazy(() => import('./pages/IntegrationsCenterPage'))
const TasksPage = lazy(() => import('./pages/TasksPage'))
const TaskDetailsPage = lazy(() => import('./pages/TaskDetailsPage'))
const TaskCreatePage = lazy(() => import('./pages/TaskCreatePage'))
const FieldOperationsPage = lazy(() => import('./pages/FieldOperationsPage'))
const OfficeDashboardPage = lazy(() => import('./pages/OfficeDashboardPage'))
const CommunicationPage = lazy(() => import('./pages/CommunicationPage'))
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'))

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

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
          <Suspense fallback={<LoadingFallback />}>
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
          </Suspense>
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
