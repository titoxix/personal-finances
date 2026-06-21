import { PrismaClient } from './src/generated/prisma/index.js'

const prisma = new PrismaClient()
const snapshots = await prisma.monthlySnapshot.findMany({
	select: { id: true, month: true },
})
console.log(JSON.stringify(snapshots, null, 2))
await prisma.$disconnect()
