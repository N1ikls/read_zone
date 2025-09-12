import knex from 'knex';

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

async function testNoveltiesLogic() {
  try {
    console.log('🧪 Тестирование логики новинок...');
    
    // Тест 1: Проверяем логику ротации
    console.log('\n1️⃣ Тест логики ротации:');
    const { NoveltyRotation } = await import('../server/utils/novelty-rotation.js');
    
    const rotation = new NoveltyRotation(5); // 5 минут
    
    // Тестируем с разными сценариями
    const testCases = [
      { total: 10, limit: 3, name: '10 новинок, лимит 3' },
      { total: 5, limit: 6, name: '5 новинок, лимит 6 (больше чем есть)' },
      { total: 0, limit: 3, name: '0 новинок' },
      { total: 15, limit: 4, name: '15 новинок, лимит 4' }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n📊 ${testCase.name}:`);
      
      const offset = rotation.getTimeBasedOffset(testCase.total, testCase.limit);
      const info = rotation.getRotationInfo(testCase.total, testCase.limit);
      const nextOffset = rotation.getNextOffset(offset, testCase.total, testCase.limit);
      const prevOffset = rotation.getPreviousOffset(offset, testCase.total, testCase.limit);
      
      console.log(`  Текущий offset: ${offset}`);
      console.log(`  Страница: ${info.currentPage}/${info.totalPages}`);
      console.log(`  Следующий offset: ${nextOffset}`);
      console.log(`  Предыдущий offset: ${prevOffset}`);
      console.log(`  Ротация активна: ${info.isRotating}`);
      console.log(`  До следующей ротации: ${info.nextRotationIn}с`);
    }
    
    // Тест 2: Проверяем кэширование
    console.log('\n2️⃣ Тест кэширования:');
    const { generateCacheKey, noveltiesCache, cacheHelpers } = await import('../server/utils/cache.js');
    
    // Генерируем ключи кэша
    const autoKey = generateCacheKey(0, 6, false);
    const manualKey = generateCacheKey(6, 6, true);
    
    console.log(`Автоматический ключ: ${autoKey}`);
    console.log(`Ручной ключ: ${manualKey}`);
    
    // Тестируем сохранение и получение
    const testData = { books: [], total: 10, offset: 0 };
    noveltiesCache.set('test-key', testData, 1000);
    
    const cached = noveltiesCache.get('test-key');
    console.log(`Данные сохранены и получены: ${cached !== null}`);
    console.log(`Размер кэша: ${noveltiesCache.size()}`);
    
    // Тест 3: Проверяем SQL запрос новинок
    console.log('\n3️⃣ Тест SQL запроса:');
    
    // Дата 7 дней назад
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    // Проверяем количество книг за неделю
    const weeklyBooks = await db('book')
      .where('created_at', '>=', weekAgo)
      .whereIn('status', ['progress', 'done'])
      .count('* as count')
      .first();
    
    console.log(`Книг за последние 7 дней: ${weeklyBooks.count}`);
    
    // Проверяем книги с главами
    const booksWithChapters = await db('book')
      .where('created_at', '>=', weekAgo)
      .whereIn('status', ['progress', 'done'])
      .where(function() {
        this.whereExists(function() {
          this.select('*')
            .from('chapter')
            .whereRaw('chapter.book_id = book.id')
            .where(function() {
              this.where('status', 'done')
                .orWhere('is_public', true);
            });
        });
      })
      .count('* as count')
      .first();
    
    console.log(`Книг с опубликованными главами: ${booksWithChapters.count}`);
    
    // Тест 4: Создаем тестовую новинку
    console.log('\n4️⃣ Создание тестовой новинки:');
    
    const authors = await db('author').select('id').limit(1);
    const users = await db('user').select('id').limit(1);
    
    if (authors.length > 0 && users.length > 0) {
      const testBook = {
        name: 'Тестовая новинка для проверки',
        description: 'Описание тестовой книги',
        author_id: authors[0].id,
        translator_id: users[0].id,
        status: 'progress',
        type: 'manga',
        release_type: 'single',
        age_rate: '0',
        created_by: users[0].id,
        updated_by: users[0].id
      };
      
      const [bookId] = await db('book').insert(testBook).returning('id');
      console.log(`Создана тестовая книга с ID: ${bookId.id}`);
      
      // Создаем главу
      const testChapter = {
        book_id: bookId.id,
        number: 1,
        name: 'Тестовая глава',
        content: 'Содержимое тестовой главы',
        is_public: true,
        status: 'done',
        created_by: users[0].id,
        updated_by: users[0].id
      };
      
      await db('chapter').insert(testChapter);
      console.log('Создана тестовая глава');
      
      // Проверяем что книга попадает в новинки
      const noveltiesCount = await db('book')
        .where('created_at', '>=', weekAgo)
        .whereIn('status', ['progress', 'done'])
        .where(function() {
          this.whereExists(function() {
            this.select('*')
              .from('chapter')
              .whereRaw('chapter.book_id = book.id')
              .where(function() {
                this.where('status', 'done')
                  .orWhere('is_public', true);
              });
          });
        })
        .count('* as count')
        .first();
      
      console.log(`Новинок после добавления: ${noveltiesCount.count}`);
      
      // Очищаем тестовые данные
      await db('chapter').where('book_id', bookId.id).delete();
      await db('book').where('id', bookId.id).delete();
      console.log('Тестовые данные очищены');
    }
    
    console.log('\n✅ Все тесты логики завершены успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error);
  } finally {
    await db.destroy();
  }
}

testNoveltiesLogic();
