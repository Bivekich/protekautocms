const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Проверяем, существует ли уже страница с slug 'shipping'
    const existingPage = await prisma.page.findUnique({
      where: {
        slug: 'shipping',
      },
    });

    if (existingPage) {
      console.log(
        'Страница "Оплата и доставка" уже существует. Обновляем данные...'
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
          title: 'Оплата и доставка',
          description: 'Информация об оплате и доставке',
          isActive: true,
        },
      });

      // Создаем новые секции
      await createSections(existingPage.id);

      console.log('Страница "Оплата и доставка" успешно обновлена!');
    } else {
      console.log('Создаем страницу "Оплата и доставка"...');

      // Создаем новую страницу
      const newPage = await prisma.page.create({
        data: {
          slug: 'shipping',
          title: 'Оплата и доставка',
          description: 'Информация об оплате и доставке',
          isActive: true,
        },
      });

      // Создаем секции для новой страницы
      await createSections(newPage.id);

      console.log('Страница "Оплата и доставка" успешно создана!');
    }
  } catch (error) {
    console.error('Ошибка при создании/обновлении страницы:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function createSections(pageId) {
  // Секция Payment
  await prisma.pageSection.create({
    data: {
      pageId,
      type: 'payment',
      order: 1,
      isActive: true,
      content: {
        title: 'Способы оплаты',
        subtitle: 'Мы предлагаем различные способы оплаты для вашего удобства',
        individuals: {
          title: 'Для физических лиц',
          imageUrl: '/images/payment/individuals.jpg',
          methods: [
            'Наличными при получении',
            'Банковской картой при получении',
            'Банковской картой онлайн',
            'Через систему быстрых платежей (СБП)',
            'Электронными деньгами (ЮMoney, QIWI)',
          ],
        },
        businesses: {
          title: 'Для юридических лиц',
          imageUrl: '/images/payment/businesses.jpg',
          methods: [
            'Безналичный расчет',
            'Оплата по счету',
            'Оплата с НДС',
            'Отсрочка платежа для постоянных клиентов',
          ],
        },
        important: {
          title: 'Важная информация',
          points: [
            'Оплата производится в российских рублях',
            'Чек предоставляется при любом способе оплаты',
            'Возможна оплата частями для крупных заказов',
            'При оплате онлайн комиссия не взимается',
          ],
        },
      },
    },
  });

  // Секция Delivery
  await prisma.pageSection.create({
    data: {
      pageId,
      type: 'delivery',
      order: 2,
      isActive: true,
      content: {
        title: 'Доставка',
        subtitle: 'Мы доставляем товары по всей России',
        moscow: {
          title: 'Доставка по Москве и области',
          details: [
            'Доставка в пределах МКАД - 300 руб.',
            'Доставка за МКАД - 300 руб. + 30 руб./км',
            'Бесплатная доставка при заказе от 5000 руб.',
            'Срок доставки - 1-2 рабочих дня',
          ],
        },
        regions: {
          title: 'Доставка по России',
          details: [
            'Доставка транспортными компаниями',
            'Заказы, оформленные до 12:00, доставляем в тот же день',
            'Доставка в ТК – бесплатно',
          ],
        },
        companies: [
          {
            name: 'Я-Доставка',
            imageUrl: '/images/delivery/ya-delivery.jpg',
          },
          {
            name: 'СДЭК',
            imageUrl: '/images/delivery/cdek.jpg',
          },
          {
            name: 'Деловые линии',
            imageUrl: '/images/delivery/delovie-linii.jpg',
          },
          {
            name: 'Boxberry',
            imageUrl: '/images/delivery/boxberry.jpg',
          },
          {
            name: 'Почта России',
            imageUrl: '/images/delivery/pochta-russia.jpg',
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
