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

// Получение конкретного договора
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string; contractId: string }> }
) {
  try {
    const { contractId } = await context.params;

    const session = await getServerSession(authOptions);
    const token = req.headers.get('Authorization')?.split(' ')[1];

    if (!session?.user && !token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
    });

    if (!contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json({ contract }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching contract:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contract' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Обновление договора
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string; contractId: string }> }
) {
  try {
    const { contractId } = await context.params;

    const session = await getServerSession(authOptions);
    const token = req.headers.get('Authorization')?.split(' ')[1];

    if (!session?.user && !token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Проверяем существование договора
    const existingContract = await prisma.contract.findUnique({
      where: { id: contractId },
    });

    if (!existingContract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Получаем данные из запроса
    const data = await req.json();

    // Обновляем договор
    const updatedContract = await prisma.contract.update({
      where: { id: contractId },
      data: {
        number: data.number,
        date: data.date ? new Date(data.date) : undefined,
        type: data.type,
      },
    });

    return NextResponse.json(
      { contract: updatedContract },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error updating contract:', error);
    return NextResponse.json(
      { error: 'Failed to update contract' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Удаление договора
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string; contractId: string }> }
) {
  try {
    const { contractId } = await context.params;

    const session = await getServerSession(authOptions);
    const token = req.headers.get('Authorization')?.split(' ')[1];

    if (!session?.user && !token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Проверяем существование договора
    const existingContract = await prisma.contract.findUnique({
      where: { id: contractId },
    });

    if (!existingContract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Удаляем договор
    await prisma.contract.delete({
      where: { id: contractId },
    });

    return NextResponse.json(
      { message: 'Contract deleted successfully' },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error deleting contract:', error);
    return NextResponse.json(
      { error: 'Failed to delete contract' },
      { status: 500, headers: corsHeaders }
    );
  }
}
