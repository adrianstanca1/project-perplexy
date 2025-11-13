import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import MainLayout from './components/layout/MainLayout'
import Dashboard from './pages/Dashboard'
import CodeInterpreter from './pages/CodeInterpreter'
import FileManager from './pages/FileManager'
import ProjectsPage from './pages/ProjectsPage'
import ProjectDetailsPage from './pages/ProjectDetailsPage'
import LiveMapPage from './pages/LiveMapPage'
import SettingsPage from './pages/SettingsPage'
import ExecutionHistoryPage from './pages/ExecutionHistoryPage'

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="interpreter" element={<CodeInterpreter />} />
              <Route path="files" element={<FileManager />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="projects/:projectId" element={<ProjectDetailsPage />} />
              <Route path="map" element={<LiveMapPage />} />
              <Route path="history" element={<ExecutionHistoryPage />} />
              <Route path="settings" element={<SettingsPage />} />
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
      </Router>
    </ErrorBoundary>
  )
}

export default App

