import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'

import * as schema from './schema.ts'

function createDatabase(databaseUrl: string) {
  return drizzle(neon(databaseUrl), { schema })
}

let database: ReturnType<typeof createDatabase> | undefined

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set')
  }

  database ??= createDatabase(databaseUrl)

  return database
}
