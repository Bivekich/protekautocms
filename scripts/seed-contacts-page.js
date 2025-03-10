const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Проверяем, существует ли уже страница с slug 'contacts'
    const existingPage = await prisma.page.findUnique({
      where: {
        slug: 'contacts',
      },
    });

    if (existingPage) {
      console.log('Страница "Контакты" уже существует. Обновляем данные...');

      // Удаляем существующие секции
      await prisma.pageSection.deleteMany({
        where: {
          pageId: existingPage.id,
        },
      });

      // Обновляем страницу
      await prisma.page.update({
        where: {
          id: existingPage.id,
        },
        data: {
          title: 'Контакты',
          description: 'Контактная информация компании Протек автозапчасти',
          isActive: true,
        },
      });

      // Создаем новые секции
      await createSections(existingPage.id);

      console.log('Страница "Контакты" успешно обновлена!');
    } else {
      console.log('Создаем страницу "Контакты"...');

      // Создаем новую страницу
      const newPage = await prisma.page.create({
        data: {
          slug: 'contacts',
          title: 'Контакты',
          description: 'Контактная информация компании Протек автозапчасти',
          isActive: true,
        },
      });

      // Создаем секции для новой страницы
      await createSections(newPage.id);

      console.log('Страница "Контакты" успешно создана!');
    }
  } catch (error) {
    console.error('Ошибка при создании/обновлении страницы:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function createSections(pageId) {
  // Секция контактов
  await prisma.pageSection.create({
    data: {
      pageId,
      type: 'contacts',
      order: 1,
      isActive: true,
      content: {
        phone: '+7 (495) 260-20-60',
        address: 'Московская обл., г. Дмитров, ул. Чекистская 6, комната 4',
        workingHours: 'ПН-ПТ 9:00 – 18:00, Сб 10:00 – 16:00, ВС – Выходной',
        inn: '5007117840',
        ogrn: '1225000146282',
        kpp: '500701001',
      },
    },
  });

  // Секция карты
  await prisma.pageSection.create({
    data: {
      pageId,
      type: 'map',
      order: 2,
      isActive: true,
      content: {
        latitude: 56.344689,
        longitude: 37.520973,
        zoom: 15,
      },
    },
  });
}

main()
  .then(() => console.log('Скрипт успешно выполнен!'))
  .catch((e) => {
    console.error('Ошибка при выполнении скрипта:', e);
    process.exit(1);
  });
