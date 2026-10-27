import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not configured')
}

const databaseUrl = new URL(connectionString)
databaseUrl.searchParams.delete('sslmode')

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
  pool?: Pool
}

// Resilient connection pool tuned for cloud PostgreSQL / Supabase
const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString: databaseUrl.toString(),
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000, // Keep warm sockets active during user browsing sessions
    connectionTimeoutMillis: 8000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 2000,
    allowExitOnIdle: true,
  })

// Prevent unhandled errors when Supabase drops idle connections
pool.on('error', (err) => {
  console.warn('[Prisma/pg Pool] Idle client connection closed or reset by server, discarding socket:', err?.message || err)
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.pool = pool
}

const createClient = () => {
  const adapter = new PrismaPg(pool)
  const baseClient = new PrismaClient({ adapter })

  // Auto-retry transient socket/connection drops seamlessly
  const extendedClient = baseClient.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          let attempts = 0
          while (attempts < 2) {
            try {
              return await query(args)
            } catch (error: any) {
              attempts++
              const msg = String(error?.message || '')
              const code = String(error?.code || '')
              const isConnectionError =
                msg.includes('Connection terminated') ||
                msg.includes('connection closed') ||
                msg.includes('Connection closed') ||
                msg.includes('socket has been ended') ||
                msg.includes('ECONNRESET') ||
                msg.includes('EPIPE') ||
                code === 'P1001' ||
                code === 'P1017'

              if (isConnectionError && attempts < 2) {
                console.warn(
                  `[Prisma Auto-Retry] Socket dropped on ${String(model)}.${String(operation)} (attempt ${attempts}/2). Reconnecting...`
                )
                await new Promise((resolve) => setTimeout(resolve, 200 * attempts))
                continue
              }
              throw error
            }
          }
        },
      },
    },
  })

  return extendedClient as unknown as PrismaClient
}

export const prisma = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

