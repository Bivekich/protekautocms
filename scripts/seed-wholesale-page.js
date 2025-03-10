const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Проверяем, существует ли уже страница с slug 'wholesale-clients'
    const existingPage = await prisma.page.findUnique({
      where: {
        slug: 'wholesale-clients',
      },
    });

    if (existingPage) {
      console.log(
        'Страница "Оптовым клиентам" уже существует. Обновляем данные...'
      );

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
          title: 'Оптовым клиентам',
          description:
            'Информация для оптовых клиентов компании Протек автозапчасти',
          isActive: true,
        },
      });

      // Создаем новые секции
      await createSections(existingPage.id);

      console.log('Страница "Оптовым клиентам" успешно обновлена!');
    } else {
      console.log('Создаем страницу "Оптовым клиентам"...');

      // Создаем новую страницу
      const newPage = await prisma.page.create({
        data: {
          slug: 'wholesale-clients',
          title: 'Оптовым клиентам',
          description:
            'Информация для оптовых клиентов компании Протек автозапчасти',
          isActive: true,
        },
      });

      // Создаем секции для новой страницы
      await createSections(newPage.id);

      console.log('Страница "Оптовым клиентам" успешно создана!');
    }
  } catch (error) {
    console.error('Ошибка при создании/обновлении страницы:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function createSections(pageId) {
  // Секция Hero
  await prisma.pageSection.create({
    data: {
      pageId,
      type: 'hero',
      order: 1,
      isActive: true,
      content: {
        title: 'Оптовым клиентам',
        subtitle: [
          'Мы предлагаем выгодные условия сотрудничества для оптовых клиентов',
          'Индивидуальный подход к каждому клиенту',
          'Гибкая система скидок и бонусов',
        ],
        imageUrl: '/images/wholesale/hero.jpg',
      },
    },
  });

  // Секция Benefits
  await prisma.pageSection.create({
    data: {
      pageId,
      type: 'benefits',
      order: 2,
      isActive: true,
      content: {
        title: 'Преимущества работы с нами',
        items: [
          {
            title: 'Широкий ассортимент',
            description:
              'Более 10 000 наименований запчастей для различных марок автомобилей',
          },
          {
            title: 'Выгодные цены',
            description:
              'Специальные цены для оптовых клиентов и дополнительные скидки при крупных заказах',
          },
          {
            title: 'Быстрая доставка',
            description:
              'Доставка по Москве и области в течение 1-2 дней, по России - от 3 до 7 дней',
          },
          {
            title: 'Гарантия качества',
            description:
              'Все товары сертифицированы и имеют гарантию от производителя',
          },
        ],
      },
    },
  });

  // Секция Services
  await prisma.pageSection.create({
    data: {
      pageId,
      type: 'services',
      order: 3,
      isActive: true,
      content: {
        title: 'Услуги для оптовых клиентов',
        items: [
          'Персональный менеджер',
          'Техническая поддержка и консультации',
          'Помощь в подборе запчастей',
          'Отсрочка платежа для постоянных клиентов',
          'Доставка до терминала транспортной компании',
        ],
      },
    },
  });

  // Секция Process
  await prisma.pageSection.create({
    data: {
      pageId,
      type: 'process',
      order: 4,
      isActive: true,
      content: {
        title: 'Как начать сотрудничество',
        steps: [
          'Оставьте заявку на сайте или свяжитесь с нами по телефону',
          'Получите коммерческое предложение с условиями сотрудничества',
          'Заключите договор и получите доступ к оптовым ценам',
          'Оформляйте заказы через личный кабинет или менеджера',
          'Получайте товар и развивайте свой бизнес вместе с нами',
        ],
      },
    },
  });

  // Секция Support
  await prisma.pageSection.create({
    data: {
      pageId,
      type: 'support',
      order: 5,
      isActive: true,
      content: {
        title: 'Остались вопросы?',
        description: [
          'Наши специалисты готовы ответить на все ваши вопросы и помочь с выбором оптимальных условий сотрудничества.',
          'Свяжитесь с нами удобным для вас способом, и мы предоставим всю необходимую информацию.',
        ],
        contacts: {
          telegram: 'https://t.me/protek_auto',
          whatsapp: 'https://wa.me/74952602060',
        },
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
