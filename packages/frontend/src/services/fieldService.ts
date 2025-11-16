/**
 * Field Service
 * Handles field operations API calls with offline support
 */

import { buildApiUrl, getApiClient } from './apiClient'

interface FieldData {
  projectId: string
  type: string
  title: string
  description?: string
  coordinates: { lat: number; lng: number }
  images?: string[]
  data?: any
}

class FieldService {
  private getAuthHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    return headers
  }

  async createFieldData(data: FieldData) {
    const response = await getApiClient().post('/v1/field', data)
    return response.data
  }

  async getFieldData(filters?: any) {
    const response = await getApiClient().get('/v1/field', {
      params: filters,
    })
    return response.data
  }

  async syncOfflineData() {
    // Get offline queue and sync
    const queue = await this.getOfflineQueue()
    if (queue.length === 0) return { synced: 0, failed: 0 }

    try {
      const response = await getApiClient().post('/v1/field/sync', { pendingData: queue })
      return response.data.result
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to sync offline data'
      throw new Error(message)
    }
  }

  async getOfflineQueue(): Promise<any[]> {
    // Get from IndexedDB or service worker
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready
      return new Promise((resolve) => {
        const channel = new MessageChannel()
        channel.port1.onmessage = (event) => {
          resolve(event.data.queue || [])
        }
        registration.active?.postMessage(
          { type: 'GET_QUEUE' },
          [channel.port2]
        )
      })
    }
    return []
  }

  async queueOfflineData(data: FieldData) {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready
      const channel = new MessageChannel()

      return new Promise<boolean>((resolve, reject) => {
        channel.port1.onmessage = (event) => {
          if (event.data.success) {
            resolve(true)
          } else {
            reject(new Error(event.data.error || 'Failed to enqueue request'))
          }
        }

        const worker = registration.active || registration.waiting || registration.installing
        if (!worker) {
          reject(new Error('No active service worker'))
          return
        }

        worker.postMessage(
          {
            type: 'QUEUE_REQUEST',
            item: {
              url: buildApiUrl('/v1/field'),
              method: 'POST',
              headers: this.getAuthHeaders(),
              body: data,
            },
          },
          [channel.port2]
        )
      })
    }
    return false
  }

  async sendEmergencyAlert(alert: {
    location?: string
    coordinates: { lat: number; lng: number }
    message?: string
  }) {
    const response = await getApiClient().post('/v1/field/emergency/alert', alert)
    return response.data
  }

  async getSyncStatus() {
    const response = await getApiClient().get('/v1/field/sync/status')
    return response.data.status
  }
}

export const fieldService = new FieldService()

