// @ts-nocheck
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Проверяем, существует ли уже розничный профиль
  const retailProfile = await prisma.clientProfile.findFirst({
    where: {
      name: 'Розничный',
    },
  });

  // Если розничного профиля еще нет, создаем его
  if (!retailProfile) {
    await prisma.clientProfile.create({
      data: {
        name: 'Розничный',
        code: 'RETAIL',
        comment: 'Базовый розничный профиль для клиентов',
        baseMarkup: '15 %',
        orderDiscount: '10000 ₽ - 5%',
      },
    });
    console.log('✅ Создан базовый розничный профиль');
  } else {
    console.log('ℹ️ Базовый розничный профиль уже существует');
  }
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при инициализации данных:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
