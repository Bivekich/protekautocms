import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/public/catalog/products/[id] - получение информации о товаре по ID
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  try {
    // Поиск товара по ID
    const product = await prisma.product.findUnique({
      where: {
        id,
        // Показываем только видимые товары в публичном API
        isVisible: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            parentId: true,
            parent: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        characteristics: true,
        images: {
          orderBy: {
            order: 'asc',
          },
        },
        options: {
          include: {
            values: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Товар не найден' }, { status: 404 });
    }

    // Форматирование ответа
    const formattedProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      description: product.description,
      retailPrice: product.retailPrice,
      stock: product.stock,
      categoryId: product.categoryId,
      category: product.category,
      mainImage: product.images.length > 0 ? product.images[0].url : null,
      imageUrls: product.images.map((img) => img.url),
      characteristics: product.characteristics,
      options: product.options,
    };

    return NextResponse.json(formattedProduct);
  } catch (error) {
    console.error('Error in GET /api/public/catalog/products/[id]:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
