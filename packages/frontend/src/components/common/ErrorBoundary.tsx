import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error,
      errorInfo,
    })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-6">
          <div className="max-w-2xl w-full bg-gray-800 border border-red-500 rounded-lg p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-red-500 bg-opacity-20 rounded-lg">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-red-400">Something went wrong</h1>
                <p className="text-gray-400 mt-1">An unexpected error occurred</p>
              </div>
            </div>

            {this.state.error && (
              <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                <p className="text-sm font-mono text-red-400 mb-2">{this.state.error.name}</p>
                <p className="text-sm text-gray-300">{this.state.error.message}</p>
                {this.state.errorInfo && (
                  <details className="mt-4">
                    <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300">
                      Stack Trace
                    </summary>
                    <pre className="mt-2 text-xs text-gray-500 overflow-auto max-h-48 p-4 bg-gray-900 rounded">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex items-center space-x-4">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
              <Link
                to="/"
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span>Go Home</span>
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

