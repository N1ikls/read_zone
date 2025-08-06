// Демонстрация улучшенного поиска манги
import knexConfig from '../knex.js';
import knex from 'knex';
import BookStorage from '../server/storage/book.js';

async function demonstrateSearchImprovements() {
  console.log('🔍 Демонстрация улучшенного поиска каталога манги\n');

  const db = knex(knexConfig);
  const mangaStorage = new BookStorage(db);

  // Тест 1: Нормализация поискового запроса
  console.log('📝 Тест 1: Нормализация поискового запроса');
  console.log('─'.repeat(50));

  const testCases = [
    '  Наруто   Узумаки  ',
    'ONE PIECE',
    'Атака Титанов',
    'Токийский Гуль',
    '',
    null,
  ];

  testCases.forEach((testCase) => {
    const normalized = mangaStorage.normalizeSearchTerm(testCase);
    console.log(`Исходный: "${testCase}" → Нормализованный: "${normalized}"`);
  });

  console.log('\n');

  // Тест 2: Создание поисковых условий
  console.log('🎯 Тест 2: Создание поисковых условий');
  console.log('─'.repeat(50));

  const searchQueries = ['Наруто', 'One Piece', 'Атака Титанов', ''];

  searchQueries.forEach((query) => {
    const condition = mangaStorage.createSearchCondition(query);
    console.log(`\nЗапрос: "${query}"`);
    if (condition) {
      console.log('Условие:', JSON.stringify(condition, null, 2));
    } else {
      console.log('Условие: null (пустой запрос)');
    }
  });

  console.log('\n');

  // Тест 3: Производительность
  console.log('⚡ Тест 3: Производительность');
  console.log('─'.repeat(50));

  const longQuery =
    'очень длинный поисковый запрос с множеством слов для тестирования производительности системы поиска манги';

  const start = Date.now();
  const condition = mangaStorage.createSearchCondition(longQuery);
  const end = Date.now();

  console.log(
    `Длинный запрос (${longQuery.length} символов): ${end - start}мс`,
  );
  console.log(`Создано условий: ${condition[':or'].length}`);

  console.log('\n');

  // Тест 4: Специальные символы
  console.log('🔤 Тест 4: Обработка специальных символов');
  console.log('─'.repeat(50));

  const specialCases = [
    'манга "с кавычками"',
    'символы %_*',
    'числа 123 и буквы',
    'знаки препинания: точка, запятая!',
  ];

  specialCases.forEach((testCase) => {
    const normalized = mangaStorage.normalizeSearchTerm(testCase);
    const condition = mangaStorage.createSearchCondition(testCase);
    console.log(`"${testCase}" → "${normalized}"`);
    console.log(
      `  Условий создано: ${condition ? condition[':or'].length : 0}`,
    );
  });

  console.log('\n');

  // Тест 5: Сравнение старого и нового подходов
  console.log('📊 Тест 5: Сравнение подходов');
  console.log('─'.repeat(50));

  const comparisonCases = [
    'ONE PIECE',
    '  наруто   узумаки  ',
    'Атака Титанов',
    'токийский гуль',
  ];

  comparisonCases.forEach((testCase) => {
    console.log(`\nЗапрос: "${testCase}"`);

    // Старый подход
    const oldCondition = { name: { like: `%${testCase}%` } };
    console.log('  Старый подход:', JSON.stringify(oldCondition));

    // Новый подход
    const newCondition = mangaStorage.createSearchCondition(testCase);
    console.log('  Новый подход: Многоуровневый поиск с нормализацией');
    console.log(
      `    - Нормализованный запрос: "${mangaStorage.normalizeSearchTerm(testCase)}"`,
    );
    console.log(
      `    - Стратегий поиска: ${newCondition ? newCondition[':or'].length : 0}`,
    );
  });

  console.log('\n');
  console.log('✅ Демонстрация завершена!');
  console.log('\nПреимущества нового подхода:');
  console.log('• Нечувствительность к регистру (ILIKE вместо LIKE)');
  console.log('• Нормализация пробелов и диакритических знаков');
  console.log(
    '• Многоуровневый поиск (точное совпадение + подстрока + по словам)',
  );
  console.log('• Поиск по создателю манги включен автоматически');
  console.log('• Высокая производительность и масштабируемость');

  await db.destroy();
}

// Запуск демонстрации
demonstrateSearchImprovements().catch(console.error);
