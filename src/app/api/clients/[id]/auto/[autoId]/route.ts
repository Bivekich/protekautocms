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

// Получение конкретного автомобиля клиента
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string; autoId: string }> }
) {
  try {
    const { id, autoId } = await context.params;

    const session = await getServerSession(authOptions);
    const token = req.headers.get('Authorization')?.split(' ')[1];

    if (!session?.user && !token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Проверяем существование автомобиля и его принадлежность клиенту
    const auto = await prisma.auto.findFirst({
      where: {
        id: autoId,
        clientId: id,
      },
    });

    if (!auto) {
      return NextResponse.json(
        { error: 'Auto not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json({ auto }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching auto:', error);
    return NextResponse.json(
      { error: 'Failed to fetch auto' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Обновление автомобиля клиента
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string; autoId: string }> }
) {
  try {
    const { id, autoId } = await context.params;

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

    // Проверяем существование автомобиля и его принадлежность клиенту
    const autoExists = await prisma.auto.findFirst({
      where: {
        id: autoId,
        clientId: id,
      },
    });

    if (!autoExists) {
      return NextResponse.json(
        { error: 'Auto not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Обновляем автомобиль
    const auto = await prisma.auto.update({
      where: { id: autoId },
      data: {
        name: data.name,
        vinOrFrame: data.vinOrFrame,
        codeType: data.codeType,
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
    console.error('Error updating auto:', error);
    return NextResponse.json(
      { error: 'Failed to update auto' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Удаление автомобиля клиента
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string; autoId: string }> }
) {
  try {
    const { id, autoId } = await context.params;

    const session = await getServerSession(authOptions);
    const token = req.headers.get('Authorization')?.split(' ')[1];

    if (!session?.user && !token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Проверяем существование автомобиля и его принадлежность клиенту
    const autoExists = await prisma.auto.findFirst({
      where: {
        id: autoId,
        clientId: id,
      },
    });

    if (!autoExists) {
      return NextResponse.json(
        { error: 'Auto not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Удаляем автомобиль
    await prisma.auto.delete({
      where: { id: autoId },
    });

    return NextResponse.json(
      { message: 'Auto deleted successfully' },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error deleting auto:', error);
    return NextResponse.json(
      { error: 'Failed to delete auto' },
      { status: 500, headers: corsHeaders }
    );
  }
}
