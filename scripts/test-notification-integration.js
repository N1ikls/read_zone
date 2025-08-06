import knex from 'knex';

const db = knex({
  client: 'pg',
  connection: {
    port: 5432,
    host: 'localhost',
    user: 'postgres',
    password: 'postgres',
    database: 'read_zone_db',
  },
});

async function testNotificationIntegration() {
  try {
    console.log('🧪 Тестирование интеграции уведомлений...');

    // Получаем тестовых пользователей
    const users = await db('user').select('id', 'name', 'email').limit(3);
    if (users.length < 2) {
      console.log('❌ Недостаточно пользователей для тестирования');
      return;
    }

    const author = users[0];
    const subscriber = users[1];

    console.log(`👤 Автор: ${author.name} (${author.email})`);
    console.log(`👤 Подписчик: ${subscriber.name} (${subscriber.email})`);

    // Создаем подписку
    await db('user_subscriber')
      .insert({
        user_id: author.id,
        subscriber_id: subscriber.id,
      })
      .onConflict(['user_id', 'subscriber_id'])
      .ignore();

    console.log('✅ Подписка создана');

    // Получаем существующего автора из таблицы author
    const authorRecord = await db('author').first();
    if (!authorRecord) {
      console.log('❌ Не найден автор в таблице author');
      return;
    }

    // Создаем тестовую книгу
    const bookData = {
      name: 'Тестовая книга для уведомлений',
      description: 'Описание тестовой книги',
      author_id: authorRecord.id,
      translator_id: author.id,
      status: 'progress',
      type: 'manga',
      release_type: 'single',
      age_rate: '0',
      created_by: author.id,
      updated_by: author.id,
    };

    const [bookId] = await db('book').insert(bookData).returning('id');
    const book = await db('book').where('id', bookId.id).first();

    console.log(`📚 Создана книга: "${book.name}" (ID: ${book.id})`);

    // Создаем закладку для другого пользователя
    if (users[2]) {
      await db('bookmark')
        .insert({
          book_id: book.id,
          user_id: users[2].id,
          type: 'favorite',
        })
        .onConflict(['book_id', 'user_id'])
        .ignore();

      console.log(`🔖 Создана закладка для пользователя: ${users[2].name}`);
    }

    // Создаем тестовую главу
    const chapterData = {
      book_id: book.id,
      number: 1,
      name: 'Тестовая глава',
      content: 'Содержимое тестовой главы для проверки уведомлений',
      is_public: true,
      status: 'done',
      created_by: author.id,
      updated_by: author.id,
    };

    const [chapterId] = await db('chapter').insert(chapterData).returning('id');
    const chapter = await db('chapter').where('id', chapterId.id).first();

    console.log(`📖 Создана глава: "${chapter.name}" (ID: ${chapter.id})`);

    // Проверяем созданные уведомления
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Ждем секунду

    const notifications = await db('notifications')
      .where('user_id', subscriber.id)
      .orderBy('created_at', 'desc')
      .limit(5);

    console.log(
      `\n📋 Найдено ${notifications.length} уведомлений для подписчика:`,
    );
    notifications.forEach((notif, index) => {
      const status = notif.is_read ? '✅' : '🔔';
      console.log(`${index + 1}. ${status} [${notif.type}] ${notif.title}`);
      console.log(`   ${notif.message}`);
    });

    // Проверяем уведомления для пользователя с закладкой
    if (users[2]) {
      const bookmarkNotifications = await db('notifications')
        .where('user_id', users[2].id)
        .orderBy('created_at', 'desc')
        .limit(3);

      console.log(
        `\n📋 Найдено ${bookmarkNotifications.length} уведомлений для пользователя с закладкой:`,
      );
      bookmarkNotifications.forEach((notif, index) => {
        const status = notif.is_read ? '✅' : '🔔';
        console.log(`${index + 1}. ${status} [${notif.type}] ${notif.title}`);
      });
    }

    // Очистка тестовых данных
    console.log('\n🧹 Очистка тестовых данных...');
    await db('notifications').where('related_entity_id', chapter.id).delete();
    await db('notifications').where('related_entity_id', book.id).delete();
    await db('chapter').where('id', chapter.id).delete();
    await db('bookmark').where('book_id', book.id).delete();
    await db('book').where('id', book.id).delete();
    await db('user_subscriber')
      .where({
        user_id: author.id,
        subscriber_id: subscriber.id,
      })
      .delete();

    console.log('✅ Тестовые данные очищены');
  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error);
  } finally {
    await db.destroy();
  }
}

testNotificationIntegration();
