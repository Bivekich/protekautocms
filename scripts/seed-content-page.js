const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Проверяем, существует ли уже страница с slug 'content'
    const existingPage = await prisma.page.findUnique({
      where: {
        slug: 'content',
      },
    });

    if (existingPage) {
      console.log('Страница "Контент" уже существует. Обновляем данные...');

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
          title: 'Контент',
          description: 'Различные виды контента для демонстрации',
          isActive: true,
        },
      });

      // Создаем новые секции
      await createSections(existingPage.id);

      console.log('Страница "Контент" успешно обновлена!');
    } else {
      console.log('Создаем страницу "Контент"...');

      // Создаем новую страницу
      const newPage = await prisma.page.create({
        data: {
          slug: 'content',
          title: 'Контент',
          description: 'Различные виды контента для демонстрации',
          isActive: true,
        },
      });

      // Создаем секции для новой страницы
      await createSections(newPage.id);

      console.log('Страница "Контент" успешно создана!');
    }
  } catch (error) {
    console.error('Ошибка при создании/обновлении страницы:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function createSections(pageId) {
  // Секция с заголовком
  await prisma.pageSection.create({
    data: {
      pageId,
      type: 'hero',
      order: 1,
      isActive: true,
      content: {
        title: 'Главный заголовок страницы',
        subtitle: 'Подзаголовок с дополнительной информацией',
        buttonText: 'Узнать больше',
        buttonUrl: '/about',
        imageUrl: '/images/hero-image.jpg',
      },
    },
  });

  // Секция с текстом
  await prisma.pageSection.create({
    data: {
      pageId,
      type: 'text',
      order: 2,
      isActive: true,
      content: {
        title: 'Информационный блок',
        text: 'Здесь размещается основной текст страницы. Это может быть любая информация, которую вы хотите донести до посетителей вашего сайта. Текст может быть длинным и содержать разные элементы форматирования.',
      },
    },
  });

  // Секция с изображениями
  await prisma.pageSection.create({
    data: {
      pageId,
      type: 'gallery',
      order: 3,
      isActive: true,
      content: {
        title: 'Галерея изображений',
        description: 'Посмотрите нашу коллекцию фотографий',
        images: [
          {
            url: '/images/gallery-1.jpg',
            alt: 'Изображение 1',
            title: 'Название первого изображения',
          },
          {
            url: '/images/gallery-2.jpg',
            alt: 'Изображение 2',
            title: 'Название второго изображения',
          },
          {
            url: '/images/gallery-3.jpg',
            alt: 'Изображение 3',
            title: 'Название третьего изображения',
          },
        ],
      },
    },
  });

  // Секция с особенностями
  await prisma.pageSection.create({
    data: {
      pageId,
      type: 'features',
      order: 4,
      isActive: true,
      content: {
        title: 'Наши преимущества',
        features: [
          {
            icon: 'ShieldCheck',
            title: 'Надежность',
            description:
              'Мы гарантируем высокое качество нашей продукции и услуг',
          },
          {
            icon: 'Truck',
            title: 'Быстрая доставка',
            description: 'Доставим ваш заказ в кратчайшие сроки',
          },
          {
            icon: 'CurrencyRuble',
            title: 'Выгодные цены',
            description: 'Предлагаем конкурентные цены на все товары',
          },
        ],
      },
    },
  });

  // Секция FAQ
  await prisma.pageSection.create({
    data: {
      pageId,
      type: 'faq',
      order: 5,
      isActive: true,
      content: {
        title: 'Часто задаваемые вопросы',
        questions: [
          {
            question: 'Как оформить заказ?',
            answer:
              'Вы можете оформить заказ через наш сайт или позвонив по телефону +7 (495) 260-20-60',
          },
          {
            question: 'Какие способы оплаты вы принимаете?',
            answer:
              'Мы принимаем оплату наличными, банковскими картами и безналичным расчетом',
          },
          {
            question: 'Как осуществляется доставка?',
            answer:
              'Доставка осуществляется курьерской службой, Почтой России или транспортными компаниями',
          },
        ],
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
