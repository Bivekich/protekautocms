const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Создаем администратора
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Администратор',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Создан администратор:', admin.email);

  // Создаем профили клиентов
  const retailProfile = await prisma.clientProfile.upsert({
    where: { code: 'RETAIL' },
    update: {},
    create: {
      name: 'Розничный',
      code: 'RETAIL',
      comment: 'Обычные розничные клиенты',
      baseMarkup: '15',
      priceMarkup: '10',
      orderDiscount: '0',
    },
  });

  const wholesaleProfile = await prisma.clientProfile.upsert({
    where: { code: 'WHOLESALE' },
    update: {},
    create: {
      name: 'Оптовый',
      code: 'WHOLESALE',
      comment: 'Оптовые клиенты',
      baseMarkup: '5',
      priceMarkup: '3',
      orderDiscount: '5',
    },
  });

  console.log('✅ Созданы профили клиентов');

  // Создаем тестовых клиентов с разными статусами
  const clients = [
    {
      phone: '+7-900-123-45-67',
      firstName: 'Иван',
      lastName: 'Петров',
      email: 'ivan.petrov@example.com',
      status: 'ACTIVE',
      profileId: retailProfile.id,
      isVerified: true,
    },
    {
      phone: '+7-900-123-45-68',
      firstName: 'Мария',
      lastName: 'Сидорова',
      email: 'maria.sidorova@example.com',
      status: 'INACTIVE',
      profileId: wholesaleProfile.id,
      isVerified: false,
    },
    {
      phone: '+7-900-123-45-69',
      firstName: 'Алексей',
      lastName: 'Козлов',
      email: 'alexey.kozlov@example.com',
      status: 'BLOCKED',
      profileId: retailProfile.id,
      isVerified: true,
    },
    {
      phone: '+7-900-123-45-70',
      firstName: 'Елена',
      lastName: 'Николаева',
      email: 'elena.nikolaeva@example.com',
      status: 'PENDING',
      profileId: wholesaleProfile.id,
      isVerified: false,
    },
    {
      phone: '+7-900-123-45-71',
      firstName: 'Дмитрий',
      lastName: 'Волков',
      email: 'dmitry.volkov@example.com',
      status: 'ACTIVE',
      profileId: retailProfile.id,
      isVerified: true,
    },
  ];

  for (const clientData of clients) {
    await prisma.client.upsert({
      where: { phone: clientData.phone },
      update: {},
      create: clientData,
    });
  }

  console.log('✅ Созданы тестовые клиенты с разными статусами');

  // Создаем скидку
  await prisma.discount.upsert({
    where: { name: 'Скидка 10%' },
    update: {},
    create: {
      name: 'Скидка 10%',
      type: 'Скидка',
      minOrderAmount: 1000,
      discountPercent: 10,
      isActive: true,
      profiles: {
        connect: [{ id: retailProfile.id }],
      },
    },
  });

  console.log('✅ Создана скидка');

  console.log('\n🎉 Тестовые данные успешно добавлены!');
  console.log('Логин: admin@example.com');
  console.log('Пароль: admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 