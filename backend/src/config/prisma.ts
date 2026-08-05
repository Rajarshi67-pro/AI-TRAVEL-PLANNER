import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const dbUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';
const libsql = createClient({ url: dbUrl });
const adapter = new PrismaLibSql(libsql);
const prisma = new PrismaClient({ adapter } as any);

export default prisma;
