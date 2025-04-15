import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verify(token, JWT_SECRET) as { id: string };

    const client = await prisma.client.findUnique({
      where: { id: decoded.id },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      client: {
        id: client.id,
        phone: client.phone,
        email: client.email,
        firstName: client.firstName,
        lastName: client.lastName,
        profileType: client.profileType,
        isVerified: client.isVerified,
      },
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
