/**
 * Database Seed Script
 * Generates realistic demo data for the platform
 */

import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/config/auth.js'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create organizations
  const org1 = await prisma.organization.create({
    data: {
      name: 'Acme Construction Ltd',
      slug: 'acme-construction',
      description: 'Leading UK construction company',
      subscriptionStatus: 'active',
      subscriptionTier: 'enterprise',
    },
  })

  const org2 = await prisma.organization.create({
    data: {
      name: 'BuildRight Contractors',
      slug: 'buildright',
      description: 'Specialized in commercial construction',
      subscriptionStatus: 'active',
      subscriptionTier: 'professional',
    },
  })

  console.log('✅ Created organizations')

  // Create users
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@constructai.com',
      name: 'Super Admin',
      password: await hashPassword('admin123'),
      role: 'SUPER_ADMIN',
      emailVerified: true,
    },
  })

  const companyAdmin1 = await prisma.user.create({
    data: {
      email: 'john.doe@acme.com',
      name: 'John Doe',
      password: await hashPassword('password123'),
      role: 'COMPANY_ADMIN',
      organizationId: org1.id,
      emailVerified: true,
    },
  })

  const supervisor1 = await prisma.user.create({
    data: {
      email: 'jane.smith@acme.com',
      name: 'Jane Smith',
      password: await hashPassword('password123'),
      role: 'SUPERVISOR',
      organizationId: org1.id,
      emailVerified: true,
    },
  })

  const operative1 = await prisma.user.create({
    data: {
      email: 'mike.jones@acme.com',
      name: 'Mike Jones',
      password: await hashPassword('password123'),
      role: 'OPERATIVE',
      organizationId: org1.id,
      emailVerified: true,
    },
  })

  console.log('✅ Created users')

  // Create projects
  const project1 = await prisma.project.create({
    data: {
      name: 'London Office Complex',
      description: 'New 20-story office building in Canary Wharf',
      organizationId: org1.id,
      userId: companyAdmin1.id,
      status: 'ACTIVE',
      budget: 5000000,
      currency: 'GBP',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2025-06-30'),
      location: 'Canary Wharf, London',
      coordinates: { lat: 51.5045, lng: -0.0185 },
    },
  })

  const project2 = await prisma.project.create({
    data: {
      name: 'Manchester Residential Tower',
      description: '50-unit residential development',
      organizationId: org1.id,
      userId: companyAdmin1.id,
      status: 'ACTIVE',
      budget: 3000000,
      currency: 'GBP',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2025-12-31'),
      location: 'Manchester City Centre',
      coordinates: { lat: 53.4808, lng: -2.2426 },
    },
  })

  console.log('✅ Created projects')

  // Create suppliers
  const supplier1 = await prisma.supplier.create({
    data: {
      name: 'SteelWorks UK',
      organizationId: org1.id,
      category: 'Materials',
      status: 'ACTIVE',
      rating: 4.5,
      contact: {
        email: 'contact@steelworks.uk',
        phone: '+44 20 1234 5678',
        address: '123 Industrial Way, Birmingham',
      },
      qualifications: ['ISO 9001', 'BS EN 1090'],
      activeContracts: 3,
      totalValue: 1500000,
    },
  })

  const supplier2 = await prisma.supplier.create({
    data: {
      name: 'Concrete Solutions Ltd',
      organizationId: org1.id,
      category: 'Materials',
      status: 'ACTIVE',
      rating: 4.2,
      contact: {
        email: 'info@concretesolutions.co.uk',
        phone: '+44 20 9876 5432',
        address: '456 Builder Street, London',
      },
      qualifications: ['ISO 14001', 'CHAS'],
      activeContracts: 2,
      totalValue: 800000,
    },
  })

  console.log('✅ Created suppliers')

  // Create contracts
  await prisma.contract.create({
    data: {
      title: 'Steel Supply Agreement - London Office',
      organizationId: org1.id,
      projectId: project1.id,
      supplierId: supplier1.id,
      value: 500000,
      currency: 'GBP',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-12-31'),
      status: 'ACTIVE',
      type: 'Supply Agreement',
      progress: 45,
    },
  })

  console.log('✅ Created contracts')

  // Create tasks
  const task1 = await prisma.task.create({
    data: {
      title: 'Foundation Excavation',
      description: 'Complete foundation excavation for building A',
      projectId: project1.id,
      organizationId: org1.id,
      createdBy: supervisor1.id,
      assignedTo: operative1.id,
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      dueDate: new Date('2024-02-15'),
      location: 'Building A, Site 1',
      coordinates: { lat: 51.5045, lng: -0.0185 },
    },
  })

  const task2 = await prisma.task.create({
    data: {
      title: 'Steel Frame Installation',
      description: 'Install steel frame structure',
      projectId: project1.id,
      organizationId: org1.id,
      createdBy: supervisor1.id,
      assignedToRoles: ['OPERATIVE'],
      status: 'PENDING',
      priority: 'URGENT',
      dueDate: new Date('2024-03-01'),
    },
  })

  console.log('✅ Created tasks')

  // Create field data
  await prisma.fieldData.create({
    data: {
      projectId: project1.id,
      organizationId: org1.id,
      userId: operative1.id,
      type: 'DAILY_REPORT',
      title: 'Daily Report - Foundation Work',
      description: 'Completed foundation excavation for section A-1',
      data: {
        workCompleted: 'Foundation excavation',
        hoursWorked: 8,
        weather: 'Clear',
        notes: 'No issues encountered',
      },
      coordinates: { lat: 51.5045, lng: -0.0185 },
      recordedAt: new Date(),
    },
  })

  await prisma.fieldData.create({
    data: {
      projectId: project1.id,
      organizationId: org1.id,
      userId: operative1.id,
      type: 'INSPECTION',
      title: 'Safety Inspection - Site A',
      description: 'Routine safety inspection completed',
      data: {
        inspector: 'Mike Jones',
        findings: 'All safety protocols followed',
        recommendations: 'Continue current practices',
      },
      coordinates: { lat: 51.5045, lng: -0.0185 },
      recordedAt: new Date(),
    },
  })

  console.log('✅ Created field data')

  // Create safety incidents
  await prisma.safetyIncident.create({
    data: {
      organizationId: org1.id,
      projectId: project1.id,
      reportedBy: operative1.id,
      title: 'Near Miss - Falling Tool',
      description: 'Tool fell from scaffolding but no one was injured',
      type: 'NEAR_MISS',
      severity: 'MEDIUM',
      status: 'REPORTED',
      occurredAt: new Date('2024-01-20T10:30:00Z'),
      location: 'Building A, Level 3',
      coordinates: { lat: 51.5045, lng: -0.0185 },
    },
  })

  console.log('✅ Created safety incidents')

  // Create compliance records
  await prisma.complianceRecord.create({
    data: {
      organizationId: org1.id,
      projectId: project1.id,
      regulation: 'CDM-2015',
      requirement: 'Construction Design and Management Regulations 2015 compliance',
      status: 'COMPLIANT',
      isViolation: false,
      aiMonitored: true,
      nextAuditDate: new Date('2024-04-01'),
    },
  })

  console.log('✅ Created compliance records')

  // Create tenders
  await prisma.tender.create({
    data: {
      title: 'Birmingham Shopping Centre Renovation',
      client: 'Birmingham City Council',
      value: 2500000,
      currency: 'GBP',
      deadline: new Date('2024-03-15'),
      status: 'ACTIVE',
      organizationId: org1.id,
      userId: companyAdmin1.id,
      progress: 60,
      winProbability: 75,
    },
  })

  console.log('✅ Created tenders')

  // Create schedules
  await prisma.schedule.create({
    data: {
      projectId: project1.id,
      organizationId: org1.id,
      name: 'Main Construction Schedule',
      description: 'Primary project timeline',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2025-06-30'),
      baseline: {
        phases: ['Planning', 'Foundation', 'Structure', 'Finishing'],
      },
      current: {
        phases: ['Planning', 'Foundation'],
        currentPhase: 'Foundation',
      },
      milestones: [
        { name: 'Foundation Complete', date: '2024-03-01', status: 'pending' },
        { name: 'Structure Complete', date: '2024-08-01', status: 'pending' },
      ],
      conflicts: [],
    },
  })

  console.log('✅ Created schedules')

  // Create communication threads
  const thread1 = await prisma.communicationThread.create({
    data: {
      organizationId: org1.id,
      projectId: project1.id,
      title: 'Foundation Work Discussion',
      type: 'task',
      createdBy: supervisor1.id,
      participants: [supervisor1.id, operative1.id],
      context: { taskId: task1.id },
    },
  })

  await prisma.communicationMessage.create({
    data: {
      threadId: thread1.id,
      userId: supervisor1.id,
      content: 'Please ensure all safety protocols are followed during excavation',
      type: 'text',
    },
  })

  await prisma.communicationMessage.create({
    data: {
      threadId: thread1.id,
      userId: operative1.id,
      content: 'Understood. All protocols in place.',
      type: 'text',
    },
  })

  console.log('✅ Created communication threads')

  console.log('🎉 Seeding completed successfully!')
  console.log('\n📋 Demo Credentials:')
  console.log('Super Admin: admin@constructai.com / admin123')
  console.log('Company Admin: john.doe@acme.com / password123')
  console.log('Supervisor: jane.smith@acme.com / password123')
  console.log('Operative: mike.jones@acme.com / password123')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

