/**
 * Комплексные тесты для системы поиска манги
 * Тестирует все аспекты поиска: нормализацию, производительность, точность
 * Простые тесты без фреймворка для быстрой проверки
 */

import BookStorage from '../server/storage/book.js';
import searchLogger from '../server/utils/search-logger.js';

// Простая функция для тестирования
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(
      `Assertion failed: ${message}. Expected: ${expected}, Actual: ${actual}`,
    );
  }
}

function assertNotNull(value, message) {
  if (value === null || value === undefined) {
    throw new Error(`Assertion failed: ${message}. Value is null or undefined`);
  }
}

async function runTests() {
  console.log('🧪 Запуск тестов системы поиска...\n');

  const bookStorage = new BookStorage();
  let testsPassed = 0;
  let testsFailed = 0;

  // Функция для выполнения одного теста
  async function runTest(testName, testFunction) {
    try {
      console.log(`  ✓ ${testName}`);
      await testFunction();
      testsPassed++;
    } catch (error) {
      console.log(`  ✗ ${testName}`);
      console.log(`    Ошибка: ${error.message}`);
      testsFailed++;
    }
  }

  // Очищаем статистику поиска
  searchLogger.clearStats();

  console.log('📝 Тестирование нормализации поисковых запросов...');

  await runTest('Нормализация простых запросов', () => {
    const testCases = [
      { input: 'One Piece', expected: 'one piece' },
      { input: 'ONE PIECE', expected: 'one piece' },
      { input: '  One   Piece  ', expected: 'one piece' },
      { input: 'One-Piece', expected: 'one piece' },
      { input: 'Наруто', expected: 'наруто' },
      { input: 'Ёжик', expected: 'ежик' },
    ];

    testCases.forEach(({ input, expected }) => {
      const result = bookStorage.normalizeSearchTerm(input);
      assertEqual(result, expected, `Нормализация "${input}"`);
    });
  });

  await runTest('Обработка специальных символов', () => {
    const testCases = [
      { input: 'One!@#$%Piece', expected: 'one piece' },
      { input: 'Attack.on.Titan', expected: 'attack on titan' },
      { input: 'Dragon/Ball\\Z', expected: 'dragon ball z' },
    ];

    testCases.forEach(({ input, expected }) => {
      const result = bookStorage.normalizeSearchTerm(input);
      assertEqual(
        result,
        expected,
        `Обработка специальных символов в "${input}"`,
      );
    });
  });

  await runTest('Обработка невалидных входных данных', () => {
    const invalidInputs = [null, undefined, '', '   ', 123, {}];

    invalidInputs.forEach((input) => {
      const result = bookStorage.normalizeSearchTerm(input);
      assertEqual(result, '', `Обработка невалидного входа: ${input}`);
    });
  });

  console.log('\n🔍 Тестирование создания поисковых условий...');

  await runTest('Создание базовых поисковых условий', () => {
    const condition = bookStorage.createSearchCondition('One Piece');

    assertNotNull(condition, 'Условие поиска не должно быть null');
    assert(condition.hasOwnProperty(':or'), 'Условие должно содержать :or');
    assert(Array.isArray(condition[':or']), 'Условие :or должно быть массивом');
    assert(condition[':or'].length > 0, 'Массив условий не должен быть пустым');

    // Проверяем наличие точного совпадения
    const exactMatch = condition[':or'].find(
      (c) => c.name?.ilike === 'one piece',
    );
    assertNotNull(exactMatch, 'Должно быть условие для точного совпадения');

    // Проверяем наличие частичного совпадения
    const partialMatch = condition[':or'].find(
      (c) => c.name?.ilike === '%one piece%',
    );
    assertNotNull(
      partialMatch,
      'Должно быть условие для частичного совпадения',
    );
  });

  await runTest('Создание условий для многословных запросов', () => {
    const condition = bookStorage.createSearchCondition('Attack on Titan');

    assertNotNull(condition, 'Условие поиска не должно быть null');
    assert(condition.hasOwnProperty(':or'), 'Условие должно содержать :or');

    // Должно быть условие для поиска по отдельным словам
    const wordSearch = condition[':or'].find((c) => c[':and']);
    assertNotNull(wordSearch, 'Должно быть условие для поиска по словам');
    assert(
      Array.isArray(wordSearch[':and']),
      'Условие :and должно быть массивом',
    );
    assertEqual(
      wordSearch[':and'].length,
      3,
      'Должно быть 3 слова: attack, on, titan',
    );
  });

  await runTest('Включение поиска по автору', () => {
    const condition = bookStorage.createSearchCondition(
      'One Piece',
      'name',
      'one piece',
    );

    assertNotNull(condition, 'Условие поиска не должно быть null');
    assert(condition.hasOwnProperty(':or'), 'Условие должно содержать :or');

    // Должно быть условие для поиска по автору
    const authorSearch = condition[':or'].find((c) => c['author.name']);
    assertNotNull(authorSearch, 'Должно быть условие для поиска по автору');
    assertEqual(
      authorSearch['author.name'].ilike,
      '%one piece%',
      'Условие поиска по автору',
    );
  });

  await runTest('Возврат null для пустых запросов', () => {
    const condition1 = bookStorage.createSearchCondition('');
    const condition2 = bookStorage.createSearchCondition('  ');

    assertEqual(condition1, null, 'Пустая строка должна возвращать null');
    assertEqual(condition2, null, 'Строка из пробелов должна возвращать null');
  });

  console.log('\n🔮 Тестирование fuzzy search...');

  await runTest('Создание fuzzy search условий для длинных запросов', () => {
    const condition = bookStorage.createFuzzySearchCondition('Attack on Titan');

    assertNotNull(condition, 'Fuzzy условие не должно быть null');
    assert(
      condition.hasOwnProperty(':or'),
      'Fuzzy условие должно содержать :or',
    );
    assert(
      Array.isArray(condition[':or']),
      'Fuzzy условие :or должно быть массивом',
    );
    assert(
      condition[':or'].length > 0,
      'Массив fuzzy условий не должен быть пустым',
    );
  });

  await runTest('Использование обычного поиска для коротких запросов', () => {
    const normalCondition = bookStorage.createSearchCondition('ab');
    const fuzzyCondition = bookStorage.createFuzzySearchCondition('ab');

    // Для коротких запросов fuzzy должен возвращать тот же результат что и обычный поиск
    assertEqual(
      JSON.stringify(fuzzyCondition),
      JSON.stringify(normalCondition),
      'Fuzzy и обычный поиск для коротких запросов',
    );
  });

  await runTest('Обработка поиска по автору в fuzzy режиме', () => {
    const condition = bookStorage.createFuzzySearchCondition(
      'One Piece',
      'name',
      'oda',
    );

    assertNotNull(condition, 'Fuzzy условие с автором не должно быть null');
    assert(
      condition.hasOwnProperty(':or'),
      'Fuzzy условие должно содержать :or',
    );

    // Должно быть условие для поиска по автору
    const authorSearch = condition[':or'].find((c) => c['author.name']);
    assertNotNull(
      authorSearch,
      'Должно быть условие для поиска по автору в fuzzy режиме',
    );
  });

  console.log('\n📊 Тестирование логирования поиска...');

  await runTest('Логирование поисковых запросов', () => {
    searchLogger.clearStats(); // Очищаем перед тестом

    const searchData = {
      query: 'One Piece',
      normalizedQuery: 'one piece',
      resultCount: 1,
      executionTime: 50,
      timestamp: new Date(),
    };

    searchLogger.logSearch(searchData);

    const stats = searchLogger.getSearchStats();
    assertEqual(stats.totalSearches, 1, 'Общее количество поисков');
    assertEqual(stats.uniqueQueries, 1, 'Количество уникальных запросов');
  });

  await runTest('Отслеживание медленных запросов', () => {
    searchLogger.clearStats(); // Очищаем перед тестом

    const slowSearchData = {
      query: 'Slow Query',
      normalizedQuery: 'slow query',
      resultCount: 0,
      executionTime: 1500, // медленный запрос
      timestamp: new Date(),
    };

    searchLogger.logSearch(slowSearchData);

    const stats = searchLogger.getSearchStats();
    assertEqual(stats.slowQueries.length, 1, 'Количество медленных запросов');
    assertEqual(
      stats.slowQueries[0].query,
      'Slow Query',
      'Запрос в списке медленных',
    );
  });

  await runTest('Отслеживание популярных запросов', () => {
    searchLogger.clearStats(); // Очищаем перед тестом

    // Выполняем один запрос несколько раз
    for (let i = 0; i < 5; i++) {
      searchLogger.logSearch({
        query: 'One Piece',
        normalizedQuery: 'one piece',
        resultCount: 1,
        executionTime: 20,
        timestamp: new Date(),
      });
    }

    const stats = searchLogger.getSearchStats();
    assert(stats.popularQueries.length > 0, 'Должны быть популярные запросы');
    assertEqual(
      stats.popularQueries[0][0],
      'one piece',
      'Самый популярный запрос',
    );
    assertEqual(
      stats.popularQueries[0][1],
      5,
      'Количество выполнений популярного запроса',
    );
  });

  await runTest('Генерация отчета о производительности', () => {
    searchLogger.clearStats(); // Очищаем перед тестом

    // Добавляем несколько запросов
    const queries = [
      { query: 'One Piece', time: 20 },
      { query: 'Naruto', time: 30 },
      { query: 'Attack on Titan', time: 1200 }, // медленный
    ];

    queries.forEach(({ query, time }) => {
      searchLogger.logSearch({
        query,
        normalizedQuery: query.toLowerCase(),
        resultCount: 1,
        executionTime: time,
        timestamp: new Date(),
      });
    });

    const report = searchLogger.generatePerformanceReport();

    assertNotNull(report.summary, 'Отчет должен содержать summary');
    assertNotNull(report.performance, 'Отчет должен содержать performance');
    assertNotNull(report.usage, 'Отчет должен содержать usage');
    assertNotNull(
      report.recommendations,
      'Отчет должен содержать recommendations',
    );

    assertEqual(
      report.summary.totalSearches,
      3,
      'Общее количество поисков в отчете',
    );
    assertEqual(
      report.performance.slowQueries.length,
      1,
      'Количество медленных запросов в отчете',
    );
    assert(
      Array.isArray(report.recommendations),
      'Рекомендации должны быть массивом',
    );
  });

  console.log('\n🔗 Интеграционные тесты поиска...');

  await runTest('Выполнение поиска с измерением времени', async () => {
    const startTime = Date.now();

    const query = { name: 'One Piece' };
    const result = await bookStorage.catalogSearch(query);

    const executionTime = Date.now() - startTime;

    assertNotNull(result, 'Результат поиска не должен быть null');
    assert(
      executionTime < 1000,
      `Поиск должен выполняться быстрее 1 секунды (${executionTime}ms)`,
    );
  });

  await runTest('Обработка различных типов поисковых запросов', async () => {
    const testQueries = [
      { name: 'One Piece' },
      { name: 'one piece' },
      { name: 'ONE PIECE' },
      { name: 'piece' },
    ];

    for (const query of testQueries) {
      const result = await bookStorage.catalogSearch(query);
      assertNotNull(result, `Результат для запроса ${JSON.stringify(query)}`);
      assert(
        result.hasOwnProperty('items'),
        'Результат должен содержать items',
      );
      assert(
        result.hasOwnProperty('total'),
        'Результат должен содержать total',
      );
    }
  });

  await runTest('Обработка пустых результатов', async () => {
    const query = { name: 'NonExistentManga12345' };
    const result = await bookStorage.catalogSearch(query);

    assertNotNull(
      result,
      'Результат не должен быть null даже для несуществующих запросов',
    );
    assert(Array.isArray(result.items), 'items должен быть массивом');
    assertEqual(
      result.items.length,
      0,
      'Количество результатов для несуществующего запроса',
    );
    assertEqual(
      result.total,
      0,
      'Общее количество для несуществующего запроса',
    );
  });

  await runTest('Поддержка комбинированных фильтров', async () => {
    const query = {
      name: 'manga',
      status: 'done',
      types: 'manga',
    };

    const result = await bookStorage.catalogSearch(query);
    assertNotNull(
      result,
      'Результат для комбинированного запроса не должен быть null',
    );
  });

  console.log('\n⚡ Тестирование производительности поиска...');

  await runTest('Быстрое выполнение простых запросов', async () => {
    const iterations = 5; // Уменьшаем количество итераций для быстрого тестирования
    const times = [];

    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      await bookStorage.catalogSearch({ name: 'One Piece' });
      const executionTime = Date.now() - startTime;
      times.push(executionTime);
    }

    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    assert(
      avgTime < 200,
      `Среднее время выполнения должно быть меньше 200мс (${avgTime.toFixed(2)}ms)`,
    );
  });

  await runTest('Масштабирование для сложных запросов', async () => {
    const complexQuery = {
      name: 'Attack on Titan manga adventure',
      status: 'done',
      types: 'manga',
      yearFrom: 2000,
    };

    const startTime = Date.now();
    const result = await bookStorage.catalogSearch(complexQuery);
    const executionTime = Date.now() - startTime;

    assertNotNull(result, 'Результат сложного запроса не должен быть null');
    assert(
      executionTime < 1000,
      `Сложный запрос должен выполняться меньше 1000мс (${executionTime}ms)`,
    );
  });

  console.log('\n🔬 Тестирование граничных случаев...');

  await runTest('Обработка очень длинных поисковых запросов', async () => {
    const longQuery = 'a'.repeat(1000);
    const result = await bookStorage.catalogSearch({ name: longQuery });

    assertNotNull(result, 'Результат для длинного запроса не должен быть null');
    assert(
      Array.isArray(result.items),
      'items должен быть массивом для длинного запроса',
    );
  });

  await runTest('Обработка специальных символов в запросах', async () => {
    const specialQueries = [
      '!@#$%^&*()',
      'SELECT * FROM book',
      '<script>alert("xss")</script>',
      '\\n\\r\\t',
    ];

    for (const query of specialQueries) {
      const result = await bookStorage.catalogSearch({ name: query });
      assertNotNull(
        result,
        `Результат для специального запроса "${query}" не должен быть null`,
      );
      assert(
        Array.isArray(result.items),
        `items должен быть массивом для запроса "${query}"`,
      );
    }
  });

  await runTest('Обработка Unicode символов', async () => {
    const unicodeQueries = [
      '🎌 манга',
      'Наруто 忍者',
      'Атака титанов 進撃の巨人',
      'Ван Пис ワンピース',
    ];

    for (const query of unicodeQueries) {
      const result = await bookStorage.catalogSearch({ name: query });
      assertNotNull(
        result,
        `Результат для Unicode запроса "${query}" не должен быть null`,
      );
      assert(
        Array.isArray(result.items),
        `items должен быть массивом для Unicode запроса "${query}"`,
      );
    }
  });

  // Завершение тестов
  console.log('\n📊 Результаты тестирования:');
  console.log(`✅ Пройдено: ${testsPassed}`);
  console.log(`❌ Провалено: ${testsFailed}`);
  console.log(
    `📈 Общий результат: ${testsPassed}/${testsPassed + testsFailed}`,
  );

  if (testsFailed === 0) {
    console.log('\n🎉 Все тесты пройдены успешно!');
  } else {
    console.log('\n⚠️ Некоторые тесты провалились. Проверьте логи выше.');
  }

  return testsFailed === 0;
}

// Запускаем тесты
runTests().catch(console.error);
