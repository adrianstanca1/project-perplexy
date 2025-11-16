import { useEffect, useRef, useState, useCallback } from 'react'

// Get WebSocket URL at runtime (for Docker/nginx proxying support)
// If VITE_WS_URL is explicitly set to empty string, construct from window.location
// Otherwise, use the provided URL or default to localhost for development
const getWebSocketUrl = (): string => {
  // Check if VITE_WS_URL is explicitly set to empty string (for Docker)
  const wsUrl = import.meta.env.VITE_WS_URL
  if (wsUrl === '') {
    // Use relative URL - construct from current location at runtime
    if (typeof globalThis !== 'undefined' && 'location' in globalThis) {
      const runtimeLocation = (globalThis as Window).location
      const protocol = runtimeLocation?.protocol === 'https:' ? 'wss:' : 'ws:'
      return `${protocol}//${runtimeLocation?.host ?? ''}/ws`
    }
  }
  return wsUrl || 'ws://localhost:3001/ws'
}

interface WebSocketMessage {
  type: string
  [key: string]: any
}

interface UseWebSocketOptions {
  projectId?: string
  onMessage?: (message: WebSocketMessage) => void
  onError?: (error: Error) => void
  onConnect?: () => void
  onDisconnect?: () => void
  reconnect?: boolean
  reconnectInterval?: number
  backoffMultiplier?: number
  maxReconnectInterval?: number
  authToken?: string
  getAuthToken?: () => string | null
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    projectId,
    onMessage,
    onError,
    onConnect,
    onDisconnect,
    reconnect = true,
    reconnectInterval = 3000,
    backoffMultiplier = 1.5,
    maxReconnectInterval = 30000,
    authToken,
    getAuthToken,
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [lastErrorMessage, setLastErrorMessage] = useState<string | null>(null)
  const [lastConnectedAt, setLastConnectedAt] = useState<number | null>(null)
  const [lastDisconnectedAt, setLastDisconnectedAt] = useState<number | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const shouldReconnectRef = useRef(true)
  const reconnectAttemptsRef = useRef(0)

  const appendToken = useCallback((url: string): string => {
    const token =
      authToken ??
      getAuthToken?.() ??
      (typeof globalThis !== 'undefined' && 'localStorage' in globalThis
        ? (globalThis as Window).localStorage?.getItem('accessToken')
        : null)
    if (!token) return url
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}token=${encodeURIComponent(token)}`
  }, [authToken, getAuthToken])

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    const scheduleReconnect = () => {
      if (!reconnect || !shouldReconnectRef.current) return
      const attempt = reconnectAttemptsRef.current
      const delay = Math.min(reconnectInterval * Math.pow(backoffMultiplier, attempt), maxReconnectInterval)
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectAttemptsRef.current += 1
        connect()
      }, delay)
    }

    try {
      // Get WebSocket URL at runtime (in case it needs window.location)
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }

      const wsUrl = appendToken(getWebSocketUrl())
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)
        setError(null)
        setLastErrorMessage(null)
        shouldReconnectRef.current = true
        reconnectAttemptsRef.current = 0
        setLastConnectedAt(Date.now())

        // Subscribe to project updates if projectId is provided
        if (projectId) {
          ws.send(
            JSON.stringify({
              type: 'subscribe',
              projectId,
            })
          )
        }

        onConnect?.()
      }

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          onMessage?.(message)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      ws.onerror = (event) => {
        console.error('WebSocket error:', event)
        const error = new Error('WebSocket connection error')
        setError(error)
        setLastErrorMessage(error.message)
        onError?.(error)
      }

      ws.onclose = (event) => {
        console.log('WebSocket disconnected')
        setIsConnected(false)
        wsRef.current = null
        setLastDisconnectedAt(Date.now())
        if (!event.wasClean) {
          setLastErrorMessage(event.reason || 'Connection lost')
        }

        onDisconnect?.()

        // Attempt to reconnect with backoff
        if (reconnect && shouldReconnectRef.current) {
          scheduleReconnect()
        }
      }
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      const err = error instanceof Error ? error : new Error('WebSocket connection failed')
      setError(err)
      setLastErrorMessage(err.message)
      onError?.(err)
      if (reconnect && shouldReconnectRef.current) {
        scheduleReconnect()
      }
    }
  }, [
    projectId,
    onMessage,
    onError,
    onConnect,
    onDisconnect,
    reconnect,
    reconnectInterval,
    backoffMultiplier,
    maxReconnectInterval,
    appendToken,
  ])

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setIsConnected(false)
  }, [])

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
      return true
    }
    return false
  }, [])

  useEffect(() => {
    connect()

    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  // Update subscription when projectId changes
  useEffect(() => {
    if (isConnected && projectId && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'subscribe',
          projectId,
        })
      )
    }
  }, [projectId, isConnected])

  return {
    isConnected,
    error,
    lastErrorMessage,
    lastConnectedAt,
    lastDisconnectedAt,
    sendMessage,
    connect,
    disconnect,
  }
}

