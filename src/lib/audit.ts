import { db } from '@/lib/db';

type AuditAction = 'LOGIN' | 'CREATE' | 'UPDATE' | 'DELETE';

interface AuditParams {
  userId: string;
  action: AuditAction;
  details: string;
  targetId?: string;
}

export async function createAuditLog({
  userId,
  action,
  details,
  targetId,
}: AuditParams) {
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
    console.error('Failed to create audit log:', error);
  }
}
