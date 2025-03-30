import { db } from '@/lib/db';

interface CreateAuditLogParams {
  action: string;
  details?: string;
  userId: string;
  targetId?: string;
  productId?: string;
  targetType?: string;
}

export const createAuditLog = async ({
  action,
  details,
  userId,
  targetId,
  productId,
  targetType,
}: CreateAuditLogParams) => {
  try {
    await db.auditLog.create({
      data: {
        action,
        details,
        userId,
        targetId: targetType === 'product' ? null : targetId,
        productId: targetType === 'product' ? targetId : productId,
        targetType,
      },
    });
  } catch (error) {
    console.error('[CREATE_AUDIT_LOG_ERROR]', error);
  }
};
