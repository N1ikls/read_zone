import knex from 'knex';
import fetch from 'node-fetch';

const db = knex({
  client: 'pg',
  connection: {
    port: 5555,
    host: 'localhost',
    user: 'botcheks',
    password: 'fekfrkenfekrjne3434',
    database: 'read_zone_db',
  }
});

const API_BASE = 'http://localhost:3001/api';

async function createTestNovelties() {
  try {
    console.log('📚 Создание тестовых новинок...');
    
    // Получаем существующих авторов и пользователей
    const authors = await db('author').select('id', 'name').limit(3);
    const users = await db('user').select('id', 'name').limit(3);
    
    if (authors.length === 0 || users.length === 0) {
      console.log('❌ Недостаточно авторов или пользователей для тестирования');
      return;
    }
    
    console.log(`👥 Найдено авторов: ${authors.length}, пользователей: ${users.length}`);
    
    // Создаем тестовые книги за последние 7 дней
    const testBooks = [];
    const now = new Date();
    
    for (let i = 0; i < 10; i++) {
      // Создаем книги в разные дни последней недели
      const daysAgo = Math.floor(Math.random() * 7);
      const createdAt = new Date(now);
      createdAt.setDate(createdAt.getDate() - daysAgo);
      
      const author = authors[i % authors.length];
      const user = users[i % users.length];
      
      const bookData = {
        name: `Тестовая новинка ${i + 1}`,
        description: `Описание тестовой книги ${i + 1} для проверки системы новинок`,
        author_id: author.id,
        translator_id: user.id,
        status: Math.random() > 0.3 ? 'progress' : 'done', // 70% в процессе, 30% завершены
        type: ['manga', 'manhva', 'manhua'][Math.floor(Math.random() * 3)],
        release_type: 'single',
        age_rate: '0',
        created_by: user.id,
        updated_by: user.id,
        created_at: createdAt,
        updated_at: createdAt
      };
      
      testBooks.push(bookData);
    }
    
    // Вставляем книги
    const insertedBooks = await db('book').insert(testBooks).returning(['id', 'name', 'author_id']);
    console.log(`✅ Создано ${insertedBooks.length} тестовых книг`);
    
    // Создаем главы для каждой книги
    for (const book of insertedBooks) {
      const chaptersCount = Math.floor(Math.random() * 5) + 1; // 1-5 глав
      
      for (let j = 0; j < chaptersCount; j++) {
        const chapterData = {
          book_id: book.id,
          number: j + 1,
          name: `Глава ${j + 1}`,
          content: `Содержимое главы ${j + 1} книги "${book.name}"`,
          is_public: true,
          status: 'done',
          created_by: users[0].id,
          updated_by: users[0].id
        };
        
        await db('chapter').insert(chapterData);
      }
    }
    
    console.log(`📖 Создано главы для всех книг`);
    
    return insertedBooks.map(book => book.id);
    
  } catch (error) {
    console.error('❌ Ошибка при создании тестовых данных:', error);
    return [];
  }
}

