import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    // Allow modules to import during build; queries will fail clearly at runtime.
    console.warn("DATABASE_URL is not set — Prisma client created without adapter");
    return new PrismaClient({
      adapter: new PrismaNeon({
        connectionString:
          "postgresql://user:pass@localhost:5432/db?sslmode=require",
      }),
    });
  }
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
