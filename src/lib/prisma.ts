import type { PrismaClient as PrismaClientType } from '@prisma/client';
import pkg from '@prisma/client';

// Handle both CJS and ESM module exports in Node and Vercel serverless environments
const PrismaClientConstructor =
  (pkg as any).PrismaClient || (pkg as any).default?.PrismaClient;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientType | undefined;
};

export const prisma: PrismaClientType =
  globalForPrisma.prisma ??
  new PrismaClientConstructor({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
