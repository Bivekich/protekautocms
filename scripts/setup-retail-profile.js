// Скрипт для создания профиля "Розничный" для клиентов
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createRetailProfile() {
  try {
    // Проверяем, существует ли уже розничный профиль
    const existingProfile = await prisma.clientProfile.findUnique({
      where: {
        name: 'Розничный',
      },
    });

    if (existingProfile) {
      console.log('Профиль "Розничный" уже существует');
      return;
    }

    // Создаем розничный профиль
    const retailProfile = await prisma.clientProfile.create({
      data: {
        name: 'Розничный',
        code: '10001',
        comment: 'Для розничных клиентов',
        baseMarkup: '15%',
        orderDiscount: '10000 ₽ - 5%',
      },
    });

    console.log('Профиль "Розничный" успешно создан:', retailProfile);
  } catch (error) {
    console.error('Ошибка при создании розничного профиля:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createRetailProfile();
