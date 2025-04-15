import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ProductImage } from '@prisma/client';

// GET /api/public/catalog/products/slug/[slug] - получение информации о товаре по slug
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ slug: string }> }
) {
  const { slug } = await props.params;
  try {
    // Поиск товара по slug
    const product = await prisma.product.findUnique({
      where: {
        slug,
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
      imageUrls: product.images.map((img: ProductImage) => img.url),
      characteristics: product.characteristics,
      options: product.options,
    };

    return NextResponse.json(formattedProduct);
  } catch (error) {
    console.error(
      'Error in GET /api/public/catalog/products/slug/[slug]:',
      error
    );
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
