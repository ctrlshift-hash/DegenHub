import { PrismaClient } from '@prisma/client';

// Prevent excess connections in dev/hot-reload
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prisma: PrismaClient;

const prismaOptions: any = {
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
};

// Add connection pooling for better performance in production
if (process.env.NODE_ENV === 'production') {
  // Connection pooling optimizations for better performance
  prismaOptions.datasources = {
    db: {
      url: process.env.DATABASE_URL,
    },
  };
}

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient(prismaOptions);
} else {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient(prismaOptions);
  }
  prisma = globalForPrisma.prisma;
}

export { prisma };

