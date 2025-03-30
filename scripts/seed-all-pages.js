const { execSync } = require('child_process');
const path = require('path');

// Массив скриптов для запуска
const scripts = [
  'seed-contacts-page.js',
  'seed-about-page.js',
  'seed-wholesale-page.js',
  'seed-payment-delivery-page.js',
  'seed-content-page.js',
];

// Функция для запуска скрипта
function runScript(scriptName) {
  console.log(`\n=== Запуск скрипта ${scriptName} ===\n`);

  try {
    // Формируем путь к скрипту
    const scriptPath = path.join(__dirname, scriptName);

    // Запускаем скрипт
    execSync(`node ${scriptPath}`, { stdio: 'inherit' });

    console.log(`\n=== Скрипт ${scriptName} успешно выполнен ===\n`);
  } catch (error) {
    console.error(`\n=== Ошибка при выполнении скрипта ${scriptName} ===\n`);
    console.error(error);
  }
}

// Запускаем все скрипты последовательно
async function main() {
  console.log('=== Начало заполнения данных всех страниц ===\n');

  for (const script of scripts) {
    runScript(script);
  }

  console.log('\n=== Заполнение данных всех страниц завершено ===');
}

main();
