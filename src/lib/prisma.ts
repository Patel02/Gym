import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not configured')
}

const databaseUrl = new URL(connectionString)
databaseUrl.searchParams.delete('sslmode')

const adapter = new PrismaPg({
  connectionString: databaseUrl.toString(),
  ssl: { rejectUnauthorized: false },
})

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
