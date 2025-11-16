import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

type SwStatusDetail = {
  status: 'registering' | 'ready' | 'error'
  error?: string
}

const notifySwStatus = (detail: SwStatusDetail) => {
  window.dispatchEvent(new CustomEvent<SwStatusDetail>('sw-status', { detail }))
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    notifySwStatus({ status: 'registering' })
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration)
        notifySwStatus({ status: 'ready' })
        return registration
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error)
        notifySwStatus({ status: 'error', error: error?.message || 'registration failed' })
      })

    navigator.serviceWorker.ready
      .then(() => notifySwStatus({ status: 'ready' }))
      .catch((error) => notifySwStatus({ status: 'error', error: error?.message || 'ready failed' }))
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

