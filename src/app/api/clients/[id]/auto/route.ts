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

// Получение всех автомобилей клиента
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

    const autos = await prisma.auto.findMany({
      where: { clientId: id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ autos }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching client autos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch autos' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Добавление нового автомобиля клиенту
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

    // Создаем новый автомобиль
    const auto = await prisma.auto.create({
      data: {
        clientId: id,
        name: data.name,
        vinOrFrame: data.vinOrFrame,
        codeType: data.codeType || 'VIN',
        make: data.make,
        model: data.model,
        modification: data.modification,
        year: data.year ? parseInt(data.year) : null,
        licensePlate: data.licensePlate,
        mileage: data.mileage ? parseInt(data.mileage) : null,
        comment: data.comment,
      },
    });

    return NextResponse.json({ auto }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error creating auto:', error);
    return NextResponse.json(
      { error: 'Failed to create auto' },
      { status: 500, headers: corsHeaders }
    );
  }
}
