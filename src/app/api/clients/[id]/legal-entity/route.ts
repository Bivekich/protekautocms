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

// Получение всех юридических лиц клиента
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

    const legalEntities = await prisma.legalEntity.findMany({
      where: { clientId: id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ legalEntities }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching client legal entities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch legal entities' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Добавление нового юридического лица клиенту
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

    // Создаем новое юридическое лицо
    const legalEntity = await prisma.legalEntity.create({
      data: {
        clientId: id,
        name: data.name,
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

    return NextResponse.json({ legalEntity }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error creating legal entity:', error);
    return NextResponse.json(
      { error: 'Failed to create legal entity' },
      { status: 500, headers: corsHeaders }
    );
  }
}
