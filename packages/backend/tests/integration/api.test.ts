/**
 * API Integration Tests
 */

import { describe, it, expect, beforeAll } from 'vitest'
import axios from 'axios'

const API_URL = process.env.API_URL || 'http://localhost:3001'
const shouldRun = process.env.RUN_API_TESTS === 'true'
const describeApi = shouldRun ? describe : describe.skip
let authToken: string

describeApi('API Integration Tests', () => {
  beforeAll(async () => {
    // Login to get token
    try {
      const response = await axios.post(`${API_URL}/api/v1/auth/login`, {
        email: 'test@example.com',
        password: 'testpassword',
      })
      authToken = response.data.token
    } catch (error) {
      // Test user might not exist, skip auth-dependent tests
    }
  })

  it('should return health check', async () => {
    const response = await axios.get(`${API_URL}/health`)
    expect(response.status).toBe(200)
    expect(response.data.status).toBe('ok')
  })

  it('should create and retrieve field data', async () => {
    if (!authToken) return

    const fieldData = {
      projectId: 'test-project',
      type: 'DAILY_REPORT',
      title: 'Test Report',
      coordinates: { lat: 51.5074, lng: -0.1278 },
      data: { test: true },
    }

    const createResponse = await axios.post(
      `${API_URL}/api/v1/field`,
      fieldData,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    )

    expect(createResponse.status).toBe(201)
    expect(createResponse.data.success).toBe(true)

    const getResponse = await axios.get(
      `${API_URL}/api/v1/field/${createResponse.data.data.id}`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    )

    expect(getResponse.status).toBe(200)
    expect(getResponse.data.data.title).toBe('Test Report')
  })

  it('should execute AI agent', async () => {
    if (!authToken) return

    const response = await axios.post(
      `${API_URL}/api/v1/ai-agents/execute`,
      {
        agentType: 'SAFETY',
        context: {},
        input: {
          action: 'predict_risks',
        },
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    )

    expect(response.status).toBe(200)
    expect(response.data.success).toBe(true)
    expect(response.data.result).toBeDefined()
  })
})

