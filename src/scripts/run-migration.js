// Скрипт для выполнения SQL миграции
import { prisma } from '../lib/prisma';
import fs from 'fs';
import path from 'path';

async function runMigration() {
  try {
    console.log('Connected to database');

    // Читаем SQL скрипт
    const sqlPath = path.join(__dirname, 'run-migration.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Выполняем SQL запросы по отдельности
    console.log('Running migration...');
    const statements = sql
      .split(';')
      .filter((statement) => statement.trim().length > 0)
      .map((statement) => statement.trim() + ';');

    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      await prisma.$executeRawUnsafe(statement);
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error running migration:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Database connection closed');
  }
}

runMigration();
