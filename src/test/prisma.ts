import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma/client'

const testDatabaseUrl = process.env.DATABASE_URL_TEST

if (!testDatabaseUrl) {
	throw new Error('DATABASE_URL_TEST is not set')
}

const adapter = new PrismaPg({ connectionString: testDatabaseUrl })

export const prismaTest = new PrismaClient({ adapter })
