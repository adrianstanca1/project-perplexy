import axios, { AxiosError, AxiosInstance } from 'axios'

const DEFAULT_API_URL = 'http://localhost:3001'
const rawApiUrl = import.meta.env.VITE_API_URL

const trimmedApiUrl = rawApiUrl?.replace(/\/$/, '')

const apiOrigin =
  rawApiUrl === ''
    ? ''
    : trimmedApiUrl && trimmedApiUrl.length > 0
      ? trimmedApiUrl
      : DEFAULT_API_URL

const apiBasePath = rawApiUrl === '' ? '/api' : `${apiOrigin}/api`

let accessTokenCache: string | null = null

const apiClient: AxiosInstance = axios.create({
  baseURL: apiBasePath,
  timeout: 15000,
  withCredentials: true,
})

const resolveAccessToken = () => {
  if (accessTokenCache) {
    return accessTokenCache
  }
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken')
  }
  return null
}

apiClient.interceptors.request.use((config) => {
  const token = resolveAccessToken()
  if (token) {
    config.headers = config.headers || {}
    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  if (!config.headers) {
    config.headers = {} as any
  }
  config.headers.Accept = 'application/json'
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.code === AxiosError.ERR_NETWORK) {
      error.message = 'Unable to reach ConstructAI services. Check connectivity.'
    } else if (error.code === AxiosError.ECONNABORTED) {
      error.message = 'Request timed out. Please retry.'
    }
    return Promise.reject(error)
  }
)

export const setAccessToken = (token: string | null) => {
  accessTokenCache = token
}

const joinUrl = (base: string, path: string) => {
  if (!path.startsWith('/')) {
    path = `/${path}`
  }
  if (!base) {
    return path
  }
  return `${base.replace(/\/$/, '')}${path}`
}

export const buildApiUrl = (path = '/') => {
  return joinUrl(apiBasePath, path)
}

export const buildOriginUrl = (path = '/') => {
  return joinUrl(apiOrigin, path)
}

export interface HealthStatus {
  ok: boolean
  status?: number
  timestamp: number
}

export async function checkApiHealth(options?: { signal?: AbortSignal; timeoutMs?: number }): Promise<HealthStatus> {
  const { signal, timeoutMs = 5000 } = options || {}
  const controller = signal ? null : new AbortController()
  const healthSignal = signal ?? controller?.signal
  const timeoutId = controller ? setTimeout(() => controller.abort(), timeoutMs) : undefined
  const url = buildOriginUrl('/health')

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: healthSignal,
    })
    return {
      ok: response.ok,
      status: response.status,
      timestamp: Date.now(),
    }
  } catch (error) {
    return {
      ok: false,
      status: undefined,
      timestamp: Date.now(),
    }
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  }
}

export const getApiClient = () => apiClient