async function testNoveltiesAPI() {
  try {
    console.log('\n🧪 Тестирование API новинок...');
    
    // Тест 1: Получение новинок без параметров (автоматическая ротация)
    console.log('\n1️⃣ Тест автоматической ротации:');
    const response1 = await fetch(`${API_BASE}/books/novelties`);
    const data1 = await response1.json();
    
    if (data1.success) {
      console.log(`✅ Получено ${data1.data.books.length} новинок`);
      console.log(`📊 Всего новинок за неделю: ${data1.meta.total}`);
      console.log(`🔄 Ротация: страница ${data1.meta.rotation.currentPage} из ${data1.meta.rotation.totalPages}`);
      console.log(`⏰ Следующее обновление через: ${data1.meta.rotation.nextRotationIn}с`);
      console.log(`💾 Из кэша: ${data1.meta.cache.fromCache}`);
    } else {
      console.log('❌ Ошибка получения новинок');
    }
    
    // Тест 2: Ручная ротация
    console.log('\n2️⃣ Тест ручной ротации:');
    const response2 = await fetch(`${API_BASE}/books/novelties?manual=true&offset=3&limit=4`);
    const data2 = await response2.json();
    
    if (data2.success) {
      console.log(`✅ Ручная ротация: получено ${data2.data.books.length} новинок с offset ${data2.meta.offset}`);
      console.log(`🎯 Следующий offset: ${data2.meta.nextOffset}`);
      console.log(`💾 Из кэша: ${data2.meta.cache.fromCache}`);
    }
    
    // Тест 3: Повторный запрос (должен быть из кэша)
    console.log('\n3️⃣ Тест кэширования:');
    const response3 = await fetch(`${API_BASE}/books/novelties`);
    const data3 = await response3.json();
    
    if (data3.success) {
      console.log(`💾 Второй запрос из кэша: ${data3.meta.cache.fromCache}`);
      console.log(`🔑 Ключ кэша: ${data3.meta.cache.cacheKey}`);
    }
    
    // Тест 4: Статистика кэша
    console.log('\n4️⃣ Статистика кэша:');
    const response4 = await fetch(`${API_BASE}/books/novelties?stats=true`);
    const data4 = await response4.json();
    
    if (data4.success) {
      console.log(`📈 Статистика кэша:`, data4.cache);
    }
    
    // Тест 5: Производительность
    console.log('\n5️⃣ Тест производительности:');
    const startTime = Date.now();
    const promises = [];
    
    for (let i = 0; i < 10; i++) {
      promises.push(fetch(`${API_BASE}/books/novelties?manual=true&offset=${i * 2}`));
    }
    
    await Promise.all(promises);
    const endTime = Date.now();
    
    console.log(`⚡ 10 параллельных запросов выполнены за ${endTime - startTime}мс`);
    
  } catch (error) {
    console.error('❌ Ошибка при тестировании API:', error);
  }
}

async function testRotationLogic() {
  try {
    console.log('\n🔄 Тестирование логики ротации...');
    
    // Импортируем модуль ротации
    const { NoveltyRotation } = await import('../server/utils/novelty-rotation.js');
    
    const rotation = new NoveltyRotation(1); // Ротация каждую минуту для тестирования
    
    // Тестируем с разным количеством элементов
    const testCases = [
      { total: 10, limit: 3 },
      { total: 5, limit: 6 },
      { total: 0, limit: 3 },
      { total: 15, limit: 4 }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n📊 Тест: ${testCase.total} новинок, лимит ${testCase.limit}`);
      
      const offset = rotation.getTimeBasedOffset(testCase.total, testCase.limit);
      const info = rotation.getRotationInfo(testCase.total, testCase.limit);
      const stats = rotation.getRotationStats(testCase.total, testCase.limit);
      
      console.log(`  Offset: ${offset}`);
      console.log(`  Страница: ${info.currentPage}/${info.totalPages}`);
      console.log(`  Ротаций в день: ${stats.rotationsPerDay}`);
      console.log(`  Дней для показа всех: ${stats.daysToShowAllPages}`);
    }
    
  } catch (error) {
    console.error('❌ Ошибка при тестировании ротации:', error);
  }
}

async function cleanupTestData(bookIds) {
  try {
    console.log('\n🧹 Очистка тестовых данных...');
    
    if (bookIds && bookIds.length > 0) {
      // Удаляем главы
      await db('chapter').whereIn('book_id', bookIds).delete();
      
      // Удаляем книги
      await db('book').whereIn('id', bookIds).delete();
      
      console.log(`✅ Удалено ${bookIds.length} тестовых книг и их главы`);
    }
    
  } catch (error) {
    console.error('❌ Ошибка при очистке:', error);
  }
}

async function runTests() {
  let testBookIds = [];
  
  try {
    console.log('🚀 Запуск тестирования системы новинок\n');
    
    // Создаем тестовые данные
    testBookIds = await createTestNovelties();
    
    // Ждем немного чтобы данные точно записались
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Тестируем API
    await testNoveltiesAPI();
    
    // Тестируем логику ротации
    await testRotationLogic();
    
    console.log('\n✅ Все тесты завершены успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка при выполнении тестов:', error);
  } finally {
    // Очищаем тестовые данные
    await cleanupTestData(testBookIds);
    await db.destroy();
  }
}

runTests();
