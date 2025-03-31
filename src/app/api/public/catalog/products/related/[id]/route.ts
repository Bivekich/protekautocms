import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/public/catalog/products/related/[id] - получение связанных товаров для указанного товара
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  try {
    // Проверяем существование товара
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: 'Товар не найден' }, { status: 404 });
    }

    // Получаем связанные и дополнительные товары из БД или используем пустые массивы
    // (Предполагаем реализацию системы связанных товаров через другую таблицу или метаданные)
    const relatedProductIds: string[] = [];
    const complementaryProductIds: string[] = [];

    // Получаем связанные товары
    const relatedProducts = await prisma.product.findMany({
      where: {
        id: { in: relatedProductIds },
        isVisible: true, // Только видимые товары
        stock: { gt: 0 }, // Только товары в наличии
      },
      include: {
        images: {
          orderBy: {
            order: 'asc',
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Получаем сопутствующие товары
    const complementaryProducts = await prisma.product.findMany({
      where: {
        id: { in: complementaryProductIds },
        isVisible: true, // Только видимые товары
        stock: { gt: 0 }, // Только товары в наличии
      },
      include: {
        images: {
          orderBy: {
            order: 'asc',
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Форматируем связанные товары
    const formattedRelated = relatedProducts.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      retailPrice: product.retailPrice,
      categoryId: product.categoryId,
      category: product.category,
      mainImage: product.images.length > 0 ? product.images[0].url : null,
    }));

    // Форматируем сопутствующие товары
    const formattedComplementary = complementaryProducts.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      retailPrice: product.retailPrice,
      categoryId: product.categoryId,
      category: product.category,
      mainImage: product.images.length > 0 ? product.images[0].url : null,
    }));

    return NextResponse.json({
      related: formattedRelated,
      complementary: formattedComplementary,
    });
  } catch (error) {
    console.error(
      'Error in GET /api/public/catalog/products/related/[id]:',
      error
    );
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
