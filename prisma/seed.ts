import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const counterTxs = [];

  for (const counter of seedData) {
    counterTxs.push(
      prisma.counter.create({
        data: {
          name: counter.name,
          message: counter.message,
          value: counter.value,
        },
      })
    );
  }
  const counters = await prisma.$transaction(counterTxs);
  console.log(`Create ${counters.length} counters`);
}

const seedData = [
  {
    name: 'test-counter-1',
    message: 'Test counter has been {%d} times',
    value: 0,
  },
  {
    name: 'test-counter-2',
    message: 'Test counter has been {%d} times',
    value: 0,
  },
  {
    name: 'test-counter-3',
    message: '{%d} thats how many times you fucjked up',
    value: 0,
  },
];

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
