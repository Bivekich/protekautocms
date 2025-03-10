const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Проверяем, существует ли уже страница с slug 'about'
    const existingPage = await prisma.page.findUnique({
      where: {
        slug: 'about',
      },
    });

    if (existingPage) {
      console.log('Страница "О компании" уже существует. Обновляем данные...');

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
          title: 'О компании',
          description: 'Информация о компании Протек автозапчасти',
          isActive: true,
        },
      });

      // Создаем новые секции
      await createSections(existingPage.id);

      console.log('Страница "О компании" успешно обновлена!');
    } else {
      console.log('Создаем страницу "О компании"...');

      // Создаем новую страницу
      const newPage = await prisma.page.create({
        data: {
          slug: 'about',
          title: 'О компании',
          description: 'Информация о компании Протек автозапчасти',
          isActive: true,
        },
      });

      // Создаем секции для новой страницы
      await createSections(newPage.id);

      console.log('Страница "О компании" успешно создана!');
    }
  } catch (error) {
    console.error('Ошибка при создании/обновлении страницы:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function createSections(pageId) {
  // Секция приветствия
  await prisma.pageSection.create({
    data: {
      pageId,
      type: 'welcome',
      order: 1,
      isActive: true,
      content: {
        title: 'Мы рады приветствовать Вас!',
        description:
          'Протек автозапчасти — это интернет-магазин автозапчастей, предлагающий широкий выбор деталей для автомобилей различных марок, подбор по VIN, кроссировка, техническая поддержка и сопровождение.',
        imageUrl: '/images/about/welcome.jpg',
      },
    },
  });

  // Секция "Мы предлагаем"
  await prisma.pageSection.create({
    data: {
      pageId,
      type: 'offerings',
      order: 2,
      isActive: true,
      content: {
        title: 'Мы предлагаем',
        items: [
          {
            title: 'Оригинальные и неоригинальные запчасти',
            description: 'От расходников до комплектующих для сложного ремонта',
            imageUrl: '/images/about/original-parts.jpg',
          },
          {
            title: 'Широкий ассортимент',
            description:
              'От запчастей для популярных моделей до редких деталей',
            imageUrl: '/images/about/assortment.jpg',
          },
          {
            title: 'Собственное наличие',
            description: 'Мы гарантируем быстрое и качественное обслуживание',
            imageUrl: '/images/about/stock.jpg',
          },
          {
            title: 'Конкурентные цены',
            description:
              'Благодаря прямым поставкам из Китая, Индии, Турции и Европы',
            imageUrl: '/images/about/prices.jpg',
          },
        ],
      },
    },
  });

  // Секция "ПРОТЕК Автозапчасти – это"
  await prisma.pageSection.create({
    data: {
      pageId,
      type: 'about_company',
      order: 3,
      isActive: true,
      content: {
        title: 'ПРОТЕК Автозапчасти – это',
        features: [
          {
            title: 'Электронные каталоги для подбора',
            description:
              'Подбор конкретной автозапчасти с помощью электронных каталогов. Кроссировка по оригинальным номерам и возможность выбора артикула от разных производителей по разным ценам и уровню качества.',
          },
          {
            title: 'Сотрудничество с известными поставщиками',
            description:
              'Сотрудничаем только с известными поставщиками и брендами, что страхует наших партнёров от приобретения контрафакта, что очень важно, с нами вы застрахованы от подделок',
          },
          {
            title: 'Оптово-розничная компания',
            description:
              'Мы работаем и с розничными клиентами, и с оптовыми покупателями',
          },
          {
            title: 'Надежный партнер',
            description:
              'Мы ценим долгосрочные отношения и стремимся к взаимовыгодному сотрудничеству',
          },
          {
            title: 'Гарантия качества',
            description:
              'Мы предлагаем только качественные запчасти от проверенных поставщиков',
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
