/**
 * PWA Hook
 * Manages Progressive Web App functionality
 */

import { useState, useEffect } from 'react'

type ServiceWorkerStatus = 'unknown' | 'registering' | 'ready' | 'error'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function usePWA() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(globalThis.navigator?.onLine ?? true)
  const [serviceWorkerStatus, setServiceWorkerStatus] = useState<ServiceWorkerStatus>('unknown')
  const [serviceWorkerError, setServiceWorkerError] = useState<string | null>(null)

  useEffect(() => {
    // Check if app is already installed
    if (globalThis.matchMedia?.('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setInstallPrompt(null)
    }

    // Monitor online/offline status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    globalThis.addEventListener?.('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
    globalThis.addEventListener?.('appinstalled', handleAppInstalled as EventListener)
    globalThis.addEventListener?.('online', handleOnline)
    globalThis.addEventListener?.('offline', handleOffline)

    const handleSwStatus = (event: Event) => {
      const detail = (event as CustomEvent<{ status: ServiceWorkerStatus; error?: string }>).detail
      if (!detail) return
      setServiceWorkerStatus(detail.status)
      setServiceWorkerError(detail.error || null)
      if (detail.status === 'ready') {
        setIsInstalled(globalThis.matchMedia?.('(display-mode: standalone)').matches ?? false)
      }
    }

    globalThis.addEventListener?.('sw-status', handleSwStatus as EventListener)

    if ('serviceWorker' in globalThis.navigator) {
      globalThis.navigator.serviceWorker.ready
        .then(() => {
          setServiceWorkerStatus('ready')
        })
        .catch((error) => {
          console.error('Service worker ready check failed', error)
          setServiceWorkerStatus('error')
          setServiceWorkerError(error?.message || 'Service worker failed to start')
        })
    }

    return () => {
      globalThis.removeEventListener?.('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
      globalThis.removeEventListener?.('appinstalled', handleAppInstalled as EventListener)
      globalThis.removeEventListener?.('online', handleOnline)
      globalThis.removeEventListener?.('offline', handleOffline)
      globalThis.removeEventListener?.('sw-status', handleSwStatus as EventListener)
    }
  }, [])

  const installApp = async () => {
    if (!installPrompt) {
      return false
    }

    try {
      await installPrompt.prompt()
      const choiceResult = await installPrompt.userChoice
      setInstallPrompt(null)
      return choiceResult.outcome === 'accepted'
    } catch (error) {
      console.error('Installation failed:', error)
      return false
    }
  }

  return {
    installPrompt,
    isInstalled,
    isOnline,
    serviceWorkerStatus,
    serviceWorkerError,
    installApp,
  }
}

