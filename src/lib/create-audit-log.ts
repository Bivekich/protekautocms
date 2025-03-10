import { db } from '@/lib/db';

interface CreateAuditLogParams {
  action: string;
  details?: string;
  userId: string;
  targetId?: string;
}

export const createAuditLog = async ({
  action,
  details,
  userId,
  targetId,
}: CreateAuditLogParams) => {
  try {
    await db.auditLog.create({
      data: {
        action,
        details,
        userId,
        targetId,
      },
    });
  } catch (error) {
    console.error('[CREATE_AUDIT_LOG_ERROR]', error);
  }
};
