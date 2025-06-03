import { makeExecutableSchema } from '@graphql-tools/schema';
import GraphQLJSON from 'graphql-type-json';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

interface GraphQLContext {
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}

// Функция логирования действий
const logAction = async (params: {
  userId: string;
  action: string;
  details: string;
  targetType?: string;
  targetId?: string;
}) => {
  await db.auditLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      details: params.details,
      targetType: params.targetType || 'unknown',
      targetId: params.targetId,
    },
  });
};

// Интерфейс для фильтров аудита
interface AuditLogFilters {
  targetType?: string;
  userId?: string;
  from?: string;
  to?: string;
}

const typeDefs = `
  scalar JSON

  type Pagination {
    total: Int!
    page: Int!
    limit: Int!
    pages: Int!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    avatarUrl: String
    requiresTwoFactor: Boolean
    twoFactorEnabled: Boolean
    createdAt: String!
    updatedAt: String!
  }

  type TwoFactorSetup {
    twoFactorEnabled: Boolean!
    secret: String
    qrCodeUrl: String
  }

  type TwoFactorResponse {
    success: Boolean!
    message: String!
    twoFactorEnabled: Boolean!
  }

  type AuditLog {
    id: ID!
    userId: ID!
    action: String!
    targetType: String
    targetId: String
    details: String!
    productId: String
    createdAt: String!
    user: User!
  }

  type AuditLogMeta {
    total: Int!
    limit: Int!
    offset: Int!
  }

  type AuditLogsResult {
    data: [AuditLog!]!
    meta: AuditLogMeta!
  }

  input CreateUserInput {
    name: String!
    email: String!
    password: String!
    role: String!
  }

  input UpdateUserAdminInput {
    name: String
    email: String
    password: String
    role: String
  }

  input UpdateUserInput {
    name: String
    email: String
  }

  input ChangePasswordInput {
    currentPassword: String!
    newPassword: String!
  }

  input VerifyTwoFactorInput {
    token: String!
  }

  input DisableTwoFactorInput {
    password: String!
  }

  input EnableTwoFactorInput {
    token: String!
    secret: String!
  }

  type Media {
    id: ID!
    name: String!
    url: String!
    type: String!
    size: Int!
    mimeType: String!
    alt: String
    description: String
    userId: ID!
    createdAt: String!
    updatedAt: String!
    user: User!
  }

  type MediaResult {
    media: [Media!]!
    pagination: Pagination!
  }

  type Category {
    id: ID!
    name: String!
    slug: String!
    description: String
    parentId: ID
    level: Int!
    order: Int!
    isVisible: Boolean!
    includeSubcategoryProducts: Boolean!
    imageUrl: String
    createdAt: String!
    updatedAt: String!
    subcategories: [Category!]
    productsCount: Int
  }

  type ProductImage {
    id: ID!
    url: String!
    alt: String
    order: Int!
  }

  type ProductCharacteristic {
    id: ID!
    name: String!
    value: String!
  }

  type ProductOptionValue {
    id: ID!
    value: String!
    price: Float!
  }

  type ProductOption {
    id: ID!
    name: String!
    type: String!
    values: [ProductOptionValue!]!
  }

  type Product {
    id: ID!
    name: String!
    slug: String!
    sku: String!
    description: String
    wholesalePrice: Float!
    retailPrice: Float!
    stock: Int!
    isVisible: Boolean!
    categoryId: ID
    createdAt: String!
    updatedAt: String!
    category: Category
    images: [ProductImage!]
    characteristics: [ProductCharacteristic!]
    options: [ProductOption!]
  }

  type Page {
    id: ID!
    slug: String!
    title: String!
    description: String
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
    sections: [PageSection!]
  }

  type PageSection {
    id: ID!
    pageId: ID!
    type: String!
    order: Int!
    content: JSON!
    isActive: Boolean!
    createdAt: String!
    updatedAt: String!
    page: Page!
  }

  type CategoriesResult {
    categories: [Category!]!
  }

  type ProductsResult {
    products: [Product!]!
    pagination: Pagination!
  }

  type PagesResult {
    pages: [Page!]!
  }

  input BulkUpdateProductsInput {
    productIds: [ID!]!
    data: BulkProductUpdateData!
  }

  input BulkProductUpdateData {
    isVisible: Boolean
    categoryId: ID
    stock: Int
    wholesalePrice: Float
    retailPrice: Float
  }

  input ExportInput {
    format: String!
    includeImages: Boolean
    includeCategories: Boolean
    includeOptions: Boolean
    includeCharacteristics: Boolean
    categoryId: ID
  }

  input CreatePageInput {
    slug: String!
    title: String!
    description: String
    isActive: Boolean
  }

  input UpdatePageInput {
    slug: String
    title: String
    description: String
    isActive: Boolean
  }

  input CreatePageSectionInput {
    pageId: ID!
    type: String!
    order: Int!
    content: JSON!
    isActive: Boolean
  }

  input UpdatePageSectionInput {
    type: String
    order: Int
    content: JSON
    isActive: Boolean
  }

  type Query {
    users: [User!]!
    currentUser: User
    twoFactorSetup: TwoFactorSetup!
    auditLogs(
      page: Int
      limit: Int
      targetType: String
      userId: String
      from: String
      to: String
    ): AuditLogsResult!
    categoriesList(includeHidden: Boolean): CategoriesResult!
    category(id: ID!): Category
    productsList(
      page: Int
      limit: Int
      categoryId: ID
      search: String
      stockFilter: String
      visibilityFilter: String
    ): ProductsResult!
    productItem(id: ID!): Product
    media(
      page: Int
      limit: Int
      type: String
      search: String
    ): MediaResult!
    pagesList(includeHidden: Boolean): PagesResult!
    page(id: ID, slug: String): Page
    pageBySlug(slug: String!): Page
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
    updateUser(input: UpdateUserInput!): User!
    updateUserAdmin(id: ID!, input: UpdateUserAdminInput!): User!
    deleteUser(id: ID!): Boolean!
    changePassword(input: ChangePasswordInput!): User!
    uploadAvatarBase64(base64Image: String!): User!
    setupTwoFactor: TwoFactorSetup!
    enableTwoFactor(input: EnableTwoFactorInput!): TwoFactorResponse!
    verifyTwoFactor(input: VerifyTwoFactorInput!): User!
    disableTwoFactor: TwoFactorResponse!
    deleteCategory(id: ID!): Boolean
    deleteProduct(id: ID!): Boolean
    bulkDeleteProducts(productIds: [ID!]!): Boolean
    bulkUpdateProducts(input: BulkUpdateProductsInput!): Boolean
    deleteMedia(id: ID!): Boolean
    exportCatalog(input: ExportInput!): String!
    createPage(input: CreatePageInput!): Page!
    updatePage(id: ID!, input: UpdatePageInput!): Page!
    deletePage(id: ID!): Boolean!
    createPageSection(input: CreatePageSectionInput!): PageSection!
    updatePageSection(id: ID!, input: UpdatePageSectionInput!): PageSection!
    deletePageSection(id: ID!): Boolean!
  }
`;

