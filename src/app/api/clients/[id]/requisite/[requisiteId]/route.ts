import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Опции для CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Обработка OPTIONS запросов (preflight)
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Получение одного реквизита
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string; requisiteId: string }> }
) {
  try {
    const { requisiteId } = await context.params;

    const session = await getServerSession(authOptions);
    const token = req.headers.get('Authorization')?.split(' ')[1];

    if (!session?.user && !token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    const requisite = await prisma.requisite.findUnique({
      where: { id: requisiteId },
    });

    if (!requisite) {
      return NextResponse.json(
        { error: 'Requisite not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json({ requisite }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching requisite:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requisite' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Обновление реквизита
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string; requisiteId: string }> }
) {
  try {
    const { requisiteId } = await context.params;

    const session = await getServerSession(authOptions);
    const token = req.headers.get('Authorization')?.split(' ')[1];

    if (!session?.user && !token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Проверяем существование реквизита
    const existingRequisite = await prisma.requisite.findUnique({
      where: { id: requisiteId },
    });

    if (!existingRequisite) {
      return NextResponse.json(
        { error: 'Requisite not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Получаем данные из запроса
    const data = await req.json();

    // Если указан legalEntityId, проверяем существование юр. лица
    if (data.legalEntityId) {
      const legalEntity = await prisma.legalEntity.findUnique({
        where: { id: data.legalEntityId },
      });

      if (!legalEntity) {
        return NextResponse.json(
          { error: 'Legal entity not found' },
          { status: 404, headers: corsHeaders }
        );
      }
    }

    // Обновляем реквизит
    const updatedRequisite = await prisma.requisite.update({
      where: { id: requisiteId },
      data: {
        name: data.name || existingRequisite.name,
        legalEntityId: data.legalEntityId,
        bankName: data.bankName,
        bik: data.bik,
        accountNumber: data.accountNumber,
        correspondentAccount: data.correspondentAccount,
        // comment: data.comment,
      },
    });

    return NextResponse.json(
      { requisite: updatedRequisite },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error updating requisite:', error);
    return NextResponse.json(
      { error: 'Failed to update requisite' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Удаление реквизита
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string; requisiteId: string }> }
) {
  try {
    const { requisiteId } = await context.params;

    const session = await getServerSession(authOptions);
    const token = req.headers.get('Authorization')?.split(' ')[1];

    if (!session?.user && !token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Проверяем существование реквизита
    const existingRequisite = await prisma.requisite.findUnique({
      where: { id: requisiteId },
    });

    if (!existingRequisite) {
      return NextResponse.json(
        { error: 'Requisite not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Удаляем реквизит
    await prisma.requisite.delete({
      where: { id: requisiteId },
    });

    return NextResponse.json(
      { message: 'Requisite deleted successfully' },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error deleting requisite:', error);
    return NextResponse.json(
      { error: 'Failed to delete requisite' },
      { status: 500, headers: corsHeaders }
    );
  }
}
