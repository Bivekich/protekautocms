// Скрипт для базового применения миграций
const { execSync } = require('child_process');

console.log('🔄 Применение базовых миграций...');

try {
  // Получаем список всех миграций
  const migrations = execSync('npx prisma migrate list', { encoding: 'utf-8' });
  console.log('Список миграций:');
  console.log(migrations);

  // Помечаем все миграции как примененные
  execSync('npx prisma migrate resolve --applied 20240310050417_init', {
    stdio: 'inherit',
  });
  execSync(
    'npx prisma migrate resolve --applied 20240310051722_add_page_sections',
    { stdio: 'inherit' }
  );
  execSync(
    'npx prisma migrate resolve --applied 20240310052217_add_audit_log',
    { stdio: 'inherit' }
  );

  console.log('✅ Миграции успешно помечены как примененные');
} catch (error) {
  console.error('❌ Ошибка при применении миграций:', error);
  process.exit(1);
}
