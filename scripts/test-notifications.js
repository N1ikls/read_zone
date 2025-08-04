import knex from 'knex';

const db = knex({
  client: 'pg',
  connection: {
    port: 5432,
    host: 'localhost',
    user: 'postgres',
    password: 'postgres',
    database: 'read_zone_db',
  }
});

async function createTestNotifications() {
  try {
    console.log('🔔 Создание тестовых уведомлений...');
    
    // Получаем первого пользователя
    const user = await db('user').select('id', 'name', 'email').first();
    if (!user) {
      console.log('❌ Пользователи не найдены');
      return;
    }
    
    console.log(`👤 Создаем уведомления для пользователя: ${user.name} (${user.email})`);
    
    // Создаем разные типы уведомлений
    const notifications = [
      {
        user_id: user.id,
        type: 'user_new_book',
        title: 'Новая книга от автора',
        message: 'Автор "Иван Иванов" опубликовал новую книгу "Приключения в космосе"',
        related_entity_type: 'book',
        metadata: JSON.stringify({ author_name: 'Иван Иванов', book_title: 'Приключения в космосе' })
      },
      {
        user_id: user.id,
        type: 'user_new_chapter',
        title: 'Новая глава',
        message: 'В книге "Магия и драконы" появилась новая глава "Битва с драконом"',
        related_entity_type: 'chapter',
        metadata: JSON.stringify({ book_title: 'Магия и драконы', chapter_title: 'Битва с драконом' })
      },
      {
        user_id: user.id,
        type: 'comment_reply',
        title: 'Ответ на комментарий',
        message: 'Пользователь "Мария" ответила на ваш комментарий',
        related_entity_type: 'comment',
        metadata: JSON.stringify({ replier_name: 'Мария' })
      },
      {
        user_id: user.id,
        type: 'book_new_chapter',
        title: 'Обновление закладки',
        message: 'В книге из ваших закладок "Тайны вселенной" появилась новая глава',
        related_entity_type: 'book',
        metadata: JSON.stringify({ book_title: 'Тайны вселенной' })
      },
      {
        user_id: user.id,
        type: 'system_announcement',
        title: 'Системное объявление',
        message: 'Добро пожаловать в обновленную систему уведомлений!',
        related_entity_type: null,
        metadata: JSON.stringify({ announcement_type: 'feature_update' })
      }
    ];
    
    // Вставляем уведомления
    await db('notifications').insert(notifications);
    
    console.log(`✅ Создано ${notifications.length} тестовых уведомлений`);
    
    // Проверяем что уведомления созданы
    const count = await db('notifications')
      .where('user_id', user.id)
      .count('* as count')
      .first();
      
    console.log(`📊 Всего уведомлений у пользователя: ${count.count}`);
    
    // Показываем созданные уведомления
    const created = await db('notifications')
      .where('user_id', user.id)
      .orderBy('created_at', 'desc')
      .limit(5)
      .select('type', 'title', 'is_read', 'created_at');
      
    console.log('\n📋 Последние уведомления:');
    created.forEach((notif, index) => {
      const status = notif.is_read ? '✅' : '🔔';
      console.log(`${index + 1}. ${status} [${notif.type}] ${notif.title}`);
    });
    
  } catch (error) {
    console.error('❌ Ошибка при создании уведомлений:', error);
  } finally {
    await db.destroy();
  }
}

createTestNotifications();
