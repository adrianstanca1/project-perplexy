import { PrismaClient } from '@prisma/client'

// Prisma Client instance with connection pooling
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
})

// Connection handling
prisma.$connect().catch((error: unknown) => {
  console.error('Failed to connect to database:', error)
  process.exit(1)
})

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

export default prisma

