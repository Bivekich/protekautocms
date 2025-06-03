import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Проверяем есть ли пользователи в системе
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true }
    });

    if (users.length === 0) {
      console.log('Нет пользователей для создания тестовых данных аудита');
      return;
    }

    console.log(`Найдено пользователей: ${users.length}`);

    // Создаем тестовые записи аудита
    const auditLogs = [];
    const actions = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN'];
    const targetTypes = ['user', 'product', 'category', 'media', 'page'];

    for (let i = 0; i < 25; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const targetType = targetTypes[Math.floor(Math.random() * targetTypes.length)];
      
      // Создаем дату в прошлом (до 30 дней назад)
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));

      // Для некоторых записей используем ID пользователей как targetId, для других - null
      const shouldUseTargetId = Math.random() > 0.5;
      const targetUser = shouldUseTargetId ? users[Math.floor(Math.random() * users.length)] : null;

      const auditLog = await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: action,
          targetType: targetType,
          targetId: targetUser ? targetUser.id : null,
          details: `${action} operation on ${targetType} by ${user.name}`,
          createdAt: createdAt,
        }
      });

      auditLogs.push(auditLog);
    }

    console.log(`Создано ${auditLogs.length} тестовых записей аудита`);

    // Выводим примеры созданных записей
    console.log('\nПримеры созданных записей:');
    auditLogs.slice(0, 5).forEach((log, index) => {
      console.log(`${index + 1}. ${log.action} - ${log.details} (${log.createdAt.toISOString()})`);
    });

  } catch (error) {
    console.error('Ошибка при создании тестовых данных:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 