const resolvers = {
  JSON: GraphQLJSON,

  Query: {
    users: async (_: unknown, __: unknown, context: GraphQLContext) => {
      const { currentUser } = context;
      
      if (!currentUser) {
        throw new Error('Access denied');
      }
      
      if (currentUser.role !== 'ADMIN') {
        throw new Error('Insufficient permissions');
      }
      
      return await db.user.findMany({
        orderBy: { createdAt: 'desc' },
      });
    },

    currentUser: async (_: unknown, __: unknown, context: GraphQLContext) => {
      const { currentUser } = context;
      
      if (!currentUser) {
        return null;
      }
      
      return await db.user.findUnique({
        where: { id: currentUser.id },
      });
    },

    twoFactorSetup: async (_: unknown, __: unknown, context: GraphQLContext) => {
      const { currentUser } = context;
      
      if (!currentUser) {
        throw new Error('Access denied');
      }
      
      const user = await db.user.findUnique({
        where: { id: currentUser.id },
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Если двухфакторная аутентификация уже включена
      if (user.twoFactorEnabled) {
        return {
          twoFactorEnabled: true,
          secret: null,
          qrCodeUrl: null,
        };
      }
      
      // Если еще не включена, возвращаем данные для настройки
      return {
        twoFactorEnabled: false,
        secret: 'TEMP_SECRET_' + user.id,
        qrCodeUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      };
    },

    auditLogs: async (_: unknown, {
      page = 1,
      limit = 50,
      targetType,
      userId,
      from,
      to,
    }: {
      page?: number;
      limit?: number;
      targetType?: string;
      userId?: string;
      from?: string;
      to?: string;
    }, context: GraphQLContext) => {
      const { currentUser } = context;
      
      if (!currentUser) {
        throw new Error('Access denied');
      }
      
      if (currentUser.role !== 'ADMIN') {
        throw new Error('Insufficient permissions');
      }
      
      const skip = (page - 1) * limit;
      const where: AuditLogFilters = {};
      
      if (targetType) {
        where.targetType = targetType;
      }
      
      if (userId) {
        where.userId = userId;
      }
      
      if (from || to) {
        const dateWhere: Record<string, Date> = {};
        if (from) {
          dateWhere.gte = new Date(from);
        }
        if (to) {
          dateWhere.lte = new Date(to);
        }
        // Приводим к правильному типу для Prisma
        (where as Record<string, unknown>).createdAt = dateWhere;
      }
      
      const [data, total] = await Promise.all([
        db.auditLog.findMany({
          where: where as Record<string, unknown>,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: true,
          },
        }),
        db.auditLog.count({ where: where as Record<string, unknown> }),
      ]);
      
      return {
        data: data.map(log => ({
          ...log,
          createdAt: log.createdAt.toISOString(),
        })),
        meta: {
          total,
          limit,
          offset: skip,
        },
      };
    },

    categoriesList: async (_: unknown, { includeHidden }: { includeHidden?: boolean }) => {
      const where = includeHidden ? {} : { isVisible: true };
      const categories = await db.category.findMany({
        where,
        orderBy: [{ level: 'asc' }, { order: 'asc' }],
        include: {
          subcategories: true,
          _count: {
            select: { products: true },
          },
        },
      });
      return {
        categories: categories.map(cat => ({
          ...cat,
          productsCount: cat._count.products,
        })),
      };
    },

    category: async (_: unknown, { id }: { id: string }) => {
      return await db.category.findUnique({
        where: { id },
        include: {
          subcategories: true,
          _count: {
            select: { products: true },
          },
        },
      });
    },

    productsList: async (_: unknown, {
      page = 1,
      limit = 20,
      categoryId,
      search,
      stockFilter,
      visibilityFilter,
    }: {
      page?: number;
      limit?: number;
      categoryId?: string;
      search?: string;
      stockFilter?: string;
      visibilityFilter?: string;
    }) => {
      const skip = (page - 1) * limit;
      const where: Record<string, unknown> = {};
      
      if (categoryId) {
        where.categoryId = categoryId;
      }
      
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
        ];
      }
      
      if (stockFilter === 'in_stock') {
        where.stock = { gt: 0 };
      } else if (stockFilter === 'out_of_stock') {
        where.stock = { lte: 0 };
      }
      
      if (visibilityFilter === 'visible') {
        where.isVisible = true;
      } else if (visibilityFilter === 'hidden') {
        where.isVisible = false;
      }
      
      const [products, total] = await Promise.all([
        db.product.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            category: true,
            images: { orderBy: { order: 'asc' } },
            characteristics: true,
            options: { include: { values: true } },
          },
        }),
        db.product.count({ where }),
      ]);
      
      return {
        products,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    },

    productItem: async (_: unknown, { id }: { id: string }) => {
      return await db.product.findUnique({
        where: { id },
        include: {
          category: true,
          images: { orderBy: { order: 'asc' } },
          characteristics: true,
          options: { include: { values: true } },
        },
      });
    },

    media: async (_: unknown, {
      page = 1,
      limit = 20,
      type,
      search,
    }: {
      page?: number;
      limit?: number;
      type?: string;
      search?: string;
    }) => {
      const skip = (page - 1) * limit;
      const where: Record<string, unknown> = {};
      
      if (type) {
        where.type = type;
      }
      
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { alt: { contains: search, mode: 'insensitive' } },
        ];
      }
      
      const [media, total] = await Promise.all([
        db.media.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        db.media.count({ where }),
      ]);
      
      return {
        media,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    },

    pagesList: async (_: unknown, { includeHidden }: { includeHidden?: boolean }) => {
      const where = includeHidden ? {} : { isActive: true };
      const pages = await db.page.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          sections: { orderBy: { order: 'asc' } },
        },
      });
      return { pages };
    },

    page: async (_: unknown, { id, slug }: { id?: string; slug?: string }) => {
      const where = id ? { id } : slug ? { slug } : null;
      if (!where) return null;
      
      return await db.page.findUnique({
        where,
        include: {
          sections: { orderBy: { order: 'asc' } },
        },
      });
    },

    pageBySlug: async (_: unknown, { slug }: { slug: string }) => {
      return await db.page.findUnique({
        where: { slug },
        include: {
          sections: { orderBy: { order: 'asc' } },
        },
      });
    },
  },

  Mutation: {
    createUser: async (_: unknown, { input }: { input: { name: string; email: string; password: string; role: string } }, context: GraphQLContext) => {
      const { currentUser } = context;
      
      if (!currentUser) {
        throw new Error('Access denied');
      }
      
      if (currentUser.role !== 'ADMIN') {
        throw new Error('Insufficient permissions');
      }
      
      const existingUser = await db.user.findUnique({
        where: { email: input.email },
      });
      
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
      
      const hashedPassword = await bcrypt.hash(input.password, 12);
      
      const user = await db.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashedPassword,
          role: input.role as 'ADMIN' | 'MANAGER',
        },
      });
      
      await logAction({
        userId: currentUser.id,
        action: 'CREATE',
        details: 'User created: ' + user.name + ' (' + user.email + ')',
        targetType: 'user',
        targetId: user.id,
      });
      
      return user;
    },

    updateUser: async (_: unknown, { input }: { input: { name?: string; email?: string } }, context: GraphQLContext) => {
      const { currentUser } = context;
      
      if (!currentUser) {
        throw new Error('Access denied');
      }
      
      const user = await db.user.update({
        where: { id: currentUser.id },
        data: input,
      });
      
      await logAction({
        userId: currentUser.id,
        action: 'UPDATE',
        details: 'User profile updated: ' + user.name,
        targetType: 'user',
        targetId: user.id,
      });
      
      return user;
    },

    updateUserAdmin: async (_: unknown, { id, input }: { id: string; input: { name?: string; email?: string; password?: string; role?: string } }, context: GraphQLContext) => {
      const { currentUser } = context;
      
      if (!currentUser) {
        throw new Error('Access denied');
      }
      
      if (currentUser.role !== 'ADMIN') {
        throw new Error('Insufficient permissions');
      }
      
      const updateData: Record<string, unknown> = {};
      if (input.name) updateData.name = input.name;
      if (input.email) updateData.email = input.email;
      if (input.role) updateData.role = input.role;
      
      if (input.password) {
        updateData.password = await bcrypt.hash(input.password, 12);
      }
      
      const user = await db.user.update({
        where: { id },
        data: updateData,
      });
      
      await logAction({
        userId: currentUser.id,
        action: 'UPDATE',
        details: 'User updated: ' + user.name + ' (' + user.email + ')',
        targetType: 'user',
        targetId: user.id,
      });
      
      return user;
    },

    deleteUser: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      const { currentUser } = context;
      
      if (!currentUser) {
        throw new Error('Access denied');
      }
      
      if (currentUser.role !== 'ADMIN') {
        throw new Error('Insufficient permissions');
      }
      
      if (currentUser.id === id) {
        throw new Error('Cannot delete yourself');
      }
      
      const user = await db.user.findUnique({
        where: { id },
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      await db.user.delete({
        where: { id },
      });
      
      await logAction({
        userId: currentUser.id,
        action: 'DELETE',
        details: 'User deleted: ' + user.name + ' (' + user.email + ')',
        targetType: 'user',
        targetId: id,
      });
      
      return true;
    },

    changePassword: async (_: unknown, { input }: { input: { currentPassword: string; newPassword: string } }, context: GraphQLContext) => {
      const { currentUser } = context;
      
      if (!currentUser) {
        throw new Error('Access denied');
      }
      
      const user = await db.user.findUnique({
        where: { id: currentUser.id },
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      const isValidPassword = await bcrypt.compare(input.currentPassword, user.password);
      
      if (!isValidPassword) {
        throw new Error('Invalid current password');
      }
      
      const hashedPassword = await bcrypt.hash(input.newPassword, 12);
      
      const updatedUser = await db.user.update({
        where: { id: currentUser.id },
        data: { password: hashedPassword },
      });
      
      await logAction({
        userId: currentUser.id,
        action: 'UPDATE',
        details: 'Password changed',
        targetType: 'user',
        targetId: currentUser.id,
      });
      
      return updatedUser;
    },

    uploadAvatarBase64: async (_: unknown, { base64Image }: { base64Image: string }, context: GraphQLContext) => {
      const { currentUser } = context;
      
      if (!currentUser) {
        throw new Error('Access denied');
      }
      
      const user = await db.user.update({
        where: { id: currentUser.id },
        data: { avatarUrl: base64Image },
      });
      
      await logAction({
        userId: currentUser.id,
        action: 'UPDATE',
        details: 'Avatar updated',
        targetType: 'user',
        targetId: currentUser.id,
      });
      
      return user;
    },

    setupTwoFactor: async (_: unknown, __: unknown, context: GraphQLContext) => {
      const { currentUser } = context;
      
      if (!currentUser) {
        throw new Error('Access denied');
      }
      
      const user = await db.user.findUnique({
        where: { id: currentUser.id },
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Если двухфакторная аутентификация уже включена
      if (user.twoFactorEnabled) {
        return {
          twoFactorEnabled: true,
          secret: null,
          qrCodeUrl: null,
        };
      }
      
      // Если еще не включена, возвращаем данные для настройки
      return {
        twoFactorEnabled: false,
        secret: 'TEMP_SECRET_' + user.id,
        qrCodeUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      };
    },

    enableTwoFactor: async (_: unknown, { input }: { input: { token: string; secret: string } }, context: GraphQLContext) => {
      const { currentUser } = context;
      
      if (!currentUser) {
        throw new Error('Access denied');
      }
      
      // Проверяем токен (временно всегда успешно для демонстрации)
      if (input.token !== '123456') {
        return {
          success: false,
          message: 'Invalid token',
          twoFactorEnabled: false,
        };
      }
      
      const user = await db.user.findUnique({
        where: { id: currentUser.id },
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Обновляем статус двухфакторной аутентификации в базе данных
      await db.user.update({
        where: { id: currentUser.id },
        data: { 
          twoFactorEnabled: true,
          twoFactorSecret: input.secret,
        },
      });
      
      await logAction({
        userId: currentUser.id,
        action: 'UPDATE',
        details: 'Two-factor authentication enabled',
        targetType: 'user',
        targetId: currentUser.id,
      });
      
      return {
        success: true,
        message: 'Двухфакторная аутентификация успешно включена',
        twoFactorEnabled: true,
      };
    },

    verifyTwoFactor: async (_: unknown, { input }: { input: { token: string } }, context: GraphQLContext) => {
      const { currentUser } = context;
      
      if (!currentUser) {
        throw new Error('Access denied');
      }
      
      // Проверяем токен (временно всегда успешно)
      if (input.token !== '123456') {
        throw new Error('Invalid token');
      }
      
      // Временно просто возвращаем пользователя
      const user = await db.user.findUnique({
        where: { id: currentUser.id },
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      await logAction({
        userId: currentUser.id,
        action: 'UPDATE',
        details: 'Two-factor authentication enabled',
        targetType: 'user',
        targetId: currentUser.id,
      });
      
      return user;
    },

    disableTwoFactor: async (_: unknown, __: unknown, context: GraphQLContext) => {
      const { currentUser } = context;
      
      if (!currentUser) {
        throw new Error('Access denied');
      }
      
      const user = await db.user.findUnique({
        where: { id: currentUser.id },
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Обновляем статус двухфакторной аутентификации в базе данных
      await db.user.update({
        where: { id: currentUser.id },
        data: { twoFactorEnabled: false },
      });
      
      await logAction({
        userId: currentUser.id,
        action: 'UPDATE',
        details: 'Two-factor authentication disabled',
        targetType: 'user',
        targetId: currentUser.id,
      });
      
      return {
        success: true,
        message: 'Two-factor authentication disabled',
        twoFactorEnabled: false,
      };
    },

    // Временные заглушки для других мутаций
    deleteCategory: async () => true,
    deleteProduct: async () => true,
    bulkDeleteProducts: async () => true,
    bulkUpdateProducts: async () => true,
    deleteMedia: async () => true,
    exportCatalog: async () => 'export-url',
    createPage: async () => ({ id: '1', slug: 'temp', title: 'Temp', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }),
    updatePage: async () => ({ id: '1', slug: 'temp', title: 'Temp', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }),
    deletePage: async () => true,
    createPageSection: async () => ({ id: '1', pageId: '1', type: 'text', order: 1, content: {}, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }),
    updatePageSection: async () => ({ id: '1', pageId: '1', type: 'text', order: 1, content: {}, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }),
    deletePageSection: async () => true,
  },

  AuditLog: {
    user: async (parent: Record<string, unknown>) => {
      return await db.user.findUnique({
        where: { id: parent.userId as string },
      });
    },
  },

  Media: {
    user: async (parent: Record<string, unknown>) => {
      return await db.user.findUnique({
        where: { id: parent.userId as string },
      });
    },
  },

  Product: {
    category: async (parent: Record<string, unknown>) => {
      if (!parent.categoryId) return null;
      return await db.category.findUnique({
        where: { id: parent.categoryId as string },
      });
    },
    images: async (parent: Record<string, unknown>) => {
      return await db.productImage.findMany({
        where: { productId: parent.id as string },
        orderBy: { order: 'asc' },
      });
    },
    characteristics: async (parent: Record<string, unknown>) => {
      return await db.productCharacteristic.findMany({
        where: { productId: parent.id as string },
      });
    },
    options: async (parent: Record<string, unknown>) => {
      return await db.productOption.findMany({
        where: { productId: parent.id as string },
        include: { values: true },
      });
    },
  },

  Page: {
    sections: async (parent: Record<string, unknown>) => {
      return await db.pageSection.findMany({
        where: { pageId: parent.id as string },
        orderBy: { order: 'asc' },
      });
    },
  },

  PageSection: {
    page: async (parent: Record<string, unknown>) => {
      return await db.page.findUnique({
        where: { id: parent.pageId as string },
      });
    },
  },
};

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
}); 