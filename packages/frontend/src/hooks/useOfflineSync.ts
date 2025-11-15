/**
 * Offline Sync Hook
 * Manages offline queue and background sync
 */

import { useState, useEffect, useCallback } from 'react'
import { fieldService } from '../services/fieldService'

interface OfflineQueueItem {
  id: string
  timestamp: string
  url: string
  method: string
  headers: Record<string, string>
  body?: any
}

const selectWorker = (registration: ServiceWorkerRegistration) =>
  registration.active || registration.waiting || registration.installing

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [queueLength, setQueueLength] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const [serviceWorkerReady, setServiceWorkerReady] = useState(false)
  const [lastSyncResult, setLastSyncResult] = useState<{ synced: number; failed: number } | null>(null)
  const [lastSyncError, setLastSyncError] = useState<string | null>(null)

  const updateQueueLength = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {
      setQueueLength(0)
      return
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const channel = new MessageChannel()

      channel.port1.onmessage = (event) => {
        setQueueLength(event.data.queue?.length || 0)
      }

      const worker = selectWorker(registration)
      if (!worker) {
        console.warn('Service worker not active when requesting queue')
        return
      }
      worker.postMessage({ type: 'GET_QUEUE' }, [channel.port2])
    } catch (error) {
      console.error('Failed to read offline queue', error)
    }
  }, [])

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    globalThis.addEventListener?.('online', handleOnline)
    globalThis.addEventListener?.('offline', handleOffline)

    let isMounted = true
    let swMessageHandler: ((event: MessageEvent) => void) | null = null

    const attachServiceWorker = async () => {
      if (!('serviceWorker' in navigator)) return
      try {
        await navigator.serviceWorker.ready
        if (!isMounted) return
        setServiceWorkerReady(true)
        swMessageHandler = (event: MessageEvent) => {
          if (event.data?.type === 'SYNC_COMPLETE') {
            setIsSyncing(false)
            setLastSyncError(null)
            setLastSyncResult(event.data.results)
            updateQueueLength()
          }
        }
        navigator.serviceWorker.addEventListener('message', swMessageHandler)
      } catch (error) {
        console.error('Service worker not ready:', error)
        setServiceWorkerReady(false)
      }
    }

    attachServiceWorker()

    updateQueueLength()

    return () => {
      globalThis.removeEventListener?.('online', handleOnline)
      globalThis.removeEventListener?.('offline', handleOffline)
      isMounted = false
      if (swMessageHandler && 'serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', swMessageHandler)
      }
    }
  }, [updateQueueLength])

  const queueRequest = useCallback(async (item: Omit<OfflineQueueItem, 'id' | 'timestamp'>) => {
    if (!('serviceWorker' in navigator)) {
      return false
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const channel = new MessageChannel()

      return await new Promise<boolean>((resolve, reject) => {
        channel.port1.onmessage = (event) => {
          if (event.data.success) {
            updateQueueLength()
            resolve(true)
          } else {
            reject(new Error(event.data.error || 'Failed to queue request'))
          }
        }

        const worker = selectWorker(registration)
        if (!worker) {
          reject(new Error('Service worker not active'))
          return
        }
        worker.postMessage(
          {
            type: 'QUEUE_REQUEST',
            item,
          },
          [channel.port2]
        )
      })
    } catch (error) {
      console.error('Failed to queue offline request', error)
      return false
    }
  }, [updateQueueLength])

  const triggerSync = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {
      return
    }

    setIsSyncing(true)
    setLastSyncError(null)
    try {
      const registration = await navigator.serviceWorker.ready
      const channel = new MessageChannel()

      channel.port1.onmessage = (event) => {
        if (event.data.success) {
          // Sync registered, will complete in background
        }
      }

      const worker = selectWorker(registration)
      if (!worker) {
        throw new Error('No active service worker available')
      }
      worker.postMessage({ type: 'TRIGGER_SYNC' }, [channel.port2])
    } catch (error) {
      console.error('Failed to trigger background sync', error)
      setLastSyncError('Background sync unavailable')
      setIsSyncing(false)
    }

    // Also try direct sync if online
    if (isOnline) {
      try {
        const result = await fieldService.syncOfflineData()
        setLastSyncResult(result)
        updateQueueLength()
      } catch (error: any) {
        console.error('Direct sync failed:', error)
        setLastSyncError(error?.message || 'Sync failed')
      } finally {
        setIsSyncing(false)
      }
    }
  }, [isOnline, updateQueueLength])

  return {
    isOnline,
    queueLength,
    isSyncing,
    serviceWorkerReady,
    lastSyncResult,
    lastSyncError,
    queueRequest,
    triggerSync,
    updateQueueLength,
  }
}

