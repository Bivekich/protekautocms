import { prisma } from '@/lib/prisma';

type AuditAction = 'create' | 'update' | 'delete';

interface LogActionParams {
  userId: string;
  action: string;
  targetId?: string;
  targetType?: string;
  details?: string;
  productId?: string;
}

/**
 * Записывает действие пользователя в аудит
 */
export async function logAction({
  userId,
  action,
  targetId,
  targetType,
  details,
  productId,
}: LogActionParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        targetId,
        targetType,
        details,
        productId,
      },
    });
  } catch (error) {
    console.error('Ошибка при записи в аудит:', error);
  }
}

/**
 * Записывает действие с профилем клиента в аудит
 */
export async function logClientProfileAction({
  userId,
  action,
  profileId,
  profileName,
}: {
  userId: string;
  action: AuditAction;
  profileId: string;
  profileName: string;
}): Promise<void> {
  const actionMap = {
    create: 'Создание профиля клиента',
    update: 'Обновление профиля клиента',
    delete: 'Удаление профиля клиента',
  };

  await logAction({
    userId,
    action: actionMap[action],
    targetId: profileId,
    targetType: 'clientProfile',
    details: `Профиль: ${profileName}`,
  });
}

/**
 * Записывает действие с клиентом в аудит
 */
export async function logClientAction({
  userId,
  action,
  clientId,
  clientName,
}: {
  userId: string;
  action: AuditAction;
  clientId: string;
  clientName: string;
}): Promise<void> {
  const actionMap = {
    create: 'Создание клиента',
    update: 'Обновление клиента',
    delete: 'Удаление клиента',
  };

  await logAction({
    userId,
    action: actionMap[action],
    targetId: clientId,
    targetType: 'client',
    details: `Клиент: ${clientName}`,
  });
}
