/**
 * Compliance API Routes (v1)
 * Regulatory monitoring and reporting
 */

import { Router } from 'express'
import { authenticate, scopeFilter } from '../../middleware/auth.js'
import { complianceController } from '../../controllers/v1/complianceController.js'
import { validateRequest } from '../../middleware/validation.js'
import { z } from 'zod'

const router: Router = Router()

// All routes require authentication
router.use(authenticate)
router.use(scopeFilter)

// Compliance records
router.get('/', complianceController.getComplianceRecords)
router.get('/:id', complianceController.getComplianceRecordById)
router.post(
  '/',
  validateRequest({
    body: z.object({
      regulation: z.string(),
      requirement: z.string(),
      projectId: z.string().optional(),
      status: z.enum(['COMPLIANT', 'NON_COMPLIANT', 'PENDING_REVIEW', 'REMEDIATION_IN_PROGRESS', 'WAIVER_GRANTED']).optional(),
    }),
  }),
  complianceController.createComplianceRecord
)
router.put('/:id', complianceController.updateComplianceRecord)
router.delete('/:id', complianceController.deleteComplianceRecord)

// Compliance monitoring
router.post('/monitor', complianceController.monitorCompliance)
router.get('/violations', complianceController.getViolations)
router.post('/audit', complianceController.performAudit)

// Remediation
router.post('/:id/remediate', complianceController.startRemediation)
router.put('/:id/remediation-status', complianceController.updateRemediationStatus)

export { router as complianceRouter }

