const fs = require('fs');
const path = require('path');

// Путь к тестовым файлам
const testDir = path.join(__dirname, '../src/test/dashboard/catalog');

// Получаем список всех тестовых файлов
const testFiles = fs.readdirSync(testDir)
  .filter(file => file.endsWith('.test.tsx'))
  .map(file => path.join(testDir, file));

// Функция для исправления импортов в файле
function fixImports(filePath) {
  console.log(`Исправление импортов в файле: ${filePath}`);
  
  // Читаем содержимое файла
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Заменяем импорты
  content = content
    // Исправляем импорт хука useCatalogGraphQL
    .replace(
      /import .*from ['"]@\/hooks\/useCatalogGraphQL['"]/g, 
      `import { mockUseCatalogGraphQL } from '../../helpers/mocks/useCatalogGraphQLMock'`
    )
    .replace(
      /import .*from ['"]@\/components\/ui\/(.*?)['"]/g, 
      `import { $1 } from '../../../../components/ui/$1'`
    )
    // Добавляем корректный импорт хука
    .replace(
      /vi\.mock\(['"]@\/hooks\/useCatalogGraphQL['"]\)/g,
      `vi.mock('../../../hooks/useCatalogGraphQL')`
    );
  
  // Записываем исправленное содержимое обратно в файл
  fs.writeFileSync(filePath, content, 'utf8');
  
  console.log(`Файл успешно обновлен: ${filePath}`);
}

// Исправляем импорты во всех файлах
testFiles.forEach(fixImports);

console.log('Все импорты успешно исправлены!'); 