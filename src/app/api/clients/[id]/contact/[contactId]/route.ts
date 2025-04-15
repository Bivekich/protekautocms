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

// Получение конкретного контакта
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string; contactId: string }> }
) {
  try {
    const { contactId } = await context.params;

    const session = await getServerSession(authOptions);
    const token = req.headers.get('Authorization')?.split(' ')[1];

    if (!session?.user && !token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json({ contact }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching contact:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Обновление контакта
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string; contactId: string }> }
) {
  try {
    const { contactId } = await context.params;

    const session = await getServerSession(authOptions);
    const token = req.headers.get('Authorization')?.split(' ')[1];

    if (!session?.user && !token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Проверяем существование контакта
    const existingContact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!existingContact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Получаем данные из запроса
    const data = await req.json();

    // Обновляем контакт
    const updatedContact = await prisma.contact.update({
      where: { id: contactId },
      data: {
        phone: data.phone,
        email: data.email,
        comment: data.comment,
      },
    });

    return NextResponse.json(
      { contact: updatedContact },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error updating contact:', error);
    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Удаление контакта
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string; contactId: string }> }
) {
  try {
    const { contactId } = await context.params;

    const session = await getServerSession(authOptions);
    const token = req.headers.get('Authorization')?.split(' ')[1];

    if (!session?.user && !token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Проверяем существование контакта
    const existingContact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!existingContact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Удаляем контакт
    await prisma.contact.delete({
      where: { id: contactId },
    });

    return NextResponse.json(
      { message: 'Contact deleted successfully' },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error deleting contact:', error);
    return NextResponse.json(
      { error: 'Failed to delete contact' },
      { status: 500, headers: corsHeaders }
    );
  }
}
