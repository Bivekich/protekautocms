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

// Получение всех реквизитов
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const session = await getServerSession(authOptions);
    const token = req.headers.get('Authorization')?.split(' ')[1];

    if (!session?.user && !token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Получаем URL параметры
    const url = new URL(req.url);
    const legalEntityId = url.searchParams.get('legalEntityId');

    // Если указан ID юридического лица, фильтруем по нему
    const whereCondition: { clientId: string; legalEntityId?: string } = {
      clientId: id,
    };
    if (legalEntityId) {
      whereCondition.legalEntityId = legalEntityId;
    }

    const requisites = await prisma.requisite.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ requisites }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching requisites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requisites' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Добавление новых реквизитов
export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const session = await getServerSession(authOptions);
    const token = req.headers.get('Authorization')?.split(' ')[1];

    if (!session?.user && !token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Получаем данные из запроса
    const data = await req.json();

    // Проверяем существование клиента
    const client = await prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404, headers: corsHeaders }
      );
    }

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

    // Создаем новые реквизиты
    const requisite = await prisma.requisite.create({
      data: {
        name: data.name || 'Основной счет',
        legalEntityId: data.legalEntityId,
        bankName: data.bankName,
        bik: data.bik,
        accountNumber: data.accountNumber,
        correspondentAccount: data.correspondentAccount,
      },
    });

    return NextResponse.json({ requisite }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error creating requisite:', error);
    return NextResponse.json(
      { error: 'Failed to create requisite' },
      { status: 500, headers: corsHeaders }
    );
  }
}
