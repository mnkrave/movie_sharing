import { PrismaClient } from "@prisma/client";

// Fallback if Vercel / Prisma Postgres sets POSTGRES_URL or DATABASE_URL_POOLED
if (!process.env.DATABASE_URL) {
  if (process.env.POSTGRES_URL) {
    process.env.DATABASE_URL = process.env.POSTGRES_URL;
  } else if (process.env.DATABASE_URL_POOLED) {
    process.env.DATABASE_URL = process.env.DATABASE_URL_POOLED;
  }
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

