import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const libsql = createClient({ url: 'file:./prisma/dev.db' });
const adapter = new PrismaLibSql(libsql);
const prisma = new PrismaClient({ adapter } as any);

export default prisma;
