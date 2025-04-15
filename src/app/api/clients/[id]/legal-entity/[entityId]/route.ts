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

// Получение конкретного юридического лица
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string; entityId: string }> }
) {
  try {
    const { entityId } = await context.params;

    const session = await getServerSession(authOptions);
    const token = req.headers.get('Authorization')?.split(' ')[1];

    if (!session?.user && !token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    const legalEntity = await prisma.legalEntity.findUnique({
      where: { id: entityId },
    });

    if (!legalEntity) {
      return NextResponse.json(
        { error: 'Legal entity not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json({ legalEntity }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching legal entity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch legal entity' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Обновление юридического лица
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string; entityId: string }> }
) {
  try {
    const { entityId } = await context.params;

    const session = await getServerSession(authOptions);
    const token = req.headers.get('Authorization')?.split(' ')[1];

    if (!session?.user && !token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Проверяем существование юридического лица
    const existingEntity = await prisma.legalEntity.findUnique({
      where: { id: entityId },
    });

    if (!existingEntity) {
      return NextResponse.json(
        { error: 'Legal entity not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Получаем данные из запроса
    const data = await req.json();

    // Обновляем юридическое лицо
    const updatedEntity = await prisma.legalEntity.update({
      where: { id: entityId },
      data: {
        shortName: data.shortName || data.name,
        fullName: data.fullName,
        form: data.form,
        legalAddress: data.legalAddress || data.address,
        taxSystem: data.taxSystem,
        responsiblePhone: data.responsiblePhone,
        responsibleName: data.responsibleName,
        responsiblePosition: data.responsiblePosition,
        accountant: data.accountant,
        signatory: data.signatory,
        inn: data.inn || '',
        kpp: data.kpp,
        ogrn: data.ogrn,
        vatPercent: data.vatPercent || 20,
      },
    });

    return NextResponse.json(
      { legalEntity: updatedEntity },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error updating legal entity:', error);
    return NextResponse.json(
      { error: 'Failed to update legal entity' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Удаление юридического лица
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string; entityId: string }> }
) {
  try {
    const { entityId } = await context.params;

    const session = await getServerSession(authOptions);
    const token = req.headers.get('Authorization')?.split(' ')[1];

    if (!session?.user && !token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Проверяем существование юридического лица
    const existingEntity = await prisma.legalEntity.findUnique({
      where: { id: entityId },
    });

    if (!existingEntity) {
      return NextResponse.json(
        { error: 'Legal entity not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Удаляем юридическое лицо
    await prisma.legalEntity.delete({
      where: { id: entityId },
    });

    return NextResponse.json(
      { message: 'Legal entity deleted successfully' },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error deleting legal entity:', error);
    return NextResponse.json(
      { error: 'Failed to delete legal entity' },
      { status: 500, headers: corsHeaders }
    );
  }
}
