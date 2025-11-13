import { useState, useEffect, useCallback } from 'react'

export interface GeolocationState {
  coordinates: { lat: number; lng: number } | null
  error: string | null
  loading: boolean
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
  watch?: boolean
  updateInterval?: number // Update interval in milliseconds (default: 10 minutes)
}

/**
 * Hook for getting user's geolocation
 */
export function useGeolocation(options: GeolocationOptions = {}) {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
    watch = false,
    updateInterval = 10 * 60 * 1000, // 10 minutes
  } = options

  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    error: null,
    loading: true,
  })

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState({
        coordinates: null,
        error: 'Geolocation is not supported by your browser',
        loading: false,
      })
      return
    }

    setState((prev) => ({ ...prev, loading: true, error: null }))

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coordinates: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          error: null,
          loading: false,
        })
      },
      (error) => {
        setState({
          coordinates: null,
          error: error.message,
          loading: false,
        })
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    )
  }, [enableHighAccuracy, timeout, maximumAge])

  useEffect(() => {
    // Get initial position
    getCurrentPosition()

    let watchId: number | null = null
    let intervalId: NodeJS.Timeout | null = null

    if (watch) {
      // Watch position changes
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setState({
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
            error: null,
            loading: false,
          })
        },
        (error) => {
          setState({
            coordinates: null,
            error: error.message,
            loading: false,
          })
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge,
        }
      )
    } else {
      // Update position at intervals
      intervalId = setInterval(() => {
        getCurrentPosition()
      }, updateInterval)
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
      if (intervalId !== null) {
        clearInterval(intervalId)
      }
    }
  }, [watch, updateInterval, getCurrentPosition])

  return {
    ...state,
    refresh: getCurrentPosition,
  }
}

