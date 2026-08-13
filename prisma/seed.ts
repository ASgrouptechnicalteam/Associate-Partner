import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const defaultPassword = 'TemporaryPassword123!';
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  const md = await prisma.user.upsert({
    where: { userId: 'MD-001' },
    update: {},
    create: {
      userId: 'MD-001',
      name: 'Managing Director',
      role: 'MD',
      passwordHash,
      isFirstLogin: true,
    },
  });

  const am = await prisma.user.upsert({
    where: { userId: 'AM-001' },
    update: {},
    create: {
      userId: 'AM-001',
      name: 'Associate Manager',
      role: 'AM',
      passwordHash,
      isFirstLogin: true,
    },
  });

  console.log({ md, am });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
